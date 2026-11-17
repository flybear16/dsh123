# dsh-whale-widget —— 鲸鱼娘余额挂件（下载榜 #3）

> 一只住在 DSH 界面右下角的小鲸鱼娘：帮你盯 DeepSeek 余额、记账、报峰谷，还会吐槽你。数据复核 2026-11-17。

**热度**：dshmarket 下载榜 **#3**（前两名 billion-context、[dsh-pet](dsh-pet.md)）。

## 是什么

[MeteorNOX/DeepSeek-Balance-Whale-Widget](https://github.com/MeteorNOX/DeepSeek-Balance-Whale-Widget)（⭐7,276），DSH Web 界面右下角常驻挂件：小鲸鱼气泡图 + API 余额 + 今日已用 + 每轮对话消耗。标准 bundle 插件，`dsh plugin` 一键装，无需任何会话令牌。

## 记账与显示

- **余额**：60 秒自动刷新 + 点击手动刷；变化时数字滚动动画；网络抖动沿用最近余额不报错。取数两路：`DEEPSEEK_API_KEY` 优先，无 key 时走 DSH 账号登录态（不用去 platform 建 key）
- **小鲸鱼记账**：不需要任何令牌——余额下降按观测累计为消费，上升（充值/赠金）单独记录不冲销；检测到入账提示「待核对余额校正」。「已观测消费」是 DeepSeek 账户口径，不含其他厂商（「本机模型费用」才是全模型本地估算）。逐轮明细留 90 天/2 万条，逐日归档留 365 天
- **每轮消耗**：监听本机会话事件，按模型真实 usage（input/cache/output/reasoning）换算金额，轮末弹泡泡，泡泡模板可自定义（`{cost}` 引用）
- **峰谷定价**：工作日高峰 9:00–12:00、14:00–18:00；2026-08-23 起周末全天谷价；样式多种（含「梁文峰谷」彩蛋）
- **用量窗口**：今日/近 7 天/全部、模型占比条、按日期或模型名搜索，模型名友好标注

## 交互与自定义

拖拽 + 四边吸附（贴左整体水平镜像翻转）、按压 Q 弹、点击序列泡泡（可并列加权随机）、模块化排版（每泡最多 6 行 × 6 模块，图片独占一行）、随机语句/随机图片带权重、逐模块字体配色样式、模块库复用、菜单可隐藏（右键/长按唤出）、移动端触摸友好。音效四类独立音量，改动「保存」才落盘，「取消」完整还原。

## 安装注意

- Web 端推荐 npm 名装：`dsh plugin --profile web add dsh-whale-widget`
- 桌面端**不能** `--profile web`（桌面读 `desktop` profile）——在桌面端会话里让 DSH 自己装
- **两条线互不兼容**：Codex 桌面版已迁至 [Yang-huai406/Codex-Whale-Public](https://github.com/Yang-huai406/Codex-Whale-Public)，别装错仓库
- npm 名 / `github:` 二选一，混装会并存冲突；换装先 remove
- 配套家族：[dsh-pet](dsh-pet.md)（桌宠）、[dsh-claude-style](dsh-claude-style.md)（主题）

## 出处

- https://github.com/MeteorNOX/DeepSeek-Balance-Whale-Widget（README，2026-11-17 抓取）
- 程序员鱼皮 2026-11-06 实测，见《[Top 12 总表](dsh-top12-plugins.md)》
