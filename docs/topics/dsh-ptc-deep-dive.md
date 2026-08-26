# dsh PTC 模式深潜——差异化卖点解剖（2026-08-26）

> 调研时点：2026-08-26 · 主仓库 master（⭐197k+，pushed 2026-08-21）· 全部结论出自官方源码/文档逐条考证，无实测数据（本机无 DeepSeek API Key，实验部分标注【待实测】）
> 快速回顾：dsh 四种模式 = Standard（全套工具）/ **PTC**（模型写代码编排工具链）/ Minimal（bash+editor）/ Creative（自定义）。前 5 篇专题对 PTC 只有一句话，本篇补全。

## 一、PTC 到底是什么：一张表说清

PTC 在源码里的真名叫 **Code Mode**，本质是**工具呈现层（presentation）的切换**，不是新工具集：

| | Standard（native，默认） | PTC（code） |
|---|---|---|
| 模型看到的工具 | 每个工具的完整 JSON Schema | 只有 1 个 `run_code` + 系统提示词里的生成 SDK 段 |
| 一次动作 | 发一个 tool_use block | 写一段 TypeScript（async 函数体） |
| N 个工具调用 | N 次模型往返（每次结果回传再决策） | **1 次往返**：程序内 `await tools.xxx()` 连环调用 |
| 中间结果 | 全部进对话历史 | 只有 print/return 进历史，中间值留在程序里 |
| 工具集本身 | 不变 | **完全相同**（bash/fs/search/jobs/skills/subagent/workflow…） |

- 配置开关：`ToolPresentationMode = 'native' | 'code' | 'both'`（`packages/core/tools/src/index.ts:654`）。`both` = 两套都发给模型让它自选
- 官方 preset 原话（`apps/cli/config/agent-presets/code/agent.cordis.yml` 注释）：code preset = standard 原封不动 + 一行 `tool-presentation: mode: code`——"a sequence that would be five round trips becomes one"（本来五次往返的序列变成一次）
- Web UI 模式列表里的「PTC 模式」描述：「具备标准模式的全部能力，并通过 Code Mode SDK 呈现工具，让模型用一个 TypeScript 程序组合多步操作」（preset.yml，order 2）

**一句话总结：PTC 不是换了工具，而是把"工具调用"从协议层（每个调用一个 block）搬到语言层（程序内函数调用）——循环控制权从"模型-工具-模型-工具…"的乒乓变成模型一次性写完、harness 一次跑完。**

## 二、机制深潜：与 Standard 逐层对比

### 2.1 工具调用协议：schema 洪流 vs run_code + 生成 SDK

**Standard**：系统提示词组装时把所有可见工具的 JSON Schema 全量发给模型（`ctx.systemPrompt.tools()` 提供方），模型按 schema 逐个发 `tool_use`。

**PTC**：模型只看到一个工具——

```jsonc
run_code: {
  code: string        // async 函数体，顶层 await/return 可用
  description: string // 5-10 词摘要，UI 展示用（"Count TODO markers across packages"）
}
```

（定义于 `packages/core/tools/src/code-mode.ts`，`RUN_CODE_NAME = 'run_code'`）

同时系统提示词多出一段 `tools:sdk`（order 150，工具引导区），由 `ts-types.ts` 的 `renderToolsSdk()` 从**同一份注册表**确定性生成（工具按字典序、同工具集字节级相同输出）。模型看到的 SDK 长这样（节选自源码内置模板）：

```ts
type JsonValue = null | boolean | number | string | JsonValue[] | { [key: string]: JsonValue }

interface ToolArgsMap  { bash: {...}; read_file: {...}; /* 每个工具的参数类型 */ }
interface ToolOutputMap { bash: {...}; read_file: {...}; /* 每个工具的返回类型 */ }
type ToolName = keyof ToolOutputMap
declare class ToolCallError extends Error { readonly toolName: ToolName }
declare const tools: {
  [K in ToolName]: (args: ToolArgsMap[K]) => Promise<ToolOutputMap[K]>
}
```

