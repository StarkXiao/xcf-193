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
    case 'world_entry': {
      for (const world of worldSettingsData) {
        const entry = world.entries?.find(e => e.id === id);
        if (entry) {
          return entry.title;
        }
      }
      return '未知条目';
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
    case 'world_entry': {
      for (const world of worldSettingsData) {
        const entry = world.entries?.find(e => e.id === id);
        if (entry) return world.authorId;
      }
      return null;
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

router.post('/:type/:id/take-down', (req, res) => {
  const { type, id } = req.params;
  const { reason, auditorId, auditorName, remark } = req.body;

  if (!reason) {
    return res.status(400).json({ message: '请填写下架原因' });
  }

  let target = null;

  switch (type) {
    case 'story': {
      target = storiesData.find(s => s.id === id);
      if (target) {
        target.auditStatus = 'rejected';
        target.auditLevel = null;
        target.rejectReason = reason;
        target.takenDown = true;
        target.takenDownAt = new Date().toLocaleString('zh-CN', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit'
        }).replace(/\//g, '-');
      }
      break;
    }
    case 'world': {
      target = worldSettingsData.find(w => w.id === id);
      if (target) {
        target.auditStatus = 'rejected';
        target.auditLevel = null;
        target.rejectReason = reason;
        target.takenDown = true;
        target.takenDownAt = new Date().toLocaleString('zh-CN', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit'
        }).replace(/\//g, '-');
      }
      break;
    }
    case 'world_entry': {
      for (const world of worldSettingsData) {
        const entry = world.entries?.find(e => e.id === id);
        if (entry) {
          target = entry;
          entry.auditStatus = 'rejected';
          entry.rejectReason = reason;
          entry.takenDown = true;
          entry.takenDownAt = new Date().toLocaleString('zh-CN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
          }).replace(/\//g, '-');
          break;
        }
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
          comment.takenDown = true;
          comment.takenDownAt = new Date().toLocaleString('zh-CN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
          }).replace(/\//g, '-');
          break;
        }
      }
      break;
    }
    default:
      return res.status(400).json({ message: '无效的下架类型' });
  }

  if (!target) {
    return res.status(404).json({ message: '下架目标不存在' });
  }

  const log = addAuditLog(type, id, 'take_down', null, auditorId || 'admin-1', auditorName || '管理员', reason);
  updateAuditStats();

  const authorId = getAuthorId(type, id);
  const targetTitle = getTargetTitle(type, id);
  if (authorId) {
    const typeLabel = type === 'story' ? '故事' : type === 'world' ? '世界设定' : type === 'world_entry' ? '设定条目' : '评论';
    const { createNotification } = require('./notifications');
    createNotification({
      userId: authorId,
      type: 'content_taken_down',
      content: `你的${typeLabel}《${targetTitle}》因「${reason}」已被下架`,
      relatedId: id,
      relatedType: type,
      relatedTitle: targetTitle,
      extra: {
        reason,
        auditorName: auditorName || '管理员'
      }
    });
  }

  res.json({ success: true, log, target, message: '内容已下架' });
});

router.post('/:type/:id/restore', (req, res) => {
  const { type, id } = req.params;
  const { auditLevel, auditorId, auditorName, remark } = req.body;

  if (auditLevel && !AUDIT_LEVELS.includes(auditLevel)) {
    return res.status(400).json({ message: '无效的审核等级' });
  }

  let target = null;

  switch (type) {
    case 'story': {
      target = storiesData.find(s => s.id === id);
      if (target) {
        target.auditStatus = auditLevel ? 'approved' : 'pending';
        target.auditLevel = auditLevel || null;
        target.rejectReason = undefined;
        target.takenDown = false;
        target.takenDownAt = undefined;
      }
      break;
    }
    case 'world': {
      target = worldSettingsData.find(w => w.id === id);
      if (target) {
        target.auditStatus = auditLevel ? 'approved' : 'pending';
        target.auditLevel = auditLevel || null;
        target.rejectReason = undefined;
        target.takenDown = false;
        target.takenDownAt = undefined;
      }
      break;
    }
    case 'world_entry': {
      for (const world of worldSettingsData) {
        const entry = world.entries?.find(e => e.id === id);
        if (entry) {
          target = entry;
          entry.auditStatus = 'approved';
          entry.rejectReason = undefined;
          entry.takenDown = false;
          entry.takenDownAt = undefined;
          break;
        }
      }
      break;
    }
    case 'comment': {
      for (const storyId in commentsData) {
        const comment = commentsData[storyId].find(c => c.id === id);
        if (comment) {
          target = comment;
          comment.auditStatus = auditLevel ? 'approved' : 'pending';
          comment.auditLevel = auditLevel || null;
          comment.rejectReason = undefined;
          comment.takenDown = false;
          comment.takenDownAt = undefined;
          break;
        }
      }
      break;
    }
    default:
      return res.status(400).json({ message: '无效的恢复类型' });
  }

  if (!target) {
    return res.status(404).json({ message: '恢复目标不存在' });
  }

  const log = addAuditLog(type, id, 'restore', auditLevel || null, auditorId || 'admin-1', auditorName || '管理员', remark || '');
  updateAuditStats();

  const authorId = getAuthorId(type, id);
  const targetTitle = getTargetTitle(type, id);
  if (authorId) {
    const typeLabel = type === 'story' ? '故事' : type === 'world' ? '世界设定' : type === 'world_entry' ? '设定条目' : '评论';
    const { createNotification } = require('./notifications');
    createNotification({
      userId: authorId,
      type: 'content_restored',
      content: `你的${typeLabel}《${targetTitle}》已恢复上架`,
      relatedId: id,
      relatedType: type,
      relatedTitle: targetTitle,
      extra: {
        auditLevel: auditLevel || null,
        auditorName: auditorName || '管理员'
      }
    });
  }

  res.json({ success: true, log, target, message: '内容已恢复' });
});

router.get('/taken-down', (req, res) => {
  const { type, page = 1, limit = 10 } = req.query;
  const pageNum = parseInt(page);
  const limitNum = parseInt(limit);

  let allItems = [];

  if (!type || type === 'story') {
    const takenDownStories = storiesData
      .filter(s => s.takenDown || s.auditStatus === 'rejected')
      .map(s => ({
        id: s.id,
        type: 'story',
        title: s.title,
        cover: s.cover,
        authorId: s.authorId,
        authorName: s.authorName,
        summary: s.summary,
        tags: s.tags,
        rejectReason: s.rejectReason,
        takenDownAt: s.takenDownAt,
        createdAt: s.createdAt
      }));
    allItems = [...allItems, ...takenDownStories];
  }

  if (!type || type === 'world') {
    const takenDownWorlds = worldSettingsData
      .filter(w => w.takenDown || w.auditStatus === 'rejected')
      .map(w => ({
        id: w.id,
        type: 'world',
        title: w.name,
        cover: w.cover,
        authorId: w.authorId,
        authorName: w.authorName,
        summary: w.description,
        entryCount: w.entries?.length || 0,
        rejectReason: w.rejectReason,
        takenDownAt: w.takenDownAt,
        createdAt: w.createdAt
      }));
    allItems = [...allItems, ...takenDownWorlds];
  }

  if (!type || type === 'world_entry') {
    worldSettingsData.forEach(world => {
      const takenDownEntries = (world.entries || [])
        .filter(e => e.takenDown || e.auditStatus === 'rejected')
        .map(e => ({
          id: e.id,
          type: 'world_entry',
          title: e.title,
          category: e.category,
          worldId: world.id,
          worldName: world.name,
          authorId: world.authorId,
          authorName: world.authorName,
          content: e.content,
          rejectReason: e.rejectReason,
          takenDownAt: e.takenDownAt
        }));
      allItems = [...allItems, ...takenDownEntries];
    });
  }

  if (!type || type === 'comment') {
    for (const storyId in commentsData) {
      const story = storiesData.find(s => s.id === storyId);
      const takenDownComments = commentsData[storyId]
        .filter(c => c.takenDown || c.auditStatus === 'rejected')
        .map(c => ({
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
          rejectReason: c.rejectReason,
          takenDownAt: c.takenDownAt,
          createdAt: c.createdAt
        }));
      allItems = [...allItems, ...takenDownComments];
    }
  }

  allItems.sort((a, b) => {
    const dateA = a.takenDownAt ? new Date(a.takenDownAt) : new Date(a.createdAt);
    const dateB = b.takenDownAt ? new Date(b.takenDownAt) : new Date(b.createdAt);
    return dateB - dateA;
  });

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

module.exports = router;
