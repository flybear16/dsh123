# archify —— 自动画可交互架构图

> 把想法、计划或整个代码库变成可交互的 HTML 架构图：agent 读代码生成带源证据的系统地图，输出单个自包含 HTML 文件。数据复核 2026-11-17。

**热度**：tt-a1i/archify ⭐98,001（11-20 双通道复核：GitHub API 98,001 / shields.io 98k 一致；12 个里最高。11-17 曾抓到 26k，为 shields 边缘缓存陈旧值，已废弃）、skills.sh 130K+ 安装、**2026-09-01 GitHub Trending 周榜全语言第 1**、量子位（QbitAI）专访。Apache-2.0，稳定版 v3.2.0。

## 是什么

官方口号 "Turn any idea, plan, or codebase into a beautiful interactive diagram"。形态是 **agent skill**（Claude Code / Codex / Cursor / OpenCode 一等公民），DSH 走社区适配插件通道；Kimi Work 插件商店里叫 "Interactive Architecture Diagram"。**不要求有仓库**——纯描述也能画；有仓库时节点可标 `SRC n`，点开就是 Git 验证过的文件+行区间（pin 到指定 commit）。

**鱼皮实测案例**（2026-11-06，中文架构图）：给「AI 闯关学习小程序」画图，产出 微信小程序前端 → FastAPI 后端（知识库/出题/复盘服务）→ LangGraph Agent → Chroma 向量库 / DeepSeek / 阿里云百炼，模块间调用关系都标了出来——「画得相当准确」。代价：画完会反复截图自检，**一张图 16 分钟、8 毛多**（成本为鱼皮实测口径，README 未给数字），急件别用。

## 十种图 + 对比视图

| 类型 | 适用 |
|---|---|
| Architecture / Workflow / Sequence / Data Flow / Lifecycle | 架构、CI/CD 与审批流、API 调用时序、数据流与 PII 边界、状态机 |
| ERD / Class / Tree / Timeline / Waterfall（3.1 新增） | 库表关系（含每列类型与键）、类契约、层级拆解、事件时间轴、请求耗时瀑布 |
| Architecture Delta | 设计/PR 评审：Before/Delta/After 快照对比，带机器回执；明确不推断影响、风险或合并安全性 |

## 工程化设计（与"让 AI 随手画图"的差别）

- agent 生成 **typed JSON IR**（每种图有 schema、可复现）→ 原子校验（schema/layout/HTML-SVG/route/label 间隙全过才算数）→ 失败返回**机器可读修复单**（规则码+证据+修复控件，不是 Node 堆栈）→ deliver 原子替换，坏文件永远顶不掉上一个好文件（last-good live preview）。
- 交互是"诚实的"：focus、上下游 reach、路径追踪复用**作者写下的**节点与关系，不发明拓扑、不声称运行时影响。
- 输出是一个自包含 HTML：下载发人即可看，无需装 archify；导出 PNG/WebP/JPG 长图、路径分享卡 1200×630。

## 安装

| 场景 | 命令 |
|---|---|
| 通用（让 agent 自己装） | `Install Archify for me by reading https://raw.githubusercontent.com/tt-a1i/archify/main/llms.txt` |
| Claude Code | skill 装到 `~/.claude/skills/` 或 `.claude/skills/`；试装 `npx skills use tt-a1i/archify@archify --agent codex` |
| **DSH（社区适配）** | `dsh plugin --profile web add @tt-a1i/archify-dsh@1.1.0`（面向 developer-preview `@deepseek-ai/dsh@0.2.1-rc.2`；Node `^22.19.0 \|\| >=24`；无遥测；卸载 `dsh plugin --profile web remove @tt-a1i/archify-dsh`） |

触发语：`Use the archify skill to map this repository's runtime architecture.` 更新检查可选且只提醒不安装，`ARCHIFY_UPDATE_CHECK_DISABLED=1` 可完全断网。官方免费开源渠道为 GitHub 仓库 + archify.si；同名第三方在线服务与付费方案与官方无关，看清再用。

## 风险与注意

- **慢且贵**（鱼皮实测 16 分钟/8 毛+一张图）：本质是 agent 深读代码+多轮校验的代价。轻量看结构不如先让模型口头总结，重要交付物再上 archify；架构图类任务建议单独开会话跑，不占用日常编码上下文。
- DSH 通道是社区适配、声明"不是 DeepSeek 官方产品"，且锚定 0.2.1-rc.2——DSH 升级后留意兼容公告；Shell 文件需要精确 workspace 路径，不认 Web Produced Files。
- 定位边界（README 自述）：不是通用绘图编辑器、不是 Mermaid 主题；自动 Mermaid 解析、托管分享、所见即所得编辑明确不在范围内。

## CC 对照

archify 本身就是 CC skill 形态的第一公民（`~/.claude/skills/`），CC 用户零学习成本——这是 12 个里「DSH 插件与 CC skill 同源」的典型。本机 Hermes 侧已装有 archify（见[插件生态 Top 5](dsh-top5-plugins.md)备注），同款能力不必在 DSH 里重复装——两边选一头用。

## 出处

- https://github.com/tt-a1i/archify（README，2026-11-17 抓取）
- 程序员鱼皮 2026-11-06 盘点（案例/耗时/成本为其实测口径）· 本站《[12 个超火插件盘点](dsh-top12-plugins.md)》
