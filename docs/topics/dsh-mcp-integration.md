# dsh 作为 MCP client：外部工具服务器接入指南

> 调研时间：2026-08-26 · 来源：GitHub 源码（master@2026-08-21）+ 包 README + 实现笔记 + 本机实测（dsh 0.1.0-rc.6，全链路验证通过）

## 一、先说结论

dsh **原生支持作为 MCP client**，不需要装任何社区插件——官方内置桥接插件 `@deepseek-ai/dsh-mcp-client`（源码位于 `packages/mcp/mcp-client/`，随主包分发）。一个 MCP server = cordis 配置里的一条插件实例，server 的工具会以 `mcp__<serverName>__<tool>` 形式注册进模型工具列表，**命名拼法与 Claude Code、Codex 完全一致**（有意设计，见实现笔记）。

但有个反直觉的发现：**主 README、docs/ 目录、subsystems 子系统文档里全部搜不到 "MCP" 字样**。MCP 的全部官方文档藏在三个非显眼位置——包内 README、`examples/mcp-memory/` 示例、`.agents/notes/` 实现笔记。想用 MCP 全靠"考古"，这是 v0.1 文档债（信息日期：2026-08-26）。

## 二、官方考证：支持范围与设计决策

| 维度 | 结论（2026-08-26 源码考证） |
|------|------|
| 角色 | 仅 MCP **client**（消费方）；不做 server 端——"暴露为 agent"由 ACP 桥接承担 |
| 桥接能力 | 仅 **Tools**；Resources 和 Prompts 明确延后（需要 harness 侧尚不存在的消费机制） |
| transport | `stdio` + `streamable-http` 两种，**没有独立的 SSE 选项**（SSE 恢复机制由 SDK 传输层内部处理） |
| 底层 SDK | 官方 `@modelcontextprotocol/sdk`（版本锁定；同 SDK 也被 Claude Desktop / Cursor / VS Code 使用） |
| 实现时间线 | 2026-07-07 实现 → 2026-08-06 补自动重连 → 2026-08-13 随 v0.1 开源 |
| E2E 测试 | 官方 e2e 用 `server-everything` + `server-filesystem`（stdio）和进程内 HTTP transport |

### 关键设计决策（摘自实现笔记 `.agents/notes/.../2026-07-07-mcp-client-plugin.zh.md`）

- **为什么是 `mcp__<server>__<tool>`**：调研了 Claude Code / Codex / Gemini CLI / VS Code / Cline / Roo Code / Goose / OpenCode 八款客户端，全部按 server 限定工具名；dsh 拼法与 Claude Code、Codex 一致，"最大化模型熟悉度"。引用微软研究院调查：1,470 个 server 中 775 个工具名冲突，仅 `search` 就出现在 32 个 server 里——命名空间是结构性防冲突，不是事后补救。
- **serverName 是本地配置而非远端 `serverInfo.name`**：远端名称是"不可信输入、跨部署不唯一、升级时可变"，工具标识不能跟着它变。起个短名（如 `gh`）还能省 token。
- **stdio 子进程环境清洗**：spawn MCP server 前会移除父环境中匹配 `/KEY\|PASSWORD\|SECRET\|TOKEN/i` 的变量和所有 `DSH_*` 变量，再合并 `config.env`——密钥只能显式注入，不会意外泄漏给第三方 server。
- **垃圾进垃圾出**：工具描述和 JSON Schema 原样透传，不做 defineTool DSL 转换；server 作者的烂描述 = 模型的烂体验，桥接不背锅。

## 三、配置方式

### 3.1 配置格式（每个 server 一条插件实例）

