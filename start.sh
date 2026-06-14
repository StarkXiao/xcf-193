#!/bin/bash

echo "
╔══════════════════════════════════════╗
║                                      ║
║    浮城回声 - 项目启动脚本           ║
║                                      ║
╚══════════════════════════════════════╝
"

BASE_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

echo "📦 检查后端依赖..."
if [ ! -d "$BASE_DIR/backend/node_modules" ]; then
  echo "   正在安装后端依赖..."
  cd "$BASE_DIR/backend" && npm install
  echo "   ✓ 后端依赖安装完成"
else
  echo "   ✓ 后端依赖已存在"
fi

echo ""
echo "📦 检查前端依赖..."
if [ ! -d "$BASE_DIR/frontend/node_modules" ]; then
  echo "   正在安装前端依赖..."
  cd "$BASE_DIR/frontend" && npm install
  echo "   ✓ 前端依赖安装完成"
else
  echo "   ✓ 前端依赖已存在"
fi

echo ""
echo "🚀 启动后端服务..."
cd "$BASE_DIR/backend" && node server.js &
BACKEND_PID=$!

sleep 2

echo ""
echo "🚀 启动前端服务..."
cd "$BASE_DIR/frontend" && npm run dev &
FRONTEND_PID=$!

echo ""
echo "
╔══════════════════════════════════════╗
║                                      ║
║    浮城回声 - 启动成功！             ║
║                                      ║
║    前端地址: http://localhost:5173   ║
║    后端地址: http://localhost:3000   ║
║                                      ║
║    按 Ctrl+C 停止所有服务            ║
║                                      ║
╚══════════════════════════════════════╝
"

trap "echo ''; echo '🛑 正在停止服务...'; kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; echo '✓ 服务已停止'; exit" INT

wait
