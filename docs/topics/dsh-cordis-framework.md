# dsh Cordis 元框架专题 —— Service / 事件 / 依赖注入 / 生命周期

> 官方教程（7 章中文版）：deepseek-harness.github.io/deepseek-harness → develop/cordis-tutorial
> 概念参考：同站 develop/cordis-primer · 源码：主仓 `vendor/cordis/src/`（上游即 npm 包 `cordis`）
> 调研时点：2026-08-26 · 主仓 ⭐197,445 · master@f865a73 期 · 教程无需 API Key，克隆仓库 `pnpm install` 后在 `tmp/cordis-tutorial/` 目录跑 `node --import tsx ../../vendor/cordis/bin.js` 即可复现全部示例

## 一、Cordis 是什么（30 秒版）

dsh 的"一切皆插件"不是口号，底层就是 Cordis：**工具、LLM 适配器、文件访问、agent loop 本身，全是挂到共享 `ctx` 上的插件**。五个核心概念（来自官方 primer）：

| 概念 | 一句话 |
|---|---|
| 插件 = Service 的对象 | 函数 / 带 apply 的对象 / Service 子类三种形态 |
| 上下文 = 服务容器 | 一个服务占一个稳定的 `ctx.<key>`（如 `ctx.tools`、`ctx.llm`），按 key 查找而非 import 实现 |
| `inject` = 依赖声明 | 列出所需服务，框架保证就绪才启动——**加载顺序由依赖决定，不靠 YAML 排序** |
| 类型化事件 = 通信 | 声明合并注册事件名，emit/waterfall/parallel/serial 分发 |
| 注册 = 可逆副作用 | 一切注册自动挂 disposer，reload/teardown 时自动撤销 |

## 二、生命周期与 effect（第 2 章）

**是什么**：插件会因改配置、热重载、显式释放、所依赖服务消失而卸载。Cordis API 建立的注册都是 effect、卸载自动撤销；框架管不到的资源（定时器/连接/watcher）必须包进 `ctx.effect()` 并返回清理函数。

```ts
// 教程原样：手动资源的标准写法
ctx.effect(() => {
  const timer = setInterval(() => console.log('tick'), 200)
  return () => {            // ← disposer：卸载时框架调
    clearInterval(timer)
    console.log('heartbeat cleaned up')
  }
})
```

每个已加载插件实例对应一个 **fiber**（运行时句柄），状态机：

```
PENDING → LOADING → ACTIVE → UNLOADING → DISPOSED
                 ↘ FAILED        （apply/配置校验抛异常）
```

三条纪律（教程原文要点）：

- 内置注册 API 本身已是 effect：`ctx.on()` / `ctx.plugin()` / 服务注册 / `ctx.tools.register()` 都不用你再包 effect
- disposer 按**注册逆序**启动，但多个**异步** disposer 会**并发**跑——有顺序要求的拆除步骤要放进同一个 disposer 里依次 await
- `fiber.dispose()` 等所有清理（含异步）完成才结束，并递归卸载子插件

**什么时候需要它**：一拿到"框架不认识"的资源（setInterval、WebSocket、fs.watch、子进程）就包 effect，别等卸载逻辑写完再补。

## 三、Service 与依赖注入（第 3 章）

**是什么**：服务 = 一个插件提供、其他插件经 `ctx` 消费的具名能力。消费方只写 `inject: ['tools']` 这类名字，不 import 提供方——于是换实现 = 改 YAML，消费方代码零改动。

```ts
// 教程原样：提供服务（类形态）
import { Service, type Context } from '@deepseek-ai/cordis'

declare module '@deepseek-ai/cordis' {
  interface Context { greeter: GreeterService }   // 编译期：类型合并
}

export class GreeterService extends Service {
  constructor(ctx: Context) {
    super(ctx, 'greeter')                          // 运行时：以 'greeter' 注册
  }
  greet(who: string) { return `Hello, ${who}!` }
}

export function apply(ctx: Context) { ctx.plugin(GreeterService) }
```

```ts
// 教程原样：消费服务（函数形态）
export const inject = ['greeter']                  // 硬依赖声明
export function apply(ctx: Context) {
  console.log(ctx.greeter.greet('world'))          // 进 apply 时保证就绪
}
```

关键细节：

- `declare module` 只加类型不生成代码——**没它运行时照样工作，但消费方丢类型安全**（新手常以为这两行是注册逻辑，其实不是）
- `inject` **不是一次性启动检查**：运行期服务消失（提供方被卸载/热替换）→ 依赖插件跟着卸载、注册回卷；服务恢复 → 自动重新加载。这就是 dsh 能"换 shell 提供方不重启全家"的原因
- 可选依赖：不写 inject，用 `ctx.get('greeter')` 探测（无提供方时 undefined，插件照跑）
- 服务名是**全局扁平命名空间**，自有服务要加前缀；`tools`/`llm` 等普通名已被 harness 占用

**什么时候需要它**：当第二个插件也要用你这块能力时，把它从"插件内部函数"提升为 Service。只有一个消费者就别抽象。

## 四、事件系统（第 4 章）

**是什么**：发通知方不需要知道谁在听。harness 用事件处理工具结果（`tools/result`）、模型请求（`agent/request`）、审批决定（`approval/request`）。

5 种分发模式（教程表格 + primer 补充 bail）：

| 模式 | 调用 | await | 语义 |
|---|---|---|---|
| emit | `ctx.emit(name, ...args)` | 否 | 同步广播，不等返回值 |
| parallel | `await ctx.parallel(...)` | 是 | 全部并发，一起等 |
| serial | `await ctx.serial(...)` | 是 | 按序执行，**第一个非空返回值胜出并短路后续** |
| bail | `ctx.bail(...)` | 否 | serial 的同步版 |
| waterfall | `ctx.waterfall(name, ...args, next)` | 否 | 环绕中间件，可转换可否决 |

