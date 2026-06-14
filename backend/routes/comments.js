const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const { comments } = require('../data/mockData');

let commentsData = JSON.parse(JSON.stringify(comments));

router.get('/story/:storyId', (req, res) => {
  const { storyId } = req.params;
  const { nodeId } = req.query;
  
  let storyComments = commentsData[storyId] || [];
  
  if (nodeId) {
    storyComments = storyComments.filter(c => c.nodeId === nodeId);
  }
  
  storyComments.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  
  res.json(storyComments);
});

router.post('/story/:storyId', (req, res) => {
  const { storyId } = req.params;
  const { nodeId, userId, username, avatar, content } = req.body;
  
  if (!commentsData[storyId]) {
    commentsData[storyId] = [];
  }
  
  const newComment = {
    id: `comment-${uuidv4()}`,
    storyId,
    nodeId: nodeId || null,
    userId,
    username,
    avatar: avatar || '👤',
    content,
    likes: 0,
    createdAt: new Date().toLocaleString('zh-CN', { 
      year: 'numeric', 
      month: '2-digit', 
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    }).replace(/\//g, '-')
  };
  
  commentsData[storyId].unshift(newComment);
  res.status(201).json(newComment);
});

router.post('/:commentId/like', (req, res) => {
  const { commentId } = req.params;
  
  for (const storyId in commentsData) {
    const comment = commentsData[storyId].find(c => c.id === commentId);
    if (comment) {
      comment.likes += 1;
      return res.json({ likes: comment.likes });
    }
  }
  
  res.status(404).json({ message: '评论不存在' });
});

router.delete('/:commentId', (req, res) => {
  const { commentId } = req.params;
  
  for (const storyId in commentsData) {
    const index = commentsData[storyId].findIndex(c => c.id === commentId);
    if (index !== -1) {
      commentsData[storyId].splice(index, 1);
      return res.json({ message: '评论已删除' });
    }
  }
  
  res.status(404).json({ message: '评论不存在' });
});

module.exports = router;
