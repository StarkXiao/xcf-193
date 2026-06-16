const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const store = require('../data/store');
const { createNotification } = require('./notifications');

let reportsData = store.reports;
let storiesData = store.stories;
let worldSettingsData = store.worldSettings;
let commentsData = store.comments;
let storyNodesData = store.storyNodes;

const REPORT_REASONS = [
  { value: 'spam', label: '垃圾信息/广告' },
  { value: 'inappropriate', label: '不当内容' },
  { value: 'harassment', label: '骚扰/霸凌' },
  { value: 'violence', label: '暴力/血腥' },
  { value: 'hate', label: '仇恨言论' },
  { value: 'copyright', label: '侵权/抄袭' },
  { value: 'misinformation', label: '虚假信息' },
  { value: 'other', label: '其他' }
];

const TARGET_TYPES = ['story', 'comment', 'world_entry'];

const getTargetInfo = (targetType, targetId) => {
  switch (targetType) {
    case 'story': {
      const story = storiesData.find(s => s.id === targetId);
      if (!story) return null;
      return {
        title: story.title,
        authorId: story.authorId,
        authorName: story.authorName,
        cover: story.cover
      };
    }
    case 'comment': {
      for (const storyId in commentsData) {
        const comment = commentsData[storyId].find(c => c.id === targetId);
        if (comment) {
          const story = storiesData.find(s => s.id === storyId);
          return {
            title: comment.content.length > 40 ? comment.content.substring(0, 40) + '...' : comment.content,
            authorId: comment.userId,
            authorName: comment.username,
            cover: comment.avatar,
            storyId,
            storyTitle: story ? story.title : '未知'
          };
        }
      }
      return null;
    }
    case 'world_entry': {
      for (const world of worldSettingsData) {
        const entry = world.entries?.find(e => e.id === targetId);
        if (entry) {
          return {
            title: entry.title,
            authorId: world.authorId,
            authorName: world.authorName,
            cover: world.cover,
            worldId: world.id,
            worldName: world.name
          };
        }
      }
      return null;
    }
    default:
      return null;
  }
};

router.get('/reasons', (req, res) => {
  res.json({ reasons: REPORT_REASONS });
});

router.post('/', (req, res) => {
  const { targetType, targetId, reason, description, reporterId, reporterName, reporterAvatar } = req.body;

  if (!TARGET_TYPES.includes(targetType)) {
    return res.status(400).json({ message: '无效的举报目标类型' });
  }
  if (!REPORT_REASONS.some(r => r.value === reason)) {
    return res.status(400).json({ message: '无效的举报原因' });
  }

  const targetInfo = getTargetInfo(targetType, targetId);
  if (!targetInfo) {
    return res.status(404).json({ message: '举报目标不存在' });
  }

  const existingReport = reportsData.find(
    r => r.targetType === targetType && r.targetId === targetId && r.reporterId === reporterId && r.status === 'pending'
  );
  if (existingReport) {
    return res.status(409).json({ message: '你已经举报过该内容，请等待处理' });
  }

  const report = {
    id: `report-${uuidv4()}`,
    targetType,
    targetId,
    targetTitle: targetInfo.title,
    targetAuthorId: targetInfo.authorId,
    targetAuthorName: targetInfo.authorName,
    reason,
    reasonLabel: REPORT_REASONS.find(r => r.value === reason)?.label || reason,
    description: description || '',
    reporterId: reporterId || 'anonymous',
    reporterName: reporterName || '匿名用户',
    reporterAvatar: reporterAvatar || '👤',
    status: 'pending',
    reviewRemark: '',
    reviewerId: null,
    reviewerName: null,
    reviewedAt: null,
    createdAt: new Date().toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    }).replace(/\//g, '-')
  };

  reportsData.unshift(report);
  res.status(201).json(report);
});

router.get('/', (req, res) => {
  const { status, targetType, reason, page = 1, limit = 10 } = req.query;
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

  const total = result.length;
  const start = (pageNum - 1) * limitNum;
  const paginated = result.slice(start, start + limitNum);

  res.json({
    total,
    page: pageNum,
    limit: limitNum,
    reports: paginated
  });
});

router.get('/stats', (req, res) => {
  const stats = {
    pending: reportsData.filter(r => r.status === 'pending').length,
    reviewing: reportsData.filter(r => r.status === 'reviewing').length,
    resolved_dismissed: reportsData.filter(r => r.status === 'dismissed').length,
    resolved_takedown: reportsData.filter(r => r.status === 'takedown').length,
    total: reportsData.length
  };

  const byType = {};
  TARGET_TYPES.forEach(t => {
    byType[t] = reportsData.filter(r => r.targetType === t && r.status === 'pending').length;
  });

  const byReason = {};
  REPORT_REASONS.forEach(r => {
    byReason[r.value] = {
      label: r.label,
      count: reportsData.filter(rp => rp.reason === r.value).length
    };
  });

  res.json({ stats, byType, byReason });
});

