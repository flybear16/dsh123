# dsh-pua —— 给 AI 上强度（验收循环）

> 名字叫 PUA，内核是「失败换思路 + 完成前验证」：agent 反复失败时换方法，声称完成时先拿证据。15 种大厂风格 + Loop 验收循环。数据复核 2026-11-17。

**热度**：MichengAI/dsh-pua ⭐74；Apache-2.0（改编自 tanweai/pua 3.5.1，捆绑 PUA 资产保留上游 MIT + NOTICE）。鱼皮点评：「可用各大厂风格 PUA 你的 AI，能让 AI 少一点轻易放弃的情况；作者称是测过最离谱的插件」。README 官方口径："Help your agent try another approach and verify its work before calling it done." + "Results depend on the model and task. The plugin does not guarantee a solution every time."

## 是什么

- **换思路**：agent 重复失败/过早放弃时，推动它重新推理而不是复读无效尝试。
- **完成前验证**：鼓励给结果配验证与证据（`/pua done-check`、`/pua evidence`）。
- **风格与人设**：15 种大厂风格（`/pua flavor huawei`…），另有 P7/P9/P10、鼓励、母亲等人设模式；composer 里 Experts 右侧出现 PUA 入口，按会话覆盖全局默认。
- **Loop 验收循环**：给定验证命令 + 迭代上限，干到验证通过或到达上限：
  ```
  /pua loop "Fix the failing tests and add regression coverage" --verify "npm test" --max-iterations 10
  /pua-cancel-loop   # 停止
  ```
- **Integrity guard**（默认关）：拒绝读取隐藏 benchmark 答案（含联网搜答案），改动 test/评分/CI 资产前提醒——防"刷榜式完成"。
- 状态卡用 GFM 管道表格（DSH 能渲染），不用 Unicode 框线。

## 安装与命令

```bash
dsh plugin --profile web add @michengai/dsh-pua@latest --registry=https://registry.npmjs.org/
```

要求 Node 22.19+；README 列明支持的 DSH 版本（0.1.2-rc.1 … 0.2.0-rc.2 多档）。装完**reload DSH 或重启 Web 服务**（只刷新浏览器不够），`/pua help` 验证。无需额外 API key（用宿主现有模型配置）。

常用命令：`/pua on|off`（会话级开关）、`/pua again`（要求换方法）、`/pua done-check`、`/pua evidence`、`/pua review`（只审不改）、`/pua reset`（回全局默认）。0.3.0 起命令只影响当前会话，全局默认只在插件设置页改。

## 配置要点

全局设置页（侧栏 Plugins → `@michengai/dsh-pua`）：启用开关、风格/人设、UI 语言、**子代理生效开关（默认关，且依赖父会话 PUA 开关）**、纠错提醒强度、Integrity guard、反馈提醒频率（反馈不上传）、Loop 默认值（验证命令/超时/迭代上限）。迭代上限 0 = 不限；**没有验证命令时，完成判定只靠模型自报**——用 Loop 务必配 verify。

## CC 对照与观察

- 上游 tanweai/pua 本就是 Claude Code 生态的"AI 管理学"插件，dsh-pua 是其 DSH 适配线。
- 效果本质是**提示词工程 + 循环控制**：对"轻易宣布完成"类失败有效，不改变模型能力上限；多轮 Loop 会真实消耗 token——和 [billion-context](dsh-billion-context.md)（压上下文）、[dsh-cost-meter](dsh-cost-meter.md)（盯花费）搭配使用更稳。
- 作者 MichengAI 维护 DSH Codex Desktop 系 11 个 first-party 插件（Codex UI / Agency Agents / Skills Manager / Archive Manager / IM Connect / Automation / BTW / Simplify / PUA / Code Review / Codex Pet）——社区里的"插件厂牌"。

## 出处

- https://github.com/MichengAI/dsh-pua（README，2026-11-17 抓取）
- 程序员鱼皮 2026-11-06 盘点 · 本站《[12 个超火插件盘点](dsh-top12-plugins.md)》