要点（均出自 `SDK_INSTRUCTIONS` 模板原文）：

- 调用即 `await tools.name(args)`，异名工具用 `tools["my-tool"](args)`
- 独立只读调用可以 `Promise.all` 并发；写操作自动串行（见 2.2 调度契约）
- **只有 print/return 是程序输出**——"every other intermediate result stays out of the conversation, so extract just what you need"
- TS 限定 erasable syntax（无 enum/namespace），类型标注仅供参考，实际类型剥离执行；Python flavor 已定义但**只有 TypeScript 有已发布后端**（code-runtime.md 明示）

### 2.2 执行模型：乒乓 vs 一次程序

**Standard 的 step 循环**（`docs/agent-lifecycle.md` 序列图）：`组装 prompt → LLM 流式 → classify 待处理调用（parallel/exclusive）→ 有界滚动池并发执行 → tool/result 回传 → 下一步 → 再问 LLM…`。exclusive 调用（如写文件）形成独占屏障。**每个 step 都要过一次模型**。

**PTC 的 run_code 执行**（`code-mode.ts:330-380` + `docs/subsystems/code-runtime.md`）：

1. 程序交给 `ctx.codeRuntime`（能力 seam，worker-thread 后端，隔离标签 `'worker-thread'|'process'|'container'`——**诊断标签，非安全声明**）
2. `tools` 命名空间作为 host 绑定注入程序全局；绑定名当敌意输入处理（`__proto__` 是普通自有属性，防原型污染）
3. 程序内的每次 `tools.xxx()` 是一次 **sub-dispatch（子分发）**，走**与 native 完全相同的策略管线**：pre-execute/guards → 执行 → post-execute → settle 事件。权限/审批一点没降级
4. 子调用 id 规则 `<parent>:code:<n>`，每个子分发落 `tool/code-dispatch` 事件（可重建、可审计）
5. 调度契约同 native：**启动严格按提交序；结果按提交序 commit（head-of-line 游标）；连续 parallel 类调用重叠至上限 `maxParallelSubCalls`（默认 10）；exclusive 调用等池排空、独跑、屏障保持到其 commit 完成**；每次启动前惰性重读分类（注册表运行时变更可翻转调用类型）
6. 关键封锁：`mode: code` 下**模型直呼 native 工具名会被拒（UNKNOWN_TOOL）**——只有带 parent token 的 SDK 子分发能执行 native 工具（tools.zh.md 明示）

大白话：Standard 像"你点一个菜，厨师做好端上来，你看一眼再点下一个"；PTC 像"你写一张完整菜单交给厨师，他按依赖顺序炒，上菜顺序还有保证，最后只端一道拼盘"。

### 2.3 错误恢复：回炉 vs 程序内自愈 + 结构化失败

| 失败类型 | Standard 的恢复路径 | PTC 的恢复路径 |
|---|---|---|
| 单个工具调用失败 | isError 结果回传模型 → 下一轮模型决定重试/换路 | 程序内 `try/catch ToolCallError`（带 toolName + 人话 message），**当场处理继续跑，不消耗模型轮次** |
| 程序本身崩了 | 不适用 | `CodeRunFailedError`（`CODE_RUN_FAILED`）→ 结构化 isError 结果：失败种类 + 捕获的日志，模型读到后下一轮改代码自纠 |
| 预算超时/中止/substrate 死亡（OOM） | 不适用 | `CodeRunFailure` 六分类：`exception / timeout / abort / worker-exit / invalid-output / output-limit`，**正交上报**（超时≠异常≠中止）。错误是 result 的字段，不是 run() 的 rejection |
| 返回值非法/超限 | 不适用 | run 直接判失败，不拿渲染字符串顶替（无静默降级） |

