const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const store = require('../data/store');
const { createNotification } = require('./notifications');

let storiesData = store.stories;
let worldSettingsData = store.worldSettings;
let commentsData = store.comments;
let auditLogsData = store.auditLogs;
let auditStatsData = store.auditStats;

const AUDIT_LEVELS = ['G', 'PG', 'PG-13', 'R'];

const getTargetTitle = (type, id) => {
  switch (type) {
    case 'story': {
      const story = storiesData.find(s => s.id === id);
      return story ? story.title : '未知';
    }
    case 'world': {
      const world = worldSettingsData.find(w => w.id === id);
      return world ? world.name : '未知';
    }
    case 'comment': {
      for (const storyId in commentsData) {
        const comment = commentsData[storyId].find(c => c.id === id);
        if (comment) {
          const shortContent = comment.content.length > 20 
            ? comment.content.substring(0, 20) + '...' 
            : comment.content;
          return `评论-${shortContent}`;
        }
      }
      return '未知评论';
    }
    default:
      return '未知';
  }
};

const getAuthorId = (type, id) => {
  switch (type) {
    case 'story': {
      const story = storiesData.find(s => s.id === id);
      return story ? story.authorId : null;
    }
    case 'world': {
      const world = worldSettingsData.find(w => w.id === id);
      return world ? world.authorId : null;
    }
    case 'comment': {
      for (const storyId in commentsData) {
        const comment = commentsData[storyId].find(c => c.id === id);
        if (comment) return comment.userId;
      }
      return null;
    }
    default:
      return null;
  }
};

const addAuditLog = (targetType, targetId, action, auditLevel, auditorId, auditorName, remark) => {
  const targetTitle = getTargetTitle(targetType, targetId);
  const log = {
    id: `audit-log-${uuidv4()}`,
    targetType,
    targetId,
    targetTitle,
    action,
    auditLevel: auditLevel || null,
    auditorId,
    auditorName,
    remark: remark || '',
    createdAt: new Date().toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    }).replace(/\//g, '-')
  };
  auditLogsData.unshift(log);
  return log;
};

const updateAuditStats = () => {
  const stats = {
    pending: { stories: 0, worlds: 0, comments: 0, total: 0 },
    approved: { stories: 0, worlds: 0, comments: 0, total: 0 },
    rejected: { stories: 0, worlds: 0, comments: 0, total: 0 }
  };

  storiesData.forEach(story => {
    if (story.auditStatus === 'pending') stats.pending.stories++;
    else if (story.auditStatus === 'approved') stats.approved.stories++;
    else if (story.auditStatus === 'rejected') stats.rejected.stories++;
  });

  worldSettingsData.forEach(world => {
    if (world.auditStatus === 'pending') stats.pending.worlds++;
    else if (world.auditStatus === 'approved') stats.approved.worlds++;
    else if (world.auditStatus === 'rejected') stats.rejected.worlds++;
  });

  for (const storyId in commentsData) {
    commentsData[storyId].forEach(comment => {
      if (comment.auditStatus === 'pending') stats.pending.comments++;
      else if (comment.auditStatus === 'approved') stats.approved.comments++;
      else if (comment.auditStatus === 'rejected') stats.rejected.comments++;
    });
  }

  stats.pending.total = stats.pending.stories + stats.pending.worlds + stats.pending.comments;
  stats.approved.total = stats.approved.stories + stats.approved.worlds + stats.approved.comments;
  stats.rejected.total = stats.rejected.stories + stats.rejected.worlds + stats.rejected.comments;

  Object.assign(auditStatsData, stats);
};

router.get('/stats', (req, res) => {
  updateAuditStats();
  res.json(auditStatsData);
});

router.get('/pending', (req, res) => {
  const { type, page = 1, limit = 10 } = req.query;
  const pageNum = parseInt(page);
  const limitNum = parseInt(limit);

  let allItems = [];

  if (!type || type === 'story') {
    const pendingStories = storiesData
      .filter(s => s.auditStatus === 'pending')
      .map(s => ({
        id: s.id,
        type: 'story',
        title: s.title,
        cover: s.cover,
        authorId: s.authorId,
        authorName: s.authorName,
        summary: s.summary,
        tags: s.tags,
        createdAt: s.createdAt
      }));
    allItems = [...allItems, ...pendingStories];
  }

  if (!type || type === 'world') {
    const pendingWorlds = worldSettingsData
      .filter(w => w.auditStatus === 'pending')
      .map(w => ({
        id: w.id,
        type: 'world',
        title: w.name,
        cover: w.cover,
        authorId: w.authorId,
        authorName: w.authorName,
        summary: w.description,
        entryCount: w.entries?.length || 0,
        createdAt: w.createdAt
      }));
    allItems = [...allItems, ...pendingWorlds];
  }

  if (!type || type === 'comment') {
    const pendingComments = [];
    for (const storyId in commentsData) {
      commentsData[storyId]
        .filter(c => c.auditStatus === 'pending')
        .forEach(c => {
          const story = storiesData.find(s => s.id === storyId);
          pendingComments.push({
            id: c.id,
            type: 'comment',
            title: c.content,
            storyId: storyId,
            storyTitle: story ? story.title : '未知',
            authorId: c.userId,
            authorName: c.username,
            avatar: c.avatar,
            content: c.content,
            likes: c.likes,
            createdAt: c.createdAt
          });
        });
    }
    allItems = [...allItems, ...pendingComments];
  }

  allItems.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  const start = (pageNum - 1) * limitNum;
  const end = start + limitNum;
  const paginated = allItems.slice(start, end);

  res.json({
    total: allItems.length,
    page: pageNum,
    limit: limitNum,
    items: paginated
  });
});

