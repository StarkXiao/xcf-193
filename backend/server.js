const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const storiesRouter = require('./routes/stories');
const commentsRouter = require('./routes/comments');
const worldsRouter = require('./routes/worlds');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: '浮城回声 API 服务运行正常',
    timestamp: new Date().toISOString()
  });
});

app.use('/api/stories', storiesRouter);
app.use('/api/comments', commentsRouter);
app.use('/api/worlds', worldsRouter);

app.use((req, res) => {
  res.status(404).json({ message: '接口不存在' });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: '服务器内部错误' });
});

app.listen(PORT, () => {
  console.log(`
  ╔══════════════════════════════════════╗
  ║                                      ║
  ║    浮城回声 - 后端服务已启动         ║
  ║                                      ║
  ║    服务地址: http://localhost:${PORT}     ║
  ║    API 前缀: /api                    ║
  ║                                      ║
  ╚══════════════════════════════════════╝
  `);
});
