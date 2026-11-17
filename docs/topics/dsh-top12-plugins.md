# dsh 插件生态 Top 12 盘点 —— 鱼皮 2026-11-06 下载榜逐仓复核

> 源自程序员鱼皮 2026-11-06 的《12 个超火的 DeepSeek Harness 插件》实测盘点（本站经 WaytoAGI 知识库转载文档复核），2026-11-17 逐仓补核 star 数与 README。11 个插件各有独立页，本篇是总表 + 选购指南。

## 背景数据（文中口径）

- DSH 日活 **154 万** / 月活 **548 万**（截至 2026-11-04，比 9 月底桌面端首发涨 5 倍多）
- dshmarket 单个市场收录插件已**接近 9,000 个**
- 生态爆发 → 挑选成本上升，这就是本篇存在的理由

## 怎么发现优质插件

| 渠道 | 说明 |
|---|---|
| dshmarket 网站下载榜 | 按最近一周下载量排序，火不火一眼可见 |
| 官方 Discover tab（0.2.1+） | 插件页内置，实验性；需开「自定义插件索引」并添加索引源（社区推荐 `dshfind` 与 Awesome DSH Plugin） |
| GitHub `dsh-plugin` topic | 翻标签找新仓 |
| Awesome DSH Plugin 清单 | 社区维护目录 |
| 直接丢仓库地址给 DSH | 未收录的新插件，让 AI 自己读文档自己装 |

安装时 DSH 会弹窗提醒「插件以你的权限在本机运行」——确认来源可信再继续；装完启用并刷新页面生效。

## 总表（star 复核 2026-11-17）

| 插件 | 组 | 定位 | ⭐ | 榜单热度 | 独立页 |
|---|---|---|---:|---|---|
| billion-context | 实用 | 上下文压缩：100K 够用、Token 省 5× | 7,684 | 下载榜 **#1**，周下载 270 万+ | [页](dsh-billion-context.md) |
| dsh-cost-meter | 实用 | 费用账本：余额/会话花费/峰谷 | 708 | — | [页](dsh-cost-meter.md) |
| dsh-vision-router | 实用 | 免费识图通道 + 14 个像素级视觉工具 | 1,282 | — | [页](dsh-vision-router.md) |
| cc-safety-net | 实用 | 拦截删库命令与敏感文件访问 | 2,059 | — | [页](dsh-cc-safety-net.md) |
| archify | 效率 | 自动画可交互架构图（准但慢） | 26k | skills.sh 130K+ 安装 | [页](dsh-archify.md) |
| dsh-ppt | 效率 | 一句话出 HTML 放映 + PPTX | 37 | — | [页](dsh-ppt.md) |
| dsh-synapse | 效率 | 对话分支画布（还不够稳定） | 724 | — | [页](dsh-synapse.md) |
| dsh-pua | 整活 | 大厂风味 PUA 你的 AI（真有用） | 76 | — | [页](dsh-pua.md) |
| dsh-whale-widget | 整活 | 鲸鱼娘余额挂件，会吐槽 | 7,276 | 下载榜 **#3** | [页](dsh-whale-widget.md) |
| dsh-pet | 整活 | 鲸鱼娘桌宠，100+ 动画 | 6,316 | 下载榜 **#2** | [页](dsh-pet.md) |
| dsh-meme | 整活 | 表情包斗图，AI 会接梗 | 581 | — | [页](dsh-meme.md) |
| dsh-claude-style | 整活 | DSH 变身 Claude Code Desktop | 622 | — | [页](dsh-claude-style.md) |

> star 只反映 GitHub 热度，与实际装机量可能倒挂（如 dsh-ppt star 极低但实测流程完整；archify star 爆表因为本体是跨宿主 agent skill）。
>
> 口径备注：archify ⭐26k 与 dsh-cost-meter ⭐708 两个数字不同抓取通道出入较大（archify 经 shields.io JSON 2026-11-17 两次核验一致；cost-meter 页面未渲染、npm-era API 快照过期），下次复核优先重抓这两个。

## 选购指南

**新手保命三件套**（省钱 → 看钱 → 防翻车）：

1. **billion-context** —— 上下文压缩，Token 开销省到 1/5
2. **dsh-cost-meter** —— 每一笔都看得见，和上面联动记账更准
3. **cc-safety-net** —— 删库命令执行前拦一道（但项目内普通目录不保，勤提交才是王道）

**按需加装**：接手陌生项目上 archify；要汇报做 PPT 上 dsh-ppt；学习探索用 dsh-synapse；爱折腾再进整活区。

**整活区毒性提示**：dsh-pet / dsh-whale-widget / dsh-meme 三件一旦装上，基本没有卸载的可能。

## 安全忠告（文章结尾要点）

- 插件是第三方代码，安装前看一眼**仓库来源**和它能做什么
- 声称能「解除限制」的插件**不建议安装**
- DSH 迭代快，插件兼容问题常见——**装前备份配置**，只装真正用得上的

## 出处

- 程序员鱼皮，2026-11-06：x.com/yupi996（WaytoAGI 知识库转载文档）
- 各插件仓库 README（2026-11-17 抓取，star 同日复核）
- 相关：《[插件生态 Top 5 盘点](dsh-top5-plugins.md)》（10-28，为主人画像选的五件）、《[dsh-market](dsh-market.md)》（货架本体）