```yaml
# stdio 传输：spawn 本地命令
- insert:
    - id: mcp-fs                       # 唯一 id
      name: '@deepseek-ai/dsh-mcp-client'
      config:
        serverName: fs                 # 工具命名空间，^[A-Za-z0-9_-]{1,32}$，全局唯一
        transport: stdio
        command: npx
        args: ['-y', '@modelcontextprotocol/server-filesystem', '/path/to/allowed/dir']
        env: {}                        # 额外环境变量（建议 !!js process.env.XXX 引用，别明文写密钥）

# streamable-http 传输：连远程 server
- insert:
    - id: mcp-web
      name: '@deepseek-ai/dsh-mcp-client'
      config:
        serverName: web
        transport: streamable-http
        url: http://localhost:3000/mcp
        headers:
          Authorization: !!js '`Bearer ${process.env.MCP_TOKEN}`'
```

### 3.2 完整字段速查（摘自包 README.zh.md，2026-08-26）

| 字段 | 传输 | 必填 | 说明 |
|------|:---:|:---:|------|
| `transport` | 两者 | ✅ | `"stdio"` 或 `"streamable-http"` |
| `serverName` | 两者 | ✅ | 工具命名空间；重复 serverName 会让后加载实例直接失败 |
| `command` / `args` / `env` / `cwd` | stdio | command ✅ | dsh 只负责启停子进程，**不跑包管理器**（要先装好 server） |
| `url` / `headers` | http | url ✅ | 上游 HTTP 服务必须已在运行 |
| `toolCallTimeoutMs` | 两者 | ❌ | 单次调用超时，默认 60000 |
| `failOnStartupError` | 两者 | ❌ | 默认 `false`：连接失败只记日志，插件照常激活（无工具）——**排错时注意这个静默模式** |
| `reconnect.*` | 两者 | ❌ | 自动重连：默认开，指数退避 500ms→30s，最多 10 次 |

### 3.3 三种生效方式

| 方式 | 命令/路径 | 场景 |
|------|------|------|
| 临时 | `dsh web --patch ./my-mcp.cordis.yml` | 试装、验证 |
| 单 profile 持久 | `$DSH_HOME/profiles/<name>/cordis.patch.yml`（`~/.dsh/profiles/web/...`） | 只给 web 配置用 |
| 全局持久 | `$DSH_HOME/cordis.patch.yml`（`~/.dsh/cordis.patch.yml`） | 本机所有 profile |

注意 patch 文件是"追加 insert 列表"结构，别覆盖已有用户 patch；改配置有 **HMR 热替换**（编辑 yml 触发断开+重连，serverName 不变则工具名不变，会话历史和权限规则继续有效）。

## 四、实测记录（本机 dsh 0.1.0-rc.6，2026-08-26）

实测环境：Node v24.16.0 + dsh 0.1.0-rc.6（全局安装于 `/usr/local/lib/node_modules/@deepseek-ai/dsh`）+ headless profile + 已配置的 DeepSeek API 端点。**三个 server、两种 transport 全链路（配置→spawn→工具发现→模型调用→结果回传）全部验证通过**：

| # | MCP server | transport | 验证任务 | 结果 |
|---|------|------|------|------|
| 1 | `@modelcontextprotocol/server-filesystem` | stdio | 让模型调 `mcp__fs__list_directory` 列目录 | ✅ 模型答出 shell 里预埋的 `canary.txt`（信息只可能来自 MCP server） |
| 2 | `@modelcontextprotocol/server-memory@2026.7.4` | stdio | 让模型建 entity | ✅ `memory.json` 真实落盘 `dsh-mcp-test` 实体 |
| 3 | `@modelcontextprotocol/server-everything@2026.8.18`（本地起 streamableHttp） | streamable-http | 让模型调 `mcp__ev__echo` | ✅ 返回 `Echo: hi-from-dsh` |

验证配置被识别的最快方式（不花钱）：

```bash
dsh --profile headless --dump-config --patch ./my-mcp.cordis.yml | grep -A6 mcp
# 输出里出现 "# == ./my-mcp.cordis.yml" + 完整插件条目 = 配置已合入组合树
```

### 4.1 踩坑实录（本机跑通前的 5 个拦路虎）

