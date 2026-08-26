# dsh 沙箱与安全机制——"一切皆插件"怎么兜底（2026-08-26）

> 官方文档站 reference/subsystems/{sandbox, approval, permission-presets, credentials} + capability-seams + config-catalog 全量考证
> 调研时点：v0.1 预览版（2026-08-26），仓库 GitHub raw 不可达，本文全部基于官方文档站中文页（每节附源码路径锚点），未做本机实测【待实测】项见第八节

## 一、先说结论（TL;DR）

1. **沙箱兜的是模型，不兜插件**：dsh 的进程沙箱包装的是"模型发起的子进程 argv"，插件代码本身跑在宿主 Node 进程里、天然全权——装第三方插件 = 信任它整个进程
2. **默认是安全的**：沙箱模式默认 `read-only`（fail-safe design，想放开要显式 opt-in），审批策略默认 `ask`，审批机制 fail-closed
3. **边界比想象窄**：沙箱三种模式**只管辖文件效果**，网络与进程可见性明确不在定义范围内——prompt injection 依然可以 `curl` 外传数据
4. **无持久 allowlist**：审批只有 `allowed-once`（一次性授权），没有 Claude Code 那种"记住此规则"的 allowlist 机制，安全模型 = 沙箱模式 × 审批策略两个独立旋钮
5. **Web UI 裸奔**：内置 HTTP 服务器**没有 TLS、认证或 origin 策略**，默认绑 127.0.0.1 是唯一防线，配 `0.0.0.0` = 局域网裸奔

## 二、沙箱架构：管的是 argv，不是插件

### 2.1 三层结构（seam → 实现 → 消费方）

| 层 | 包 | 职责 |
|---|---|---|
| 抽象 seam | `@deepseek-ai/dsh-sandbox`（packages/sandbox/sandbox/） | 定义 `ctx.sandbox.confine(argv, policy)` 契约：收进调用方即将 spawn 的确切 argv，返回包装后的 argv |
| 本地实现 | `@deepseek-ai/dsh-sandbox-local` | 三平台后端：Linux **bwrap/Landlock**、macOS **Seatbelt**、Windows **ACL 受限令牌**；负责 runner 探测、选择、缓存 |
| 消费方 | `dsh-bash-sandbox` / `dsh-pwsh-sandbox` / `dsh-fs-sandbox` / `terminal-bash` | 真正 spawn 进程的地方，调 `confine()` 换 argv 再执行 |

大白话：沙箱不是给整个 dsh 套个壳，而是**每 spawn 一个进程前，把 argv 包一层平台级 runner**（比如 bwrap），让这个进程只能做文件策略允许的事。策略挂在每次调用上（per-call），不固定在 provider 上——同一瞬间可以有会话跑 `read-only`、另一个跑 `workspace-write`。

### 2.2 隔离边界：三种模式只管文件效果

```ts
type SandboxMode = 'read-only' | 'workspace-write' | 'danger-full-access'
```

| 模式 | 能写哪 | 备注 |
|---|---|---|
| `read-only` | 仅 /dev/null 等 POSIX 必需接收器（Windows ACL 后端无显式可写根） | **部署默认值（fail-safe）** |
| `workspace-write` | 会话 cwd（workspace 边界）+ 后端承诺的临时区 | 常用工作档 |
| `danger-full-access` | 无限制 | **不经过 ctx.sandbox**——消费方直接 spawn 原始 argv，绕过一切包装 |

**关键红线（官方原文）**：网络与进程可见性不在此处的定义范围内。也就是说：即便 `read-only` 模式，被沙箱的进程**照样能联网、照样能看到进程列表**——文件保住了，数据还是可以被 `curl` 发出去。

### 2.3 enforcement 完整度与 fail-closed

