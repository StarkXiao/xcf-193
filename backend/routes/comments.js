const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const store = require('../data/store');
const { createNotification } = require('./notifications');

let commentsData = store.comments;
let storiesData = store.stories;
let usersData = store.users;
let storyNodesData = store.storyNodes;

const isStoryAuthor = (storyId, userId) => {
  const story = storiesData.find(s => s.id === storyId);
  return story && story.authorId === userId;
};

const getNodeTitle = (storyId, nodeId) => {
  const nodes = storyNodesData[storyId] || [];
  const node = nodes.find(n => n.id === nodeId);
  return node ? node.title : null;
};

const buildReplyTree = (comments) => {
  const commentMap = new Map();
  const roots = [];
  
  comments.forEach(c => {
    commentMap.set(c.id, { ...c, replies: [] });
  });
  
  comments.forEach(c => {
    const comment = commentMap.get(c.id);
    if (c.replyToCommentId && commentMap.has(c.replyToCommentId)) {
      commentMap.get(c.replyToCommentId).replies.push(comment);
    } else {
      roots.push(comment);
    }
  });
  
  const sortReplies = (node) => {
    node.replies.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    node.replies.forEach(sortReplies);
  };
  roots.forEach(sortReplies);
  
  return roots;
};

router.get('/story/:storyId', (req, res) => {
  const { storyId } = req.params;
  const { nodeId, sort = 'newest', scope = 'current' } = req.query;
  
  let storyComments = commentsData[storyId] || [];
  
  if (scope === 'current' && nodeId) {
    storyComments = storyComments.filter(c => c.nodeId === nodeId);
  } else if (scope === 'story') {
    // 全故事评论，不过滤nodeId
  }
  
  let result = [...storyComments];
  
  if (sort === 'hot') {
    result.sort((a, b) => {
      const scoreA = a.likes * 3 + (a.replyCount || 0) * 2;
      const scoreB = b.likes * 3 + (b.replyCount || 0) * 2;
      return scoreB - scoreA;
    });
  } else {
    result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }
  
  const pinnedComments = result.filter(c => c.isPinned);
  const normalComments = result.filter(c => !c.isPinned);
  
  if (sort === 'newest') {
    pinnedComments.sort((a, b) => new Date(b.pinnedAt || 0) - new Date(a.pinnedAt || 0));
  }
  
  const finalList = [...pinnedComments, ...normalComments];
  const tree = buildReplyTree(finalList);
  
  res.json({
    total: finalList.length,
    pinnedCount: pinnedComments.length,
    sort,
    scope,
    comments: tree
  });
});

router.get('/story/:storyId/hot-aggregate', (req, res) => {
  const { storyId } = req.params;
  const { limit = 5, minLikes = 5 } = req.query;
  
  const storyComments = commentsData[storyId] || [];
  const nodes = storyNodesData[storyId] || [];
  
  const hotByNode = {};
  
  nodes.forEach(node => {
    const nodeComments = storyComments.filter(c => c.nodeId === node.id && !c.replyToCommentId);
    const topComments = nodeComments
      .filter(c => c.likes >= parseInt(minLikes))
      .sort((a, b) => b.likes - a.likes)
      .slice(0, 1)
      .map(c => ({
        ...c,
        nodeTitle: node.title
      }));
    
    if (topComments.length > 0) {
      hotByNode[node.id] = {
        nodeId: node.id,
        nodeTitle: node.title,
        topComment: topComments[0],
        commentCount: nodeComments.length
      };
    }
  });
  
  const allHotComments = storyComments
    .filter(c => !c.replyToCommentId && c.likes >= parseInt(minLikes))
    .map(c => ({
      ...c,
      nodeTitle: getNodeTitle(storyId, c.nodeId)
    }))
    .sort((a, b) => b.likes - a.likes)
    .slice(0, parseInt(limit));
  
  const overallStats = {
    totalComments: storyComments.length,
    totalLikes: storyComments.reduce((sum, c) => sum + c.likes, 0),
    nodeWithComments: Object.keys(hotByNode).length,
    totalNodes: nodes.length
  };
  
  res.json({
    overallStats,
    topHotComments: allHotComments,
    byNode: Object.values(hotByNode).sort((a, b) => b.commentCount - a.commentCount)
  });
});

