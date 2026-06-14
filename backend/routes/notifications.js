const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const store = require('../data/store');

let notificationsData = store.notifications;

const NOTIFICATION_TYPES = [
  'like',
  'comment',
  'comment_reply',
  'favorite',
  'reference',
  'story_update',
  'collaboration',
  'invitation',
  'activity',
  'system'
];

const createNotification = (data) => {
  const now = new Date().toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  }).replace(/\//g, '-');

  const notification = {
    id: `notif-${uuidv4()}`,
    userId: data.userId,
    type: data.type,
    content: data.content,
    relatedId: data.relatedId || null,
    relatedType: data.relatedType || null,
    relatedTitle: data.relatedTitle || null,
    isRead: false,
    createdAt: now,
    ...data.extra || {}
  };

  notificationsData.unshift(notification);
  return notification;
};

router.get('/user/:userId', (req, res) => {
  const { userId } = req.params;
  const {
    type,
    isRead,
    page = 1,
    limit = 20,
    sort = 'newest'
  } = req.query;

  let result = notificationsData.filter(n => n.userId === userId);

  if (type && type !== 'all') {
    const types = type.split(',');
    result = result.filter(n => types.includes(n.type));
  }

  if (isRead !== undefined && isRead !== 'all') {
    result = result.filter(n => n.isRead === (isRead === 'true'));
  }

  if (sort === 'newest') {
    result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  } else if (sort === 'oldest') {
    result.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
  }

  const unreadCount = notificationsData.filter(n => n.userId === userId && !n.isRead).length;
  const typeStats = {};
  NOTIFICATION_TYPES.forEach(t => {
    typeStats[t] = notificationsData.filter(n => n.userId === userId && n.type === t && !n.isRead).length;
  });

  const start = (page - 1) * limit;
  const end = start + parseInt(limit);
  const paginatedResult = result.slice(start, end);

  res.json({
    total: result.length,
    page: parseInt(page),
    limit: parseInt(limit),
    unreadCount,
    typeStats,
    notifications: paginatedResult
  });
});

router.get('/user/:userId/unread-count', (req, res) => {
  const { userId } = req.params;
  const unreadCount = notificationsData.filter(n => n.userId === userId && !n.isRead).length;

  const typeStats = {};
  NOTIFICATION_TYPES.forEach(t => {
    typeStats[t] = notificationsData.filter(n => n.userId === userId && n.type === t && !n.isRead).length;
  });

  res.json({
    unreadCount,
    typeStats
  });
});

router.post('/', (req, res) => {
  const {
    userId,
    type,
    content,
    relatedId,
    relatedType,
    relatedTitle,
    extra
  } = req.body;

  if (!userId || !type || !content) {
    return res.status(400).json({ message: '缺少必要参数' });
  }

  if (!NOTIFICATION_TYPES.includes(type)) {
    return res.status(400).json({ message: '无效的通知类型' });
  }

  const notification = createNotification({
    userId,
    type,
    content,
    relatedId,
    relatedType,
    relatedTitle,
    extra
  });

  res.status(201).json(notification);
});

router.post('/batch', (req, res) => {
  const { notifications } = req.body;

  if (!Array.isArray(notifications)) {
    return res.status(400).json({ message: '参数必须是数组' });
  }

  const created = [];
  const errors = [];

  notifications.forEach((data, index) => {
    if (!data.userId || !data.type || !data.content) {
      errors.push({ index, message: '缺少必要参数' });
      return;
    }
    if (!NOTIFICATION_TYPES.includes(data.type)) {
      errors.push({ index, message: '无效的通知类型' });
      return;
    }
    created.push(createNotification(data));
  });

  res.json({
    created: created.length,
    errors: errors.length,
    errorDetails: errors,
    notifications: created
  });
});

router.post('/:notificationId/read', (req, res) => {
  const { notificationId } = req.params;
  const { userId } = req.body;

  const notif = notificationsData.find(n => n.id === notificationId);
  if (!notif) {
    return res.status(404).json({ message: '通知不存在' });
  }

  if (userId && notif.userId !== userId) {
    return res.status(403).json({ message: '无权限操作此通知' });
  }

  notif.isRead = true;

  const unreadCount = userId
    ? notificationsData.filter(n => n.userId === userId && !n.isRead).length
    : 0;

  res.json({ message: '已标记为已读', unreadCount });
});

router.post('/user/:userId/read-all', (req, res) => {
  const { userId } = req.params;
  const { type } = req.body;

  let updated = 0;
  notificationsData.forEach(n => {
    if (n.userId === userId && !n.isRead) {
      if (!type || n.type === type) {
        n.isRead = true;
        updated++;
      }
    }
  });

  const unreadCount = notificationsData.filter(n => n.userId === userId && !n.isRead).length;

  res.json({
    message: `已标记 ${updated} 条通知为已读`,
    updated,
    unreadCount
  });
});

router.delete('/:notificationId', (req, res) => {
  const { notificationId } = req.params;
  const { userId } = req.body;

  const index = notificationsData.findIndex(n => n.id === notificationId);
  if (index === -1) {
    return res.status(404).json({ message: '通知不存在' });
  }

  if (userId && notificationsData[index].userId !== userId) {
    return res.status(403).json({ message: '无权限操作此通知' });
  }

  notificationsData.splice(index, 1);
  res.json({ message: '通知已删除' });
});

router.delete('/user/:userId/clear', (req, res) => {
  const { userId } = req.params;
  const { isRead, type } = req.body;

  const initialLength = notificationsData.length;

  notificationsData = notificationsData.filter(n => {
    if (n.userId !== userId) return true;
    if (isRead !== undefined && n.isRead !== (isRead === 'true')) return true;
    if (type && n.type !== type) return true;
    return false;
  });

  const deleted = initialLength - notificationsData.length;
  store.notifications = notificationsData;

  res.json({
    message: `已删除 ${deleted} 条通知`,
    deleted
  });
});

router.get('/types', (req, res) => {
  const typeConfig = {
    like: { label: '点赞', icon: '❤️', color: 'error' },
    comment: { label: '评论', icon: '💬', color: 'primary' },
    comment_reply: { label: '回复', icon: '↩️', color: 'info' },
    favorite: { label: '收藏', icon: '⭐', color: 'warning' },
    reference: { label: '引用', icon: '🔗', color: 'success' },
    story_update: { label: '作品动态', icon: '📖', color: 'primary' },
    collaboration: { label: '协作', icon: '🤝', color: 'info' },
    invitation: { label: '邀请', icon: '✉️', color: 'warning' },
    activity: { label: '活动', icon: '🎯', color: 'success' },
    system: { label: '系统', icon: '🔔', color: 'default' }
  };

  res.json({
    types: NOTIFICATION_TYPES,
    config: typeConfig
  });
});

module.exports = { router, createNotification };
