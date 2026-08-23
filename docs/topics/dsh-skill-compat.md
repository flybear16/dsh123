# dsh 的 skill 兼容机制：原生扫描 + dsh-skillport 桥接

> 追加时间：2026-08-23 · 来源：CSDN / bibigpt / 夜雨飘零博客多方交叉

## 一、原生兼容：不需要任何插件

dsh（rc.5 起）内置 skill 子系统开箱即用，Web UI 三个内置预设（standard / code / cordis）都已挂载 skill 能力。它直接认 Anthropic 的 SKILL.md 契约（YAML frontmatter 带 `name` + `description`），和 Claude Code 等 40+ 款 agent 是同一套格式。

### 扫描根优先级（数字小者胜，重名最近层赢）

| 优先级 | 路径 | 说明 |
|:---:|------|------|
| 100 | `项目/.dsh/skills` | 项目专属 |
| 200 | `项目/.agents/skills` | 项目共享 |
| 300 | `customSkillDirs` 配置 | 自定义目录 |
| 400 | `~/.dsh/skills` | 个人全局 |
| 500 | `~/.agents/skills` | 全局共享（跨框架） |

**推论**：`~/.agents/skills` 下的技能（如本机 flybear-skills 体系）dsh 启动自动扫描，零配置零迁移。

### 格式要求

- 目录式：`<skill-name>/SKILL.md`（目录名必须 kebab-case）
- 扁平式：单个 `.md` 文件
- frontmatter 必填 `name` + `description`，可选 `whenToUse` 等
- ⚠️ 不支持二级子目录递归发现
- 文件改动自动热更新，不用重启

### 验证是否加载成功

- 命令面板 `/` → Skills 分组应列出技能完整 description
- 会话日志出现 `Context injection · skill-catalog` 记录 = 真的进了模型上下文
- 前提：`DEEPSEEK_API_KEY` 已设置（缺 key 的报错和 skill 加载失败长得一样）

## 二、插件桥接：dsh-skillport

社区插件 **dsh-skillport** 把各家旧技能目录直接桥接进 dsh，不用复制文件：

- `sources: [dsh, claude, agents, gemini]` — 扫描多套发现组
- 额外转换能力：
  - `.cursor/rules/*.mdc` → skill
  - `AGENTS.md` / `CLAUDE.md` → context（原生已处理则跳过）
  - `.claude/commands/*.md` → 用户可调用 skill
- 会话里 `/skills doctor` 查看当前加载的技能，按来源分组核对

安装：`dsh plugin add <skillport 仓库>`（详见其 README）；卸载插件会把导入的技能一并撤掉（Cordis effect 机制）。

## 三、选型建议

| 场景 | 方案 |
|------|------|
| skill 在 `~/.agents/skills` 或 `.agents/skills` | 什么都不用做 |
| skill 只在 `~/.claude/skills` / `.cursor` / gemini 目录 | 装 dsh-skillport 桥接 |
| skill 在项目专属目录 | 复制到 `.dsh/skills` 或配 customSkillDirs |

## 参考

- dsh-skillport 介绍：https://blog.yeyupiaoling.cn/article/1787007144293
- Skills 与 AGENTS.md 注入机制（源码实测）：CSDN liulilittle
- Skills 兼容 FAQ：https://bibigpt.co/zh/blog/posts/deepseek-harness-agent-skills-compatible