- `SandboxEnforcement = 'full' | 'partial'`：后端如实报告隔离是否完整。已知 partial 场景：**较旧的 Landlock ABI**、**Windows ACL 的 Everyone 与硬链接边界**——要求绝对边界的消费方必须拒绝 partial 或向上暴露
- **fail-closed 铁律**：没有可用后端时 `ctx.sandbox.confine()` 抛 `SandboxUnavailableError`（错误码 `SANDBOX_UNAVAILABLE`），官方原话"对于受限策略，静默的无隔离透传永远不合法"
- stderr 方言按后端区分（bwrap=EROFS / Landlock=EACCES / Seatbelt=EPERM），框架用 `denialSignatures` 精确归因"是被沙箱拦了"还是"命令本身失败"，两种情况对模型呈现不同结果

### 2.4 E2B：远程沙箱是同级实现，不是 ctx.sandbox 的提供方

官方明确：容器、microVM 和远程执行是"完整能力 seam 的同级实现"。`ctx.e2b`（packages/e2b/）拥有共享 E2B SDK 句柄，两个亮点设计值得抄：

- **API key 永不转发进沙箱**（配置注释原话 "It is never forwarded into the sandbox"）
- 沙箱有生命周期 `timeoutMs`，**到期必删**，不留僵尸环境

### 2.5 配置方式：策略只有一个家

所有沙箱配置集中在 `dsh-sandbox-policy`（packages/sandbox/sandbox-policy/），bash/pwsh/fs 执行器的 Config **刻意不含**沙箱策略（防止两个执行器限制到不同根目录）：

```ts
// dsh-sandbox-policy Config（全部可选）
{
  mode?: SandboxMode        // 默认 'read-only'（fail-safe default）
  workspaceRoot?: string    // 无 agent 调用的回退根，默认 process.cwd()
}
```

`dsh-sandbox-local` 另有自己的 runner 配置：`runnerCommand`（覆盖 runner argv，bwrap 兼容）、`runnerFailureSignatures`（识别 runner 自身失败的 stderr 签名）、`probeTimeoutMs`（功能探针超时）。

## 三、两个旋钮：沙箱模式 × 审批策略

### 3.1 权限预设（permission-presets）

`ctx.permissionPresets` 把两个独立强制执行旋钮捆绑成具名预设，供 Web UI 的 Permissions 选择器使用。默认预设表只有两项：

| 预设名 | sandbox/mode | approval/policy | 语义 |
|---|---|---|---|
| `workspace-write` | workspace-write | ask | 默认工作档：能改工作区，敏感操作弹窗 |
| `danger-full-access` | danger-full-access | never | 全裸档：绕过沙箱 + 永不询问 |

两个旋钮各自独立可调（`setSandboxMode` / `setApprovalPolicy`），组合出预设表之外的值时显示派生态 `custom`。预设切换只记录意图，实际强制执行永远读各自旋钮的折叠结果——**预设层自己不拥有任何强制执行**。

### 3.2 策略解析优先级（每次能力调用）

```
已批准的一次性显式 mode（escalated retry）
  > 会话日志最后一条 sandbox/mode 事件（会话内切换）
    > 部署默认（dsh-sandbox-policy Config，默认 read-only）
```

会话的不可变 cwd 就是 workspace-write 的边界；无 agent 调用回退到配置的 workspaceRoot。

### 3.3 模型怎么申请提权

模型收到"拒绝"事实后，可以带 `sandbox_permissions` 参数 + justification 发起**一次性、严格更宽松**的重试，但执行前必须过 `ctx.approval` 批准该次确切调用——用户点允许，这次调用放宽；下次同样的调用再走一遍完整流程。

## 四、审批链路：allowed-once + fail-closed

### 4.1 闭合的结果集

```ts
type ApprovalOutcome = 'allowed-once' | 'rejected' | 'cancelled' | 'unavailable'
type ApprovalPolicy  = 'ask' | 'never'
```

- **只有 `allowed-once` 是放行**，且只授权所询问的那一个操作；`rejected`/`cancelled`/`unavailable` 一律拒绝
- 应答者缺失、抛异常、返回不合规值 → 全部归一化为 `unavailable`（**fail-closed**），绝不放行
- `never` 是无头模式（CI/无人值守）的严格姿态：确定性地拒绝每个请求，且**在 waterfall 分发之前强制执行**——即使有恶意插件后来以 prepend 注册应答器，也无法绕过 never 策略