router.post('/story/:storyId', (req, res) => {
  const { storyId } = req.params;
  const { nodeId, userId, username, avatar, content, replyToCommentId } = req.body;
  
  if (!commentsData[storyId]) {
    commentsData[storyId] = [];
  }
  
  let replyToComment = null;
  let replyToUserId = null;
  let replyToUsername = null;
  
  if (replyToCommentId) {
    replyToComment = commentsData[storyId].find(c => c.id === replyToCommentId);
    if (replyToComment) {
      replyToUserId = replyToComment.userId;
      replyToUsername = replyToComment.username;
      if (replyToComment.replyCount === undefined) {
        replyToComment.replyCount = 0;
      }
      replyToComment.replyCount += 1;
    }
  }
  
  const newComment = {
    id: `comment-${uuidv4()}`,
    storyId,
    nodeId: nodeId || null,
    nodeTitle: nodeId ? getNodeTitle(storyId, nodeId) : null,
    userId,
    username,
    avatar: avatar || '👤',
    content,
    likes: 0,
    replyCount: 0,
    replyToCommentId: replyToCommentId || null,
    replyToUserId: replyToUserId || null,
    replyToUsername: replyToUsername || null,
    isPinned: false,
    pinnedAt: null,
    pinnedBy: null,
    isAuthor: isStoryAuthor(storyId, userId),
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
    if (replyToComment && replyToComment.userId !== userId) {
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
          replyToNodeId: nodeId,
          inviterId: userId,
          inviterName: username,
          inviterAvatar: avatar || '👤'
        }
      });
    }
    
    if (story.authorId && story.authorId !== userId && !replyToCommentId) {
      createNotification({
        userId: story.authorId,
        type: 'comment',
        content: `${username} 评论了你的故事《${story.title}》：${content.length > 30 ? content.substring(0, 30) + '...' : content}`,
        relatedId: storyId,
        relatedType: 'story',
        relatedTitle: story.title,
        extra: {
          commentId: newComment.id,
          nodeId,
          inviterId: userId,
          inviterName: username,
          inviterAvatar: avatar || '👤'
        }
      });
    }
  }
  
  res.status(201).json(newComment);
});

router.post('/:commentId/pin', (req, res) => {
  const { commentId } = req.params;
  const { userId, username } = req.body;
  
  for (const storyId in commentsData) {
    const comment = commentsData[storyId].find(c => c.id === commentId);
    if (comment) {
      if (!isStoryAuthor(storyId, userId)) {
        return res.status(403).json({ message: '只有作者可以置顶评论' });
      }
      
      if (comment.isPinned) {
        comment.isPinned = false;
        comment.pinnedAt = null;
        comment.pinnedBy = null;
        res.json({ message: '已取消置顶', isPinned: false, comment });
      } else {
        comment.isPinned = true;
        comment.pinnedAt = new Date().toISOString();
        comment.pinnedBy = { userId, username };
        res.json({ message: '置顶成功', isPinned: true, comment });
      }
      return;
    }
  }
  
  res.status(404).json({ message: '评论不存在' });
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
            nodeId: comment.nodeId,
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
  const { userId } = req.body;
  
  for (const storyId in commentsData) {
    const index = commentsData[storyId].findIndex(c => c.id === commentId);
    if (index !== -1) {
      const comment = commentsData[storyId][index];
      
      if (userId && comment.userId !== userId && !isStoryAuthor(storyId, userId)) {
        return res.status(403).json({ message: '无权限删除此评论' });
      }
      
      if (comment.replyToCommentId) {
        const parentComment = commentsData[storyId].find(c => c.id === comment.replyToCommentId);
        if (parentComment && parentComment.replyCount > 0) {
          parentComment.replyCount -= 1;
        }
      }
      
      const deleteReplies = (parentId) => {
        const replies = commentsData[storyId].filter(c => c.replyToCommentId === parentId);
        replies.forEach(r => {
          deleteReplies(r.id);
          const rIndex = commentsData[storyId].findIndex(c => c.id === r.id);
          if (rIndex !== -1) {
            commentsData[storyId].splice(rIndex, 1);
          }
        });
      };
      deleteReplies(commentId);
      
      const finalIndex = commentsData[storyId].findIndex(c => c.id === commentId);
      if (finalIndex !== -1) {
        commentsData[storyId].splice(finalIndex, 1);
      }
      
      return res.json({ message: '评论已删除' });
    }
  }
  
  res.status(404).json({ message: '评论不存在' });
});

module.exports = router;
