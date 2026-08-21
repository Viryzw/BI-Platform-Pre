#!/bin/zsh
set -e

SCRIPT_DIR="${0:A:h}"
cd "$SCRIPT_DIR"

if ! command -v node >/dev/null 2>&1; then
  echo "未检测到 Node.js。请先执行：brew install node"
  read -r "?按回车键退出..."
  exit 1
fi

echo "正在启动 Atlas BI 前端..."
echo "浏览器访问：http://127.0.0.1:5173"
exec node server.mjs