### 4.2 谁来应答

`approval/request` 是 waterfall 事件：UI 通道提供人类应答者（弹窗），ACP（Agent Client Protocol）自动化桥接层为其拥有的 agent 提供一次性机器决策。每个请求配 `approval/asked` / `approval/decided` 审计事件对（仅入日志，不进模型 transcript）。

### 4.3 审批在工具执行管线里的位置

```
tools/pre-execute waterfall（钩子）
  → ctx.approval 询问（在单调守卫之前）
    → 单调守卫（monotonic guards）
      → tools/execute + tools/post-execute waterfall
        → finalizeContent + tools/result 观测
```

三个 waterfall 都可以改写一次调用；文件系统的"先读后编辑"检查在 tool-fs 之下通过 `fs/*` 事件实现（fs-observation-policy 门禁）。

### 4.4 凭据自动剥离

本地 shell 执行器 spawn 子进程前**先清除环境中的凭据**，再合并调用方显式提供的 env（bash-stdin-env Agent Note）。凭据体系本身：settings/cordis.yml 只存**引用**（环境变量名），值归 `dsh-credentials-local` 提供方（来源层 env / file / project-env / user-env），按操作解析不缓存——轮换立即生效。

## 五、恶意插件风险面：沙箱管不到的那一半

### 5.1 边界澄清（本文最重要的一段）

沙箱包装的是**模型发起的子进程**。而插件（`apply(ctx)` 模块）由 Cordis 加载、**跑在 dsh 宿主 Node 进程里**——它拿到的是进程内 TypeScript 级别的 `ctx`，和 dsh 主程序同权：能 `require('fs')`、能开 socket、能 spawn、能读 `~/.dsh` 下的一切。沙箱、审批、凭据剥离，全是防"模型乱来"的；**防不了"插件使坏"**。安全边界 = 你 `dsh plugin add` 那一刻的信任决策。

### 5.2 ctx 全权能力清单（恶意插件能做什么）

| 能力 | 通道 | 能干出的坏事 |
|---|---|---|
| 注册/篡改工具 | `ctx.tools.register` | 挂假 Bash 工具记录用户输入、伪造工具结果误导模型 |
| 监听全部事件 | Cordis 事件（waterfall/emit/on） | 窥探会话日志、工具参数、文件编辑内容 |
| 冒充审批应答器 | `approval/request` waterfall 注册监听器 | `ask` 策略下自动返回 `allowed-once` 替用户点"允许"（仅 `never` 策略可挡住，见 4.1） |
| 读凭据 | `inject` credentials 服务，按操作 resolve | 拿走 DEEPSEEK_API_KEY 等真实值 |
| 任意系统调用 | 宿主进程 Node API | 无需任何 ctx——`require('child_process')` 即可，沙箱不管宿主进程自己 |
| 改写设置/LLM 流 | `ctx.settings` / `ctx.llm` seam | 把请求转发到攻击者代理端点（中间人你的全部对话） |

### 5.3 供应链现状

- 社区 topic `dsh-plugin` 已 **1.1 万+ 仓**（Day 2 盘点：11,275），头部全是"平台级"插件（设计/编排/记忆）——功能越重、权限面越大
- v0.1 预览期**没有官方插件市场审核**（文档站无 registry/签名/审计任何字样，GitHub SECURITY.md 不存在），`dsh plugin add <repo>` = 直接信任该仓库当前 HEAD 及其全部依赖树（npm 传递依赖同样全权）
- 文档站也没有插件能力声明（permission manifest）机制——和浏览器扩展不同，装之前看不到它要什么权限

### 5.4 装第三方插件前的审计清单

