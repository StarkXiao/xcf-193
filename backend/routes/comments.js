const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const store = require('../data/store');
const { createNotification } = require('./notifications');

let commentsData = store.comments;
let storiesData = store.stories;
let usersData = store.users;

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
  const { nodeId, userId, username, avatar, content, replyToCommentId } = req.body;
  
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
    replyToCommentId: replyToCommentId || null,
    createdAt: new Date().toLocaleString('zh-CN', { 
      year: 'numeric', 
      month: '2-digit', 
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    }).replace(/\//g, '-')
  };
  
  commentsData[storyId].unshift(newComment);
  
  const story = storiesData.find(s => s.id === storyId);
  if (story) {
    if (replyToCommentId) {
      const replyToComment = commentsData[storyId].find(c => c.id === replyToCommentId);
      if (replyToComment && replyToComment.userId !== userId) {
        const replyToUser = usersData.find(u => u.id === replyToComment.userId);
        createNotification({
          userId: replyToComment.userId,
          type: 'comment_reply',
          content: `${username} 回复了你的评论：${content.length > 30 ? content.substring(0, 30) + '...' : content}`,
          relatedId: storyId,
          relatedType: 'story',
          relatedTitle: story.title,
          extra: {
            replyToCommentId,
            replyContent: replyToComment.content,
            commentId: newComment.id,
            inviterId: userId,
            inviterName: username,
            inviterAvatar: avatar || '👤'
          }
        });
      }
    }
    
    if (story.authorId && story.authorId !== userId) {
      createNotification({
        userId: story.authorId,
        type: 'comment',
        content: `${username} 评论了你的故事《${story.title}》：${content.length > 30 ? content.substring(0, 30) + '...' : content}`,
        relatedId: storyId,
        relatedType: 'story',
        relatedTitle: story.title,
        extra: {
          commentId: newComment.id,
          inviterId: userId,
          inviterName: username,
          inviterAvatar: avatar || '👤'
        }
      });
    }
  }
  
  res.status(201).json(newComment);
});

router.post('/:commentId/like', (req, res) => {
  const { commentId } = req.params;
  const { userId, username, avatar } = req.body;
  
  for (const storyId in commentsData) {
    const comment = commentsData[storyId].find(c => c.id === commentId);
    if (comment) {
      comment.likes += 1;
      
      if (comment.userId && userId && comment.userId !== userId) {
        const story = storiesData.find(s => s.id === storyId);
        createNotification({
          userId: comment.userId,
          type: 'like',
          content: `${username || '有人'} 点赞了你的评论`,
          relatedId: commentId,
          relatedType: 'comment',
          relatedTitle: story ? story.title : null,
          extra: {
            commentId,
            commentContent: comment.content,
            storyId,
            inviterId: userId,
            inviterName: username,
            inviterAvatar: avatar || '👤'
          }
        });
      }
      
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
