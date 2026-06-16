const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const store = require('../data/store');
const { createNotification } = require('./notifications');

let reportsData = store.reports;
let reportStatsData = store.reportStats;
let storiesData = store.stories;
let worldSettingsData = store.worldSettings;
let commentsData = store.comments;
let auditLogsData = store.auditLogs;
let REPORT_REASONS = store.REPORT_REASONS;

const REPORT_STATUSES = ['pending', 'processing', 'resolved', 'rejected'];
const HANDLE_RESULTS = ['take_down', 'dismiss'];

const getTargetInfo = (targetType, targetId) => {
  switch (targetType) {
    case 'story': {
      const story = storiesData.find(s => s.id === targetId);
      return {
        exists: !!story,
        title: story ? story.title : '未知',
        authorId: story ? story.authorId : null,
        authorName: story ? story.authorName : null,
        cover: story ? story.cover : null,
        summary: story ? story.summary : null
      };
    }
    case 'comment': {
      for (const storyId in commentsData) {
        const comment = commentsData[storyId].find(c => c.id === targetId);
        if (comment) {
          const shortContent = comment.content.length > 20
            ? comment.content.substring(0, 20) + '...'
            : comment.content;
          return {
            exists: true,
            title: `评论-${shortContent}`,
            authorId: comment.userId,
            authorName: comment.username,
            avatar: comment.avatar,
            content: comment.content,
            storyId
          };
        }
      }
      return { exists: false, title: '未知评论' };
    }
    case 'world_entry': {
      for (const world of worldSettingsData) {
        const entry = world.entries?.find(e => e.id === targetId);
        if (entry) {
          return {
            exists: true,
            title: entry.title,
            authorId: world.authorId,
            authorName: world.authorName,
            worldId: world.id,
            worldName: world.name,
            category: entry.category,
            content: entry.content
          };
        }
      }
      return { exists: false, title: '未知条目' };
    }
    default:
      return { exists: false, title: '未知' };
  }
};