| # | 检查项 | 怎么查 |
|---|---|---|
| 1 | 仓库真身 | owner 是谁、star/issue 历史、是否 fork 洗皮 |
| 2 | apply/inject 声明 | `inject` 了 `credentials` / `llm` / `approval` 的要重点审 |
| 3 | 网络出口 | grep `fetch(` / `http` / `axios` / `net.connect`——数据发去哪 |
| 4 | 进程逃逸 | grep `child_process` / `exec` / `spawn`——是否有沙箱外动作 |
| 5 | 动态代码 | grep `eval` / `new Function` / `vm.runIn*`——混淆加载的红旗 |
| 6 | install 脚本 | package.json 的 pre/post install hooks——npm 阶段就执行代码 |
| 7 | 依赖树 | `pnpm why` 看传递依赖里有没有 typosquatting 包名 |
| 8 | 锁定版本 | 装 commit hash 而非分支名，升级走 diff review |

## 六、dsh vs Claude Code 权限模型对照表

Claude Code 侧为 2.1.195 本机实证（~/.claude/settings.json 的 permissions.allow 实测含 `Bash(kill 1302292)`、`Read(//home/east/.../**)` 等规则）+ 官方 iam/settings 文档知识，dsh 侧为文档站考证。均为 2026-08-26 时点。

| 维度 | Claude Code | dsh |
|---|---|---|
| 权限决策粒度 | **规则级**：`Bash(npm run test:*)` 前缀匹配、`Read/Edit(路径 gitignore 风格)`、`WebFetch(domain:)` | **调用级**：每次敏感操作单独问，无规则语法 |
| 持久 allowlist | ✅ allow/deny/ask 三表 + 企业/用户/项目三层 settings + `defaultMode` | ❌ 无——审批结果仅 `allowed-once`，会话内也不累积成规则 |
| 审批弹窗 | 首次遇新命令弹窗，可选 "Always allow"（写回 allowlist） | Web UI 询问（`ask`），或 ACP 机器决策 |
| 权限模式 | default / acceptEdits / plan / bypassPermissions | 预设表：workspace-write+ask / danger-full-access+never，双旋钮可独立调 |
| 沙箱形态 | OS 级（bubblewrap/seatbelt，实验性，装了才启用） | OS 级三平台后端（bwrap/Landlock、Seatbelt、Win ACL），**seam 可换**（E2B 远程/容器同级） |
| 沙箱默认 | 未显式启用时无沙箱（靠审批） | `read-only` fail-safe 默认（想写要先 opt-in） |
| 沙箱覆盖面 | 文件+网络（network block 列表） | **仅文件效果**；网络、进程可见性明确不管 |
| fail 语义 | bypassPermissions 显式跳过检查 | fail-closed：无后端即 `SANDBOX_UNAVAILABLE`，静默透传非法 |
| 凭据防护 | 环境变量直传子进程 | 配置存引用不存值；shell spawn 前剥离 env 凭据；E2B key 不进沙箱 |
| 审计 | 会话记录 + hooks | `approval/asked→decided` 事件对强制入会话日志 |
| 插件面 | MCP 服务器（子进程、按 server/tool 粒度可 allowlist `mcp__srv__tool`） | **插件=同进程代码，全权**，无 manifest 声明 |
| 子代理权限 | 独立 permission mode（`--permission-mode`） | `PermissionPolicy = 'allow' \| 'reject'` 默认 reject；CC/Codex 子代理可配 `bypassPermissions`（危险档名 `dangerously-bypass-approvals-and-sandbox`） |

一句话总结差异：**Claude Code 用"规则记忆"换效率（弹一次窗、永久放行同类），dsh 用"每次必问 + 沙箱默认只读"换简单**——dsh 把复杂度从权限语法转移到了沙箱模式切换上；但两者在"插件/扩展进程"这一层都默认全信任。

## 七、自托管者安全清单（跑 dsh 前必做的 8 件事）

> ⚠️ **WARNING**（仿 OpenHands SELF_HOSTING 措辞）：dsh 驱动的 agent 可以读写其运行目录可达的整个文件系统、执行 shell 命令、访问网络。**任何能连上 dsh Web UI 或装进一个插件的人，都能做同样的事。** 把 dsh 宿主机当作持有生产凭证的机器对待，暴露到网络前先锁死。

