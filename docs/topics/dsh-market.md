# dsh-market —— 插件市场（淘货入口）

> 装进 dsh 的可视化插件市场：Plugins 页里的 Discover tab，浏览/搜索/一键安装。数据复核 2026-10-28。

## 是什么

[dsh-market org](https://github.com/dsh-market/dsh-market)（⭐9,323）：装进 dsh 的可视化插件市场——Plugins 页面里的 Discover tab（0.2.1+ 原生位置），浏览/搜索/一键安装/主题热切换。DSH 生态两个月翻倍的背景下，与其每次翻 GitHub，不如有个货架。

## 安装

```bash
dsh plugin --profile web add dshmarket
```

重启 `dsh web` 生效。**注意**：DSH Desktop（Electron 版）用户要走应用内 Settings → Plugins 安装——CLI 装会进错 profile。

## 它同时是一份市场索引

- catalog 地址：`https://cdn.jsdelivr.net/npm/dsh-plugin-catalog/index.json`，可在 Plugins → Discover → Index sources 挂载
- 交叉验证渠道：awesome-dsh-plugin 清单（⭐21,133），榜单外淘货时对得上的第二来源

## 市场 ≠ 审核（重要）

本期调研明确看到头部榜里有「贴着 dsh 标签但根本不是 dsh 插件」的仓库：

> morluto/rea，⭐397,504，star 数全场最高，但实际是通用 MCP server（逆向工程用），与 DSH 插件机制毫无关系。教训：**topic 打标 ≠ dsh 原生插件**。

装任何插件前先读 README 确认接入方式；高 star 低相关的案例盘点见《[插件生态 Top 5 盘点](dsh-top5-plugins.md)》第三节「防 star 迷惑清单」。

## CC 对照

≈ CC 社区 plugin marketplace 的形态；Claude Code 无官方市场，dsh 生态反而先把货架做进产品页了。

## 出处

- https://github.com/dsh-market/dsh-market
- 本站《[插件生态 Top 5 盘点](dsh-top5-plugins.md)》（2026-10-28 复核）