const takeDownContent = (targetType, targetId, reason, handlerId, handlerName) => {
  let target = null;

  switch (targetType) {
    case 'story': {
      const story = storiesData.find(s => s.id === targetId);
      if (story) {
        story.auditStatus = 'rejected';
        story.rejectReason = reason;
        story.takenDown = true;
        story.takenDownAt = new Date().toLocaleString('zh-CN', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit'
        }).replace(/\//g, '-');
        target = story;
      }
      break;
    }
    case 'comment': {
      for (const storyId in commentsData) {
        const comment = commentsData[storyId].find(c => c.id === targetId);
        if (comment) {
          comment.auditStatus = 'rejected';
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
          target = comment;
          break;
        }
      }
      break;
    }
    case 'world_entry': {
      for (const world of worldSettingsData) {
        const entryIndex = world.entries?.findIndex(e => e.id === targetId);
        if (entryIndex !== -1 && entryIndex !== undefined) {
          const entry = world.entries[entryIndex];
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
          target = entry;
          break;
        }
      }
      break;
    }
  }

  if (target) {
    const log = {
      id: `audit-log-${uuidv4()}`,
      targetType,
      targetId,
      targetTitle: getTargetInfo(targetType, targetId).title,
      action: 'take_down',
      auditLevel: null,
      auditorId: handlerId || 'admin-1',
      auditorName: handlerName || '管理员',
      remark: reason,
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
  }

  return target;
};

const updateReportStats = () => {
  const stats = {
    total: reportsData.length,
    pending: 0,
    processing: 0,
    resolved: 0,
    rejected: 0,
    byType: {
      story: 0,
      comment: 0,
      world_entry: 0
    },
    byReason: {
      spam: 0,
      pornography: 0,
      violence: 0,
      illegal: 0,
      plagiarism: 0,
      harassment: 0,
      rumor: 0,
      other: 0
    }
  };

  reportsData.forEach(report => {
    if (stats.byType[report.targetType] !== undefined) {
      stats.byType[report.targetType]++;
    }
    if (stats.byReason[report.reason] !== undefined) {
      stats.byReason[report.reason]++;
    }

    switch (report.status) {
      case 'pending':
        stats.pending++;
        break;
      case 'processing':
        stats.processing++;
        break;
      case 'resolved':
        stats.resolved++;
        break;
      case 'rejected':
        stats.rejected++;
        break;
    }
  });

  Object.assign(reportStatsData, stats);
};

router.get('/reasons', (req, res) => {
  res.json({ reasons: REPORT_REASONS });
});

router.get('/stats', (req, res) => {
  updateReportStats();
  res.json(reportStatsData);
});

router.get('/', (req, res) => {
  const { status, targetType, reason, reporterId, page = 1, limit = 10, sort = 'newest' } = req.query;
  const pageNum = parseInt(page);
  const limitNum = parseInt(limit);

  let result = [...reportsData];

  if (status) {
    result = result.filter(r => r.status === status);
  }
  if (targetType) {
    result = result.filter(r => r.targetType === targetType);
  }
  if (reason) {
    result = result.filter(r => r.reason === reason);
  }
  if (reporterId) {
    result = result.filter(r => r.reporterId === reporterId);
  }

  if (sort === 'newest') {
    result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  } else if (sort === 'oldest') {
    result.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
  }

  const start = (pageNum - 1) * limitNum;
  const end = start + limitNum;
  const paginated = result.slice(start, end);

  const itemsWithTarget = paginated.map(report => {
    const targetInfo = getTargetInfo(report.targetType, report.targetId);
    return {
      ...report,
      targetInfo: {
        ...targetInfo
      }
    };
  });

  res.json({
    total: result.length,
    page: pageNum,
    limit: limitNum,
    reports: itemsWithTarget
  });
});

router.get('/:id', (req, res) => {
  const { id } = req.params;
  const report = reportsData.find(r => r.id === id);

  if (!report) {
    return res.status(404).json({ message: '举报记录不存在' });
  }

  const targetInfo = getTargetInfo(report.targetType, report.targetId);

  res.json({
    ...report,
    targetInfo
  });
});

router.post('/', (req, res) => {
  const { targetType, targetId, reason, description, reporterId, reporterName } = req.body;

  if (!targetType || !targetId || !reason) {
    return res.status(400).json({ message: '缺少必要参数' });
  }

  const validTypes = ['story', 'comment', 'world_entry'];
  if (!validTypes.includes(targetType)) {
    return res.status(400).json({ message: '无效的举报类型' });
  }

  const validReasons = REPORT_REASONS.map(r => r.value);
  if (!validReasons.includes(reason)) {
    return res.status(400).json({ message: '无效的举报原因' });
  }

  const targetInfo = getTargetInfo(targetType, targetId);
  if (!targetInfo.exists) {
    return res.status(404).json({ message: '举报目标不存在' });
  }

  const reasonObj = REPORT_REASONS.find(r => r.value === reason);

  const newReport = {
    id: `report-${uuidv4()}`,
    targetType,
    targetId,
    targetTitle: targetInfo.title,
    reporterId: reporterId || 'anonymous',
    reporterName: reporterName || '匿名用户',
    reason,
    reasonLabel: reasonObj ? reasonObj.label : reason,
    description: description || '',
    status: 'pending',
    createdAt: new Date().toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    }).replace(/\//g, '-'),
    handledAt: null,
    handlerId: null,
    handlerName: null,
    handleResult: null,
    handleRemark: null
  };

  if (targetType === 'world_entry' && targetInfo.worldId) {
    newReport.worldId = targetInfo.worldId;
  }

  reportsData.unshift(newReport);
  updateReportStats();

  res.status(201).json({
    success: true,
    report: newReport,
    message: '举报已提交，我们会尽快处理'
  });
});

