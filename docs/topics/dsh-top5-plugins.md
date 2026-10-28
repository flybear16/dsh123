# dsh 插件生态 Top 5 盘点——为主人画像选出的五个最值得装的插件（2026-10-28）

> 调研时间：2026-10-28 · 来源：GitHub API（topic:dsh-plugin 全量 star 榜 + 头部仓库 README 逐个精读）、npm registry（@deepseek-ai scope + 社区包）、官方 docs/cli-help.md、awesome-dsh-plugin 清单（21 分区 7,597 行）、sov2ex/V2EX 与掘金检索
> 时点锚定：主仓 deepseek-ai/deepseek-harness ⭐263,696（pushed 2026-10-23）；topic:dsh-plugin 共 **23,603 仓**——8 月 24 日盘点时为 11,275，两个月翻倍。本机 dsh 0.2.1-rc.2 与 ~/.dsh 配置零改动：本文只盘点、不安装，所有安装命令均为"下次要装时抄这个"的备忘
> 前置阅读：[Day 2 插件机制精读](dsh-day2-plugins.md)（8/24 生态快照）· [MCP 接入指南](dsh-mcp-integration.md)（桥接全链路实测）· [skill vs 插件](waytoagi-dsh-skill-vs-plugin.md)

## 一、先说结论

| # | 插件 | ⭐(10-28) | 一句话定位 | 对应画像痛点 |
|---|---|---|---|---|
| 1 | @deepseek-ai/dsh-mcp-client（官方） | 官方内置 | MCP 桥接地基，存量 server 直接搬 | MCP 重度用户；11/1 起 Search & Fetch 计费 → 本地 MCP 是省钱路线 |
| 2 | dsh-context | 3,720 | 上下文/成本仪表盘，官方员工推荐 | 峰谷定价敏感 + 缓存命门 + 新会话 1.5 万 token 固定税 |
| 3 | dsh-TUI | 6,004 | 终端原生 UI，官方 lead 推荐社区插件第一 | CLI-first 习惯；dsh 主场是 Web，TUI 补上终端体验 |
| 4 | volcengine/OpenViking | 40,969 | 上下文数据库：记忆+知识+skill 统一，字节出品 | 跨会话上下文复用（30+ 仓多项目 + 文档产出重）；agentmemory 的升级位 |
| 5 | dsh-market | 9,323 | 插件市场入口，0.2.1+ 原生 tab | 生态两月翻倍，持续淘插件需要货架 |

选择逻辑一句话：**1 是地基（不装白不装），2 管钱袋子，3 给 CLI 原生手感，4 管跨会话记忆，5 当淘货入口**。选型全部对照主人画像：CC 深度用户（每个都给了 CC 对应物）、MCP 重度、成本敏感、中文热度信号齐全。

## 二、逐个详析

### 1. @deepseek-ai/dsh-mcp-client —— 官方 MCP 桥接（必配地基）

- **是什么/痛点**：让 dsh 作为 MCP client 接入任意 MCP server，server 工具以 `mcp__<server>__<tool>` 注册进模型工具列表。主人本地跑着 agentmemory 等 MCP server——这是存量资产直接复用的通道，不用为 dsh 重写任何工具。
- **来源/热度**：官方出品（源码在主仓 `packages/mcp/mcp-client/`，随主包分发，另有独立 npm 包 `@deepseek-ai/dsh-mcp-client`）。主仓 ⭐263,696 是整个生态的底座。
- **安装/启用**：内置插件无需安装；独立接入走 cordis patch（完整字段速查和三种生效方式见 [MCP 接入指南](dsh-mcp-integration.md) §3，本机已有实测记录）。0.2.x 另有官方新包 `@deepseek-ai/dsh-mcp-resources`（0.1.6-alpha.1，2026-09-15 发布）——把桥接能力从 Tools 扩展到 MCP Resources，补上了 v0.1 "只桥 Tools" 的最大缺口。
- **CC 对照**：工具命名 `mcp__<server>__<tool>` 与 Claude Code **完全一致**（官方调研过 8 家客户端后有意对齐）；CC 的 `claude mcp add` 对应 dsh 的手写 patch / `dsh plugin`，配置字段 command/args/env 可直接抄。
- **风险/成本注意**：`failOnStartupError` 默认 false——server 没起来只是静默无工具（本机踩过端口冲突 + 静默失败的组合坑，排错先 `ss -tlnp`）；stdio 子进程有环境变量清洗（KEY/PASSWORD/SECRET/TOKEN 不透传），密钥只能显式注入，安全性 OK。
- **成本联动（重点）**：官方宣布 2026-11-01 起 Search & Fetch server-side 调用计费（$0.75/千次）。把搜索/fetch 类需求改走**本地 MCP server**（经本桥接入），调用发生在本机，不产生 server-side 计费——这条路线是否完全绕开计费口径，**待实测**（以 11 月账单为准）。

