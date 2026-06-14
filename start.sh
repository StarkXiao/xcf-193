#!/bin/bash

echo "
╔══════════════════════════════════════════════════════════════╗
║                                                              ║
║    浮城回声 - 幻想恋爱叙事社区 项目启动脚本                  ║
║                                                              ║
║    本脚本会自动检测并安装依赖，然后启动前后端服务            ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝
"

BASE_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

# 配置 npm 镜像源（可选，加速国内下载）
USE_MIRROR=true
if [ "$USE_MIRROR" = true ]; then
  echo "� 配置 npm 镜像源..."
  npm config set registry https://registry.npmmirror.com
  echo "   ✓ 已设置为 npmmirror 镜像"
fi

echo ""
echo "�📦 检查 Node.js 环境..."
NODE_VERSION=$(node --version)
NPM_VERSION=$(npm --version)
echo "   Node.js 版本: $NODE_VERSION"
echo "   npm 版本: $NPM_VERSION"

echo ""
echo "══════════════════════════════════════════════════════════════"
echo "📦 后端依赖安装 (backend)"
echo "══════════════════════════════════════════════════════════════"

cd "$BASE_DIR/backend"

if [ ! -d "node_modules" ]; then
  echo "   正在安装后端依赖，请稍候..."
  echo "   (如果安装较慢，请耐心等待或检查网络连接)"
  npm install --no-audit --no-fund --loglevel=error
  
  if [ $? -eq 0 ]; then
    echo "   ✓ 后端依赖安装成功"
  else
    echo "   ✗ 后端依赖安装失败，请检查网络后重试"
    echo "   手动安装命令: cd backend && npm install"
    exit 1
  fi
else
  echo "   ✓ 后端依赖已存在，跳过安装"
fi

echo ""
echo "══════════════════════════════════════════════════════════════"
echo "📦 前端依赖安装 (frontend)"
echo "══════════════════════════════════════════════════════════════"

cd "$BASE_DIR/frontend"

if [ ! -d "node_modules" ]; then
  echo "   正在安装前端依赖，请稍候..."
  echo "   (前端依赖较多，可能需要 3-5 分钟)"
  npm install --no-audit --no-fund --loglevel=error
  
  if [ $? -eq 0 ]; then
    echo "   ✓ 前端依赖安装成功"
  else
    echo "   ✗ 前端依赖安装失败，请检查网络后重试"
    echo "   手动安装命令: cd frontend && npm install"
    exit 1
  fi
else
  echo "   ✓ 前端依赖已存在，跳过安装"
fi

echo ""
echo "══════════════════════════════════════════════════════════════"
echo "🚀 启动服务"
echo "══════════════════════════════════════════════════════════════"

# 启动后端服务
echo ""
echo "🚀 启动后端服务 (端口 3000)..."
cd "$BASE_DIR/backend"
node server.js &
BACKEND_PID=$!

# 等待后端启动
sleep 3

# 检查后端是否启动成功
if kill -0 $BACKEND_PID 2>/dev/null; then
  echo "   ✓ 后端服务启动成功 (PID: $BACKEND_PID)"
else
  echo "   ✗ 后端服务启动失败"
  exit 1
fi

# 启动前端服务
echo ""
echo "🚀 启动前端服务 (端口 5173)..."
cd "$BASE_DIR/frontend"
npm run dev -- --host 0.0.0.0 > /tmp/fucheng-frontend.log 2>&1 &
FRONTEND_PID=$!

# 等待前端启动
sleep 5

# 检查前端是否启动成功
if kill -0 $FRONTEND_PID 2>/dev/null; then
  echo "   ✓ 前端服务启动成功 (PID: $FRONTEND_PID)"
else
  echo "   ✗ 前端服务启动失败，查看日志:"
  cat /tmp/fucheng-frontend.log
  kill $BACKEND_PID 2>/dev/null
  exit 1
fi

echo ""
echo "
╔══════════════════════════════════════════════════════════════╗
║                                                              ║
║    🎉 浮城回声 启动成功！                                    ║
║                                                              ║
║    🌐 前端地址:  http://localhost:5173                       ║
║    🔧 后端地址:  http://localhost:3000                       ║
║    📡 健康检查:  http://localhost:3000/api/health            ║
║                                                              ║
║    功能模块:                                                 ║
║    ✅ 故事创作 (Story Editor)                                ║
║    ✅ 分支阅读 (Story Reader)                                ║
║    ✅ 评论互动 (Comment System)                              ║
║    ✅ 世界设定库 (World Library)                             ║
║                                                              ║
║    按 Ctrl+C 停止所有服务                                    ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝
"

# 捕获退出信号
cleanup() {
  echo ""
  echo "🛑 正在停止服务..."
  kill $BACKEND_PID 2>/dev/null
  kill $FRONTEND_PID 2>/dev/null
  wait $BACKEND_PID 2>/dev/null
  wait $FRONTEND_PID 2>/dev/null
  echo "✓ 所有服务已停止"
  exit 0
}

trap cleanup INT TERM

# 保持脚本运行
echo "📋 服务运行中... 按 Ctrl+C 停止"
echo ""

# 简单的健康检查循环
while true; do
  sleep 60
  if ! kill -0 $BACKEND_PID 2>/dev/null; then
    echo "⚠️  后端服务异常退出！"
    cleanup
  fi
  if ! kill -0 $FRONTEND_PID 2>/dev/null; then
    echo "⚠️  前端服务异常退出！"
    cleanup
  fi
done
