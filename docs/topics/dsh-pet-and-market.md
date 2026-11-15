# 桌宠与插件市场：dsh-pet & dsh-market

> 两个「体验型」生态入口：dsh-pet 让 AI 有了看得见的身体，dsh-market 让插件有了货架。本文是两者的入门说明，深度盘点见《[插件生态 Top 5 盘点](dsh-top5-plugins.md)》。数据复核 2026-11-16。

## dsh-pet —— DSH 桌面宠物

**是什么**：一只住在 DeepSeek Harness 里的桌面宠物（[PC2005-cloud/dsh-pet](https://github.com/PC2005-cloud/dsh-pet)，⭐6,316）。一百余段透明动画：待机呼吸、随机动作（打瞌睡、玩魔方、吃火锅）、屏幕漫游、点击 Q 弹、拖拽甩抛反弹、右键菜单点播；还能跟随 DSH 会话事件切换工作状态动画、播报 API 余额、碎碎念聊天、弹系统通知。

**三件套结构**（它不只是插件，还是一条可复现的生产线）：

```
① 提示词（配方）   →  ② 素材生成链（引擎）     →  ③ 插件（成品）
AI 生成动画的配方      源视频 → 透明动画的管线      运行在 DSH 里的宠物
```

clone 仓库即可从零生成自己的宠物：换角色、换动作、换风格，全流程可复现（pet pack 机制）。

### 安装

| 方式 | 命令/操作 |
|---|---|
| 图形化 | 「插件管理」页安装框填 `dsh-pet` |
| CLI（web 界面） | `dsh plugin --profile web add dsh-pet` |
| CLI（Electron 桌面版） | `dsh plugin --profile desktop add dsh-pet` |
| 独立模式（不装 DSH） | Release 下载 `dsh-pet-win-x64.zip`，双击 `dsh-pet.exe` |

装完**重启 DSH / `dsh web`** 才生效（运行中进程持有内存里的旧插件）。宠物默认落在界面右上角。

### 核心能力速览

| 类别 | 能力 |
|---|---|
| 表现 | 100+ 段动画资产按权重衔接；多开同屏、各自大小位置；自定义宠物种类 |
| 形态 | DSH web 浏览器 overlay / 桌面应用透明置顶窗 / 完全脱离 DSH 的独立模式，三选一 |
| 交互 | 点击回应、拖拽甩抛、双击弹弓、宠物互撞；触屏同套物理；手机端倾斜重力/摇一摇/震动（HTTPS 或 localhost 下可用） |
| 语音 | 对话回复念出来（音色音量可配）；按住话筒说话转文字 |
| 实用 | 余额/额度查询分档播动画；天气查询（IP 粗定位 + Open-Meteo，免 key）；待办清单挂头顶、临期密集提醒；跟随会话状态切档位动画 |
| 其他 | 睡觉模式（睡时全安静、周期说梦话）、任务完成系统通知（点击回跳会话）、右键菜单、点击音效 |

### 对外接口（供其他插件调用）

桌宠开放两条驱动通道——比如「女仆」插件巡检完想让桌宠开口播报，就走这里：

- **HTTP**：挂 DSH Web 服务上，前缀 `/dsh-pet-7340`（**只监听本机、无鉴权**——别手动改监听地址暴露到局域网）。接口一览见仓库 `API.md`，完整契约 `openapi.yaml`（OpenAPI 3.1，可导入 Swagger/Postman）
- **Cordis 服务**：同页客户端插件用 `ctx.get('petApi7340')` 直取，零网络零端口，仅页面实例内有效（见 `CORDIS-API.md`）

### 移植生态

| 仓库 | ⭐ | 说明 |
|---|---:|---|
| PC2005-cloud/dsh-pet | 6,316 | 主仓（本篇主角） |
| MerZlin/dsh-pet-indesktop | 3,284 | 移植到 Win/Linux/macOS 桌面常驻 |
| Tony-Chen-Stark/dsh-pet-android | 125 | 安卓悬浮窗，106 段动画，无 AI 不联网 |
| zhu1090093659/dsh-pet | 70 | DSH Web GUI 多宠物伴侣插件（registry 驱动） |
| Gin-7/dsh-pet-remielle | 65 | 第三方角色 pack |

**CC 对照**：Claude Code 生态无直接等价物——纯体验型插件，DSH 生态特色。理念上它是「给 agent 一个可视化实体」的样板：状态联动 + 对外 API 让其他插件借它的身体说话，这个模式值得写插件的参考。

**风险/成本注意**：不碰 DSH 内核，卸载即走；HTTP 通道无鉴权但仅本机监听，保持默认配置即可；动画素材占磁盘（百段视频），嵌入版留意体积；iOS 无振动 API、传感器需 HTTPS + 一次授权，属平台限制非缺陷。

## dsh-market —— 插件市场（淘货入口）

**是什么**：装进 dsh 的可视化插件市场：Plugins 页面里的 Discover tab（0.2.1+ 原生位置），浏览/搜索/一键安装/主题热切换。生态两个月翻倍的背景下，与其每次翻 GitHub，不如有个货架。（[dsh-market org](https://github.com/dsh-market/dsh-market)，⭐9,323，10-28 复核值）

**安装**：`dsh plugin --profile web add dshmarket`，重启 `dsh web` 生效。注意：**DSH Desktop 用户要走应用内 Settings → Plugins 安装**（CLI 装会进错 profile）。

**它同时是一份市场索引**：`https://cdn.jsdelivr.net/npm/dsh-plugin-catalog/index.json` 可在 Plugins → Discover → Index sources 挂载；交叉验证渠道是 awesome-dsh-plugin 清单（⭐21,133）。

**风险/成本注意**：市场 ≠ 审核——Top 5 盘点里明确看到头部榜有「贴着 dsh 标签但根本不是 dsh 插件」的仓库（rea 案例，⭐397K 的 MCP server）。**装任何插件前先读 README 确认接入方式**，详见《[插件生态 Top 5 盘点](dsh-top5-plugins.md)》第三节。

## 选型速查

| 你想要 | 建议 |
|---|---|
| 给工作区加点生气、体验 DSH 插件机制 | `dsh-pet`，顺手读它 API.md 学习插件对外接口设计 |
| 批量淘插件、少翻 GitHub | `dsh-market`，挂上 catalog 索引 |
| 自造宠物/研究 AI 生成动画管线 | clone dsh-pet 仓库走三件套流程 |
| 严肃生产能力（检索/记忆/工具） | 回 Top 5 盘点看 mcp-client、OpenViking 等 |

## 出处

- dsh-pet：https://github.com/PC2005-cloud/dsh-pet（README，2026-11-16 抓取）
- dsh-market：https://github.com/dsh-market/dsh-market；本站《插件生态 Top 5 盘点》（2026-10-28 复核）