### 2. dsh-context —— 上下文与成本仪表盘（管钱袋子）

- **是什么/痛点**：上下文全生命周期管理：KPI 带 + 7 天 token/成本曲线、活动热力图、上下文构成/趋势/事件面板、子代理卡片（Fleet tab）、`/context` 斜杠命令。把"这个会话烧了多少钱、缓存命中怎么样"从盲区变成常驻可视化。
- **来源/热度**：bowenliang123，GitHub ⭐3,720；npm `dsh-context` v0.77.0（2026-10-25 发布，抓取时 3 天前）——发版活跃。**被 DeepSeek Harness 官方员工 @tianyicui、@turtle1999 推荐并 star**（README 引 X 帖），是社区插件里少见的"官方盖章"。
- **安装/启用**：`dsh plugin --profile web add dsh-context`（官方 cli-help 证实的通用插件安装姿势）；Web UI 里也可走 Plugins → Add plugin 搜索框。
- **CC 对照**：≈ Claude Code `/context`（上下文可视化）的加强版——多了跨会话汇总、成本估算和 7 天趋势，CC 没有等价物。
- **风险/成本注意**：读侧统计为主，本地运行，无额外 API 调用；估算口径是插件侧计算，与官方账单可能有出入，对账以 DeepSeek 后台为准。**待实测**：本机 headless/TUI profile 下面板可用性。

### 3. dsh-TUI —— 终端原生 UI（CLI 党的本命）

- **是什么/痛点**：给 dsh 一个完整的终端界面：流式 Markdown、工具卡、`/` 与 `@` 补全、double-Esc 时间回溯、上下文进度条、TPS 表、任务完成通知。零内核改动，只消费 dsh 公开导出。
- **来源/热度**：ccch1mneyyy，GitHub ⭐6,004。README 声明"**DeepSeek Harness 官方 lead 推荐的社区插件中 dsh-TUI 排第一**"，且被 DeepSeek Harness **官方微信公众号**转发（README 附截图），第三方插件目录 dshfind 收录——中文热度与官方背书双证据。
- **安装/启用**：`npm install -g @deepseek-ai/dsh @deepseek-harness-tui/dsh-tui` 然后 `dsh-tui`（首次运行自动初始化 profile，需要 pnpm）。Windows 另有一键安装器。注意 Node 版本要求与 dsh 主程序一致（本机已满足，≥20.12）。
- **CC 对照**：dsh 原生主入口是 Web UI（`dsh web`），对 CC 用户是体验断层；dsh-TUI ≈ 把 CC 那套终端体验搬进 dsh。加分项：支持 `--backend claude / codex` 切换内核——混用过渡期可以一个 TUI 入口跑不同后端。
- **风险/成本注意**：模型调用仍走所配 DeepSeek 端点，插件本身不产生新费用；`--backend claude` 需另装对应 CLI 与凭证（本机已有 CC，理论上零成本试）。**待实测**：双后端切换的实际稳定性。

### 4. volcengine/OpenViking —— 上下文数据库（记忆+知识+skill 三合一）

- **是什么/痛点**：把 agent 的一切上下文（知识/记忆/skill）组织成 `viking://` 虚拟文件系统：L0 目录摘要 → L1 总览 → L2 原文的分层读取让 agent 先读摘要判断相关性再决定开原文（省 token）；语义检索可圈定子目录而非全库扫；会话提交后归档为可读可编辑的 Markdown 记忆。
- **来源/热度**：字节跳动（火山引擎）出品，GitHub ⭐40,969、Trendshift 收录、Apache 2.0（个别语言适配器有 AGPL，接前看 LICENSE）。官方集成矩阵明确列出 **DSH（Plugin + MCP 双通道）**，memory plugin installer 会自动检测本机 agent（覆盖 Claude Code/Codex/Cursor/TRAE/OpenCode/DSH）并生成对应挂载。
- **安装/启用**：`uv tool install openviking --upgrade && openviking-server init`（init 向导配模型），然后跑官方 memory plugin installer 对 DSH 生成插件+MCP 挂载。云端有 OpenViking Studio 可先零安装体验。
- **CC 对照**：CC 是 MEMORY.md 手工记忆流，无原生等价物；OpenViking ≈ 把"记忆"升级成"带检索的上下文数据库"。对主人另有一层意义：本机 agentmemory 已覆盖"记忆"单点，OpenViking 是记忆+知识 RAG+skill 的三合一上位替代——建议先并行试用再决定是否替换，**不要直接迁移**。
- **风险/成本注意**：自建 server 要配一个模型做摘要/检索（走所配 DeepSeek 端点，正常计费）；多一个常驻服务要管生命周期；与 agentmemory 功能重叠是最大的决策成本。**待实测**：DSH 插件通道的实际挂载效果与 token 开销。