1. **`~/.dsh/.credentials.yaml` 格式**：合法格式是**扁平的 `引用名: "字符串值"` 映射**（源码 `parseCredentialsDocument` 强校验：key 必须是 POSIX 标识符、value 必须是非空字符串）。手写成 `version: 1` + `refs:` 嵌套结构会报 `the value for "version"/"refs" must be a string`——因为它把每个顶层 key 都当成一条凭证引用。修法：只留 `DEEPSEEK_API_KEY: "sk-xxx"` 一行。
2. **sharp 模块缺失**（`dsh-attachment-local` 依赖）：报 `Could not load the "sharp" module using the linux-x64 runtime`，插件树整体挂掉。修法：`cd /usr/local/lib/node_modules/@deepseek-ai/dsh && sudo npm install --include=optional --os=linux --cpu=x64 sharp --no-save`。
3. **HMR 需要 `--expose-internals`**：报 `--expose-internals is required for HMR service`。且该标志**不允许放进 NODE_OPTIONS**，只能命令行直传：`node --expose-internals $(which dsh | xargs readlink -f)` 等价入口 `node --expose-internals /usr/local/lib/node_modules/@deepseek-ai/dsh/lib/bin.js ...`。
4. **退出段错误（exit 139）**：rc.6 在任务完成、结果正常输出后于退出清理阶段崩溃，属 v0.1 已知粗糙点——**看 stdout 别看 exit code**。
5. **`@modelcontextprotocol/server-fetch` 已从 npm 下架（404）**：官方 archives 化了一批参考 server。挑 server 前先 `npm view <pkg> version` 确认还在；官方 example 的做法是**pin 死版本号**（如 `server-memory@2026.7.4`）。

另有一个纯乌龙但值得记录：本机 3001 端口被 cloudcli 占用，everything server 悄悄没起来，dsh 侧表现为"模型说工具不存在"而非报错——`failOnStartupError` 默认 false 的静默失败模式叠加端口冲突，排错先 `ss -tlnp` 确认 server 真在监听。

## 五、与 Claude Code 的 MCP 配置对照

"我在 Claude Code 里配好的 MCP server，搬到 dsh 要改什么？"——配置入口完全不同，但**工具命名完全一致**，模型的调用体验无缝：

| 维度 | Claude Code（2026-08 时点） | dsh（v0.1.0-rc.6） |
|------|------|------|
| 添加命令 | `claude mcp add <name> -- <command>` / `claude mcp add --transport http <name> <url>` | **无 CLI 命令**，手写 cordis patch yml（`insert` 列表） |
| 查看命令 | `claude mcp list` / `claude mcp get <name>` | `dsh --dump-config --patch x.yml`（看配置树）；工具面板看会话内注册 |
| 配置文件 | `~/.claude.json`（user 级）/ `.mcp.json`（project 级） | `~/.dsh/cordis.patch.yml`（全局）/ `~/.dsh/profiles/<name>/cordis.patch.yml`（单 profile） |
| server 条目格式 | `{"type":"stdio","command":"npx","args":[...]}` | `transport: stdio` + `command/args/env`（扁平联合类型，YAML） |
| transport | stdio / sse / http | stdio / streamable-http（无独立 sse） |
| 工具命名 | `mcp__<server>__<tool>` | `mcp__<server>__<tool>`（**完全一致**） |
| 环境变量注入 | `env` 字段 / `"${VAR}"` 展开 | `env` 字段 + `!!js process.env.XXX`（YAML 内嵌 JS 表达式） |
| 生效范围 | user / project（`local` 默认） | 全局 patch / 单 profile patch / `--patch` 临时 |
| 热更新 | 重启会话 | HMR 热替换（编辑 yml 即断开重连） |
| 断线行为 | 手动重连为主 | 自动重连（指数退避，预算耗尽后注销工具） |

**迁移口诀**：把 Claude Code 里每条 MCP server 配置的 `command/args/env`（stdio）或 `url/headers`（http）抄进 dsh 的 insert 条目，`serverName` 沿用原名，模型侧零感知——提示词、历史会话里的 `mcp__xxx__yyy` 工具名不用改。SSE-only 的老 server 需要确认上游已升级 streamable-http，或找替代。

