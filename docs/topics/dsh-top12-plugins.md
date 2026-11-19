# 12 个超火 DSH 插件盘点（鱼皮 2026-11-06 榜单）

> 来源：程序员鱼皮 2026-11-06 X 帖《12 个超火的 DeepSeek Harness 插件，大肥鱼已经落后 N 个版本了》（WaytoAGI wiki 转载）。本站在榜单基础上**逐仓复核**（2026-11-17，README/Releases/shields.io 实抓），11 个插件各有独立页，本页是总表与选购指南。

## 背景锚点

- 官方数据（鱼皮引，截至 2026-11-04）：DSH 日活 154 万、月活 548 万，比 9 月底桌面端发布时涨 5 倍多。
- 生态体量：仅 dshmarket 一个插件市场收录的社区插件已**接近 9,000 个**（详见[dsh-market](dsh-market.md)）。
- 鱼皮从下载排行榜和各大插件目录挑出 12 个，全部亲手装进 DSH 实测——本站又逐个复核了一遍仓库与版本。

## 怎么发现优质插件（榜单外的淘货渠道）

| 渠道 | 说明 |
|---|---|
| dshmarket 网站下载榜 | 按最近一周下载量排序，火不火一眼可见 |
| 官方 Discover tab（0.2.1+） | 插件页内置；需开「自定义插件索引」并添加索引源（社区推荐 `dshfind` 与 Awesome DSH Plugin） |
| GitHub `dsh-plugin` topic | 翻标签找新仓（注意[防 star 迷惑](dsh-top5-plugins.md)：topic 打标 ≠ dsh 原生插件） |
| Awesome DSH Plugin 清单 | 社区维护目录（⭐21,133，21 分区） |
| 直接丢仓库地址给 DSH | 未收录的新插件，让 AI 自己读文档自己装 |

安装时 DSH 会弹窗提醒「插件以你的权限在本机运行」——确认来源可信再继续；装完启用并刷新页面生效。

## 总表（11-17 复核数据）

### 一、实用必装

