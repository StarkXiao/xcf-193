const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const store = require('../data/store');
const { createNotification } = require('./notifications');

let storiesData = store.stories;
let storyNodesData = store.storyNodes;
let favoritesData = store.favorites;
let worldSettingsData = store.worldSettings;

router.get('/', (req, res) => {
  const { tag, sort, page = 1, limit = 10 } = req.query;
  let result = [...storiesData];

  if (tag) {
    result = result.filter(story => story.tags.includes(tag));
  }

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

router.get('/:id', (req, res) => {
  const story = storiesData.find(s => s.id === req.params.id);
  if (!story) {
    return res.status(404).json({ message: '故事不存在' });
  }
  res.json(story);
});

router.get('/:id/nodes', (req, res) => {
  const nodes = storyNodesData[req.params.id];
  if (!nodes) {
    return res.status(404).json({ message: '故事节点不存在' });
  }
  res.json(nodes);
});

router.get('/:id/nodes/:nodeId', (req, res) => {
  const nodes = storyNodesData[req.params.id];
  if (!nodes) {
    return res.status(404).json({ message: '故事不存在' });
  }
  const node = nodes.find(n => n.id === req.params.nodeId);
  if (!node) {
    return res.status(404).json({ message: '节点不存在' });
  }
  res.json(node);
});

router.put('/:id', (req, res) => {
  const story = storiesData.find(s => s.id === req.params.id);
  if (!story) {
    return res.status(404).json({ message: '故事不存在' });
  }

  const { title, summary, cover, tags } = req.body;

  if (title !== undefined) story.title = title;
  if (summary !== undefined) story.summary = summary;
  if (cover !== undefined) story.cover = cover;
  if (tags !== undefined) story.tags = tags;
  story.updatedAt = new Date().toISOString().split('T')[0];

  res.json(story);
});

router.post('/', (req, res) => {
  const { title, summary, cover, authorId, authorName, tags } = req.body;
  const newStory = {
    id: `story-${uuidv4()}`,
    title,
    summary,
    cover: cover || '📖',
    authorId,
    authorName,
    tags: tags || [],
    likes: 0,
    views: 0,
    createdAt: new Date().toISOString().split('T')[0],
    updatedAt: new Date().toISOString().split('T')[0],
    status: 'ongoing',
    startNodeId: null
  };
  storiesData.unshift(newStory);
  storyNodesData[newStory.id] = [];
  res.status(201).json(newStory);
});

router.post('/:id/nodes', (req, res) => {
  const storyId = req.params.id;
  const { title, content, choices = [], isEnding = false, endingType, updateNotify = true } = req.body;
  
  if (!storyNodesData[storyId]) {
    storyNodesData[storyId] = [];
  }

  const newNode = {
    id: `node-${uuidv4()}`,
    storyId,
    title,
    content,
    choices: choices.map(c => ({
      id: `choice-${uuidv4()}`,
      text: c.text,
      nextNodeId: c.nextNodeId || null
    })),
    isEnding,
    endingType
  };

  storyNodesData[storyId].push(newNode);

  const story = storiesData.find(s => s.id === storyId);
  if (story) {
    if (!story.startNodeId) {
      story.startNodeId = newNode.id;
    }
    story.updatedAt = new Date().toISOString().split('T')[0];
    
    if (updateNotify && story.authorId) {
      const userFavorites = Object.keys(favoritesData).filter(userId => 
        favoritesData[userId]?.stories?.includes(storyId)
      );
      
      const updateType = isEnding ? 'new_ending' : 'new_chapter';
      const updateTypeLabel = isEnding ? '新结局' : '新章节';
      
      userFavorites.forEach(userId => {
        if (userId !== story.authorId) {
          createNotification({
            userId,
            type: 'story_update',
            content: `你收藏的作品《${story.title}》发布了${updateTypeLabel}`,
            relatedId: storyId,
            relatedType: 'story',
            relatedTitle: story.title,
            extra: {
              updateType,
              chapterTitle: title,
              authorId: story.authorId,
              authorName: story.authorName,
              authorAvatar: '👤'
            }
          });
        }
      });
    }
  }

  res.status(201).json(newNode);
});

router.put('/:id/nodes/:nodeId', (req, res) => {
  const storyId = req.params.id;
  const nodeId = req.params.nodeId;
  const nodes = storyNodesData[storyId];
  
  if (!nodes) {
    return res.status(404).json({ message: '故事不存在' });
  }

  const nodeIndex = nodes.findIndex(n => n.id === nodeId);
  if (nodeIndex === -1) {
    return res.status(404).json({ message: '节点不存在' });
  }

  const { title, content, choices, isEnding, endingType } = req.body;
  
  if (title !== undefined) nodes[nodeIndex].title = title;
  if (content !== undefined) nodes[nodeIndex].content = content;
  if (isEnding !== undefined) nodes[nodeIndex].isEnding = isEnding;
  if (endingType !== undefined) nodes[nodeIndex].endingType = endingType;
  if (choices !== undefined) {
    nodes[nodeIndex].choices = choices.map(c => ({
      id: c.id || `choice-${uuidv4()}`,
      text: c.text,
      nextNodeId: c.nextNodeId || null
    }));
  }

  const story = storiesData.find(s => s.id === storyId);
  if (story) {
    story.updatedAt = new Date().toISOString().split('T')[0];
  }

  res.json(nodes[nodeIndex]);
});

router.delete('/:id/nodes/:nodeId', (req, res) => {
  const storyId = req.params.id;
  const nodeId = req.params.nodeId;
  const nodes = storyNodesData[storyId];
  
  if (!nodes) {
    return res.status(404).json({ message: '故事不存在' });
  }

  const nodeIndex = nodes.findIndex(n => n.id === nodeId);
  if (nodeIndex === -1) {
    return res.status(404).json({ message: '节点不存在' });
  }

  nodes.splice(nodeIndex, 1);
  res.json({ message: '节点已删除' });
});

router.post('/:id/like', (req, res) => {
  const { id } = req.params;
  const { userId, username, avatar } = req.body;
  
  const story = storiesData.find(s => s.id === id);
  if (!story) {
    return res.status(404).json({ message: '故事不存在' });
  }
  story.likes += 1;
  
  if (story.authorId && userId && story.authorId !== userId) {
    createNotification({
      userId: story.authorId,
      type: 'like',
      content: `${username || '有人'} 点赞了你的故事《${story.title}》`,
      relatedId: id,
      relatedType: 'story',
      relatedTitle: story.title,
      extra: {
        inviterId: userId,
        inviterName: username,
        inviterAvatar: avatar || '👤'
      }
    });
  }
  
  res.json({ likes: story.likes });
});

router.post('/:id/view', (req, res) => {
  const story = storiesData.find(s => s.id === req.params.id);
  if (!story) {
    return res.status(404).json({ message: '故事不存在' });
  }
  story.views += 1;
  res.json({ views: story.views });
});

router.get('/:id/nodes/:nodeId/references', (req, res) => {
  const { id, nodeId } = req.params;
  
  const nodes = storyNodesData[id];
  if (!nodes) {
    return res.status(404).json({ message: '故事不存在' });
  }
  
  const node = nodes.find(n => n.id === nodeId);
  if (!node) {
    return res.status(404).json({ message: '节点不存在' });
  }
  
  res.json({
    nodeId,
    nodeTitle: node.title,
    references: node.referencedEntries || []
  });
});

router.post('/:id/nodes/:nodeId/references', (req, res) => {
  const { id, nodeId } = req.params;
  const { worldId, worldName, entryId, entryTitle, entryCategory } = req.body;
  
  const nodes = storyNodesData[id];
  if (!nodes) {
    return res.status(404).json({ message: '故事不存在' });
  }
  
  const node = nodes.find(n => n.id === nodeId);
  if (!node) {
    return res.status(404).json({ message: '节点不存在' });
  }
  
  if (!node.referencedEntries) {
    node.referencedEntries = [];
  }
  
  const exists = node.referencedEntries.some(e => e.entryId === entryId);
  if (!exists) {
    node.referencedEntries.push({ worldId, worldName, entryId, entryTitle, entryCategory });
  }
  
  const world = worldSettingsData.find(w => w.id === worldId);
  if (world) {
    const entry = world.entries.find(e => e.id === entryId);
    if (entry) {
      if (!entry.referencedStories) {
        entry.referencedStories = [];
      }
      const story = storiesData.find(s => s.id === id);
      const refExists = entry.referencedStories.some(
        r => r.storyId === id && r.nodeId === nodeId
      );
      if (!refExists) {
        entry.referencedStories.push({
          storyId: id,
          storyTitle: story?.title || '',
          nodeId,
          nodeTitle: node.title
        });
      }
    }
  }
  
  res.json({ message: '关联已添加', referencedEntries: node.referencedEntries });
});

router.delete('/:id/nodes/:nodeId/references', (req, res) => {
  const { id, nodeId } = req.params;
  const { worldId, entryId } = req.body;
  
  const nodes = storyNodesData[id];
  if (!nodes) {
    return res.status(404).json({ message: '故事不存在' });
  }
  
  const node = nodes.find(n => n.id === nodeId);
  if (!node) {
    return res.status(404).json({ message: '节点不存在' });
  }
  
  if (node.referencedEntries) {
    node.referencedEntries = node.referencedEntries.filter(e => e.entryId !== entryId);
  }
  
  const world = worldSettingsData.find(w => w.id === worldId);
  if (world) {
    const entry = world.entries.find(e => e.id === entryId);
    if (entry && entry.referencedStories) {
      entry.referencedStories = entry.referencedStories.filter(
        r => !(r.storyId === id && r.nodeId === nodeId)
      );
    }
  }
  
  res.json({ message: '关联已删除', referencedEntries: node.referencedEntries || [] });
});

router.get('/:id/references', (req, res) => {
  const { id } = req.params;
  
  const nodes = storyNodesData[id];
  if (!nodes) {
    return res.status(404).json({ message: '故事不存在' });
  }
  
  const allReferences = [];
  const seenEntries = new Set();
  
  nodes.forEach(node => {
    if (node.referencedEntries) {
      node.referencedEntries.forEach(ref => {
        if (!seenEntries.has(ref.entryId)) {
          seenEntries.add(ref.entryId);
          allReferences.push(ref);
        }
      });
    }
  });
  
  res.json({
    storyId: id,
    totalReferences: allReferences.length,
    references: allReferences
  });
});

module.exports = router;
