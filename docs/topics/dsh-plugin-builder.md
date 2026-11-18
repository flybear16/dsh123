# dsh-plugin-builder —— 写插件的插件（AI 自己造插件）

> 更高层路线：人只描述「要什么能力」，Agent Skill 负责决策扩展点、生成、验证、打包、装管全流程。数据复核 2026-11-19。

## 是什么

[kingjly/dsh-plugin-builder](https://github.com/kingjly/dsh-plugin-builder)（⭐3，MIT），一个 **Agent Skill**——不是 DSH 插件，而是装进 agent 客户端（Grok / Claude Code / Codex / 项目本地 `.agents/skills/`）的技能包，让 AI 自己完成 dsh 插件的「决定 → 构建 → 增量修改 → 验证 → 打包 → 管理」。

架构上自洽：dsh 的 UI/工具扩展靠插件，agent 能力扩展靠 skill——「造插件」这个能力，正是以后者承载前者。

## 决策优先工作流

先生成代码之前，先选**最窄的可用扩展点**；每单都会把决策记录进 `plugin-design.md` 再动手：

| 需求 | 选的扩展点 |
|---|---|
| 加结构化模型能力 | `defineTool()` 注册工具 |
| 拦截/约束已有工具调用 | 单调 `ctx.tools.guard()` 策略 |
| 替换文件系统/shell/搜索/沙箱/子代理执行 | 现有 Service Provider seam |
| 加或路由模型后端 | 先配 `dsh-llm-pi-ai`，必要时才写 adapter |
| 加可重放的 Chat 卡片 | Host 结果/事件 + Client Conversation Node |
| 改全局 Web UI / 加 shell 控件 | 语义主题 + additive shell slot |
| 接 IM / IDE / 自动化协议 | `ctx.agents` 上的协议桥 |
| 改 agent-loop、重复造 bash、重写现有 MCP 工具 | **拒绝**，指回支持的 seam |

## 产物形态

合法请求生成独立 TypeScript ESM 包：`dsh.bundle` 可安装体 + 开发 overlay + 设计记录 + 冒烟测试 + 验证命令。默认出树 Host 插件、`web` profile、不改 agent-loop、先本地 overlay 测试再安装。凭据只收环境变量名，**绝不把真实密钥写进生成文件**。

## Showcase：四个真实插件全链路实证

| 包 | 形态 | 实际效果 |
|---|---|---|
| dsh-aurora-ui | 主题 + shell overlay | 全应用换 Aurora 色，浮窗控制器管主题/侧栏/详情面板 |
| dsh-luna-pet | 宠物 overlay（8×9 WebP 图集） | 无边框可拖拽 Luna 桌宠，位置跨刷新持久 |
| dsh-release-readiness | Host 工具 + Conversation Node | 证据门禁打分仪表盘，重启后卡片可重放 |
| dsh-command-safety | 策略 guard | `Remove-Item -Recurse -Force` 探针在 PowerShell 执行前被拦，会话里显示命中的规则 |

README 五张截图均为 `127.0.0.1:3080` 实机抓取，17 个冒烟测试通过。

## 修改已有插件

不用重新生成脚手架——指向包目录描述改动即可。Skill 先审计当前包与扩展形态，**保留包名、原始入口 id、配置键、持久化语义**，只改必要源码，重跑静态校验与测试；Client UI 改动在新浏览器页验证，依赖/manifest 变更才需重启服务。

## 热启停（免重启开关）

已安装的包在 profile 的 `cordis.patch.yml` 加精确条目即可运行时开关，DSH 监听 patch 层、无需重启服务：

```yaml
- id: showcase-aurora-ui
  disabled: true
```

对比：`dsh plugin add/remove` 或改 profile `package.json` 动的是依赖与 bundles，**必须重启**。注意 inventory id（如 `include:showcase-aurora-ui`）是 Loader 路径，未必是写进 patch 的 id——先解析活进程的真实 `DSH_HOME` 与原始 bundle 入口 id。

## 安装与运行

```powershell
git clone https://github.com/kingjly/dsh-plugin-builder.git "$HOME\.claude\skills\dsh-plugin-builder"
```

前置：Node 22+、pnpm、Python 3.10+、DeepSeek Harness。编译/静态校验/测试/bundle 安装/`--dump-config` **全程无需模型 Key**，只有端到端对话才需要。

## 注意事项

- **版本**：Windows + `@deepseek-ai/dsh@0.1.0-rc.6` 验证；Harness 还是开发者预览，破坏性变更风险自担
- **DSH_HOME 一致性**：安装与每次重启必须同一 `DSH_HOME`，否则开出新 profile，模型设置和会话看起来「消失」（数据其实还在）
- **Windows 本地 ESM**：`cordis.dev.yml` 里的条目必须 `file:///C:/...` URL；仓库脚本负责重生成可移植绝对导入
- 同类还有 WilShi/dsh-plugin-builder（guardrail 向）、hheroulsoul/dsh-plugins-builder，kingjly 版最完整

## CC 对照

装进 `~/.claude/skills/` 即可在 Claude Code 用——与《[Day 3 实战](dsh-day3-hands-on.md)》的手工流水线互为高低配：手工版适合学机制，这条 skill 化路线适合批量产出。

## 出处

- https://github.com/kingjly/dsh-plugin-builder（README，2026-11-19 抓取）