配套的上下文管理：超大文本结果走 **spill**（`docs/subsystems/spill.zh.md`）——落盘持久化，模型只拿 preview + 定位符 + 检索指引；含图片的子工具结果在 run 结束后附加（模型下一步能看到）。`tools/code-dispatch-log` waterfall 可改写持久日志副本而不影响程序已收到的值。

## 三、同任务对比实验（设计 + 预期差异）【待实测】

任务体建议的基准任务：**「列出 docs/topics/ 目录所有 md 文件并统计总字数」**。

### 3.1 实验设计（可复现）

环境：`npx @deepseek-ai/dsh web`，模型固定 `deepseek-v4-flash`（学习期便宜），同一 workspace，两个全新会话分别挂 Standard 与 PTC preset（Web UI 模式列表切换；**仅空白会话可切**，切换锁 `agent-preset-locked`）。

| 步骤 | Standard 会话 | PTC 会话 |
|---|---|---|
| 1 | 选「标准模式」，发任务 | 选「PTC 模式」，发同一任务 |
| 2 | 观察 Trajectory：预计 `list/glob → read_file × N → 汇总回复` | 观察 Trajectory：预计 1 次 `run_code`，程序内循环 `await tools.read_file()` 累加字数后 `return` |
| 3 | 记录指标（见下） | 同左 |

记录指标（每次会话跑 3 遍取中位数）：

1. **模型往返数**（assistant 消息条数）
2. **input/output tokens**（token-meter 投影单元）
3. **总耗时**（turn 开始到结束）
4. **失败点**：文件名含空格/中文是否踩坑；第 i 次读文件失败后是否需要回炉模型

扩展任务（可选，测边界）：B 任务「找出仓库里所有 TODO 并按文件分组计数」（更多步骤、需要聚合）；C 任务「这段代码有什么 bug」（纯问答，无工具）。

### 3.2 预期差异（基于机制推导，非实测数据）

| 维度 | 预期 | 机制依据 |
|---|---|---|
| 模型往返 | Standard ≈ 2-3 轮（列表 1 轮 + 读文件 1-2 轮）；PTC = 1 轮 | PTC 只需一次 run_code |
| input tokens | PTC 首轮略高（SDK 段 vs 全量 schema，量级相近）；**后续轮 PTC 显著低**——N 个文件内容不重复进历史 | 中间结果不进对话（SDK_INSTRUCTIONS 原文） |
| output tokens | PTC 更低（只输出 return 的汇总数，而非逐文件复述） | curated output |
| 耗时 | 文件多时 PTC 占优（省 N-1 次 LLM 推理往返；工具执行本身时间两边一样） | 往返合并 |
| 失败点 | Standard：某文件读取失败 → isError 回传 → 多 1 轮；PTC：程序内 catch → 当轮消化 | §2.3 |
| 纯问答（C 任务） | 两者几乎无差（都不用工具） | PTC 差异只在工具呈现层 |

⚠️ 以上全部为机制推导的**预期**，等 API Key 到位后按 3.1 跑实测回填。注意 v0.1 接口常变，实测前先 `dsh --dump-config` 确认 preset 列表。

## 四、场景判定：什么时候用 PTC

**更划算（多步编排/数据处理）**：

- 批量文件操作：N 个文件读-改-写-验证，往返数从 N 压到 1-2
- 数据聚合统计：列表 → 过滤 → 累加 → 分组，程序内循环比模型逐轮记忆靠谱
- 需要**中间变量**的任务：上一步输出作为下一步输入，放程序变量里比放对话历史里准（不会抄错）
- 大结果集只要摘要：100 个文件的 full text 留在程序里，只 return 三行统计
- 可并发的只读调查：`Promise.all` 并发读，native 模式下这些也是并发，但 PTC 省 N 次推理
- 工具 schema 洪流场景：注册了几十个 MCP 插件时，native 每轮全量 schema，PTC 换成一个 run_code + 静态 SDK 段

**别用/慎用**：

