const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const storiesRouter = require('./routes/stories');
const commentsRouter = require('./routes/comments');
const worldsRouter = require('./routes/worlds');
const usersRouter = require('./routes/users');
const collaborationRouter = require('./routes/collaboration');
const activitiesRouter = require('./routes/activities');
const { router: notificationsRouter } = require('./routes/notifications');
const searchRouter = require('./routes/search');
const analyticsRouter = require('./routes/analytics');
const auditRouter = require('./routes/audit');
const themeHallsRouter = require('./routes/themeHalls');

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
app.use('/api/users', usersRouter);
app.use('/api/collaboration', collaborationRouter);
app.use('/api/activities', activitiesRouter);
app.use('/api/notifications', notificationsRouter);
app.use('/api/search', searchRouter);
app.use('/api/analytics', analyticsRouter);
app.use('/api/audit', auditRouter);
app.use('/api/theme-halls', themeHallsRouter);

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
