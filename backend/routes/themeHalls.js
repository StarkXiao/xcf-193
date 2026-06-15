const express = require('express');
const router = express.Router();
const store = require('../data/store');
const { createNotification } = require('./notifications');

let themeHallsData = store.themeHalls;
let charactersData = store.themeHallCharacters;
let factionsData = store.themeHallFactions;
let timelineData = store.themeHallTimeline;
let storiesData = store.themeHallStories;

router.get('/', (req, res) => {
  const { sort, filter, page = 1, limit = 20 } = req.query;
  let result = [...themeHallsData];

  if (filter && filter !== 'all') {
    result = result.filter(h => h.genre === filter);
  }

  if (sort === 'newest') {
    result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  } else if (sort === 'popular') {
    result.sort((a, b) => b.likes - a.likes);
  } else if (sort === 'stories') {
    result.sort((a, b) => b.storyCount - a.storyCount);
  }

  const start = (page - 1) * limit;
  const end = start + parseInt(limit);
  const paginatedResult = result.slice(start, end);

  res.json({
    total: result.length,
    page: parseInt(page),
    limit: parseInt(limit),
    halls: paginatedResult
  });
});

router.get('/featured', (req, res) => {
  const sorted = [...themeHallsData].sort((a, b) => b.likes - a.likes);
  const featured = sorted.slice(0, 2);
  res.json({
    total: featured.length,
    halls: featured
  });
});

router.get('/:id', (req, res) => {
  const hall = themeHallsData.find(h => h.id === req.params.id);
  if (!hall) {
    return res.status(404).json({ message: '专题世界馆不存在' });
  }
  const characters = charactersData[req.params.id] || [];
  const factions = factionsData[req.params.id] || [];
  const timeline = timelineData[req.params.id] || [];
  const stories = storiesData[req.params.id] || [];
  res.json({
    ...hall,
    characters,
    factions,
    timeline,
    stories
  });
});

router.get('/:id/characters', (req, res) => {
  const hall = themeHallsData.find(h => h.id === req.params.id);
  if (!hall) {
    return res.status(404).json({ message: '专题世界馆不存在' });
  }
  const { role, page = 1, limit = 20 } = req.query;
  let result = charactersData[req.params.id] || [];
  if (role && role !== 'all') {
    result = result.filter(c => c.role === role);
  }
  const start = (page - 1) * limit;
  const end = start + parseInt(limit);
  res.json({
    total: result.length,
    characters: result.slice(start, end)
  });
});

router.get('/:id/factions', (req, res) => {
  const hall = themeHallsData.find(h => h.id === req.params.id);
  if (!hall) {
    return res.status(404).json({ message: '专题世界馆不存在' });
  }
  const factions = factionsData[req.params.id] || [];
  res.json({
    total: factions.length,
    factions
  });
});

router.get('/:id/timeline', (req, res) => {
  const hall = themeHallsData.find(h => h.id === req.params.id);
  if (!hall) {
    return res.status(404).json({ message: '专题世界馆不存在' });
  }
  const timeline = timelineData[req.params.id] || [];
  res.json({
    total: timeline.length,
    events: timeline
  });
});

router.get('/:id/stories', (req, res) => {
  const hall = themeHallsData.find(h => h.id === req.params.id);
  if (!hall) {
    return res.status(404).json({ message: '专题世界馆不存在' });
  }
  const { page = 1, limit = 20 } = req.query;
  let result = storiesData[req.params.id] || [];
  const start = (page - 1) * limit;
  const end = start + parseInt(limit);
  res.json({
    total: result.length,
    stories: result.slice(start, end)
  });
});

router.post('/:id/like', (req, res) => {
  const { id } = req.params;
  const { userId, username, avatar } = req.body;
  
  const hall = themeHallsData.find(h => h.id === id);
  if (!hall) {
    return res.status(404).json({ message: '专题世界馆不存在' });
  }
  hall.likes += 1;
  
  if (hall.authorId && userId && hall.authorId !== userId) {
    createNotification({
      userId: hall.authorId,
      type: 'like',
      content: `${username || '有人'} 心动了你的专题馆《${hall.name}》`,
      relatedId: id,
      relatedType: 'themeHall',
      relatedTitle: hall.name,
      extra: {
        inviterId: userId,
        inviterName: username,
        inviterAvatar: avatar || '👤'
      }
    });
  }
  
  res.json({ likes: hall.likes });
});

module.exports = router;
