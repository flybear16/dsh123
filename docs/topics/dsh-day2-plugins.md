# dsh Day 2 笔记 · 插件机制精读（2026-08-24）

> 官方教程：deepseek-harness.github.io → develop/basic · 生态盘点：github.com/topics/dsh-plugin
> 调研时点：主仓库 ⭐190,974 · pushed 2026-08-21 · MIT · 社区 topic 仓库 **11,275 个**

## 一、插件链路大白话

官方四步 `apply → inject → ctx.tools.register → patch`，翻译成人话：

1. **apply**：插件的"总开关函数"。插件 = 一个导出 `apply(ctx)` 的 TS 模块，加载时框架调它，就这么多
2. **inject**：插件的"点菜单"。要用别人的服务（tools/llm），先 `export const inject = ['tools']` 声明，框架保证依赖就绪才加载你
3. **ctx.tools.register**：在 ctx 上挂能力（工具/事件/定时器）——**挂上去的东西卸载时自动回收**，不用手动 removeListener
4. **patch**：`cordis.yml` 覆盖层 + `--patch` 启动参数，把本地插件插进 Web UI（路径必须绝对路径）

## 二、教程里的三个关键细节

- **ctx.effect()**：手动资源（网络连接等）的清理钩子——return 一个清理函数，卸载时框架调
- **三种插件形态**：函数（99% 场景够用）/ 对象 / 类（要给其他插件**提供服务**时用，extends Service）
- **排错入口**：插件没加载先看终端有没有 `[plugin] loaded!` 日志，再看 inject 声明是否拼错

```ts
// 最小可跑插件（教程原样）
import type { Context } from '@deepseek-ai/cordis'
export const name = 'hello-plugin'
export function apply(ctx: Context) {
  console.log('[hello-plugin] plugin loaded!')
}
```

## 三、社区生态盘点（dsh-plugin topic ⭐Top）

| 仓库 | ⭐ | 一句话 |
|---|---|---|
| nexu-io/open-design | 90.9k | "dsh 上的 Claude Design 平替"，设计向最强插件 |
| ruvnet/ruflo | 69.2k | agent 元框架：多智能体 swarm 编排 |
| esengine/DeepSeek-Reasonix | 35.1k | DeepSeek 原生终端编码 agent |
| volcengine/OpenViking | 32.8k | 自进化上下文库（记忆/知识统一） |
| titanwings/distilly | 23.9k | 把"他们怎么想"蒸馏成可复用 Skill |

**观察**：生态 8 天长到 1.1 万仓，头部全是"平台级"插件（设计/编排/记忆）而非小工具——说明"一切皆插件"的架构真的把组件市场打开 了。Day 3 写自己的小插件时，可以参考 distilly 的 skill 思路。

## 四、Day 3 预告的弹药

- 工具定义 DSL：教程"下一步"指向 develop/tools
- 无 Key 玩法：Cordis 教程（7 章）在临时目录就能跑，适合白嫖学习
- 候选选题（结合自家工作流）：git commit message 规范检查 / TODO 扫描器 / flybear-skills 接入
