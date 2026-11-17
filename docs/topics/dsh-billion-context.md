# billion-context —— 上下文压缩（下载榜 #1）

> 架在编程助手与模型 API 之间的上下文压缩层：何时压缩、压缩什么由模型决定，而非硬截断。数据复核 2026-11-17。

**热度**：dshmarket 下载榜 **#1**，最近一周下载 270 万+，比第二名高出好几倍（程序员鱼皮 2026-11-06 盘点）。

## 是什么

[ranxianglei/billion-context](https://github.com/ranxianglei/billion-context)（⭐7,684），MIT，slogan「billion-context is all you need」。宣传口径：100K 上下文窗口够用、Token 消耗省到 1/5、单会话可连跑一个月（billions of tokens）。

不只服务 DSH——它用 [acp-kernel](https://github.com/ranxianglei/acp-kernel) 压缩重写 Anthropic/OpenAI 流，官方列出 15 个宿主：Claude Code、Codex、OpenCode、pi、Gemini CLI、Kimi、Qwen Code、Copilot CLI、TRAE、CodeBuddy、Qoder、iFlow CLI、MiniMax mcode、**deepseek-harness**、Amp。

## 原理一图流

向对话注入 4 个上下文管理工具，模型在上下文增长时自主调用：

| 工具 | 作用 |
|---|---|
| `compress` | 把一段消息范围折叠成详细摘要 |
| `decompress` | 需要精确细节时恢复已压缩范围 |
| `search_context` | 在压缩摘要与可见消息中做关键词检索 |
| `acp_status` | 上下文用量概览 + 哪些区间仍可压缩 |

与宿主自带摘要器的差异：压缩**增量、可逆、对前缀缓存友好**——摘要在小范围内写入、按需解压、缓存前缀保持完整。

## 硬核背书

- **论文**（随代码 MIT 开源，`paper/` 目录活文档）：四个半月纵向研究，三宿主 174,327 次调用、累计输入 187.6 亿 token，204,800-token 窗口零违规
- **第三方 1,500 题横评**（LongMemEval-S / ContextBench / MemoryAgentBench，基于 DeepSeek V4.1 Flash）：
  - ContextBench 端到端有效 F1 全场第一（0.3097，比 full 全量省钱 58.3%）
  - LongMemEval-S 领先最强 RAG +16.6%（79.20% vs 62.60%，省钱 71.1%）
  - MemoryAgentBench 1.48M 超长会话 100% 存活 + 30× 稳态压缩（full 全量 199 题全部爆窗崩溃）

## 实测（鱼皮 11-06）

让体检一个刚聊两轮的会话：先列出 Token 构成（文本消息 vs 工具输出各占多少），再逐条分析哪些能压、哪些不该动，结论是**「现在不建议压缩」**——可压缩内容只有 1 千多 Token，离触发门槛差三十多倍，大头是系统提示和工具定义的固定成本，压了也省不下来。不是无脑压缩，可放心食用。

## 运维提示

- **缓存健康速览**：健康会话的前缀缓存命中率在 96–99%，压缩本身代价 ≤2%；持续偏低用 `/acp` 或 `/acp-cache` 查归因，常见原因依次：上游缓存 TTL 到期 → 切换模型 → bug
- 与 [dsh-cost-meter](dsh-cost-meter.md) 联动：压缩、重试这些额外请求的费用也能算进去
- 安装：`npm install -g billion-context --prefix=~/.local`（或按各宿主自己的插件装法）

## 出处

- https://github.com/ranxianglei/billion-context（README / README.zh-CN，2026-11-17 抓取）
- 程序员鱼皮 2026-11-06 实测，见《[Top 12 总表](dsh-top12-plugins.md)》
