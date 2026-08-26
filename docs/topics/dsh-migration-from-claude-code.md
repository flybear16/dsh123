# dsh 迁移实战：从 Claude Code / OpenClaw 带着技能库切过来（实测记录）

> 实测时间：2026-08-26 · 环境：本机（Node 22.22.3 via nvm / 24.16.0 system）+ 火山方舟 ark 端点
> 版本：全局 CLI `0.1.0-rc.6`（/usr/local/bin/dsh）· profile 包 `0.1.1-rc.2` · npx 拉取的最新构建
> 关联：[skill 兼容机制（推论篇）](/topics/dsh-skill-compat.md) · [Day 2 插件精读](/topics/dsh-day2-plugins.md)

## 一、实测方法

- **迁移源**：本机三套技能库 —— `~/.claude/skills`（247 个）、`~/.agents/skills`（90 个）、`~/.openclaw/skills`（114 个）
- **迁移样本**：从 flybear-skills 挑 2 个真技能（`ai-news-collectors` 纯净版 / `evening-journal` 多字段版）+ 2 个自造探针（目录式 + 平铺式）
- **验证通道**：`dsh --profile headless "任务"` 一次性运行 → 解压 `~/.dsh/sessions/<路径化目录>/session-*/session.jsonl.zstd` 查 `skill-catalog` 与 `tool-call` 事件（比看模型嘴说可靠）
- **端点**：ark.env 提供 `DEEPSEEK_API_KEY` + `DEEPSEEK_BASE_URL=https://ark.cn-beijing.volces.com/api/v3`——**不申请官方 platform.deepseek.com 的 key 也能跑**（deepseek-official provider 认 BASE_URL 覆盖）

## 二、启动踩坑实录（两个真障碍，均为一等公民发现）

| # | 障碍 | 报错特征 | 修法 |
|---|------|---------|------|
| 1 | **全局安装缺 sharp 原生模块** | `Could not load the "sharp" module using the linux-x64 runtime`，进程 core dump | npm 安装时 optional deps 没装上。改用 `npx -y @deepseek-ai/dsh ...`（npx 缓存安装会带平台二进制），或全局目录补 `npm install --include=optional sharp` |
| 2 | **credentials 版本字符串/数字不匹配** | `declares version "1"; this build reads version 1` | 旧构建写出 `version: "1"`（带引号），新构建严格 `!== 1` 数字比较。编辑 `~/.dsh/.credentials.yaml` 去掉引号即可（已备份 `.bak.20260826`） |

> 教训：v0.1 预览版"接口常变"不是吓唬人——**同一台机器上 CLI、profile 包、npx 最新版三代共存，配置兼容性随时可能断**。迁移前先 `dsh --version` + 摸清自己实际跑的是哪一代。

其他环境事实：3080 端口**单实例语义**（已有 web 在跑时再启一个直接 `EADDRINUSE` 退出）；本机 node 24.16.0 / 22.22.3 均满足 22.19+/24+ 门槛，无版本障碍。

## 三、skill 发现实测：四个放置路径全命中

### 部署与结果

| Rank | 放置路径 | 样本 | 形态 | 目录可见 |
|:---:|---------|------|------|:---:|
| 100 | `/tmp/dsh-skill-lab/.dsh/skills/test-probe/` | 自造探针 | 目录式 SKILL.md | ✅ |
| 200 | `/tmp/dsh-skill-lab/.agents/skills/probe-agents.md` | 自造探针 | **平铺单文件** | ✅ |
| 400 | `~/.dsh/skills/ai-news-collectors/`、`evening-journal/` | flybear 真技能 | 目录式 | ✅ |
| 500 | `~/.agents/skills/`（90 个目录） | 存量库 | 目录式 | 71/90 ✅ |

- 实测命令（可复跑的验证配方）：

```bash
source ~/.config/dsh/ark.env && cd /tmp/dsh-skill-lab
npx -y @deepseek-ai/dsh --profile headless \
  "不要调用任何工具。只根据 available skills 目录，列出名字含 probe/news/journal 的条目。"
```