| # | 插件 | 仓库 | ⭐ | 版本/许可 | 一句话 | 详页 |
|---|---|---|---:|---|---|---|
| 1 | billion-context | [ranxianglei/billion-context](https://github.com/ranxianglei/billion-context) | 6.9k | MIT+署名条款 | 上下文压缩代理：长会话省 5× token，下载榜第 1 | [详页](dsh-billion-context.md) |
| 2 | dsh-cost-meter | [Han-1413141/dsh-cost-meter](https://github.com/Han-1413141/dsh-cost-meter) | 未见* | v1.9.70 · MIT | 费用账本：会话/模型/调用拆成本+峰谷+16 家订阅额度 | [详页](dsh-cost-meter.md) |
| 3 | dsh-vision-router | [ysr666/dsh-vision-router](https://github.com/ysr666/dsh-vision-router) | 1.3k | v3.3.0 · MIT | 免 key 识图路由：免费视觉链+14 个像素级工具 | [详页](dsh-vision-router.md) |
| 4 | cc-safety-net | [kenryu42/cc-safety-net](https://github.com/kenryu42/cc-safety-net) | 2,055 | v2.7.14 · MIT | 防删库防护网：危险命令预执行语义拦截 | [详页](dsh-cc-safety-net.md) |

\* dsh-cost-meter 页面未渲染 star 数，API 旧快照不可信，标"未见"。

### 二、效率创意

| # | 插件 | 仓库 | ⭐ | 版本/许可 | 一句话 | 详页 |
|---|---|---|---:|---|---|---|
| 5 | archify | [tt-a1i/archify](https://github.com/tt-a1i/archify) | 26k | v3.2.0 · Apache-2.0 | 自动画可交互架构图：读代码生成带源证据的系统地图 | [详页](dsh-archify.md) |
| 6 | dsh-ppt | [STARDUSTLC666/dsh-ppt](https://github.com/STARDUSTLC666/dsh-ppt) | 37 | MIT | 一句话/Markdown → HTML 放映+可编辑 PPTX，2 毛钱级 | [详页](dsh-ppt.md) |
| 7 | dsh-synapse | [liangmianya/dsh-synapse](https://github.com/liangmianya/dsh-synapse) | 723 | v0.5.6 · MIT | 对话分支画布：会话/追问/fork 一张地图 | [详页](dsh-synapse.md) |

### 三、整活玩法

| # | 插件 | 仓库 | ⭐ | 版本/许可 | 一句话 | 详页 |
|---|---|---|---:|---|---|---|
| 8 | dsh-pua | [MichengAI/dsh-pua](https://github.com/MichengAI/dsh-pua) | 74 | Apache-2.0 | 给 AI 上强度：15 种大厂风格+验收 Loop | [详页](dsh-pua.md) |
| 9 | dsh-whale-widget | [MeteorNOX/DeepSeek-Balance-Whale-Widget](https://github.com/MeteorNOX/DeepSeek-Balance-Whale-Widget) | 7.2k | MIT（assets 除外） | 鲸鱼娘余额挂件+记账账本，下载榜第 3 | [详页](dsh-whale-widget.md) |
| 10 | dsh-pet | [PC2005-cloud/dsh-pet](https://github.com/PC2005-cloud/dsh-pet) | 6,316 | （11-16 复核） | 鲸鱼娘桌宠，下载榜第 2，100+ 段动画 | [详页](dsh-pet.md) |
| 11 | dsh-meme | [yyh-001/dsh-meme](https://github.com/yyh-001/dsh-meme) | 581 | MIT | 表情包斗图：文字标记+前端配图，AI 也能回图 | [详页](dsh-meme.md) |
| 12 | dsh-claude-style | [Nwflower/dsh-claude-style](https://github.com/Nwflower/dsh-claude-style) | 619 | MIT（字体例外） | 把 DSH 界面变成 Claude Code Desktop | [详页](dsh-claude-style.md) |

> star 只反映 GitHub 热度，与实际装机量可能倒挂（dsh-ppt star 极低但实测流程完整；archify 26k 是跨宿主 skill 的加成）。口径备注：archify 与 dsh-cost-meter 两个数字不同抓取通道出入较大，下次复核优先重抓这两个。

## 选购指南（对照画像）

- **管钱**：billion-context（开源流）+ dsh-cost-meter（记账）+ dsh-whale-widget（肉眼盯余额）——三者是[成本与模型选择](dsh-cost-and-model-selection.md)的完整闭环，功能有重叠，按口味选主力。
- **管能力**：dsh-vision-router（识图免费通道）是纯文本 DeepSeek 模型的最大补强；archify（架构图）建议只在交付物级任务用（慢且贵，鱼皮实测一张图 16 分钟）。
- **管安全**：cc-safety-net 是"手滑兜底"，挡不住所有误操作（项目内 rm -rf 不拦），底线仍是[沙箱与安全机制](dsh-sandbox-security.md) + 勤提交。
- **管体验**：dsh-synapse（学习探索类会话）、dsh-pet / dsh-whale-widget / dsh-meme（鲸鱼娘三件套：桌宠/挂件/表情包）、dsh-claude-style（CC 用户找熟悉感）、dsh-pua（AI 太轻易放弃时）。

## 通用注意事项（装前 30 秒）

1. **profile 装对**：`dsh web` 走 `--profile web`，Electron 桌面端走应用内安装（CLI 拒绝碰 desktop profile）——装完界面没反应，十有八九是装到另一套去了。
2. **重启才生效**：宿主进程持有内存里的旧插件，装完重启 `dsh web` / 客户端，浏览器再硬刷新。
3. **装前读 README**：确认接入方式（bundle 插件 / 独立 CLI / MITM 代理 / skill），别被 topic 标签带跑。
4. **留意安全边界**：vision-router 默认数据出境、whale-widget 凭据只发内置端点、billion-context 是全局流量代理——每个详页都有专门的风险节。
5. **鱼皮原文的三条忠告**：插件是第三方代码，装前看仓库来源；**声称能「解除限制」的插件不建议安装**；DSH 迭代快、插件兼容问题常见，**装前备份 `~/.dsh` 配置**。

## 与本站 Top 5 盘点的关系

[插件生态 Top 5](dsh-top5-plugins.md)（2026-10-28，GitHub star 榜路线）选了 mcp-client / dsh-context / dsh-TUI / OpenViking / dsh-market；鱼皮榜（2026-11-06，**下载榜+实测**路线）12 个里两榜零重叠——两套方法论结论不同本身就是信息：star 榜偏"平台级基建"，下载榜偏"装上就有体感"。装插件前先读《防 star 迷惑清单》，市场 ≠ 审核。

## 出处

- 程序员鱼皮 X 帖 2026-11-06 · WaytoAGI wiki 转载：https://waytoagi.feishu.cn/wiki/Cm5IwqRfSiG0j4kzIomcXGOBnxg
- 知乎专栏镜像：https://zhuanlan.zhihu.com/p/2102067864073147818
- 各仓库 README/Releases/shields.io（2026-11-17 抓取，star 数为时点数据）