```ts
// 教程原样：waterfall 的短路纪律
ctx.on('demo/transform', async (input, next) => {
  if (input.includes('blocked')) return '** blocked **'  // 有决策权：直接返回=否决
  return next()                                            // 只观察：必须委托
})
```

**waterfall 是全框架最锋利也最危险的刀**：观察型监听器忘了调 `next()`，会**悄无声息吞掉所有下游默认行为**（比如一个日志监听器忘了 next，模型调用直接没了）——教程称之为"本仓库的常设规则"。

**什么时候需要它**：拦截/策略/装饰走事件（waterfall），直接能力调用走服务方法。

## 五、配置（第 5 章，简记）

`cordis.yml` 条目带 `config:` 块 → 插件导出同名 `Config`（TS interface + Schemastery schema 双导出）→ apply 前校验，坏配置给出 `ValidationError: $.targets expected array...` 且 fiber 进 FAILED、退出码 1——**插件绝不在配置不完整时启动**。`!!js` 标签仅 `config` 与 `disabled` 字段可用（如 `disabled: !!js process.env.CI != null` 按环境门控一条）。注意：导出普通对象当 Config 无效，必须是 Standard Schema 验证器。

## 六、DI 的坑（源码 + 教程双重考证，2026-08-26）

### 坑 1：inject 服务名拼错 → 永久 PENDING，静默到怀疑人生

- 表现：插件**无输出、不报错、不崩溃**；若组合里没有其他活动项，**进程直接 exit 0**（PENDING fiber 不占事件循环）
- 教程原话："PENDING 通常就是『为什么我的插件没有输出』的答案"（第 2/6 章两处强调）
- 本质：等待是合法状态（提供方可能稍后才来），框架不区分"还没来"和"永远不会来"

### 坑 2：模块路径/包名拼错 → 只走 logger，启动期可能丢失

- 与 apply 抛异常（进程终止、明确报错）不同，**模块解析失败只报 logger 错误、进程不崩**
- 更糟：启动阶段这条报告可能出现在 console logger 插件开始观察之前——**日志里都看不到**
- 教程给的纪律："新增配置项似乎没有任何效果，先检查拼写"

### 坑 3：循环依赖 → 无检测，互相 PENDING 死等

- 源码考证（`vendor/cordis/src/fiber.ts` 754 行 + `registry.ts` 337 行，2026-08-26 master）：**grep 不到任何 circular/cycle 检测**。fiber 对每个 inject 名调 `_checkImpl` → `reflect._getImpl(name)` 单点查找，找不到就继续等；A inject B 且 B inject A 时双方各自永远等不到，无告警无超时
- 结论：**Cordis 把循环依赖当配置错误留给作者自己发现**，不是运行时错误
- 怎么办（教程第 6 章的诊断手法，实测思路）：

```ts
// 教程原样：diagnose.ts——枚举 fiber 状态，揪出 PENDING
import { FiberState, type Context } from '@deepseek-ai/cordis'
export function apply(ctx: Context) {
  setTimeout(() => {
    for (const runtime of ctx.registry.values()) {
      for (const fiber of runtime.fibers) {
        if (fiber.state === FiberState.PENDING) {
          console.log(`${fiber.name} is PENDING — a required service is missing`)
        }
      }
    }
  }, 500)
}
```

排障顺序建议：**插件没动静 → 跑 diagnose 看 PENDING 名单 → 对照名字拼写（区分坑 1/坑 3：只有一个 PENDING≈拼错，一组互相等≈循环）→ 检查模块路径（坑 2）**。

### 附：HMR 下的 id 纪律

`cordis.yml` 条目不带 `id` 时每次读取都拿新生成的 id → **配置文件任何编辑都会让所有无 id 条目"先删再加"重新挂载**。要热重载稳定，条目必须写显式 `id:`。

## 七、升级路径决策树：函数 → 对象 → Service 类

```
你的插件要给别人提供服务（ctx.xxx 能力）吗？
├─ 否 → 函数插件（export function apply(ctx)）
│        └─ 99% 场景到这里就够了，教程第 1 章形态
└─ 是 → 别人需要拿到带状态的实例、可调方法吗？
    ├─ 否（只是可复用的一段逻辑/一组工具注册）→ 对象插件
    │      export const p = { name: '...', apply(ctx) {} }
    │      用途：需要把插件当值传递、动态 ctx.plugin(p) 挂载时
    └─ 是（有状态、有生命周期、被 inject 消费）→ Service 类
           extends Service + super(ctx, '带前缀的名字')
           + declare module 补类型 + 提供方 apply 里 ctx.plugin(YourService)
           记得：消费方 inject=['名字']，服务注册/注销自动随 fiber 走
```

判断口诀：**一个消费者→函数；要传值/动态挂→对象；要被 inject→类**。Day3 写小工具用函数形态；等第二个插件要用到它，再升级不迟——升级成本低，因为三种形态的 apply/ctx 合同完全一致。

## 参考

- 教程 7 章（中英双语）：01-first-plugin / 02-lifecycle-and-effects / 03-services / 04-events / 05-config / 06-composition-and-hmr / 07-into-the-harness
- Cordis 入门（primer）：五概念 + 分发模式表 + waterfall 语义 + loader 配置
- 进阶材料（教程第 7 章指向）：`examples/headless-agent/cordis.yml`（完整 agent 组合）、subsystems 页 cordis-surface 区块（全部可注入服务/事件清单）、event-producer-consumer 专题（事件生产者/消费者模式，21KB 长文）
- 前置阅读：[Day 2 插件机制精读](/topics/dsh-day2-plugins.md)（apply → inject → ctx.tools.register → patch 四步链路）
