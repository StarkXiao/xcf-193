const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const store = require('../data/store');

let storiesData = store.stories;
let storyNodesData = store.storyNodes;

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
  const { title, content, choices = [], isEnding = false, endingType } = req.body;
  
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
  if (story && !story.startNodeId) {
    story.startNodeId = newNode.id;
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
  const story = storiesData.find(s => s.id === req.params.id);
  if (!story) {
    return res.status(404).json({ message: '故事不存在' });
  }
  story.likes += 1;
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

module.exports = router;