### 5. dsh-market —— 插件市场（淘货入口）

- **是什么/痛点**：装进 dsh 的可视化插件市场：Plugins 页面里的 Discover tab（0.2.1+ 原生位置），浏览/搜索/一键安装/主题热切换。生态两个月翻倍的背景下，与其每次翻 GitHub，不如有个货架。
- **来源/热度**：dsh-market org，GitHub ⭐9,323。其目录本身还是一份市场索引（`https://cdn.jsdelivr.net/npm/dsh-plugin-catalog/index.json`，可在 Plugins → Discover → Index sources 挂载）。配套的 awesome-dsh-plugin 清单（⭐21,133）是另一条交叉验证渠道。
- **安装/启用**：`dsh plugin --profile web add dshmarket`，重启 `dsh web` 生效。注意：DSH Desktop 用户要走应用内 Settings → Plugins 安装（CLI 装会进错 profile）。
- **CC 对照**：≈ CC 社区 plugin marketplace 的形态；CC 无官方市场，dsh 生态反而先把货架做进产品页了。
- **风险/成本注意**：市场 ≠ 审核——本期调研明确看到头部榜里有"贴着 dsh 标签但根本不是 dsh 插件"的仓库（见下节 rea 案例），**装任何插件前先读 README 确认接入方式**。

## 三、很火但没进 Top 5 的（防 star 迷惑清单）

| 仓库 | ⭐ | 不选理由 |
|---|---|---|
| nexu-io/open-design | 104,393 | 社区最大插件、"dsh 上的 Claude Design 平替"。但重 workspace 型产品，设计产出不是主人主线（Hermes 侧已有 image-gen/archify），需要做界面/海报时再上 |
| Ebony-Vinyl/dsh-our-free-model | 46,810 | 免费车道聚合（OpenCode Zen 网关 + Kilo 免费池 + TRAE/Qoder/ZCode 等十个账号渠道），中文社区热度极高。但：流量过第三方网关（数据出境给上游）、账号渠道有 ToS 灰色地带、官方 README 明确警告**不在 npm 发布**只从仓库 Release 装（防假冒签名包）。想省 API 钱可以研究，但属"先读免责声明再动手"级 |
| morluto/rea | 397,504 | **star 数全场最高但根本不是 dsh 插件**——通用 MCP server（逆向工程用，npx 一行注册到任何 agent），全栈开发画像用不上。教训：topic 打标 ≠ dsh 原生插件，选型别被 star 数带跑 |
| ruvnet/ruflo / esengine/DeepSeek-Reasonix | 79,802 / 35,983 | agent 元框架/独立编码 agent，是"平台级替代"而非"装上增强 dsh"，与主人现有 hermes+CC 栈重叠 |
| titanwings/distilly（colleague.skill） | 26,107 | 把人的聊天记录/文档蒸馏成可复用 skill，创意极好，但 skill 形态（跨 agent 通用）而非 dsh 插件，且偏组织交接/趣味场景 |
| NanmiCoder/dsh-agent-teams | 2,483 | dsh 内多智能体协作（captain 分派 + 依赖感知任务 + 成员唤醒）。设计不错，但与主人现有 hermes kanban + LoopX 编排栈完全重叠，列观察名单 |

## 四、"很火"的热度证据（2026-10-28 实抓）