router.get('/logs', (req, res) => {
  const { targetType, action, page = 1, limit = 10 } = req.query;
  const pageNum = parseInt(page);
  const limitNum = parseInt(limit);

  let logs = [...auditLogsData];

  if (targetType) {
    logs = logs.filter(log => log.targetType === targetType);
  }
  if (action) {
    logs = logs.filter(log => log.action === action);
  }

  const start = (pageNum - 1) * limitNum;
  const end = start + limitNum;
  const paginated = logs.slice(start, end);

  res.json({
    total: logs.length,
    page: pageNum,
    limit: limitNum,
    logs: paginated
  });
});

router.post('/:type/:id/approve', (req, res) => {
  const { type, id } = req.params;
  const { auditLevel, auditorId, auditorName, remark } = req.body;

  if (!AUDIT_LEVELS.includes(auditLevel)) {
    return res.status(400).json({ message: '无效的审核等级' });
  }

  let target = null;

  switch (type) {
    case 'story': {
      target = storiesData.find(s => s.id === id);
      if (target) {
        target.auditStatus = 'approved';
        target.auditLevel = auditLevel;
        target.rejectReason = undefined;
      }
      break;
    }
    case 'world': {
      target = worldSettingsData.find(w => w.id === id);
      if (target) {
        target.auditStatus = 'approved';
        target.auditLevel = auditLevel;
        target.rejectReason = undefined;
      }
      break;
    }
    case 'comment': {
      for (const storyId in commentsData) {
        const comment = commentsData[storyId].find(c => c.id === id);
        if (comment) {
          target = comment;
          comment.auditStatus = 'approved';
          comment.auditLevel = auditLevel;
          comment.rejectReason = undefined;
          break;
        }
      }
      break;
    }
    default:
      return res.status(400).json({ message: '无效的审核类型' });
  }

  if (!target) {
    return res.status(404).json({ message: '审核目标不存在' });
  }

  const log = addAuditLog(type, id, 'approve', auditLevel, auditorId || 'admin-1', auditorName || '管理员', remark);
  updateAuditStats();

  const authorId = getAuthorId(type, id);
  const targetTitle = getTargetTitle(type, id);
  if (authorId) {
    const typeLabel = type === 'story' ? '故事' : type === 'world' ? '世界设定' : '评论';
    createNotification({
      userId: authorId,
      type: 'audit_approved',
      content: `你的${typeLabel}《${targetTitle}》已通过审核，等级：${auditLevel}`,
      relatedId: id,
      relatedType: type,
      relatedTitle: targetTitle,
      extra: {
        auditLevel,
        auditorName: auditorName || '管理员'
      }
    });
  }

  res.json({ success: true, log, target });
});

router.post('/:type/:id/reject', (req, res) => {
  const { type, id } = req.params;
  const { reason, auditorId, auditorName, remark } = req.body;

  if (!reason) {
    return res.status(400).json({ message: '请填写驳回原因' });
  }

  let target = null;

  switch (type) {
    case 'story': {
      target = storiesData.find(s => s.id === id);
      if (target) {
        target.auditStatus = 'rejected';
        target.auditLevel = null;
        target.rejectReason = reason;
      }
      break;
    }
    case 'world': {
      target = worldSettingsData.find(w => w.id === id);
      if (target) {
        target.auditStatus = 'rejected';
        target.auditLevel = null;
        target.rejectReason = reason;
      }
      break;
    }
    case 'comment': {
      for (const storyId in commentsData) {
        const comment = commentsData[storyId].find(c => c.id === id);
        if (comment) {
          target = comment;
          comment.auditStatus = 'rejected';
          comment.auditLevel = null;
          comment.rejectReason = reason;
          break;
        }
      }
      break;
    }
    default:
      return res.status(400).json({ message: '无效的审核类型' });
  }

  if (!target) {
    return res.status(404).json({ message: '审核目标不存在' });
  }

  const log = addAuditLog(type, id, 'reject', null, auditorId || 'admin-1', auditorName || '管理员', reason);
  updateAuditStats();

  const authorId = getAuthorId(type, id);
  const targetTitle = getTargetTitle(type, id);
  if (authorId) {
    const typeLabel = type === 'story' ? '故事' : type === 'world' ? '世界设定' : '评论';
    createNotification({
      userId: authorId,
      type: 'audit_rejected',
      content: `你的${typeLabel}《${targetTitle}》未通过审核：${reason}`,
      relatedId: id,
      relatedType: type,
      relatedTitle: targetTitle,
      extra: {
        rejectReason: reason,
        auditorName: auditorName || '管理员'
      }
    });
  }

  res.json({ success: true, log, target });
});

router.get('/levels', (req, res) => {
  res.json({
    levels: AUDIT_LEVELS,
    descriptions: {
      'G': '全年龄段，适合所有读者',
      'PG': '建议家长指导，适合大部分读者',
      'PG-13': '13岁以上，包含轻度敏感内容',
      'R': '限制级，17岁以上，包含成人内容'
    }
  });
});

module.exports = router;
