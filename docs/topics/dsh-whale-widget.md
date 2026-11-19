# dsh-whale-widget —— 鲸鱼娘余额挂件（下载榜第 3）

> 住在 DSH 界面右下角的小鲸鱼娘：盯 DeepSeek 余额、记账今日已用、每轮消耗泡泡、峰谷倒计时，外加 34 家厂商余额模板。QQ 弹弹，可拖拽吸附。数据复核 2026-11-17。

**热度**：MeteorNOX/DeepSeek-Balance-Whale-Widget ⭐7.2k、234 forks（dshmarket 下载榜第 3，鱼皮 2026-11-06 盘点：「气泡内容可自定义——但谁让它可爱呢」）。代码 MIT；**`assets/` 美术素材（图/音效）不在 MIT 覆盖内**，as-is 分发，见 PROVENANCE.md。

## 是什么

标准 DSH bundle 插件：右下角常驻鲸鱼挂件 + 完整记账后端（lib/accounting.mjs 定点金额运算）。

| 类别 | 能力 |
|---|---|
| 余额 | 60 秒自动刷新 + 点击手动刷新，变化时数字滚动动画；**两种取数**：DSH 凭据里的 `DEEPSEEK_API_KEY`（优先）或 DSH 账号登录态（无 key 也能取，不需去 platform 建 key） |
| 今日已用 | 零令牌"小鲸鱼记账"：余额下降按观测累计为消费，上升（充值/赠金）单独记录不冲销；「余额校正」按实际到账补账；8 位小数记账；逐轮明细留 90 天/2 万条、逐日 365 天，超期归档 |
| 每轮消耗 | 监听本机会话事件，按模型**真实 usage**（input/cache/output/reasoning）换算金额，每轮结束弹泡泡；内容模块化可自定义（`{cost}` 引用） |
| 峰谷 | 工作日 9:00–12:00、14:00–18:00 高峰（北京时间），其余空闲；2026-08-23 起周末全天谷价；支持倒计时与多种样式 |
| 多厂商 | 34 个厂商模板：OpenRouter、Kimi（CN/国际）、智谱 GLM Coding、MiniMax Coding、OpenCode Go（5h/周/月三窗口）、OneAPI/New API 中转等可直接查余额；OpenAI/Anthropic/Gemini 等无余额接口的走探活验证 key、按会话估算用量 |
| Codex 统计 | 读本机 Codex 会话日志（`$CODEX_HOME/sessions/**.jsonl`）统计 token——只读本地、不联网、不需密钥 |
| 提醒 | 余额预警、今日预算、提问/授权等待音效+气泡（同一挂起只响一次） |
| 互动 | 四边吸附+左吸附镜像翻转、按压 Q 弹、音效组可自定义、自定义角色图、移动端触摸拖拽 |

**内置价目表**（CNY/百万 token，[空闲, 高峰]；官方调价改 `lib/index.js` 顶部 `PRICING`）：`deepseek-flash`（V4.1-Flash）缓存命中 0.02/0.04、未命中 1/2、输出 4/8；`deepseek-v4-pro` 0.15/0.30、4.5/9.0、13.5/27.0。

## 安装（profile 是最大坑）

```bash
dsh plugin --profile web add dsh-whale-widget   # dsh web（npm 已发布版，推荐）
```

- **桌面端（Electron）不能用 `--profile web`**：桌面读的是 `desktop` profile，且 CLI 按设计拒绝 `--profile desktop`（`profile "desktop" is managed exclusively by the Electron application`）——要在桌面端会话里让 DSH 用内置 `plugin_manager` 安装（README 给了现成提示词），装完完全退出客户端（含托盘）再开。
- npm 名与 `github:` 两种装法**二选一别混用**（同一包名会并存冲突）；换来源先 remove 再 add。
- 运行时数据在 `$DSH_HOME/.dshw-*.json`；密钥只写 DSH 官方凭据服务，配置文件只存凭据名。

## 安全边界（0.3.15 起）

1. 凭据**只发厂商模板里写死的端点**；自定义接口地址默认拿不到凭据（自建网关需在本机面板按模型勾选放行）。
2. 一切**写请求仅限本机回环**来源（127.0.0.1/localhost/[::1]），局域网可看不可改；远端管理用 `DSHW_ADMIN_HOSTS` 显式授权。
3. 26 条 `/dsh-whale/*` 路由全部接入 DSH 浏览器信任栅栏——裸 curl 返回 401/403 是**预期行为**，证明路由和栅栏在工作。

## CC 对照与同类

- CC 无等价物；与 [dsh-cost-meter](dsh-cost-meter.md) 定位互补：cost-meter 重报表/预算/16 家订阅额度，whale 重"挂件+音效+可爱+余额观测"；两者可并存但功能有重叠，按口味选主力。
- 与 [dsh-pet](dsh-pet.md) 的分工：pet 是全功能桌宠（会话状态联动+对外 API），whale 是记账挂件；鲸鱼娘皮肤文化一脉相承。
- Codex 版挂件已迁独立仓库 Yang-huai406/Codex-Whale-Public，与本仓库互不兼容（已装用户无需重装）。

## 出处

- https://github.com/MeteorNOX/DeepSeek-Balance-Whale-Widget（README，2026-11-17 抓取）
- 程序员鱼皮 2026-11-06 盘点 · 本站《[12 个超火插件盘点](dsh-top12-plugins.md)》
