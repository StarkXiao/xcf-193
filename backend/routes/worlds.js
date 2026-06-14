const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const store = require('../data/store');

const worldSettingsData = store.worldSettings;

router.get('/', (req, res) => {
  const { sort, page = 1, limit = 10 } = req.query;
  let result = [...worldSettingsData];

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

router.get('/:id', (req, res) => {
  const world = worldSettingsData.find(w => w.id === req.params.id);
  if (!world) {
    return res.status(404).json({ message: '世界设定不存在' });
  }
  res.json(world);
});

router.post('/', (req, res) => {
  const { name, description, cover, authorId, authorName } = req.body;
  const newWorld = {
    id: `world-${uuidv4()}`,
    name,
    description,
    cover: cover || '🌍',
    authorId,
    authorName,
    likes: 0,
    entries: [],
    createdAt: new Date().toISOString().split('T')[0]
  };
  worldSettingsData.unshift(newWorld);
  res.status(201).json(newWorld);
});

router.post('/:id/entries', (req, res) => {
  const worldId = req.params.id;
  const world = worldSettingsData.find(w => w.id === worldId);
  
  if (!world) {
    return res.status(404).json({ message: '世界设定不存在' });
  }

  const { title, category, content } = req.body;
  const newEntry = {
    id: `entry-${uuidv4()}`,
    title,
    category: category || '其他',
    content
  };

  world.entries.push(newEntry);
  res.status(201).json(newEntry);
});

router.put('/:id/entries/:entryId', (req, res) => {
  const world = worldSettingsData.find(w => w.id === req.params.id);
  
  if (!world) {
    return res.status(404).json({ message: '世界设定不存在' });
  }

  const entry = world.entries.find(e => e.id === req.params.entryId);
  if (!entry) {
    return res.status(404).json({ message: '条目不存在' });
  }

  const { title, category, content } = req.body;
  if (title !== undefined) entry.title = title;
  if (category !== undefined) entry.category = category;
  if (content !== undefined) entry.content = content;

  res.json(entry);
});

router.delete('/:id/entries/:entryId', (req, res) => {
  const world = worldSettingsData.find(w => w.id === req.params.id);
  
  if (!world) {
    return res.status(404).json({ message: '世界设定不存在' });
  }

  const entryIndex = world.entries.findIndex(e => e.id === req.params.entryId);
  if (entryIndex === -1) {
    return res.status(404).json({ message: '条目不存在' });
  }

  world.entries.splice(entryIndex, 1);
  res.json({ message: '条目已删除' });
});

router.post('/:id/like', (req, res) => {
  const world = worldSettingsData.find(w => w.id === req.params.id);
  if (!world) {
    return res.status(404).json({ message: '世界设定不存在' });
  }
  world.likes += 1;
  res.json({ likes: world.likes });
});

module.exports = router;
