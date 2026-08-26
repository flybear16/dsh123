#!/usr/bin/env bash
# dsh Web UI 启动器（Node 22 + 火山方舟 ark 端点）
# key 在 ~/.config/dsh/ark.env（不进 repo）
set -e
export NVM_DIR="$HOME/.nvm"; . "$NVM_DIR/nvm.sh"
nvm use 22.22.3 >/dev/null 2>&1
source ~/.config/dsh/ark.env
export DEEPSEEK_API_KEY DEEPSEEK_BASE_URL
exec npx -y @deepseek-ai/dsh web