- 铁证：session 日志里恰好 1 条 `skill-catalog` 来源消息，`<available_skills>` 共 **76 个**条目，4 个新放置全部在列；模型复述与日志完全一致。
- `/tmp/dsh-skill-lab` 无 `.git` → projectRoot 回退 cwd，rank 100/200 照常生效（源码行为吻合）。

### 90 → 76 的账（拒收/排除明细，全部人工核对）

| 数量 | 原因 |
|:---:|------|
| 16 | `disable-model-invocation: true` —— **主动**排除出模型目录（命令面板以"仅用户"徽章呈现，属设计行为非故障） |
| 1 | frontmatter YAML 语法错误（mmx-image） |
| 1 | `name`（qiushi-openclaw-skills）≠ 目录名（qiushi-openclaw-skill） |
| 1 | 无 SKILL.md 的普通目录（scripts） |
| 71 | 正常进入模型目录 |

### frontmatter 兼容实测

- `evening-journal` 携带 `version`/`author`/`license`/`metadata.hermes` 等额外字段 → **照收**（开放 YAML 对象，只挑已知字段）
- 必填仅 `name` + `description`；name 必须 kebab-case
- ⚠️ 唯一硬雷（源码 L842-844）：驼峰调用键 `disableModelInvocation` / `modelInvocable` / `userInvocable` → **整个技能被拒**并告警，不是只丢字段

## 四、触发机制实测

### 自动触发（描述匹配）

headless 任务："收集今天的 AI 新闻并按热度排序（离线演示）"。session 日志捕获两次 `skill` 工具调用：

```json
{"name": "skill", "arguments": "{\"name\": \"ai-news-collectors\"}"}
{"name": "skill", "arguments": "{\"name\": \"aihot\"}"}
```

- 不点名、纯靠 description 语义匹配，且**一次命中两个库的同类技能**（rank 400 新迁入 + rank 500 存量）
- 机制（源码级）：agent 每次 pre-step 快照技能表 → `<available_skills>` 摘要注入模型上下文 → 模型调 `skill` 工具按名加载正文；目录描述超长按 `catalogDescriptionMaxLength`（默认 500 字符）截断
- 实际跑的模型：`deepseek-v4-flash`（provider 显示 deepseek-official，走 ark BASE_URL）——**学习期友好**；ark.env 里 `DSH_MODEL=v4-pro` 未被采纳，模型选择机制另在 UI/settings【机制待深究】

### 用户触发（Web UI 命令面板）

- 输入框打 `/关键词` 弹"触发候选建议"：`/tri` → `triage 仅用户 · Move issues and external PRs...`（"仅用户"徽章 = disable-model-invocation）；`/aihot` → 完整描述无徽章（模型+用户双向可调）
- **热刷新粒度**：目录刷新发生在 agent pre-step。实测往 `~/.dsh/skills` 新增技能后，**新起进程立即可见**；但长驻 web 进程的"新会话未发消息前"，触发建议列表仍是旧目录——发第一条消息后才更新。排查"新技能不显示"先发一条消息再判

## 五、与 Claude Code / OpenClaw 的加载差异对比（2026-08-26 实测/源码）

| 维度 | Claude Code | OpenClaw | dsh |
|------|-------------|----------|-----|
| 个人技能路径 | `~/.claude/skills` | `~/.openclaw/skills` | `~/.dsh/skills` + **`~/.agents/skills`** |
| 项目技能路径 | `.claude/skills` | 同左（兼容） | `.dsh/skills` + `.agents/skills` |
| 跨框架共享目录 | 不扫 `~/.agents` | 不扫 `~/.agents` | **原生扫**（rank 500） |
| 平铺单文件技能 | 否 | 否 | ✅ `<name>.md` |
| frontmatter 宽容度 | 宽（本机实测 12+ 种字段：allowed-tools/triggers/origin/bins...） | 宽（多 openclaw 私有字段） | 开放解析+字段忽略；**驼峰调用键硬拒** |
| 额外字段处置 | 各自生效 | 各自生效 | 静默忽略（不报错） |
| 触发机制 | 描述匹配 + Skill 工具/斜杠命令 | 同 CC 习惯 | `<available_skills>` 目录 + `skill` 工具 + `/` 命令面板 |
| disable-model-invocation | 支持（本机 16 个在用） | 支持 | 支持，UI 呈现"仅用户"徽章 |

