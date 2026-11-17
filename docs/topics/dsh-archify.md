# archify —— 自动画可交互架构图

> 把想法、计划或整个代码库变成一张可交互的可视化 HTML。12 个插件里 star 碾压级的存在。数据复核 2026-11-17。

## 是什么

[tt-a1i/archify](https://github.com/tt-a1i/archify)（**⭐97,212**，12 个里最高），Apache-2.0，skills.sh 安装量 130K+。本体是 **agent skill**（Claude Code / Codex / Cursor / OpenCode 均可用），DSH 上以插件形态使用。给 AI 一段描述或一个项目，产出可探索、可定制、可分享的交互式 HTML——行程计划、学习地图、复杂系统架构都行。

## 实测（鱼皮 11-06）

拿「AI 闯关学习小程序」画中文架构图：**相当准确**——微信小程序前端 → FastAPI 后端（知识库/出题/复盘服务）→ LangGraph Agent → Chroma 向量库 / DeepSeek / 阿里云百炼，连模块间调用关系都标了出来。接手陌生项目、给团队新人讲项目，一张图省大事。

**缺点：慢且不便宜**。画完会反复截图自检，一张图前后 **16 分钟、8 毛多**。急件别用它。

## 安装与渠道

- 官方免费开源渠道：GitHub 仓库 + archify.si（gallery 有 live demo）
- 第三方在线服务与付费方案与官方无关，看清再用
- 作者与鱼皮直播连麦推广过，社区活跃

## 对照与注意事项

- **CC 对照**：Claude Code 生态可直接用同一 skill（skills.sh 即装）——这是 12 个里「DSH 插件与 CC skill 同源」的典型
- 架构图类任务建议单独开会话跑，避免阻塞日常编码上下文

## 出处

- https://github.com/tt-a1i/archify（README，2026-11-17 抓取）
- 程序员鱼皮 2026-11-06 实测，见《[Top 12 总表](dsh-top12-plugins.md)》