- **GitHub**：topic:dsh-plugin 11,275（8/24）→ **23,603**（10/28），两个月翻倍；主仓 ⭐190,974 → **263,696**
- **V2EX**："dsh 插件" 相关 **102 帖**（sov2ex 检索），最新一帖 10-27（前一天）仍在发新插件；"dsh 是否会成为新的一代 agent 标准?"（10-25）这类方向讨论已出现
- **掘金**：《DeepSeek Harness 值得安装的 15 款插件》**2.43 万阅读 / 99 赞**（8/19）；《16 个超火的插件》8,442 阅读（8/21）——"必装插件"已成固定内容品类
- **生态结构观察**：awesome 清单 21 个分区里 Memory 315 条、Skills 269 条、Git & Code Review 154 条、Usage & Billing 100+ 条——**腰尾部是海量个人小工具（多数 <50⭐），头部集中在平台级插件（设计/记忆/编排/市场）**。"按画像选头部"比"按清单全装"靠谱得多

## 五、成本联动备忘（Search & Fetch 计费倒计时）

- 2026-11-01 起 dsh 内置 Search & Fetch 的 server-side 调用计费 $0.75/千次（详见[成本与模型选择](dsh-cost-and-model-selection.md)复核记录）
- 本文 Top 5 内的省钱闭环：**#1 MCP 桥**（搜索/fetch 走本地 server 不经 server-side 计费，口径待 11 月账单验证）+ **#2 dsh-context**（每一步成本可视化，配合峰谷时段表用）
- 反向提醒：装任何"替你调官方搜索"的第三方插件前，先确认它的调用走谁的服务器——生态里不缺把免费功能变计费项的路径

## 六、Top 5 对比表（收尾）

| # | 插件 | ⭐(10-28) | 形态 | 解决什么 | CC 对应物 | 安装（备忘，勿在本机执行） | 主要风险 |
|---|---|---|---|---|---|---|---|
| 1 | @deepseek-ai/dsh-mcp-client | 官方 | 内置插件+npm | 存量 MCP server 直接复用 | `claude mcp add`（工具命名一致） | 内置无需装；独立场景写 cordis patch | 静默失败模式；Resources 桥还是 alpha |
| 2 | dsh-context | 3,720 | 插件（npm） | 上下文/成本可视化 | `/context` 加强版 | `dsh plugin --profile web add dsh-context` | 估算口径与账单可能有出入 |
| 3 | dsh-TUI | 6,004 | 独立 TUI（npm） | 终端原生体验 | CC 终端形态本身 | `npm i -g @deepseek-harness-tui/dsh-tui` 后 `dsh-tui` | 需 pnpm；多后端切换待实测 |
| 4 | volcengine/OpenViking | 40,969 | 服务+插件/MCP | 跨会话记忆+知识 RAG+skill | 无原生等价物 | `uv tool install openviking` + installer | 与 agentmemory 重叠；常驻服务运维 |
| 5 | dsh-market | 9,323 | 插件（npm） | 插件货架/一键安装 | 社区 marketplace 形态 | `dsh plugin --profile web add dshmarket` | 市场≠审核，装前读 README |

## 参考

- 主仓：https://github.com/deepseek-ai/deepseek-harness （⭐263,696，2026-10-28 抓取）
- topic:dsh-plugin star 榜：https://github.com/topics/dsh-plugin （23,603 仓）
- 官方 CLI 帮助（`dsh plugin` 安装语义）：https://github.com/deepseek-ai/deepseek-harness/blob/master/docs/cli-help.md
- @deepseek-ai/dsh-mcp-client（npm）：https://www.npmjs.com/package/@deepseek-ai/dsh-mcp-client
- @deepseek-ai/dsh-mcp-resources（npm，2026-09-15 首发）：https://www.npmjs.com/package/@deepseek-ai/dsh-mcp-resources
- dsh-context：https://github.com/bowenliang123/dsh-context · https://www.npmjs.com/package/dsh-context
- dsh-TUI：https://github.com/ccch1mneyyy/dsh-TUI
- OpenViking：https://github.com/volcengine/OpenViking · https://openviking.ai/integrations
- dsh-market：https://github.com/dsh-market/dsh-market
- awesome-dsh-plugin（⭐21,133 清单）：https://github.com/awesome-dsh-plugin/awesome-dsh-plugin
- 热度检索：sov2ex（V2EX 全文检索，q="dsh 插件"，102 帖）· 掘金搜索 API（q="dsh 插件"）
- 上游承接：[Day 2 插件机制精读](dsh-day2-plugins.md) · [MCP 接入指南](dsh-mcp-integration.md) · [成本与模型选择](dsh-cost-and-model-selection.md)
