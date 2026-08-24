# DeepSeek Harness（dsh）3天入门计划

> 每天 25 分钟 · 2026-08-23 ~ 08-25 · 每晚 22:00 飞书提醒
> 调研笔记：[DeepSeek Harness 概览](/topics/deepseek-harness.md)

## Day 1 · 跑起来 + 认识模式（8/23）

- [ ] **10min**：`npx @deepseek-ai/dsh web` 启动，浏览器开 http://127.0.0.1:3080
- [ ] **10min**：配 API Key（platform.deepseek.com，学习期用 **v4-flash** 便宜），随便聊两句，观察它怎么调用 Bash/文件工具
- [ ] **5min**：翻 README，记住四种模式（Standard / PTC / Minimal / Creative）和公式：**Model + Harness = Agent**

## Day 2 · 换模式跑 + 看插件机制（8/24）

- [ ] **10min**：分别用 Minimal 和 PTC 模式跑同一个任务（比如"列出目录里所有 md 文件"），感受工具集差异（待实操，需 API Key）
- [x] **10min**：读官方第一个插件教程（deepseek-harness.github.io → develop/basic），理解插件链路：apply → inject → ctx.tools.register → patch → 已精读，笔记见 [Day 2 笔记](/topics/dsh-day2-plugins.md)
- [x] **5min**：逛 github.com/topics/dsh-plugin，看看社区插件 → 已盘点 ⭐Top5（topic 共 11,275 仓），见笔记第三节

## Day 3 · 写一个自己的小插件（8/25）

- [ ] **20min**：照教程写一个只服务自己工作流的小工具（如"检查 git commit message 规范"或"扫描 TODO"）
- [ ] **5min**：卸载插件，验证"世界干净回到从前"——"一切皆插件"的爽点

## 坑位提醒

- ⚠️ v0.1 预览版，接口会有 breaking changes，别深耦合
- ⚠️ DeepSeek API 8/17 起峰谷定价，练手避开高峰时段用 flash

## 跑完之后

- 深入 Cordis 元框架（官方 7 章教程，无 Key 也能跑概念）
- 把 flybear-skills 技能接入 dsh 插件体系
- 关注社区 dsh-plugin 生态，考虑贡献一个插件