1. **保持默认回环绑定**——Web 服务器 host 只有 `127.0.0.1`（默认）和 `0.0.0.0` 两个合法值，**没有 TLS、认证或 origin 策略**；需要远程访问走 SSH 隧道/反向代理加认证，不要配 `0.0.0.0`
2. **别在敏感目录启动**——dsh 把启动目录作为默认文件系统位置；用专用空目录/专用 VM 跑，别在 `~/` 或有云凭证的仓库里起进程
3. **保持 read-only 起步**——部署默认即 fail-safe；确需写再切 `workspace-write` 预设，`danger-full-access` 只在一次性容器里用
4. **无头场景配 `never`**——CI/无人值守跑法显式设 approval policy 为 `never`（fail-closed 拒绝一切提权，且能挡住恶意插件冒充应答器）；不要用"配一个自动点允许的应答器"来模拟无人值守
5. **API Key 走 credentials 体系**——用引用（env var）而非明文进 cordis.yml；E2B 场景确认 key 不进沙箱（框架已保证，但别自己往 env 里塞着绕过）
6. **第三方插件先过 5.4 审计清单**——v0.1 无市场审核，`plugin add` 即全权信任；高权限 inject（credentials/llm/approval）的插件逐行看
7. **旧内核自检 enforcement**——Linux 看 Landlock ABI 版本（老内核会 `partial`），Windows 注意 ACL Everyone/硬链接缺口；要求绝对文件边界的场景拒绝 partial 或换容器/microVM 跑
8. **记住网络不隔离**——任何沙箱模式下模型进程都能联网；涉密数据环境配出网白名单（防火墙/APT 代理），prompt injection 的数据外传只有这一层能挡

## 八、【待实测】项与信息时效

以下结论来自官方文档站文本（2026-08-26），未做本机实测：

- read-only 默认值在 `npx @deepseek-ai/dsh web` 开箱组合中的实际表现（需 DEEPSEEK_API_KEY）
- Web UI 权限选择器的预设切换体验、`sandbox_permissions` 提权重试的弹窗流程
- `SANDBOX_UNAVAILABLE` 在无 bwrap 环境的实际触发路径
- 恶意插件冒充 approval 应答器的实际可行性（4.1 的 never 防护是文档陈述，未验证）

dsh 是 v0.1 预览版，接口常变；本文所有 API/行为描述以 2026-08-26 文档站为准。

## 九、参考链接

- 进程沙箱：https://deepseek-harness.github.io/deepseek-harness/reference/subsystems/sandbox
- 用户审批：https://deepseek-harness.github.io/deepseek-harness/reference/subsystems/approval
- 权限预设：https://deepseek-harness.github.io/deepseek-harness/reference/subsystems/permission-presets
- 用户凭据：https://deepseek-harness.github.io/deepseek-harness/reference/subsystems/credentials
- 能力 Seams 总表：https://deepseek-harness.github.io/deepseek-harness/reference/capability-seams
- 插件配置目录（含 sandbox-policy/E2B 默认值）：https://deepseek-harness.github.io/deepseek-harness/reference/config-catalog
- Bash 执行器（ShellSandboxInfo/sandbox_permissions）：https://deepseek-harness.github.io/deepseek-harness/reference/subsystems/shell
- HTTP 服务器（绑定与无认证事实）：https://deepseek-harness.github.io/deepseek-harness/reference/subsystems/web-server
- 工具执行流水线：https://deepseek-harness.github.io/deepseek-harness/reference/tool-execution-pipeline
- Claude Code 权限对照：本机 2.1.195 settings.json 实证 + 官方 iam 文档（调研时点同上）
- 自托管清单风格参考：OpenHands SELF_HOSTING.md（docs/SELF_HOSTING.md，All-Hands-AI/OpenHands）
- 相关专题：[DeepSeek Harness 概览](/topics/deepseek-harness.md) · [Day 2 插件机制精读](/topics/dsh-day2-plugins.md)
