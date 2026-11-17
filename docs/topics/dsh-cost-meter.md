# dsh-cost-meter —— DSH 费用账本

> 按会话 / 模型 / 调用三级记账：余额、订阅配额、预算、峰谷提醒一屏看全。数据复核 2026-11-17。

## 是什么

[Han-1413141/dsh-cost-meter](https://github.com/Han-1413141/dsh-cost-meter)（⭐708，v1.9.70），MIT，中英双语 UI。定位：Cost tracking and subscription quotas for DeepSeek Harness——按会话、模型、调用记录费用与 token，余额/订阅配额/预算同屏，API 花费与 Plan 等价量分开呈现，多 provider 定价、峰谷提醒，侧边栏与输入框显示均可配置。

## 安装

```sh
dsh plugin --profile web add dsh-cost-meter
```

- 需 Node ≥ 20、DSH ≥ 0.2.0、pnpm 对 DSH 可用；装/更新后**重启 `dsh web`** 生效
- 桌面端走 bundled CLI + `desktop` profile；Windows 有 PowerShell 一键安装器（可钉版本）

## 能力速览

| 位置 | 看到什么 |
|---|---|
| 侧边栏 | 账户余额、今天花了多少、当前峰谷时段 |
| 「费用明细」按钮 | 本会话花费 / 模型调用次数 / Token 量 / 缓存命中率 |
| 矩形图 | 费用按用途拆分（执行命令 vs 直接回复） |
| 记账口径 | 与 billion-context 联动：压缩、重试等额外请求费用一并计入 |

装好即自动导入历史——鱼皮装上后，过去半个月近百个会话的费用直接全算了出来。

## 实测（鱼皮 11-06）

一个会话总花费 **1 毛 1**：近九成花在 AI 执行命令的步骤上，模型直接回复只占一成多。DSH 下「想」便宜，「做」才烧钱——控制工具调用轮次才是省钱关键。

## 对照与注意事项

- **CC 对照**：Claude Code 生态的 ccusage / 各类 usage 面板是同思路，但本插件对 DeepSeek 峰谷定价与订阅配额的理解是原生级
- 峰谷时段细节见本站《[成本与模型选择](dsh-cost-and-model-selection.md)》
- 桌面端安装问题查仓库 `docs/install-troubleshooting.md`

## 出处

- https://github.com/Han-1413141/dsh-cost-meter（README，2026-11-17 抓取）
- 程序员鱼皮 2026-11-06 实测，见《[Top 12 总表](dsh-top12-plugins.md)》