router.get('/:id', (req, res) => {
  const report = reportsData.find(r => r.id === req.params.id);
  if (!report) {
    return res.status(404).json({ message: '举报记录不存在' });
  }
  res.json(report);
});

const performTakedown = (targetType, targetId) => {
  switch (targetType) {
    case 'story': {
      const story = storiesData.find(s => s.id === targetId);
      if (story) {
        story.auditStatus = 'rejected';
        story.rejectReason = '因举报被下架';
        story.isTakenDown = true;
      }
      return story;
    }
    case 'comment': {
      for (const storyId in commentsData) {
        const comment = commentsData[storyId].find(c => c.id === targetId);
        if (comment) {
          comment.auditStatus = 'rejected';
          comment.rejectReason = '因举报被下架';
          comment.isTakenDown = true;
          return comment;
        }
      }
      return null;
    }
    case 'world_entry': {
      for (const world of worldSettingsData) {
        const entry = world.entries?.find(e => e.id === targetId);
        if (entry) {
          entry.isTakenDown = true;
          entry.takedownReason = '因举报被下架';
          return entry;
        }
      }
      return null;
    }
    default:
      return null;
  }
};

router.post('/:id/dismiss', (req, res) => {
  const { reviewerId, reviewerName, reviewRemark } = req.body;
  const report = reportsData.find(r => r.id === req.params.id);

  if (!report) {
    return res.status(404).json({ message: '举报记录不存在' });
  }
  if (report.status !== 'pending' && report.status !== 'reviewing') {
    return res.status(400).json({ message: '该举报已处理' });
  }

  report.status = 'dismissed';
  report.reviewerId = reviewerId || 'admin-1';
  report.reviewerName = reviewerName || '管理员';
  report.reviewRemark = reviewRemark || '举报不成立，驳回处理';
  report.reviewedAt = new Date().toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  }).replace(/\//g, '-');

  if (report.reporterId && report.reporterId !== 'anonymous') {
    const typeLabel = report.targetType === 'story' ? '故事' : report.targetType === 'comment' ? '评论' : '世界设定条目';
    createNotification({
      userId: report.reporterId,
      type: 'system',
      content: `你举报的${typeLabel}「${report.targetTitle}」经审核未构成违规，举报已驳回`,
      relatedId: report.id,
      relatedType: 'report',
      relatedTitle: report.targetTitle,
      extra: {
        reportId: report.id,
        action: 'dismissed'
      }
    });
  }

  res.json({ success: true, report });
});

router.post('/:id/takedown', (req, res) => {
  const { reviewerId, reviewerName, reviewRemark } = req.body;
  const report = reportsData.find(r => r.id === req.params.id);

  if (!report) {
    return res.status(404).json({ message: '举报记录不存在' });
  }
  if (report.status !== 'pending' && report.status !== 'reviewing') {
    return res.status(400).json({ message: '该举报已处理' });
  }

  const target = performTakedown(report.targetType, report.targetId);
  if (!target) {
    return res.status(404).json({ message: '举报目标已不存在' });
  }

  report.status = 'takedown';
  report.reviewerId = reviewerId || 'admin-1';
  report.reviewerName = reviewerName || '管理员';
  report.reviewRemark = reviewRemark || '举报成立，内容已下架';
  report.reviewedAt = new Date().toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  }).replace(/\//g, '-');

  const relatedReports = reportsData.filter(
    r => r.targetType === report.targetType && r.targetId === report.targetId && r.id !== report.id && (r.status === 'pending' || r.status === 'reviewing')
  );
  relatedReports.forEach(r => {
    r.status = 'takedown';
    r.reviewerId = reviewerId || 'admin-1';
    r.reviewerName = reviewerName || '管理员';
    r.reviewRemark = '关联内容已下架';
    r.reviewedAt = report.reviewedAt;
  });

  if (report.targetAuthorId) {
    const typeLabel = report.targetType === 'story' ? '故事' : report.targetType === 'comment' ? '评论' : '世界设定条目';
    createNotification({
      userId: report.targetAuthorId,
      type: 'system',
      content: `你的${typeLabel}「${report.targetTitle}」因收到举报并经审核确认违规，已被下架`,
      relatedId: report.targetId,
      relatedType: report.targetType,
      relatedTitle: report.targetTitle,
      extra: {
        reportId: report.id,
        action: 'takedown',
        reason: report.reasonLabel,
        reviewRemark: report.reviewRemark
      }
    });
  }

  if (report.reporterId && report.reporterId !== 'anonymous') {
    const typeLabel = report.targetType === 'story' ? '故事' : report.targetType === 'comment' ? '评论' : '世界设定条目';
    createNotification({
      userId: report.reporterId,
      type: 'system',
      content: `你举报的${typeLabel}「${report.targetTitle}」经审核确认违规，内容已下架`,
      relatedId: report.id,
      relatedType: 'report',
      relatedTitle: report.targetTitle,
      extra: {
        reportId: report.id,
        action: 'takedown'
      }
    });
  }

  res.json({
    success: true,
    report,
    relatedResolvedCount: relatedReports.length
  });
});

module.exports = router;
