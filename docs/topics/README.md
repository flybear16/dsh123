# 专题概览

按学习顺序排列，从认知到机制到实战。

## 基础认知

| 篇目 | 内容 |
|---|---|
| [DeepSeek Harness 调研](deepseek-harness.md) | dsh 是什么、核心特性、和 Claude Code 的关系 |
| [3天入门计划](dsh-3day-plan.md) | 三天路线：环境→机制→实战 |

## 生态与兼容

| 篇目 | 内容 |
|---|---|
| [skill vs 插件（转载）](waytoagi-dsh-skill-vs-plugin.md) | 两种扩展方式的边界 |
| [skill 兼容机制](dsh-skill-compat.md) | 原生扫描 + dsh-skillport 从 Claude Code 迁移技能 |
| [Claude Code → dsh 迁移实战](dsh-migration-from-claude-code.md) | 带技能库切换实测 + 检查表 |

## 机制深潜

| 篇目 | 内容 |
|---|---|
| [Day 2 · 插件机制精读](dsh-day2-plugins.md) | plugin/apply/inject 三要素、patch 分层、社区生态盘点 |
| [Cordis 元框架专题](dsh-cordis-framework.md) | Service/事件/DI/生命周期，DI 三坑源码考证 |
| [PTC 模式深潜](dsh-ptc-deep-dive.md) | 差异化卖点解剖 + 同任务对比设计 |
| [沙箱与安全机制](dsh-sandbox-security.md) | 权限模式、插件全权模式下的兜底 |

## 实战收官

| 篇目 | 内容 |
|---|---|
| [Day 3 · 插件实战](dsh-day3-hands-on.md) | git-commit-check 全生命周期：开发→挂载→验证→卸载，三坑源码考证 |
| [dsh-plugin-builder 写插件的插件](dsh-plugin-builder.md) | Agent Skill 元插件：决策扩展点→生成→验证→打包，showcase 四件实证 |

## 运维参考

| 篇目 | 内容 |
|---|---|
| [MCP 接入指南](dsh-mcp-integration.md) | 接入现有 MCP server |
| [成本与模型选择](dsh-cost-and-model-selection.md) | 模型搭配与开销 |
| [12 个超火插件盘点](dsh-top12-plugins.md) | 鱼皮 2026-11-06 下载榜逐仓复核总表 + 选购指南（11 个插件各有独立页） |
| [billion-context](dsh-billion-context.md) · [dsh-cost-meter](dsh-cost-meter.md) · [dsh-vision-router](dsh-vision-router.md) · [cc-safety-net](dsh-cc-safety-net.md) | 实用组四件：压缩省钱 / 记账 / 识图 / 防删库 |
| [archify](dsh-archify.md) · [dsh-ppt](dsh-ppt.md) · [dsh-synapse](dsh-synapse.md) | 创意组三件：架构图 / PPT / 分支画布 |
| [dsh-pua](dsh-pua.md) · [dsh-whale-widget](dsh-whale-widget.md) · [dsh-meme](dsh-meme.md) · [dsh-claude-style](dsh-claude-style.md) | 整活组四件：上强度 / 余额挂件 / 斗图 / Claude 主题 |
| [dsh-pet 桌宠](dsh-pet.md) | DSH 桌面宠物：三件套自造流程、能力速览、对外接口 |
| [dsh-market 插件市场](dsh-market.md) | 可视化插件货架：安装、索引挂载、防假冒提醒 |
