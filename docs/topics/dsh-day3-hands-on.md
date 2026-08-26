# Day 3 实战：从零写一个 dsh 插件并挂载上线

> 三部曲收官篇。前面两篇讲了机制（[Day 2 插件机制精读](dsh-day2-plugins.md)、[Cordis 元框架](dsh-cordis-framework.md)），这篇记录一个真实插件的完整生命周期：开发 → 挂载 → 端到端验证 → 卸载验证。所有坑都是亲手踩的，错误信息、源码定位、修复方式全部来自实际操作。

## 需求

写一个 `check_commits` 工具：检查任意 git 仓库最近 N 条 commit message 是否符合 conventional commits 规范，返回 pass rate。规则：

- 格式 `type(scope)?: subject`，type 白名单 `feat/fix/docs/style/refactor/test/chore/perf/ci/build/revert`
- subject ≤72 字符（中文按字符算）
- 结尾不加句号
- merge commit 跳过

## 第一步：纯逻辑与框架分离

核心检查逻辑写成纯函数，不碰任何框架 API，可以直接单测：

```js
const TYPES = ['feat', 'fix', 'docs', 'style', 'refactor', 'test', 'chore', 'perf', 'ci', 'build', 'revert']

function checkMessage(msg) {
  const problems = []
  const m = msg.match(/^(\w+)(\([^)]*\))?!?:\s*.+/)
  if (!m) {
    problems.push(`格式不符 conventional commits：应为 "type(scope): subject"`)
  } else if (!TYPES.includes(m[1])) {
    problems.push(`type "${m[1]}" 不在白名单`)
  }
  const subject = msg.replace(/^\w+(\([^)]*\))?!?:\s*/, '')
  if (subject.length > 72) problems.push(`subject 过长`)
  if (/[。.]$/.test(subject)) problems.push('subject 结尾不应有句号')
  return problems
}
```

**双向验证**（挂载前做，不用起服务）：
- 规范仓（flybear-skills）：20/20 通过，pass rate 100%
- 脏仓（手工构造 7 种违规）：7/7 全部抓出，0 漏报

## 第二步：挂载——第一个坑：inject

插件骨架照 Day 2 教程写，第一次启动直接炸：

```
Error: failed to apply loader entry git-commit-check:
cannot get property "tools" without inject
```

**根因**：Cordis 的依赖注入是显式的——`apply(ctx)` 里要用哪个服务，必须在模块顶层 `export const inject` 声明，否则框架不给碰。Day 2 笔记里记过三要素（plugin/apply/inject），写的时候还是漏了：

```js
export const name = 'git-commit-check'
export const inject = ['tools']   // ← 缺这行，ctx.tools 未就绪直接炸
```

## 第三个坑：register 的真实签名

补上 inject 后，日志打出了 `[git-commit-check] plugin loaded!`，但接着又炸：

```
Error: tool "undefined" must declare output { schema, render, presentationMeta? }
```

**根因**：想当然写成了 `register('check_commits', {...})`（名字当第一个参数）。真实契约不是这样。

去源码里找标准答案——`~/.dsh/profiles/node_modules/@deepseek-ai/dsh-tools/lib/index.js` 的 `register(definition)`：

```js
register(definition) {
  const name = definition.name;
  const output = definition.output;
  if (output === void 0 || typeof output !== "object"
      || typeof output.render !== "function" ...)
    throw new TypeError(`tool "${name}" must declare output { schema, render, presentationMeta? }`);
```

完整契约：

```js
ctx.tools.register({
  name: 'check_commits',
  description: '...',
  parameters: { type: 'object', properties: {...}, required: ['repo'] },  // JSON Schema
  output: {
    schema: { ... },              // execute 返回值的 JSON Schema
    render(args, value) {         // 必须返回内容块数组！
      return [{ type: 'text', text: '...' }]
    },
  },
  async execute(args) { return {...} }
})
```

