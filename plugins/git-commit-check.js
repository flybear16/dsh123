// dsh Day3 插件：git commit message 规范检查
// 形态：函数插件（Day2 教程 99% 场景）
// 链路：apply → ctx.tools.register → 卸载自动回收（无需手动清理）
import { execSync } from 'node:child_process'

export const name = 'git-commit-check'
// 声明依赖 dsh-tools 服务（tool registry）——没这行，apply 时 ctx.tools 还没就绪直接炸
export const inject = ['tools']

// ---- 核心逻辑（与框架无关，可单测）----
const TYPES = ['feat', 'fix', 'docs', 'style', 'refactor', 'test', 'chore', 'perf', 'ci', 'build', 'revert']

function checkMessage(msg) {
  const problems = []
  // 规则1：格式 type(scope)?: subject 或 type: subject
  const m = msg.match(/^(\w+)(\([^)]*\))?!?:\s*.+/)
  if (!m) {
    problems.push(`格式不符 conventional commits：应为 "type(scope): subject"，实际 "${msg.slice(0, 40)}"`)
  } else if (!TYPES.includes(m[1])) {
    problems.push(`type "${m[1]}" 不在白名单 [${TYPES.join('/')}]`)
  }
  // 规则2：subject 长度（去 type 前缀后 ≤72 字符或 ≤24 个中文字）
  const subject = msg.replace(/^\w+(\([^)]*\))?!?:\s*/, '')
  if (subject.length > 72) problems.push(`subject 过长（${subject.length} > 72）`)
  // 规则3：结尾不加句号
  if (/[。.]$/.test(subject)) problems.push('subject 结尾不应有句号')
  return problems
}

function checkRepo(repoPath, count = 20) {
  const log = execSync(`git -C ${repoPath} log --pretty=format:%s -n ${count}`, { encoding: 'utf8' })
  const lines = log.split('\n')
  const bad = []
  lines.forEach((msg, i) => {
    // merge commit 跳过
    if (/^Merge /i.test(msg)) return
    const problems = checkMessage(msg)
    if (problems.length) bad.push({ offset: i + 1, msg, problems })
  })
  const passRate = Math.round(((lines.length - bad.length) / lines.length) * 100)
  return { total: lines.length, bad, passRate }
}

// ---- 插件注册层（dsh/cordis 接线）----
// API 契约源：dsh-tools/lib/index.js register(definition)
// definition = { name, description, parameters, output: { schema, render }, execute }
export function apply(ctx) {
  console.log('[git-commit-check] plugin loaded!')

  ctx.tools.register({
    name: 'check_commits',
    description: '检查 git 仓库最近 N 条 commit message 是否符合 conventional commits 规范',
    parameters: {
      type: 'object',
      properties: {
        repo: { type: 'string', description: '仓库绝对路径' },
        count: { type: 'number', description: '检查最近几条，默认 20' },
      },
      required: ['repo'],
    },
    output: {
      // execute 返回值的 JSON Schema
      schema: {
        type: 'object',
        properties: {
          total: { type: 'number' },
          passRate: { type: 'number' },
          bad: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                offset: { type: 'number' },
                msg: { type: 'string' },
                problems: { type: 'array', items: { type: 'string' } },
              },
            },
          },
        },
        required: ['total', 'passRate', 'bad'],
      },
      // render(args, value) 必须返回内容块数组
      render(args, value) {
        if (!value.bad.length) {
          return [{ type: 'text', text: `✅ 全部 ${value.total} 条 commit 合规（pass rate 100%）` }]
        }
        const lines = value.bad.map(b => `第${b.offset}条 "${b.msg.slice(0, 36)}" → ${b.problems.join('；')}`)
        return [{ type: 'text', text: `📊 pass rate ${value.passRate}%（${value.bad.length}/${value.total} 违规）\n` + lines.join('\n') }]
      },
    },
    async execute({ repo, count = 20 }) {
      return checkRepo(repo, count)
    },
  })
}
