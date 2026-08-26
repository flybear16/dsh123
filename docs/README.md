# dsh123

> DeepSeek Harness（dsh）三天入门与实践 —— 调研、机制精读、插件实战全程记录

DeepSeek 官方开源的 AI 编程智能体框架 dsh（DeepSeek Harness），基于 Cordis 元框架构建，支持 skill 兼容、插件扩展、MCP 接入、沙箱安全。这个仓库记录了从零到写出一个可用插件的完整三天 journey，所有坑都是亲手踩的。

## 三天路线

| 天 | 主题 | 产出 |
|---|---|---|
| Day 1 | 环境搭建 + 跑通 | 安装、profile 机制、web 模式启动 |
| Day 2 | 插件机制精读 | plugin/apply/inject 三要素、patch 分层、Cordis 源码考证 |
| Day 3 | 插件实战闭环 | git-commit-check 插件：开发→挂载→端到端验证→卸载验证 |

## 内容索引

### 专题（11 篇）

- [DeepSeek Harness 调研笔记](topics/deepseek-harness.md) — 是什么、和 Claude Code 的关系
- [3天入门计划](topics/dsh-3day-plan.md) — 路线设计
- [skill vs 插件（WaytoAGI 转载）](topics/waytoagi-dsh-skill-vs-plugin.md)
- [skill 兼容机制](topics/dsh-skill-compat.md) — 原生扫描 + dsh-skillport 迁移
- [Day 2 笔记 · 插件机制精读](topics/dsh-day2-plugins.md) + [社区生态盘点](topics/dsh-day2-plugins.md)
- [Day 3 实战 · 从零写插件并挂载上线](topics/dsh-day3-hands-on.md) — 三坑源码考证 + 双向验证
- [Claude Code → dsh 迁移实战](topics/dsh-migration-from-claude-code.md) — 带技能库切换实测 + 检查表
- [PTC 模式深潜](topics/dsh-ptc-deep-dive.md) — 差异化卖点解剖
- [Cordis 元框架专题](topics/dsh-cordis-framework.md) — Service/事件/DI/生命周期
- [沙箱与安全机制](topics/dsh-sandbox-security.md) — 插件全权模式下怎么兜底
- [MCP 接入指南](topics/dsh-mcp-integration.md)
- [成本与模型选择](topics/dsh-cost-and-model-selection.md)

### 指南

- [快速开始](guide/quickstart.md) — 10 分钟跑起 dsh web

## 实战成果

三天结束时拥有一个真实可用的插件 [`check_commits`](https://github.com/flybear16/dsh123/blob/main/plugins/git-commit-check.js)：检查任意 git 仓库的 commit message 是否符合 conventional commits 规范，挂载/卸载双向验证通过。

```
$ dsh web --patch cordis.yml
[git-commit-check] plugin loaded!
dsh web: http://127.0.0.1:3080
```

---

*基于 docsify 搭建，内容在 `docs/` 目录。*