**本机迁移面的真实数字**：`~/.agents/skills` 与 CC 重叠 82 个、与 OpenClaw 重叠 76 个 → **零迁移直接可用约 82 个**；CC 独有 **165 个** dsh 看不见（需下节方案）。

## 六、迁移检查表：从 Claude Code 切 dsh

### A. 配置迁移

- [ ] API：`DEEPSEEK_API_KEY`（官方或 ark 均可）+ 可选 `DEEPSEEK_BASE_URL`（ark 中转实测可用）
- [ ] 权限：`~/.dsh/settings.yaml` → `permission.defaultPreset`（本机为 danger-full-access；新迁移建议先默认再放开）
- [ ] 踩坑预检：credentials 版本引号问题（本文二节）、sharp 依赖（优先 npx 路线）
- [ ] 端口：3080 单实例，先 `curl 127.0.0.1:3080/healthz` 探活

### B. 技能迁移（按位置分流）

| 你的技能在哪 | 动作 |
|-------------|------|
| `~/.agents/skills` | **什么都不做**（实测零配置可见） |
| `~/.claude/skills` / `~/.openclaw/skills` 独有 | 三选一：① `ln -s` 逐个软链到 `~/.agents/skills`（可撤、不复制）② 装 dsh-skillport 插件桥接（见兼容篇）③ 批量 cp（迁移彻底但失去单一来源） |
| 项目 `.claude/skills` | 复制/软链到同项目 `.dsh/skills` 或 `.agents/skills` |
| frontmatter 体检 | 必填 name+description、kebab-case、无驼峰调用键；额外字段（allowed-tools 等）会被忽略——**依赖这些字段的技能行为会变**，需人工过一遍 |

迁移后验证（30 秒配方）：headless 探针问一句 + `zstdcat` 最新 session 日志 grep 技能名（本文一节命令）。

### C. 习惯差异

- CC 的 `allowed-tools`/`triggers`/`preamble-tier` 等字段在 dsh **无对应语义**（静默忽略）
- description 是唯一自动触发依据，且目录里截断到 500 字符——长 description 前置关键词
- 斜杠命令 → `/` 触发候选；"仅用户"技能仍可正常面板调用
- 新技能不显示 → 先发一条消息触发 pre-step 刷新，再看 session 日志定责

### D. 回退方案（成本≈0）

- dsh 全部状态隔离在 `~/.dsh/`（配置/会话/credentials），**不写 Claude Code 任何文件**——删目录即完全卸载
- 软链/桥接方案不复制文件，`unlink` 即回
- 会话历史 `~/.dsh/sessions/`（zstd JSONL）可 `dsh` 内 export ZIP 归档后再清理

## 七、残留与后续

- `~/.dsh/skills/` 现有 ai-news-collectors、evening-journal 两个真技能（本次迁移实物，保留）
- `/tmp/dsh-skill-lab/` 探针测试场保留（重启自动清空，可随时重建）
- 待办：CC 独有 165 个技能的批量软链脚本化；`DSH_MODEL` 不生效的模型选择机制；dsh-skillport 桥接实测（可与本文软链方案对比后择优）

## 参考

- 源码级依据：`~/.dsh/profiles/node_modules/@deepseek-ai/dsh-skill-filesystem/lib/index.js`（roots/parseSkillFile/L842-844 驼峰拒收）及同包 README.zh.md
- 目录注入与 `skill` 工具：`dsh-tool-skill/README.zh.md`
- 仓库：https://github.com/deepseek-ai/deepseek-harness（packages/skill/skill-filesystem）
- 实测日志：`~/.dsh/sessions/--tmp-dsh-skill-lab--/session-{66e6cd89,16f281b4}-*`（Probe A/B 原始证据）