- 纯问答、零工具调用：模式无差异，白付 SDK 段 token
- 单工具单次调用：run_code 包一层纯属过度包装，native 一步到位
- 模型代码能力弱或任务逻辑刁钻：程序写错 → CODE_RUN_FAILED 回炉，比 native 单步错误更"贵"（一次废掉整段程序）
- 需要逐步人审的操作：native 每个调用独立过审批，UI 粒度自然；PTC 一个程序一次提交，人工把关的对象变成"代码"而非"动作"（子调用虽也逐个过 policy，但预览体验不同）
- 注意：PTC 下 exclusive 工具（写操作）依然自动串行成 barrier——并发收益主要在只读调用

## 五、业界对照：Anthropic / OpenAI 怎么做

| | Anthropic tool use | OpenAI function calling | dsh PTC（Code Mode） |
|---|---|---|---|
| 协议形态 | 消息内 `tool_use` block，结果以 `tool_result` 回传 | `tool_calls` 字段，结果走 `tool` 角色消息 | 模型只发 `run_code(code, description)`，工具调用发生在程序语言层 |
| 多步任务 | 每步一次模型往返（agentic loop 在客户端） | 同左 | 一次往返，循环下放到 harness 执行 |
| 工具描述 | 逐个 API schema | 逐个 function schema | 从注册表**自动生成 typed SDK**（ToolArgsMap/ToolOutputMap，含类型化返回值） |
| 执行环境 | 客户端自己跑 | 客户端自己跑 | 内置 code-runtime（worker-thread，绑定注入） |
| 错误自愈 | 回传模型重试 | 回传模型重试 | 程序内 try/catch 即时自愈，崩溃才回炉 |

脉络定位（笔者按）：

1. 「用可执行代码统一 agent 动作」的学术代表是 **CodeAct**（Wang et al., *Executable Code Actions Elicit Better LLM Agents*, ICML 2024）——dsh PTC 是这一路线的产品化，且工程化点在别家没做到位的地方：**typed SDK 自动生成**（模型对返回值有类型可依）+ **子调用走完整权限/审批管线**（能力没因"变成代码"而旁路）+ **调度契约与 native 完全一致**（提交序 commit、exclusive barrier，可审计可重建）
2. OpenAI Code Interpreter / Anthropic 的 code execution 工具也"让模型写代码"，但定位是数据分析/计算沙箱，**不是工具调用协议的替代**；dsh 是把两者合并——代码既是算力也是工具总线
3. Claude Code 的对应物：Skill（SKILL.md 渐进加载）解决"知识注入"，MCP 解决"工具接入"，但工具调用仍是逐轮 native 协议。PTC 直接动了协议层——这是 dsh 相对 Claude Code 最锋利的一刀，也是前 5 篇专题里"最大差异化卖点"评价的实体

边界提醒：code-runtime 的 `isolation` 字段官方明说是**诊断标签而非安全声明**；程序与工具同宿主进程族（worker-thread），高敏感部署应自行组合 container 后端或叠加沙箱栈。

## 六、关键链接

- run_code 定义与调度：https://github.com/deepseek-ai/deepseek-harness/blob/master/packages/core/tools/src/code-mode.ts
- TS SDK 生成器：https://github.com/deepseek-ai/deepseek-harness/blob/master/packages/core/tools/src/ts-types.ts
- code-runtime 子系统：https://github.com/deepseek-ai/deepseek-harness/blob/master/docs/subsystems/code-runtime.md
- tools 子系统（native/code 呈现、调度契约）：https://github.com/deepseek-ai/deepseek-harness/blob/master/docs/subsystems/tools.zh.md
- PTC preset 组装（官方动机注释）：https://github.com/deepseek-ai/deepseek-harness/blob/master/apps/cli/config/agent-presets/code/agent.cordis.yml
- spill 存储：https://github.com/deepseek-ai/deepseek-harness/blob/master/docs/subsystems/spill.zh.md
- CodeAct 论文：https://arxiv.org/abs/2402.01030