## 六、生态位：dsh 插件 vs skill vs MCP server

承接 [skill vs 插件](/topics/waytoagi-dsh-skill-vs-plugin.md) 的结论——**插件解决"能做什么"，skill 解决"怎么做"**——MCP server 加入后形成三层生态位：

| 层 | 本质 | 强项 | 弱项 | 典型场景 |
|------|------|------|------|------|
| dsh 插件 | TS 模块，深度调 ctx（tools/llm/UI/事件） | 能力最深：可换模型、换 UI、挂服务；Cordis 生命周期托管 | 只服务 dsh 生态，写 TS，无跨框架复用 | 平台级改造（open-design、ruflo、记忆库） |
| skill | SKILL.md 指令包 | 零代码、40+ agent 通用、热更新 | 只教"怎么做"，不提供新能力 | 流程沉淀（提测清单、代码评审打法） |
| MCP server | 协议标准化的工具服务器 | **存量生态直接复用**：万级 server（GitHub/数据库/浏览器…）一把梭；语言不限 | 只有 Tools 能力；每工具 schema 透传有 token 成本；无 dsh 深度集成（无 UI 卡片/事件） | 接外部系统：GitHub、Slack、DB、搜索 |

### 选型决策（按顺序问三个问题）

1. **"这个能力市面上有现成 MCP server 吗？"** 有 → 直接配 dsh-mcp-client，5 分钟接入，别自己写（如接 GitHub：官方 server-github 一条配置完事）。
2. **"没有现成的，但我只需要模型知道怎么做？"** → 写 skill（纯 md，跨框架通用，成本最低）。
3. **"需要深度改造 dsh 本身，或提供 dsh 特有的服务/UI？"** → 写 dsh 插件（TS + Cordis，唯一能碰 ctx.llm / UI / 事件循环的层）。

一句话：**MCP 是"借力"，插件是"造轮子"，skill 是"教打法"**。v0.1 时点 MCP 桥只透传 Tools 意味着：想要 UI 卡片、权限预设、会话事件联动的深度集成仍然只有 dsh 插件一条路；而任何"接外部 API"的需求，都应该先扫一遍 MCP 目录再考虑动手。

## 七、已知限制（v0.1 时点，2026-08-26）

- 只桥接 Tools：Resources（上下文注入）和 Prompts（模板）延后，依赖它们的 server 只能用其工具部分。
- 启动超时沿用 MCP SDK 默认 60s，dsh 未暴露连接/发现超时配置——无响应 server 会拖慢激活。
- HTTP 传输的失败表现为**按调用重试**（SDK 的 SSE 恢复），不会触发 supervisor 重 spawn；stdio 崩溃才会自动重连。
- 每个工具名带 `mcp__<server>__` 前缀的 token 开销（官方评估后接受，理由：schema 描述才是 token 大头）。
- 图片是唯一持久化的富结果（PNG/JPEG/WebP/GIF）；音频、嵌入资源不进模型上下文。

## 参考

- 包 README（中文）：https://github.com/deepseek-ai/deepseek-harness/blob/master/packages/mcp/mcp-client/README.zh.md
- 实现笔记（中文，含全部设计决策）：https://github.com/deepseek-ai/deepseek-harness/blob/master/.agents/notes/implemented/feature/2026-07-07-mcp-client-plugin.zh.md
- 自动重连笔记：https://github.com/deepseek-ai/deepseek-harness/blob/master/.agents/notes/implemented/feature/2026-08-06-mcp-client-auto-reconnect.zh.md
- 官方记忆 MCP 示例（三种 server 配置范本）：https://github.com/deepseek-ai/deepseek-harness/tree/master/examples/mcp-memory
- MCP 官方 server 目录：https://github.com/modelcontextprotocol/servers
- 上游承接：[skill vs 插件（WaytoAGI）](/topics/waytoagi-dsh-skill-vs-plugin.md) · [skill 兼容机制](/topics/dsh-skill-compat.md) · [Day2 插件精读](/topics/dsh-day2-plugins.md)
