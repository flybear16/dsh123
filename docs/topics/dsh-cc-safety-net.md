# cc-safety-net —— AI 编码 agent 的防删库防护网

> 工具调用执行前解析命令语义：破坏性 Git/文件系统命令、SSH key 与 .env 等敏感文件访问直接拦下。数据复核 2026-11-17。

## 是什么

[kenryu42/cc-safety-net](https://github.com/kenryu42/cc-safety-net)（⭐2,059），MIT。名字里的 cc = Claude Code（最早为它做的），现已支持 14 个宿主：Claude Code、Codex、Cursor、**DeepSeek Harness**、**OpenClaw**、OpenCode、Amp、Kimi Code、Copilot CLI、Grok Build、Devin CLI、Antigravity CLI、Hermes Agent、Pi。

三个关键特性（README 原文）：

- **语义解析**：解析命令到底干什么——包装一层、调换 flag 顺序都躲不掉
- **故障安全**：配置文件坏了回退安全默认，而不是让 agent 停摆
- **不是沙箱**：不隔离进程、不设文件系统权限、不看网络出口——它只是执行前的最后一道语义闸门

## 实测（鱼皮 11-06）

克隆「AI 闯关学习小程序」，故意让 DSH 删整个后端目录 + `git reset --hard` 回退 5 个提交：

- DeepSeek 本身先谨慎确认，选「按原样执行」后 `git reset --hard` **连续两次被拦**
- AI 换 `git restore` 绕路再试——**同样被拦**（「轨迹」页面看得一清二楚）
- 最终 AI 按提示改走 `git stash` 存改动再回退：结果一样，但被丢的改动躺在 stash 里，后悔药还在

**边界**：`rm -rf backend` 没有被拦。默认规则防的是删根目录、用户主目录这类要命操作，项目内普通目录不在保护范围。它是「挡住最致命几刀」的保险，不是万能兜底——重要的项目还是要勤提交。

## 对照与注意事项

- 本站《[沙箱与安全机制](dsh-sandbox-security.md)》讲的是 DSH 权限模式（内层），cc-safety-net 是外挂的语义层，两层不冲突
- 对 OpenClaw 用户同样可用（宿主列表在列），可作 exec 审批之外的双保险

## 出处

- https://github.com/kenryu42/cc-safety-net（README，2026-11-17 抓取）
- 程序员鱼皮 2026-11-06 实测，见《[Top 12 总表](dsh-top12-plugins.md)》