三个要点：

1. **name 在 definition 对象里**，不是第一个参数
2. **output 必填**：`schema`（execute 返回值的 JSON Schema）+ `render`（把返回值渲染成内容块）
3. **render 必须返回 `[{type:'text',text}]` 数组**——返回字符串会炸（`must return an ARRAY of content blocks`）

为什么这么设计？execute 返回结构化数据（可被程序消费），render 负责人读的呈现——数据和展示分离，UI 层可以换渲染方式而不用动工具逻辑。

## 第四步：patch 挂载文件

`--patch` 用的 YAML 是 loader patch 条目数组，格式照抄 `dsh-base/cordis.patch.yml`：

```yaml
# /home/east/dsh-cordis.yml
- insert:
    - id: git-commit-check
      name: /home/east/ws2026/dsh123/plugins/git-commit-check.js   # 绝对路径
```

注意：第一反应猜的 `$location` map 格式是错的。正确形态是 `- insert:` 数组，`name` 直接填文件绝对路径。

## 第五步：启动（Node 版本坑）

dsh 要求 Node 22.19+ 或 24+。dsh 的 bin 用 `#!/usr/bin/env node`，如果 PATH 里默认 node 低于要求就会异常。用绝对路径显式指定：

```bash
tmux new-session -d -s dsh \
  '/home/east/.nvm/versions/node/v24.18.1/bin/node \
   /home/east/.nvm/versions/node/v24.18.1/bin/dsh web \
   --patch /home/east/dsh-cordis.yml > ~/dsh-web.log 2>&1'
```

启动成功的标志：

```
[git-commit-check] plugin loaded!
dsh web: http://127.0.0.1:3080
```

## 第六步：端到端验证（UI 真实调用）

打开 `http://127.0.0.1:3080` 新建会话，发：

> 用 check_commits 工具检查 /home/east/ws2026/flybear-skills 最近 20 条 commit

观察到完整链路：

1. agent Think → 决定直接调工具
2. UI 出现 `Tool call check_commits · /home/east/ws2026/flybear-skills`
3. 返回 `✅ 全部 20 条 commit 合规（pass rate 100%）`——这正是 render 函数拼的文案，说明 **render 管线也走通了**，不只是 execute
4. agent 向用户复述结果

## 第七步：卸载验证

杀掉 tmux session，**去掉 `--patch` 参数**重启：

```bash
tmux kill-session -t dsh
tmux new-session -d -s dsh-nopatch '...dsh web > ~/dsh-web.log 2>&1'   # 无 --patch
```

新会话再让 agent 调 check_commits，它明确回复：

> 我没有名为 `check_commits` 的工具（当前可用工具中不存在该工具，可用技能目录里也没有）

还自己用 Bash 跑 git log 兜底了。工具干净消失，无残留——Cordis "卸载自动回收"的设计得到验证。

## 总结：三个坑一张表

| 坑 | 错误信息 | 根因 | 修复 |
|---|---|---|---|
| 缺依赖声明 | `cannot get property "tools" without inject` | Cordis 显式 DI，不声明不给碰 | `export const inject = ['tools']` |
| register 签名 | `tool "undefined" must declare output { schema, render }` | name 不在 definition 里 / output 必填 | 单 definition 对象 + 完整 output |
| render 返回值 | `must return an ARRAY of content blocks` | 返回了字符串 | 返回 `[{type:'text',text}]` |

**方法论沉淀**：dsh/cordis 的 API 别猜，两个源码入口可以直接抄标准答案——

- 工具注册契约：`dsh-tools/lib/index.js` 搜 `register(definition)`
- patch 条目样例：`dsh-base/cordis.patch.yml`（所有内置服务的 id/name 清单）

三天总账：Day1 环境跑通 → Day2 机制精读 → Day3 实战闭环。一个插件从想法到"挂载生效、卸载无残留"的完整生命周期，全部亲手验证。
