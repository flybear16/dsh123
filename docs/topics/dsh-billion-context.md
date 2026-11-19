# billion-context —— 上下文压缩（下载榜第 1）

> 站在任何 agent 与模型 API 之间的压缩代理：把消耗掉的对话折叠成分层摘要，长会话可以跑几天——十亿 token 级流量过一个 100K 窗口。数据复核 2026-11-17。

**热度**：dshmarket 下载榜第 1，周下载 270 多万次（程序员鱼皮 2026-11-06 盘点：「Token 消耗能省到原来的五分之一」，且不是无脑压缩）。

## 是什么

[ranxianglei/billion-context](https://github.com/ranxianglei/billion-context)（⭐6.9k，8,540 commits，Issues 640 open）：口号 "billion-context is all you need"。月级长会话（billions of tokens）· 小窗口（100K 足矣）· 省 5 倍 token · 高压缩质量。支持客户端矩阵极宽：pi / omp / opencode / dsh / kimi / hermes / zcode / claude / codex 等 20+ 客户端，dsh 是官方原生插件通道之一。

## 工作原理

- 在 agent 与模型 API 之间改写 Anthropic/OpenAI 流（acp-kernel 压缩内核），注入 4 个上下文管理工具让**模型自己决定**何时压缩、压缩什么：`compress`（折叠消息段为详摘要）/ `decompress`（按需还原）/ `search_context`（对摘要+可见消息做关键词检索）/ `acp_status`（用量总览）。
- 与宿主内置总结器的差别：**增量、可逆、prefix-cache 友好**——摘要按小段写入、可解压还原、缓存前缀不被打断。
- 健康线：压缩本身成本 ≤2%，健康会话 prefix-cache 命中率 95–97%；低了用 `/acp-cache` 看归因（TTL 过期 / 换模型 / bili bug）。
- **DSH 特别行为**：bili 激活时禁用 DSH 宿主 auto-compaction（两个压缩器不能打同一份历史）；代价是 DSH 会话文件本体不缩，几万条消息后每轮变慢——重了就开新会话。

## 论文与第三方基准（README 数字）

- 自述论文（`paper/`，MIT 开源、可 PR 修改）：4.5 个月、3 台主机、174,327 次模型调用、18.76B 累计 input tokens，204,800-token 模型上零窗口违约，马拉松会话 8,584–12,049 次调用。
- 第三方 1,500 条基准（LongMemEval-S / ContextBench / MemoryAgentBench，DeepSeek V4.1 Flash + Qwen3-Embedding-8B + Qwen3-Reranker-4B）：ContextBench **#1**（Utilized F1 0.3097，成本 -58.3% vs full）；LongMemEval-S 79.20% vs 62.60%（比最强 RAG +16.6%，独立会话成本 -71.1%）；MemoryAgentBench 1.48M token 100% 存活（30× 稳态压缩，full 199/199 全灭）。

## 安装（三选一）

| 方式 | 命令 |
|---|---|
| DSH 原生插件（推荐） | `bili plugin install dsh`——它会对每个现有 profile 执行 `dsh plugin --profile <name> add billion-context`；也可直接 `dsh plugin --profile web add billion-context`（npm 形态，git 源码装没有 dist 不会加载） |
| Launcher | `npm install -g billion-context --prefix=~/.local` 后 `bili dsh`（代理+客户端一把起，不改真实配置） |
| URL 前缀（最通用） | `bili` 起代理后，客户端 baseURL 前缀改成 `http://localhost:8787/bili/https://…` |

装完验证：`curl -s http://localhost:8787/__bili/health`；看压缩活动：`/acp` / `/acp-cache`（dsh 原生插件模式有 session 绑定的斜杠命令）或 web UI（localhost:8787）。端口约定：`bili start` 用 8787，launcher/plugin 自建区从 18787 起冲突 +1。

## 配置与运维要点

- 配置文件 `~/.config/billion-context/billion-context.json`（`BILI_CONFIG_FILE` 可改）；首选旋钮 `compress.nudgeGrowthTokens`（默认每增长 50k token 轻推一次压缩；想更早触发就调小 + 开 lean mode）。
- 自更新：启动+每 3 分钟查 npm，装完要**重启宿主**才生效（插件模式嵌入在宿主进程里）；错峰发布（15 分钟–48 小时随机窗）+ 公共策略文件（hold/blocked/pinned）+ critical 级强制更新（advisories 包）。
- 状态按**客户端自报的会话 id** 键控，多实例部署要按会话头做 sticky 路由；Windows 把 `%USERPROFILE%\.local\share\billion-context\` 加进杀软排除（防 EPERM）。

## CC 对照与风险

- **CC 对照**：CC 有 `claude` 通道（launcher `bili claude` 或原生 #964）。注意 #4693：走自定义 ANTHROPIC_BASE_URL 后，CC 把会话当第三方 API-key，**账号绑定功能（如 `/remote-control`）会从命令列表消失**；需要时跑裸 `claude`。Claude Desktop 的 Code tab 有独立坑（#2290，绕过代理且拿到的是"双无"状态）。
- **许可**：MIT + 一条附加条款——可见产品用它需在首页/文档/About 署名并回链仓库（纯服务端/嵌入式用文档满足即可）。
- **风险**：装了双压缩（OpenCode 原生 auto-compaction、pi 旧独立扩展共存）会出事——安装器会自动换掉旧条目并备份 `.bili-bak`；混装自装配置要自己关宿主压缩。master 分支随时可能坏，生产用 npm release。

## 出处

- https://github.com/ranxianglei/billion-context（README，2026-11-17 抓取）
- 程序员鱼皮 2026-11-06 盘点（WaytoAGI wiki 转载）· 本站《[12 个超火插件盘点](dsh-top12-plugins.md)》
