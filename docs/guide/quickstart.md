# 快速开始

10 分钟跑起 dsh web。

## 前置要求

- **Node 22.19+ 或 24+**（低于此版本启动异常）
- npm / pnpm 可用

检查版本：

```bash
node -v
# v24.x.x ✓  v22.17.x ✗（不够线）
```

## 安装

```bash
npm install -g @deepseek-ai/dsh
```

## 启动 web 模式

```bash
dsh web
# dsh web: http://127.0.0.1:3080
```

打开 `http://127.0.0.1:3080`，选择工作区，新会话即可对话。

### Node 版本不够时的启动方式

用绝对路径显式指定高版本 node：

```bash
/home/east/.nvm/versions/node/v24.18.1/bin/node \
  /home/east/.nvm/versions/node/v24.18.1/bin/dsh web
```

### 常驻运行（tmux）

```bash
tmux new-session -d -s dsh 'dsh web > ~/dsh-web.log 2>&1'
tmux attach -t dsh        # 进入查看
tail -f ~/dsh-web.log     # 或看日志
```

## 带插件启动

写好插件后（见 [Day 3 实战](../topics/dsh-day3-hands-on.md)），通过 `--patch` 挂载：

```bash
dsh web --patch /path/to/cordis.yml
```

## 下一步

- [DeepSeek Harness 调研](../topics/deepseek-harness.md) — 了解全貌
- [Day 2 插件机制](../topics/dsh-day2-plugins.md) — 写插件前必读
- [Day 3 实战](../topics/dsh-day3-hands-on.md) — 从零写一个插件
