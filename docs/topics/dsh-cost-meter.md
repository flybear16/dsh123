# dsh-cost-meter —— 费用账本

> DSH Web 界面的会话费用统计与订阅额度插件：按会话/模型/调用拆成本、盯余额、盯峰谷、盯各家 Coding Plan 额度。数据复核 2026-11-17。

**热度**：鱼皮 2026-11-06 盘点实用组第 2（「显示余额、当日花费、峰谷时段，能按用途拆分费用并自动导入历史记录；可与 billion-context 配合计费更准」）。

## 是什么

[Han-1413141/dsh-cost-meter](https://github.com/Han-1413141/dsh-cost-meter)：中英双语 UI，v1.9.70（2026-11-16 合入，v1.9.61→70 密集发版，高度活跃）。MIT。star 数页面未见（API 旧快照 58，疑为缓存）。

**核心功能**：

| 类别 | 能力 |
|---|---|
| 明细 | 按会话/模型/调用的成本拆分（含父/子代理归属）；日/周/月/累计统计与导出 |
| 预算 | 预算框：≥80% 告警、≥100% 超支；余额预警 |
| 余额 | 官方余额 + 自定义 Provider 余额查询；主流 Coding Plan 额度 npm 自述 16 家（Codex/ChatGPT、Claude、GLM、Kimi、MiniMax、OpenDesign、CLIProxyAPI 多账号、火山方舟 AK/SK、SCNet…） |
| 峰谷 | 峰谷计价显示 + 切换前弹窗/系统通知（默认提前 2 分钟，1–30 分钟可调） |
| 可视化 | Codex 式 26 周 token 热力图 |
| 价格 | 一键官方价格同步；内置 170+ 模型 ID 价格目录自动匹配；API/套餐双轨记账；26 种显示币种（v1.9.67） |

## 安装

```bash
dsh plugin --profile web add dsh-cost-meter        # 装完重启 dsh web
dsh plugin --profile web add dsh-cost-meter@latest # 更新
```

要求 Node.js ≥20、DSH 0.2.0+（engines：`>=0.2.0-rc.1 <0.3.0-0`）、DSH 进程 PATH 有 pnpm。另有 PowerShell 一键脚本与固定 tag 装法（README 原文）。

## 原理与口径

- 宿主侧包一层 `llm/stream` 计费；`costUsage` 会话投影供浏览器读取；计费公式 `cost = cache-missed input × 单价 + output × 单价 + (cache read + cache write) × cache-hit 单价`；账本一律以 **USD 存储**、显示按汇率（默认 1 USD = 7.2 CNY）换算。
- 官方价格同步靠解析 DSH 文档站的 Docusaurus 预渲染页——**官方页改版同步就会失败**，需手填。
- 账本 `$DSH_HOME/storages/cost-meter/ledger.json`（原子写 + 2 秒 debounce），历史默认保留 180 天。
- 峰谷窗口 UTC 01:00–04:00、06:00–10:00，谷段=峰段半价，周末/中国法定节假日全天谷段（口径详见[成本与模型选择](dsh-cost-and-model-selection.md)）。

## 风险与局限（作者自述）

- 预算**只告警从不拦截**调用；reasoning tokens 不计费、插件五类 token 列与官方账单三列对不齐——**对账按金额不按 token 数**。
- 会话徽章回退估算按当前时段计价会高估；不向宿主上报用量的插件无法追踪。
- 凭据只进 DSH credential store（`allowedHosts` 白名单）；余额 API 只发官方域名。曾做全库安全审计修复 3 高危 + 30+ 中低危。

## 生态联动与 CC 对照

- **dsh-claude-style 的工作台用量面板**装了它就直接读它的账本缓存（只读，不写对方文件）——两个插件是上下游关系。
- 与[插件生态 Top 5](dsh-top5-plugins.md)里的 dsh-context 定位对比：dsh-context 管上下文+成本双仪表盘，cost-meter 更专精费用/额度/峰谷报表，可并存。
- **CC 对照**：无 CC 插件形态；但明确支持 Anthropic Claude Pro/Max 配额查询——CC 原生没有等价的费用面板。

## 出处

- https://github.com/Han-1413141/dsh-cost-meter（README/Releases，2026-11-17 抓取）
- 程序员鱼皮 2026-11-06 盘点 · 本站《[12 个超火插件盘点](dsh-top12-plugins.md)》
