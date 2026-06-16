const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const store = require('../data/store');
const { createNotification } = require('./notifications');

let storiesData = store.stories;
let storyNodesData = store.storyNodes;
let favoritesData = store.favorites;
let worldSettingsData = store.worldSettings;
let featuredTopicsData = store.featuredTopics;

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

router.get('/:id', (req, res, next) => {
  const { id } = req.params;
  if (id === 'recommend' || id === 'featured-topics' || id === 'drafts') {
    return next();
  }
  const story = storiesData.find(s => s.id === id);
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

router.get('/drafts/user/:userId', (req, res) => {
  const { userId } = req.params;
  const drafts = store.storyDrafts.filter(d => d.userId === userId);
  drafts.sort((a, b) => new Date(b.lastSavedAt) - new Date(a.lastSavedAt));
  res.json({ drafts });
});

router.get('/drafts/:draftId', (req, res) => {
  const draft = store.storyDrafts.find(d => d.id === req.params.draftId);
  if (!draft) {
    return res.status(404).json({ message: '草稿不存在' });
  }
  res.json(draft);
});

router.post('/drafts', (req, res) => {
  const { userId, storyId, title, summary, cover, tags, nodes, autoSaved = false } = req.body;
  
  const now = new Date().toISOString().replace('T', ' ').slice(0, 16);
  
  const newDraft = {
    id: `draft-${uuidv4()}`,
    userId,
    storyId: storyId || null,
    title: title || '未命名草稿',
    summary: summary || '',
    cover: cover || '📖',
    tags: tags || [],
    nodes: nodes ? JSON.parse(JSON.stringify(nodes)) : [],
    autoSaved,
    lastSavedAt: now,
    createdAt: now
  };
  
  store.storyDrafts.push(newDraft);
  res.status(201).json(newDraft);
});

router.put('/drafts/:draftId', (req, res) => {
  const draftIndex = store.storyDrafts.findIndex(d => d.id === req.params.draftId);
  if (draftIndex === -1) {
    return res.status(404).json({ message: '草稿不存在' });
  }
  
  const { title, summary, cover, tags, nodes, autoSaved } = req.body;
  const draft = store.storyDrafts[draftIndex];
  
  if (title !== undefined) draft.title = title;
  if (summary !== undefined) draft.summary = summary;
  if (cover !== undefined) draft.cover = cover;
  if (tags !== undefined) draft.tags = tags;
  if (nodes !== undefined) draft.nodes = JSON.parse(JSON.stringify(nodes));
  if (autoSaved !== undefined) draft.autoSaved = autoSaved;
  
  draft.lastSavedAt = new Date().toISOString().replace('T', ' ').slice(0, 16);
  
  res.json(draft);
});

router.delete('/drafts/:draftId', (req, res) => {
  const draftIndex = store.storyDrafts.findIndex(d => d.id === req.params.draftId);
  if (draftIndex === -1) {
    return res.status(404).json({ message: '草稿不存在' });
  }
  
  store.storyDrafts.splice(draftIndex, 1);
  res.json({ message: '草稿已删除' });
});

router.post('/drafts/:draftId/publish', (req, res) => {
  const draft = store.storyDrafts.find(d => d.id === req.params.draftId);
  if (!draft) {
    return res.status(404).json({ message: '草稿不存在' });
  }
  
  const { userId, authorName } = req.body;
  
  if (draft.storyId) {
    const storyIndex = store.stories.findIndex(s => s.id === draft.storyId);
    if (storyIndex === -1) {
      return res.status(404).json({ message: '关联的故事不存在' });
    }
    
    const originalStory = store.stories[storyIndex];
    originalStory.title = draft.title;
    originalStory.summary = draft.summary;
    originalStory.cover = draft.cover;
    originalStory.tags = draft.tags;
    originalStory.updatedAt = new Date().toISOString().split('T')[0];
    
    const storyNodes = draft.nodes.map(node => ({
      id: `node-${uuidv4()}`,
      storyId: draft.storyId,
      title: node.title,
      content: node.content,
      choices: (node.choices || []).map(c => ({
        id: `choice-${uuidv4()}`,
        text: c.text,
        nextNodeId: c.nextNodeId || null
      })),
      isEnding: node.isEnding || false,
      endingType: node.endingType,
      referencedEntries: node.referencedEntries || []
    }));
    
    const nodeIdMap = {};
    draft.nodes.forEach((node, index) => {
      nodeIdMap[node.id] = storyNodes[index].id;
    });
    
    storyNodes.forEach(node => {
      node.choices.forEach(choice => {
        if (choice.nextNodeId && nodeIdMap[choice.nextNodeId]) {
          choice.nextNodeId = nodeIdMap[choice.nextNodeId];
        }
      });
    });
    
    store.storyNodes[draft.storyId] = storyNodes;
    
    if (storyNodes.length > 0) {
      originalStory.startNodeId = storyNodes[0].id;
    }
    
    const draftIndex = store.storyDrafts.findIndex(d => d.id === req.params.draftId);
    if (draftIndex !== -1) {
      store.storyDrafts.splice(draftIndex, 1);
    }
    
    res.json({ 
      story: originalStory, 
      nodes: storyNodes,
      isUpdate: true,
      message: '已更新原故事'
    });
  } else {
    const newStory = {
      id: `story-${uuidv4()}`,
      title: draft.title,
      summary: draft.summary,
      cover: draft.cover,
      authorId: userId || draft.userId,
      authorName: authorName || '匿名作者',
      tags: draft.tags,
      likes: 0,
      views: 0,
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0],
      status: 'ongoing',
      startNodeId: null
    };
    
    store.stories.unshift(newStory);
    
    const storyNodes = draft.nodes.map(node => ({
      id: `node-${uuidv4()}`,
      storyId: newStory.id,
      title: node.title,
      content: node.content,
      choices: (node.choices || []).map(c => ({
        id: `choice-${uuidv4()}`,
        text: c.text,
        nextNodeId: c.nextNodeId || null
      })),
      isEnding: node.isEnding || false,
      endingType: node.endingType,
      referencedEntries: node.referencedEntries || []
    }));
    
    const nodeIdMap = {};
    draft.nodes.forEach((node, index) => {
      nodeIdMap[node.id] = storyNodes[index].id;
    });
    
    storyNodes.forEach(node => {
      node.choices.forEach(choice => {
        if (choice.nextNodeId && nodeIdMap[choice.nextNodeId]) {
          choice.nextNodeId = nodeIdMap[choice.nextNodeId];
        }
      });
    });
    
    store.storyNodes[newStory.id] = storyNodes;
    
    if (storyNodes.length > 0) {
      newStory.startNodeId = storyNodes[0].id;
    }
    
    const draftIndex = store.storyDrafts.findIndex(d => d.id === req.params.draftId);
    if (draftIndex !== -1) {
      store.storyDrafts.splice(draftIndex, 1);
    }
    
    res.status(201).json({ 
      story: newStory, 
      nodes: storyNodes,
      isUpdate: false,
      message: '已创建新故事'
    });
  }
});

router.post('/drafts/:draftId/apply-to-story', (req, res) => {
  const draft = store.storyDrafts.find(d => d.id === req.params.draftId);
  if (!draft) {
    return res.status(404).json({ message: '草稿不存在' });
  }
  
  if (!draft.storyId) {
    return res.status(400).json({ message: '该草稿未关联任何故事，请使用发布功能' });
  }
  
  const storyIndex = store.stories.findIndex(s => s.id === draft.storyId);
  if (storyIndex === -1) {
    return res.status(404).json({ message: '关联的故事不存在' });
  }
  
  const originalStory = store.stories[storyIndex];
  originalStory.title = draft.title;
  originalStory.summary = draft.summary;
  originalStory.cover = draft.cover;
  originalStory.tags = draft.tags;
  originalStory.updatedAt = new Date().toISOString().split('T')[0];
  
  const storyNodes = draft.nodes.map(node => ({
    id: `node-${uuidv4()}`,
    storyId: draft.storyId,
    title: node.title,
    content: node.content,
    choices: (node.choices || []).map(c => ({
      id: `choice-${uuidv4()}`,
      text: c.text,
      nextNodeId: c.nextNodeId || null
    })),
    isEnding: node.isEnding || false,
    endingType: node.endingType,
    referencedEntries: node.referencedEntries || []
  }));
  
  const nodeIdMap = {};
  draft.nodes.forEach((node, index) => {
    nodeIdMap[node.id] = storyNodes[index].id;
  });
  
  storyNodes.forEach(node => {
    node.choices.forEach(choice => {
      if (choice.nextNodeId && nodeIdMap[choice.nextNodeId]) {
        choice.nextNodeId = nodeIdMap[choice.nextNodeId];
      }
    });
  });
  
  store.storyNodes[draft.storyId] = storyNodes;
  
  if (storyNodes.length > 0) {
    originalStory.startNodeId = storyNodes[0].id;
  }
  
  draft.lastSavedAt = new Date().toISOString().replace('T', ' ').slice(0, 16);
  
  res.json({ 
    story: originalStory, 
    nodes: storyNodes,
    message: '已将草稿内容保存到原故事'
  });
});

router.get('/:id/versions', (req, res) => {
  const versions = store.storyVersions
    .filter(v => v.storyId === req.params.id)
    .sort((a, b) => b.version - a.version);
  
  res.json({ versions });
});

router.get('/:id/versions/:versionId', (req, res) => {
  const version = store.storyVersions.find(
    v => v.id === req.params.versionId && v.storyId === req.params.id
  );
  
  if (!version) {
    return res.status(404).json({ message: '版本不存在' });
  }
  
  res.json(version);
});

router.post('/:id/versions', (req, res) => {
  const storyId = req.params.id;
  const { changeSummary, savedBy, savedByName, savedByAvatar } = req.body;
  
  const story = store.stories.find(s => s.id === storyId);
  if (!story) {
    return res.status(404).json({ message: '故事不存在' });
  }
  
  const nodes = store.storyNodes[storyId] || [];
  
  const existingVersions = store.storyVersions.filter(v => v.storyId === storyId);
  const nextVersion = existingVersions.length + 1;
  
  const now = new Date().toISOString().replace('T', ' ').slice(0, 16);
  
  const newVersion = {
    id: `story-version-${uuidv4()}`,
    storyId,
    version: nextVersion,
    changeSummary: changeSummary || `保存版本 v${nextVersion}`,
    savedBy: savedBy || 'user-1',
    savedByName: savedByName || '匿名',
    savedByAvatar: savedByAvatar || '👤',
    story: JSON.parse(JSON.stringify(story)),
    nodes: JSON.parse(JSON.stringify(nodes)),
    createdAt: now
  };
  
  store.storyVersions.push(newVersion);
  
  const maxVersions = 20;
  const allVersions = store.storyVersions.filter(v => v.storyId === storyId);
  if (allVersions.length > maxVersions) {
    const oldest = allVersions.sort((a, b) => a.version - b.version)[0];
    const idx = store.storyVersions.findIndex(v => v.id === oldest.id);
    if (idx !== -1) {
      store.storyVersions.splice(idx, 1);
    }
  }
  
  res.status(201).json(newVersion);
});

router.post('/:id/versions/:versionId/restore', (req, res) => {
  const storyId = req.params.id;
  const versionId = req.params.versionId;
  
  const version = store.storyVersions.find(
    v => v.id === versionId && v.storyId === storyId
  );
  
  if (!version) {
    return res.status(404).json({ message: '版本不存在' });
  }
  
  const storyIndex = store.stories.findIndex(s => s.id === storyId);
  if (storyIndex !== -1 && version.story) {
    const currentStory = store.stories[storyIndex];
    store.stories[storyIndex] = {
      ...version.story,
      id: storyId,
      createdAt: currentStory.createdAt,
      updatedAt: new Date().toISOString().split('T')[0]
    };
  }
  
  if (version.nodes) {
    store.storyNodes[storyId] = JSON.parse(JSON.stringify(version.nodes));
  }
  
  res.json({
    message: '已恢复到该版本',
    story: store.stories.find(s => s.id === storyId),
    nodes: store.storyNodes[storyId] || []
  });
});

router.delete('/:id/versions/:versionId', (req, res) => {
  const versionIndex = store.storyVersions.findIndex(
    v => v.id === req.params.versionId && v.storyId === req.params.id
  );
  
  if (versionIndex === -1) {
    return res.status(404).json({ message: '版本不存在' });
  }
  
  store.storyVersions.splice(versionIndex, 1);
  res.json({ message: '版本已删除' });
});

const calculateStoryScore = (story, userTags = []) => {
  let score = 0;
  
  const likesScore = Math.log10(story.likes + 1) * 20;
  score += likesScore;
  
  const viewsScore = Math.log10(story.views + 1) * 15;
  score += viewsScore;
  
  const likeRatio = story.views > 0 ? story.likes / story.views : 0;
  score += likeRatio * 50;
  
  if (story.status === 'completed') {
    score += 15;
  }
  
  if (userTags.length > 0) {
    let tagMatchScore = 0;
    let matchedCount = 0;
    userTags.forEach(userTag => {
      if (story.tags.includes(userTag.tag)) {
        tagMatchScore += 15 * userTag.weight;
        matchedCount++;
      }
    });
    score += tagMatchScore;
    const matchRatio = matchedCount / Math.max(userTags.length, 1);
    score += matchRatio * 25;
  }
  
  const now = new Date();
  const updatedDate = new Date(story.updatedAt);
  const daysSinceUpdate = Math.floor((now - updatedDate) / (1000 * 60 * 60 * 24));
  if (daysSinceUpdate <= 7) {
    score += 10;
  } else if (daysSinceUpdate <= 30) {
    score += 5;
  }
  
  const createdDate = new Date(story.createdAt);
  const daysSinceCreate = Math.floor((now - createdDate) / (1000 * 60 * 60 * 24));
  if (daysSinceCreate <= 7) {
    score += 8;
  }
  
  if (story.auditStatus === 'approved') {
    score += 5;
  }
  
  return score;
};

const getApprovedStories = () => {
  return storiesData.filter(s => s.auditStatus === 'approved');
};

const getUserTags = (userId) => {
  if (!userId) return [];
  const userFavorites = favoritesData[userId];
  if (!userFavorites || !userFavorites.stories) return [];
  
  const tagCount = {};
  let totalFavorites = 0;
  userFavorites.stories.forEach(storyId => {
    const story = storiesData.find(s => s.id === storyId);
    if (story && story.tags) {
      totalFavorites++;
      story.tags.forEach(tag => {
        tagCount[tag] = (tagCount[tag] || 0) + 1;
      });
    }
  });
  
  const sortedTags = Object.entries(tagCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([tag, count]) => ({
      tag,
      count,
      weight: count / Math.max(totalFavorites, 1)
    }));
  
  return sortedTags;
};

const getStorySection = (stories, sectionType, limit = 6, userTags = []) => {
  let filtered = [...stories];
  const hasUserTags = userTags.length > 0;
  
  const calcTagBonus = (story) => {
    if (!hasUserTags) return 0;
    let bonus = 0;
    userTags.forEach(userTag => {
      if (story.tags.includes(userTag.tag)) {
        bonus += userTag.weight;
      }
    });
    return bonus;
  };
  
  switch (sectionType) {
    case 'featured':
      return filtered
        .map(s => ({ ...s, score: calculateStoryScore(s, userTags) }))
        .sort((a, b) => b.score - a.score)
        .slice(0, limit);
    
    case 'hot':
      return filtered
        .map(s => {
          let hotScore = s.likes + s.views * 0.3;
          const tagBonus = calcTagBonus(s);
          hotScore += tagBonus * 120;
          return { ...s, hotScore };
        })
        .sort((a, b) => b.hotScore - a.hotScore)
        .slice(0, limit);
    
    case 'new':
      return filtered
        .map(s => {
          const daysOld = Math.floor((new Date() - new Date(s.createdAt)) / (1000 * 60 * 60 * 24));
          let newScore = -daysOld;
          const tagBonus = calcTagBonus(s);
          newScore -= tagBonus * 3;
          return { ...s, newScore };
        })
        .sort((a, b) => a.newScore - b.newScore)
        .slice(0, limit);
    
    case 'completed':
      return filtered
        .filter(s => s.status === 'completed')
        .map(s => {
          let completedScore = s.likes;
          const tagBonus = calcTagBonus(s);
          completedScore += tagBonus * 150;
          return { ...s, completedScore };
        })
        .sort((a, b) => b.completedScore - a.completedScore)
        .slice(0, limit);
    
    case 'trending':
      return filtered
        .map(s => {
          const daysOld = Math.max(1, Math.floor((new Date() - new Date(s.createdAt)) / (1000 * 60 * 60 * 24)));
          let momentum = (s.likes + s.views * 0.2) / Math.sqrt(daysOld);
          const tagBonus = calcTagBonus(s);
          momentum *= (1 + tagBonus * 0.5);
          return { ...s, momentum };
        })
        .sort((a, b) => b.momentum - a.momentum)
        .slice(0, limit);
    
    default:
      return filtered.slice(0, limit);
  }
};

router.get('/recommend/home', (req, res) => {
  const { userId, limit = 6 } = req.query;
  const approvedStories = getApprovedStories();
  const userTags = getUserTags(userId);
  
  const featuredStories = getStorySection(approvedStories, 'featured', parseInt(limit), userTags);
  const hotStories = getStorySection(approvedStories, 'hot', parseInt(limit), userTags);
  const newStories = getStorySection(approvedStories, 'new', parseInt(limit), userTags);
  const completedStories = getStorySection(approvedStories, 'completed', parseInt(limit), userTags);
  const trendingStories = getStorySection(approvedStories, 'trending', parseInt(limit), userTags);
  
  const sortedTopics = [...featuredTopicsData].sort((a, b) => a.sortOrder - b.sortOrder);
  const topicsWithStories = sortedTopics.map(topic => {
    let topicStories = approvedStories.filter(story => {
      if (topic.isCompleted) {
        return story.status === 'completed';
      }
      if (topic.tags && topic.tags.length > 0) {
        return topic.tags.some(tag => story.tags.includes(tag));
      }
      return false;
    });
    topicStories = topicStories
      .map(s => ({ ...s, score: calculateStoryScore(s, topic.tags) }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 3);
    
    return {
      ...topic,
      previewStories: topicStories
    };
  });
  
  const allTags = [];
  const tagCount = {};
  approvedStories.forEach(story => {
    story.tags.forEach(tag => {
      tagCount[tag] = (tagCount[tag] || 0) + 1;
    });
  });
  Object.entries(tagCount)
    .sort((a, b) => b[1] - a[1])
    .forEach(([tag, count]) => {
      allTags.push({ tag, count });
    });
  
  res.json({
    sections: [
      {
        id: 'featured',
        title: '✨ 精选推荐',
        subtitle: '编辑精选，优质故事',
        type: 'featured',
        stories: featuredStories
      },
      {
        id: 'trending',
        title: '🔥 正在流行',
        subtitle: '近期热门作品',
        type: 'trending',
        stories: trendingStories
      },
      {
        id: 'new',
        title: '🌟 新书速递',
        subtitle: '最新上架的故事',
        type: 'new',
        stories: newStories
      },
      {
        id: 'hot',
        title: '💎 热门佳作',
        subtitle: '最受欢迎的故事',
        type: 'hot',
        stories: hotStories
      },
      {
        id: 'completed',
        title: '📚 完本精品',
        subtitle: '已完结，放心入坑',
        type: 'completed',
        stories: completedStories
      }
    ],
    topics: topicsWithStories,
    popularTags: allTags.slice(0, 15),
    userPreferenceTags: userTags.map(t => t.tag),
    stats: {
      totalStories: approvedStories.length,
      completedStories: approvedStories.filter(s => s.status === 'completed').length,
      totalTopics: sortedTopics.length
    }
  });
});

router.get('/featured-topics', (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  const approvedStories = getApprovedStories();
  
  const sortedTopics = [...featuredTopicsData].sort((a, b) => a.sortOrder - b.sortOrder);
  const start = (page - 1) * limit;
  const end = start + parseInt(limit);
  const paginatedTopics = sortedTopics.slice(start, end);
  
  const topicsWithStories = paginatedTopics.map(topic => {
    let topicStories = approvedStories.filter(story => {
      if (topic.isCompleted) {
        return story.status === 'completed';
      }
      if (topic.tags && topic.tags.length > 0) {
        return topic.tags.some(tag => story.tags.includes(tag));
      }
      return false;
    });
    
    return {
      ...topic,
      storyCount: topicStories.length,
      previewStories: topicStories.slice(0, 3)
    };
  });
  
  res.json({
    total: sortedTopics.length,
    page: parseInt(page),
    limit: parseInt(limit),
    topics: topicsWithStories
  });
});

router.get('/featured-topics/:id', (req, res) => {
  const { id } = req.params;
  const { page = 1, limit = 10, sort = 'popular' } = req.query;
  const approvedStories = getApprovedStories();
  
  const topic = featuredTopicsData.find(t => t.id === id);
  if (!topic) {
    return res.status(404).json({ message: '专题不存在' });
  }
  
  let topicStories = approvedStories.filter(story => {
    if (topic.isCompleted) {
      return story.status === 'completed';
    }
    if (topic.tags && topic.tags.length > 0) {
      return topic.tags.some(tag => story.tags.includes(tag));
    }
    return false;
  });
  
  if (sort === 'newest') {
    topicStories.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  } else if (sort === 'popular') {
    topicStories.sort((a, b) => (b.likes + b.views * 0.3) - (a.likes + a.views * 0.3));
  } else if (sort === 'rating') {
    topicStories = topicStories
      .map(s => ({ ...s, score: calculateStoryScore(s, topic.tags) }))
      .sort((a, b) => b.score - a.score);
  }
  
  const start = (page - 1) * limit;
  const end = start + parseInt(limit);
  const paginatedStories = topicStories.slice(start, end);
  
  res.json({
    topic: {
      ...topic,
      storyCount: topicStories.length
    },
    total: topicStories.length,
    page: parseInt(page),
    limit: parseInt(limit),
    sort,
    stories: paginatedStories
  });
});

module.exports = router;
