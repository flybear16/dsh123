# dsh-synapse —— 对话分支画布

> 把线性对话变成一张可拖拽缩放的地图：每轮问答一张卡片，任意卡片拉出分支。数据复核 2026-11-17。

## 是什么

[liangmianya/dsh-synapse](https://github.com/liangmianya/dsh-synapse)（⭐724），MIT，npm 包 `dsh-synapse`。定位：DeepSeek Harness 的可视化对话工作台——同工作区的会话、追问、分支组织成一张地图，**DSH 原生会话仍是唯一事实来源**（插件只做视图层，不劫持数据）。

## 安装

需 DSH `>= 0.1.7-rc.2`（依赖该版本的 Host 会话与 Client 服务接口）+ Node ≥ 22.19.0。按 profile 分套安装，互不影响：

```sh
dsh plugin --profile desktop add dsh-synapse   # 桌面 App
dsh plugin --profile web add dsh-synapse       # 命令行 dsh web / 浏览器
```

## 怎么用（实测场景，鱼皮 11-06）

1. 让 AI 用大白话解释 RAG
2. 主线追问：「那 AI Agent 又是什么？」
3. 同时从 RAG 卡片拉一个分支：「RAG 和模型微调有什么区别？」

「会话地图」里主线与分支一目了然；分支自动生成新会话，会话列表标注「分支」，两条线各聊各的互不干扰。

**适合学习新知识**：一个概念没懂就开分支问透，问完回主线，思路不乱。

## 现状与注意

- **还不太稳定**（11-06 时点）：卡片标题偶现系统信息乱码、弹过「工作空间不存在」报错
- 版本含破坏性变更：仅支持 `>= 0.1.7-rc.2`，老版本 DSH 装不上
- 愿意尝鲜再上，重要工作流先别依赖它

## 出处

- https://github.com/liangmianya/dsh-synapse（README，2026-11-17 抓取）
- 程序员鱼皮 2026-11-06 实测，见《[Top 12 总表](dsh-top12-plugins.md)》
