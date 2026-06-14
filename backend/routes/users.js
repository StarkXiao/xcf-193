const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const { users, stories, worldSettings, favorites, notifications } = require('../data/mockData');

let usersData = [...users];
let storiesData = [...stories];
let worldsData = [...worldSettings];
let favoritesData = JSON.parse(JSON.stringify(favorites));
let notificationsData = [...notifications];

router.get('/:id', (req, res) => {
  const user = usersData.find(u => u.id === req.params.id);
  if (!user) {
    return res.status(404).json({ message: '用户不存在' });
  }
  
  const userStories = storiesData.filter(s => s.authorId === user.id);
  const userWorlds = worldsData.filter(w => w.authorId === user.id);
  const userFavorites = favoritesData[user.id] || { stories: [], worlds: [] };
  const unreadCount = notificationsData.filter(n => n.userId === user.id && !n.isRead).length;
  
  const totalLikes = userStories.reduce((sum, s) => sum + s.likes, 0) + 
                     userWorlds.reduce((sum, w) => sum + w.likes, 0);
  const totalViews = userStories.reduce((sum, s) => sum + s.views, 0);
  
  res.json({
    ...user,
    stats: {
      storyCount: userStories.length,
      worldCount: userWorlds.length,
      favoriteStoryCount: userFavorites.stories.length,
      favoriteWorldCount: userFavorites.worlds.length,
      totalLikes,
      totalViews,
      unreadCount
    }
  });
});

router.get('/:id/stories', (req, res) => {
  const { sort = 'newest', page = 1, limit = 10 } = req.query;
  let result = storiesData.filter(s => s.authorId === req.params.id);
  
  if (sort === 'newest') {
    result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  } else if (sort === 'popular') {
    result.sort((a, b) => b.likes - a.likes);
  }
  
  const start = (page - 1) * limit;
  const end = start + parseInt(limit);
  const paginatedResult = result.slice(start, end);
  
  res.json({
    total: result.length,
    page: parseInt(page),
    limit: parseInt(limit),
    stories: paginatedResult
  });
});

router.get('/:id/worlds', (req, res) => {
  const { sort = 'newest', page = 1, limit = 10 } = req.query;
  let result = worldsData.filter(w => w.authorId === req.params.id);
  
  if (sort === 'newest') {
    result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  } else if (sort === 'popular') {
    result.sort((a, b) => b.likes - a.likes);
  }
  
  const start = (page - 1) * limit;
  const end = start + parseInt(limit);
  const paginatedResult = result.slice(start, end);
  
  res.json({
    total: result.length,
    page: parseInt(page),
    limit: parseInt(limit),
    worlds: paginatedResult
  });
});

router.get('/:id/favorites', (req, res) => {
  const { type = 'all' } = req.query;
  const userFavorites = favoritesData[req.params.id] || { stories: [], worlds: [] };
  
  let favoriteStories = [];
  let favoriteWorlds = [];
  
  if (type === 'all' || type === 'stories') {
    favoriteStories = storiesData.filter(s => userFavorites.stories.includes(s.id));
  }
  if (type === 'all' || type === 'worlds') {
    favoriteWorlds = worldsData.filter(w => userFavorites.worlds.includes(w.id));
  }
  
  res.json({
    stories: favoriteStories,
    worlds: favoriteWorlds
  });
});

router.post('/:id/favorites', (req, res) => {
  const { targetId, targetType } = req.body;
  const userId = req.params.id;
  
  if (!favoritesData[userId]) {
    favoritesData[userId] = { stories: [], worlds: [] };
  }
  
  if (targetType === 'story') {
    if (!favoritesData[userId].stories.includes(targetId)) {
      favoritesData[userId].stories.push(targetId);
    }
  } else if (targetType === 'world') {
    if (!favoritesData[userId].worlds.includes(targetId)) {
      favoritesData[userId].worlds.push(targetId);
    }
  }
  
  res.json({ message: '收藏成功', favorites: favoritesData[userId] });
});

router.delete('/:id/favorites', (req, res) => {
  const { targetId, targetType } = req.body;
  const userId = req.params.id;
  
  if (!favoritesData[userId]) {
    favoritesData[userId] = { stories: [], worlds: [] };
  }
  
  if (targetType === 'story') {
    favoritesData[userId].stories = favoritesData[userId].stories.filter(id => id !== targetId);
  } else if (targetType === 'world') {
    favoritesData[userId].worlds = favoritesData[userId].worlds.filter(id => id !== targetId);
  }
  
  res.json({ message: '取消收藏成功', favorites: favoritesData[userId] });
});

router.get('/:id/favorites/check', (req, res) => {
  const { targetId, targetType } = req.query;
  const userId = req.params.id;
  const userFavorites = favoritesData[userId] || { stories: [], worlds: [] };
  
  let isFavorited = false;
  if (targetType === 'story') {
    isFavorited = userFavorites.stories.includes(targetId);
  } else if (targetType === 'world') {
    isFavorited = userFavorites.worlds.includes(targetId);
  }
  
  res.json({ isFavorited });
});

router.get('/:id/notifications', (req, res) => {
  const { type, isRead, page = 1, limit = 20 } = req.query;
  let result = notificationsData.filter(n => n.userId === req.params.id);
  
  if (type && type !== 'all') {
    result = result.filter(n => n.type === type);
  }
  
  if (isRead !== undefined) {
    result = result.filter(n => n.isRead === (isRead === 'true'));
  }
  
  result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  
  const start = (page - 1) * limit;
  const end = start + parseInt(limit);
  const paginatedResult = result.slice(start, end);
  
  const unreadCount = notificationsData.filter(n => n.userId === req.params.id && !n.isRead).length;
  
  res.json({
    total: result.length,
    page: parseInt(page),
    limit: parseInt(limit),
    unreadCount,
    notifications: paginatedResult
  });
});

router.post('/:id/notifications/read', (req, res) => {
  const { notificationId } = req.body;
  const userId = req.params.id;
  
  if (notificationId) {
    const notif = notificationsData.find(n => n.id === notificationId && n.userId === userId);
    if (notif) {
      notif.isRead = true;
    }
  } else {
    notificationsData.forEach(n => {
      if (n.userId === userId) {
        n.isRead = true;
      }
    });
  }
  
  const unreadCount = notificationsData.filter(n => n.userId === userId && !n.isRead).length;
  res.json({ message: '已标记为已读', unreadCount });
});

router.delete('/:id/notifications/:notificationId', (req, res) => {
  const { notificationId } = req.params;
  const userId = req.params.id;
  
  const index = notificationsData.findIndex(n => n.id === notificationId && n.userId === userId);
  if (index === -1) {
    return res.status(404).json({ message: '通知不存在' });
  }
  
  notificationsData.splice(index, 1);
  res.json({ message: '通知已删除' });
});

module.exports = router;
