# cc-safety-net —— 防删库防护网

> AI 编码 agent 的预执行防护网：危险命令在**运行前**被语义解析拦截，包一层 shell 或重排 flag 都躲不掉。自述"不是沙箱"。数据复核 2026-11-17。

**热度**：kenryu42/cc-safety-net ⭐2,055、98 forks（GitHub API 实抓）；v2.7.14（2026-11-16 发布，近乎每日发版）；MIT。鱼皮盘点实用组第 4：「更像'最后的保险'，挡不住所有误操作，重要项目仍需勤提交」。

## 是什么与拦截清单

CC 生态出身（npm 描述原文 "A Claude Code plugin that acts as a safety net"），npm 包自带 `dsh.bundle.patch: ./dist/deepseek-harness/cordis.patch.yml`，keywords 含 deepseek-harness/dsh——**DeepSeek Harness 与 Claude Code 并列在支持清单里**。

| 拦截 | 放行 |
|---|---|
| `git reset --hard` / `--merge`、`git push --force`、`git clean -f`、`git branch -D`、`git stash drop/clear`、`git worktree remove --force`、`git checkout --`、`git restore` | `git checkout -b`、`git restore --staged`、`git branch -d`、`git clean -n`（dry-run）、`git push --force-with-lease` |
| 危险目标 `rm -rf`（cwd 外、/、~、$HOME）、`find … -delete`、`xargs rm -rf`、`curl … \| bash`；藏在 `bash -c` / `python -c` / `node -e` 等解释器一行命令里也拦 | 临时目录内的 `rm -rf` |
| 密钥访问：SSH key、.env、`~/.aws`、coding-CLI 凭据（shell 与文件工具双侧覆盖） | — |

## 原理

- **PreToolUse hook，先于权限系统运行**（防御纵深）：对命令做语义分析，而不是通配 deny 规则——后者有 5 种绕过向量（选项前置、shell 变量、flag 重排、多余空格、shell wrapper）；shell wrapper 递归分析 5 层。
- 配置：用户级 `~/.cc-safety-net/config.json` + 项目级 `.safety-net.json`（项目优先，大小写不敏感去重）；规则 schema `{name ≤64 字符, command, subcommand, block_args, reason ≤256 字符}`；`.cc-safety-net/` 提交进 git 即团队共享策略。
- GUI 调策略 `npx cc-safety-net gui`（Standard/Strict/Paranoid 三档预设）；rulebook 扩展（Terraform/AWS/gcloud/Azure 官方包或自定义 JSON）；审计日志 `~/.cc-safety-net/logs/*.jsonl`（敏感数据自动脱敏）；`doctor` 7 项检查（含近 7 天拦截汇总）；statusline emoji 指示器。

## 安装

```bash
npx -y cc-safety-net@latest install   # 通用安装（Node 22+）
npx -y cc-safety-net@latest doctor    # 体检
```

- **Claude Code**：`/plugin marketplace add kenryu42/cc-marketplace` → `/plugin install safety-net@cc-marketplace` → `/reload-plugins`；支持自然语言建规则 `/set-custom-rules`。
- **DSH**：走插件通道加载（npm 包自带 dsh.bundle.patch）；DSH 侧加载细节二手转载称以可选 profile 插件、注册 monotonic tool guard（**来源为转载，非 README 原文**，装前自行验证）。

## 局限（作者自述，重要）

- 绕过抗性**低于 OS 沙箱**：只分析命令字符串，无网络防护、不隔离进程——鱼皮实测项目内 `rm -rf` 未拦截。沙箱本体见[沙箱与安全机制](dsh-sandbox-security.md)。
- 短选项展开可能误报（`-Cfoo` 被拆成 `-C -f -o -o`）；自定义规则只能加限制、不能绕过内置。
- **默认 fail-open**：配置损坏静默回退内置规则；要 fail-closed 需 `SAFETY_NET_STRICT=1`（另有 `SAFETY_NET_PARANOID=1` / `_RM=1` / `_INTERPRETERS=1`）。
- 结论一句话：它是"手滑兜底"，不是"恶意防线"；重要仓库仍要靠勤提交 + 远端备份。

## 出处

- https://github.com/kenryu42/cc-safety-net · https://www.npmjs.com/package/cc-safety-net（2026-11-17 抓取）
- 程序员鱼皮 2026-11-06 盘点 · 本站《[12 个超火插件盘点](dsh-top12-plugins.md)》
