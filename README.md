# 浮城回声 - 幻想恋爱叙事社区

一个基于 Vue 3 + Naive UI + Node.js + Express 的幻想恋爱叙事社区平台，用户可以发布分支故事、选择不同结局，并与他人共创世界观。

## 项目特色

- 🏰 **分支故事系统** - 支持多结局的交互式叙事体验
- ✏️ **故事编辑器** - 可视化创建章节节点和分支选项
- 💬 **评论互动** - 在故事的每个节点留下你的想法
- 🌍 **世界设定库** - 共创世界观，丰富故事背景
- 🎨 **精美界面** - 紫色梦幻风格的 UI 设计

## 技术栈

### 前端
- Vue 3 (Composition API)
- Naive UI 组件库
- Vue Router 4
- Axios
- Vite

### 后端
- Node.js
- Express
- CORS
- UUID
- 内存数据存储 (Mock Data)

## 项目结构

```
xcf-193/
├── frontend/                 # 前端项目
│   ├── src/
│   │   ├── api/              # API 接口封装
│   │   ├── components/       # 公共组件
│   │   ├── views/            # 页面视图
│   │   ├── App.vue           # 根组件
│   │   └── main.js           # 入口文件
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
├── backend/                  # 后端项目
│   ├── data/                 # 数据模型
│   ├── routes/               # API 路由
│   ├── server.js             # 服务器入口
│   └── package.json
└── README.md
```

## 功能模块

### 1. 故事编辑器 (Story Editor)
- 创建/编辑故事基本信息
- 章节节点管理
- 分支选项配置
- 结局类型设置（完美/普通/遗憾）
- 实时预览

### 2. 分支阅读器 (Story Reader)
- 沉浸式阅读体验
- 多分支选择
- 阅读历史回溯
- 结局达成展示
- 节点评论

### 3. 评论互动 (Comment)
- 故事/节点评论
- 评论点赞
- 回复功能

### 4. 世界设定库 (World Library)
- 世界观浏览
- 分类条目管理
- 设定详情查看
- 世界观编辑器

## 快速开始

### 前置要求
- Node.js >= 14.0.0
- npm 或 yarn

### 安装与运行

#### 1. 启动后端服务

```bash
cd backend
npm install
npm start
```

后端服务将在 http://localhost:3000 启动

#### 2. 启动前端服务

```bash
cd frontend
npm install
npm run dev
```

前端服务将在 http://localhost:5173 启动

### 访问应用

打开浏览器访问 http://localhost:5173 即可使用

## API 接口

### 故事相关
- `GET /api/stories` - 获取故事列表
- `GET /api/stories/:id` - 获取故事详情
- `POST /api/stories` - 创建故事
- `GET /api/stories/:id/nodes` - 获取故事节点
- `POST /api/stories/:id/nodes` - 创建节点
- `PUT /api/stories/:id/nodes/:nodeId` - 更新节点
- `DELETE /api/stories/:id/nodes/:nodeId` - 删除节点
- `POST /api/stories/:id/like` - 点赞故事
- `POST /api/stories/:id/view` - 增加阅读量

### 评论相关
- `GET /api/comments/story/:storyId` - 获取评论
- `POST /api/comments/story/:storyId` - 发表评论
- `POST /api/comments/:commentId/like` - 点赞评论

### 世界设定相关
- `GET /api/worlds` - 获取世界列表
- `GET /api/worlds/:id` - 获取世界详情
- `POST /api/worlds` - 创建世界
- `POST /api/worlds/:id/entries` - 添加条目
- `PUT /api/worlds/:id/entries/:entryId` - 更新条目
- `DELETE /api/worlds/:id/entries/:entryId` - 删除条目
- `POST /api/worlds/:id/like` - 点赞世界

## 内置示例数据

项目内置了三个完整的示例故事：

1. **浮城之恋** - 云端之城的浪漫邂逅（奇幻/恋爱/冒险）
2. **星海彼端的约定** - 星际时代的百合故事（科幻/百合/治愈）
3. **妖狐与书生** - 古风人妖恋（古风/奇幻/恋爱）

每个故事都有多个分支和结局，欢迎体验！

## 开发说明

- 后端使用内存存储数据，重启服务后数据会重置
- 前端配置了代理，`/api` 请求会转发到后端 3000 端口
- 所有用户数据均为模拟数据，无需登录

## 后续可扩展功能

- [ ] 用户系统（注册/登录/个人中心）
- [ ] 故事收藏/历史记录
- [ ] 富文本编辑器
- [ ] 多人协作创作
- [ ] 数据库持久化
- [ ] 搜索功能
- [ ] 故事排行榜

## License

MIT