router.put('/:id/status', (req, res) => {
  const { id } = req.params;
  const { status, handlerId, handlerName, remark } = req.body;

  if (!REPORT_STATUSES.includes(status)) {
    return res.status(400).json({ message: '无效的状态' });
  }

  const report = reportsData.find(r => r.id === id);
  if (!report) {
    return res.status(404).json({ message: '举报记录不存在' });
  }

  report.status = status;
  if (status !== 'pending') {
    report.handledAt = new Date().toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    }).replace(/\//g, '-');
    report.handlerId = handlerId || 'admin-1';
    report.handlerName = handlerName || '管理员';
  }
  if (remark) {
    report.handleRemark = remark;
  }

  updateReportStats();

  res.json({
    success: true,
    report
  });
});

router.post('/:id/handle', (req, res) => {
  const { id } = req.params;
  const { result, remark, handlerId, handlerName } = req.body;

  if (!HANDLE_RESULTS.includes(result)) {
    return res.status(400).json({ message: '无效的处理结果' });
  }

  const report = reportsData.find(r => r.id === id);
  if (!report) {
    return res.status(404).json({ message: '举报记录不存在' });
  }

  if (report.status === 'resolved' || report.status === 'rejected') {
    return res.status(400).json({ message: '该举报已处理，无法重复操作' });
  }

  const now = new Date().toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  }).replace(/\//g, '-');

  if (result === 'take_down') {
    const target = takeDownContent(
      report.targetType,
      report.targetId,
      remark || '违反社区规范',
      handlerId || 'admin-1',
      handlerName || '管理员'
    );

    if (!target) {
      return res.status(404).json({ message: '下架目标不存在' });
    }

    const targetInfo = getTargetInfo(report.targetType, report.targetId);
    if (targetInfo.authorId) {
      const typeLabel = report.targetType === 'story' ? '故事'
        : report.targetType === 'comment' ? '评论' : '世界设定条目';
      createNotification({
        userId: targetInfo.authorId,
        type: 'content_taken_down',
        content: `你的${typeLabel}《${report.targetTitle}》因「${remark || '违反社区规范'}」已被下架`,
        relatedId: report.targetId,
        relatedType: report.targetType,
        relatedTitle: report.targetTitle,
        extra: {
          reason: remark || '违反社区规范',
          reportId: id,
          handlerName: handlerName || '管理员'
        }
      });
    }

    report.status = 'resolved';
    report.handleResult = 'take_down';
    report.handleRemark = remark || '违反社区规范';
    report.handledAt = now;
    report.handlerId = handlerId || 'admin-1';
    report.handlerName = handlerName || '管理员';
  } else if (result === 'dismiss') {
    report.status = 'rejected';
    report.handleResult = 'dismiss';
    report.handleRemark = remark || '举报不成立';
    report.handledAt = now;
    report.handlerId = handlerId || 'admin-1';
    report.handlerName = handlerName || '管理员';
  }

  if (report.reporterId && report.reporterId !== 'anonymous') {
    createNotification({
      userId: report.reporterId,
      type: 'report_result',
      content: `你举报的内容《${report.targetTitle}》已处理：${result === 'take_down' ? '已下架' : '举报不成立'}`,
      relatedId: id,
      relatedType: 'report',
      relatedTitle: report.targetTitle,
      extra: {
        result,
        remark: remark || '',
        handlerName: handlerName || '管理员'
      }
    });
  }

  updateReportStats();

  res.json({
    success: true,
    report,
    message: result === 'take_down' ? '内容已下架' : '举报已驳回'
  });
});

router.get('/user/:userId', (req, res) => {
  const { userId } = req.params;
  const { page = 1, limit = 10, status } = req.query;
  const pageNum = parseInt(page);
  const limitNum = parseInt(limit);

  let result = reportsData.filter(r => r.reporterId === userId);

  if (status) {
    result = result.filter(r => r.status === status);
  }

  result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  const start = (pageNum - 1) * limitNum;
  const end = start + limitNum;
  const paginated = result.slice(start, end);

  res.json({
    total: result.length,
    page: pageNum,
    limit: limitNum,
    reports: paginated
  });
});

module.exports = router;
