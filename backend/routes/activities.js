const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const store = require('../data/store');

let activitiesData = store.activities;
let registrationsData = store.activityRegistrations;
let submissionsData = store.activitySubmissions;
let rankingsData = store.activityRankings;
let sharesData = store.activityShares;
let votesData = store.activityVotes;
let notificationsData = store.notifications;

const formatDate = () => {
  return new Date().toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  }).replace(/\//g, '-');
};

const createNotification = (userId, type, content, relatedId, relatedType, extra = {}) => {
  const notification = {
    id: `notif-${uuidv4()}`,
    userId,
    type,
    content,
    relatedId,
    relatedType,
    isRead: false,
    createdAt: formatDate(),
    ...extra
  };
  notificationsData.unshift(notification);
  return notification;
};

router.get('/', (req, res) => {
  const { status, tag, sort, page = 1, limit = 10 } = req.query;
  let result = [...activitiesData];

  if (status) {
    result = result.filter(a => a.status === status);
  }

  if (tag) {
    result = result.filter(a => a.tags.includes(tag));
  }

  if (sort === 'newest') {
    result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  } else if (sort === 'popular') {
    result.sort((a, b) => b.viewCount - a.viewCount);
  } else if (sort === 'ending') {
    result.sort((a, b) => new Date(a.endTime) - new Date(b.endTime));
  }

  const start = (page - 1) * limit;
  const end = start + parseInt(limit);
  const paginatedResult = result.slice(start, end);

  res.json({
    total: result.length,
    page: parseInt(page),
    limit: parseInt(limit),
    activities: paginatedResult
  });
});

router.get('/featured', (req, res) => {
  const ongoing = activitiesData.filter(a => a.status === 'ongoing');
  const sorted = ongoing.sort((a, b) => b.viewCount - a.viewCount);
  res.json({
    featured: sorted.slice(0, 3)
  });
});

router.get('/:id', (req, res) => {
  const activity = activitiesData.find(a => a.id === req.params.id);
  if (!activity) {
    return res.status(404).json({ message: '活动不存在' });
  }
  activity.viewCount = (activity.viewCount || 0) + 1;
  res.json(activity);
});

router.get('/:id/stats', (req, res) => {
  const activityId = req.params.id;
  const activity = activitiesData.find(a => a.id === activityId);
  if (!activity) {
    return res.status(404).json({ message: '活动不存在' });
  }

  const registrations = registrationsData.filter(r => r.activityId === activityId);
  const submissions = submissionsData.filter(s => s.activityId === activityId);
  const approvedSubmissions = submissions.filter(s => s.status === 'approved');
  const shares = sharesData.filter(s => s.activityId === activityId);
  const totalClicks = shares.reduce((sum, s) => sum + s.clickCount, 0);
  const totalRegisters = shares.reduce((sum, s) => sum + s.registerCount, 0);
  const totalSubmits = shares.reduce((sum, s) => sum + s.submitCount, 0);

  const channelStats = {};
  shares.forEach(share => {
    if (!channelStats[share.channel]) {
      channelStats[share.channel] = { clickCount: 0, registerCount: 0, submitCount: 0, shareCount: 0 };
    }
    channelStats[share.channel].clickCount += share.clickCount;
    channelStats[share.channel].registerCount += share.registerCount;
    channelStats[share.channel].submitCount += share.submitCount;
    channelStats[share.channel].shareCount += 1;
  });

  res.json({
    activityId,
    viewCount: activity.viewCount,
    shareCount: activity.shareCount,
    registrationCount: registrations.length,
    submissionCount: submissions.length,
    approvedSubmissionCount: approvedSubmissions.length,
    totalVotes: approvedSubmissions.reduce((sum, s) => sum + s.voteCount, 0),
    totalViews: approvedSubmissions.reduce((sum, s) => sum + s.viewCount, 0),
    propagation: {
      totalShares: shares.length,
      totalClicks,
      totalRegisters,
      totalSubmits,
      conversionRate: totalClicks > 0 ? ((totalRegisters / totalClicks) * 100).toFixed(2) + '%' : '0%',
      channelStats
    }
  });
});

router.post('/', (req, res) => {
  const {
    title, subtitle, description, theme, cover, banner,
    rules, prizes, tags, organizerId, organizerName, organizerAvatar,
    startTime, endTime, registrationEndTime, maxParticipants
  } = req.body;

  const newActivity = {
    id: `activity-${uuidv4()}`,
    title,
    subtitle,
    description,
    theme,
    cover: cover || '🎯',
    banner: banner || '',
    rules: rules || [],
    prizes: prizes || [],
    tags: tags || [],
    organizerId: organizerId || 'system',
    organizerName: organizerName || '浮城回声官方',
    organizerAvatar: organizerAvatar || '🏛️',
    startTime,
    endTime,
    registrationEndTime,
    status: 'upcoming',
    maxParticipants: maxParticipants || 1000,
    viewCount: 0,
    shareCount: 0,
    participantCount: 0,
    submissionCount: 0,
    createdAt: formatDate()
  };

  activitiesData.unshift(newActivity);
  res.status(201).json(newActivity);
});

router.put('/:id', (req, res) => {
  const activity = activitiesData.find(a => a.id === req.params.id);
  if (!activity) {
    return res.status(404).json({ message: '活动不存在' });
  }

  const updatableFields = [
    'title', 'subtitle', 'description', 'theme', 'cover', 'banner',
    'rules', 'prizes', 'tags', 'startTime', 'endTime', 'registrationEndTime',
    'maxParticipants', 'status'
  ];

  updatableFields.forEach(field => {
    if (req.body[field] !== undefined) {
      activity[field] = req.body[field];
    }
  });

  res.json(activity);
});

router.delete('/:id', (req, res) => {
  const index = activitiesData.findIndex(a => a.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ message: '活动不存在' });
  }

  activitiesData.splice(index, 1);
  res.json({ message: '活动已删除' });
});

router.post('/:id/register', (req, res) => {
  const activityId = req.params.id;
  const activity = activitiesData.find(a => a.id === activityId);
  if (!activity) {
    return res.status(404).json({ message: '活动不存在' });
  }

  const { userId, username, avatar, penName, contactInfo, motivation, shareId } = req.body;

  const existingRegistration = registrationsData.find(
    r => r.activityId === activityId && r.userId === userId
  );
  if (existingRegistration) {
    return res.status(400).json({ message: '您已报名该活动' });
  }

  const newRegistration = {
    id: `reg-${uuidv4()}`,
    activityId,
    userId,
    username,
    avatar,
    penName: penName || username,
    contactInfo,
    motivation,
    status: 'approved',
    registeredAt: formatDate(),
    reviewedAt: formatDate(),
    sourceShareId: shareId || null
  };

  registrationsData.unshift(newRegistration);
  activity.participantCount = (activity.participantCount || 0) + 1;

  createNotification(
    userId,
    'activity',
    `您已成功报名活动「${activity.title}」，期待您的作品！`,
    activityId,
    'activity'
  );

  if (shareId) {
    const share = sharesData.find(s => s.id === shareId);
    if (share) {
      share.registerCount += 1;
    }
  }

  res.status(201).json(newRegistration);
});

router.get('/:id/registrations', (req, res) => {
  const activityId = req.params.id;
  const { userId, status, page = 1, limit = 20 } = req.query;

  let result = registrationsData.filter(r => r.activityId === activityId);

  if (userId) {
    result = result.filter(r => r.userId === userId);
  }
  if (status) {
    result = result.filter(r => r.status === status);
  }

  result.sort((a, b) => new Date(b.registeredAt) - new Date(a.registeredAt));

  const start = (page - 1) * limit;
  const end = start + parseInt(limit);
  const paginatedResult = result.slice(start, end);

  res.json({
    total: result.length,
    page: parseInt(page),
    limit: parseInt(limit),
    registrations: paginatedResult
  });
});

router.get('/:id/registration/check', (req, res) => {
  const activityId = req.params.id;
  const { userId } = req.query;

  const registration = registrationsData.find(
    r => r.activityId === activityId && r.userId === userId
  );

  res.json({
    isRegistered: !!registration,
    registration: registration || null
  });
});

router.post('/:id/submit', (req, res) => {
  const activityId = req.params.id;
  const activity = activitiesData.find(a => a.id === activityId);
  if (!activity) {
    return res.status(404).json({ message: '活动不存在' });
  }

  const {
    userId, username, avatar, storyId, storyTitle, summary, cover, tags,
    wordCount, endingCount, shareId
  } = req.body;

  const registration = registrationsData.find(
    r => r.activityId === activityId && r.userId === userId
  );
  if (!registration || registration.status !== 'approved') {
    return res.status(400).json({ message: '请先报名该活动' });
  }

  const effectiveShareId = shareId || (registration.sourceShareId) || null;

  const newSubmission = {
    id: `submission-${uuidv4()}`,
    activityId,
    userId,
    username,
    avatar,
    storyId,
    storyTitle,
    summary,
    cover: cover || '📖',
    tags: tags || [],
    wordCount: wordCount || 0,
    endingCount: endingCount || 0,
    status: 'pending',
    reviewComment: null,
    submittedAt: formatDate(),
    reviewedAt: null,
    voteCount: 0,
    viewCount: 0,
    score: 0,
    sourceShareId: effectiveShareId
  };

  submissionsData.unshift(newSubmission);
  activity.submissionCount = (activity.submissionCount || 0) + 1;

  createNotification(
    userId,
    'activity',
    `您的作品「${storyTitle}」已成功提交至活动「${activity.title}」，请等待审核~`,
    newSubmission.id,
    'submission'
  );

  if (effectiveShareId) {
    const share = sharesData.find(s => s.id === effectiveShareId);
    if (share) {
      share.submitCount += 1;
    }
  }

  res.status(201).json(newSubmission);
});

router.get('/:id/submissions', (req, res) => {
  const activityId = req.params.id;
  const { userId, status, sort, page = 1, limit = 20 } = req.query;

  let result = submissionsData.filter(s => s.activityId === activityId);

  if (userId) {
    result = result.filter(s => s.userId === userId);
  }
  if (status) {
    result = result.filter(s => s.status === status);
  } else {
    result = result.filter(s => s.status === 'approved');
  }

  if (sort === 'votes') {
    result.sort((a, b) => b.voteCount - a.voteCount);
  } else if (sort === 'views') {
    result.sort((a, b) => b.viewCount - a.viewCount);
  } else if (sort === 'score') {
    result.sort((a, b) => b.score - a.score);
  } else {
    result.sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt));
  }

  const start = (page - 1) * limit;
  const end = start + parseInt(limit);
  const paginatedResult = result.slice(start, end);

  res.json({
    total: result.length,
    page: parseInt(page),
    limit: parseInt(limit),
    submissions: paginatedResult
  });
});

router.get('/submissions/:submissionId', (req, res) => {
  const submission = submissionsData.find(s => s.id === req.params.submissionId);
  if (!submission) {
    return res.status(404).json({ message: '作品不存在' });
  }
  submission.viewCount = (submission.viewCount || 0) + 1;
  res.json(submission);
});

router.put('/submissions/:submissionId/review', (req, res) => {
  const submission = submissionsData.find(s => s.id === req.params.submissionId);
  if (!submission) {
    return res.status(404).json({ message: '作品不存在' });
  }

  const { status, reviewComment, score } = req.body;

  if (status !== undefined) submission.status = status;
  if (reviewComment !== undefined) submission.reviewComment = reviewComment;
  if (score !== undefined) submission.score = score;
  submission.reviewedAt = formatDate();

  if (status === 'approved') {
    createNotification(
      submission.userId,
      'activity',
      `恭喜！您的作品「${submission.storyTitle}」已通过审核，快去拉票吧~`,
      submission.id,
      'submission'
    );
  } else if (status === 'rejected') {
    createNotification(
      submission.userId,
      'activity',
      `很遗憾，您的作品「${submission.storyTitle}」未通过审核：${reviewComment || '请查看详情'}`,
      submission.id,
      'submission'
    );
  }

  res.json(submission);
});

router.post('/submissions/:submissionId/vote', (req, res) => {
  const submission = submissionsData.find(s => s.id === req.params.submissionId);
  if (!submission) {
    return res.status(404).json({ message: '作品不存在' });
  }

  const { userId } = req.body;

  const existingVote = votesData.find(
    v => v.activityId === submission.activityId && v.submissionId === submission.id && v.userId === userId
  );
  if (existingVote) {
    return res.status(400).json({ message: '您已为该作品投过票' });
  }

  const newVote = {
    id: `vote-${uuidv4()}`,
    activityId: submission.activityId,
    submissionId: submission.id,
    userId,
    createdAt: formatDate()
  };
  votesData.unshift(newVote);
  submission.voteCount = (submission.voteCount || 0) + 1;

  res.json({ voteCount: submission.voteCount });
});

router.get('/:id/ranking', (req, res) => {
  const activityId = req.params.id;
  const activity = activitiesData.find(a => a.id === activityId);
  if (!activity) {
    return res.status(404).json({ message: '活动不存在' });
  }

  const { type = 'votes', limit = 50 } = req.query;

  let approvedSubmissions = submissionsData.filter(
    s => s.activityId === activityId && s.status === 'approved'
  );

  if (type === 'votes') {
    approvedSubmissions.sort((a, b) => b.voteCount - a.voteCount);
  } else if (type === 'views') {
    approvedSubmissions.sort((a, b) => b.viewCount - a.viewCount);
  } else if (type === 'score') {
    approvedSubmissions.sort((a, b) => b.score - a.score);
  } else if (type === 'comprehensive') {
    approvedSubmissions.sort((a, b) => {
      const scoreA = (a.score * 40) + (a.voteCount * 30) + (a.viewCount * 0.03);
      const scoreB = (b.score * 40) + (b.voteCount * 30) + (b.viewCount * 0.03);
      return scoreB - scoreA;
    });
  }

  const ranking = approvedSubmissions.slice(0, parseInt(limit)).map((s, index) => ({
    rank: index + 1,
    submissionId: s.id,
    userId: s.userId,
    username: s.username,
    avatar: s.avatar,
    storyId: s.storyId,
    storyTitle: s.storyTitle,
    summary: s.summary,
    cover: s.cover,
    score: s.score,
    voteCount: s.voteCount,
    viewCount: s.viewCount
  }));

  res.json({
    activityId,
    activityTitle: activity.title,
    type,
    ranking
  });
});

router.post('/:id/share', (req, res) => {
  const activityId = req.params.id;
  const activity = activitiesData.find(a => a.id === activityId);
  if (!activity) {
    return res.status(404).json({ message: '活动不存在' });
  }

  const { userId, username, avatar, channel = 'other', shareType = 'activity', targetId, targetType } = req.body;

  const newShare = {
    id: `share-${uuidv4()}`,
    activityId,
    userId,
    username,
    avatar,
    channel,
    shareType,
    targetId: targetId || activityId,
    targetType: targetType || 'activity',
    clickCount: 0,
    registerCount: 0,
    submitCount: 0,
    createdAt: formatDate()
  };

  sharesData.unshift(newShare);
  activity.shareCount = (activity.shareCount || 0) + 1;

  res.status(201).json(newShare);
});

router.post('/share/:shareId/click', (req, res) => {
  const share = sharesData.find(s => s.id === req.params.shareId);
  if (!share) {
    return res.status(404).json({ message: '分享记录不存在' });
  }

  share.clickCount = (share.clickCount || 0) + 1;

  res.json({
    shareId: share.id,
    clickCount: share.clickCount,
    activityId: share.activityId,
    targetId: share.targetId,
    targetType: share.targetType
  });
});

router.get('/:id/propagation', (req, res) => {
  const activityId = req.params.id;
  const activity = activitiesData.find(a => a.id === activityId);
  if (!activity) {
    return res.status(404).json({ message: '活动不存在' });
  }

  const { channel, userId } = req.query;

  let shares = sharesData.filter(s => s.activityId === activityId);
  if (channel) {
    shares = shares.filter(s => s.channel === channel);
  }
  if (userId) {
    shares = shares.filter(s => s.userId === userId);
  }

  shares.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  const totalClicks = shares.reduce((sum, s) => sum + s.clickCount, 0);
  const totalRegisters = shares.reduce((sum, s) => sum + s.registerCount, 0);
  const totalSubmits = shares.reduce((sum, s) => sum + s.submitCount, 0);

  const channelBreakdown = {};
  shares.forEach(share => {
    if (!channelBreakdown[share.channel]) {
      channelBreakdown[share.channel] = {
        shareCount: 0,
        clickCount: 0,
        registerCount: 0,
        submitCount: 0,
        avgClicks: 0
      };
    }
    channelBreakdown[share.channel].shareCount += 1;
    channelBreakdown[share.channel].clickCount += share.clickCount;
    channelBreakdown[share.channel].registerCount += share.registerCount;
    channelBreakdown[share.channel].submitCount += share.submitCount;
  });

  Object.keys(channelBreakdown).forEach(ch => {
    channelBreakdown[ch].avgClicks = channelBreakdown[ch].shareCount > 0
      ? (channelBreakdown[ch].clickCount / channelBreakdown[ch].shareCount).toFixed(2)
      : 0;
    channelBreakdown[ch].conversionRate = channelBreakdown[ch].clickCount > 0
      ? ((channelBreakdown[ch].registerCount / channelBreakdown[ch].clickCount) * 100).toFixed(2) + '%'
      : '0%';
  });

  const topSpreaders = shares
    .filter(s => s.clickCount > 0)
    .sort((a, b) => b.clickCount - a.clickCount)
    .slice(0, 10)
    .map(s => ({
      userId: s.userId,
      username: s.username,
      avatar: s.avatar,
      channel: s.channel,
      clickCount: s.clickCount,
      registerCount: s.registerCount,
      submitCount: s.submitCount,
      influenceScore: s.clickCount * 1 + s.registerCount * 5 + s.submitCount * 10
    }));

  res.json({
    activityId,
    activityTitle: activity.title,
    summary: {
      totalShares: shares.length,
      totalClicks,
      totalRegisters,
      totalSubmits,
      overallConversionRate: totalClicks > 0 ? ((totalRegisters / totalClicks) * 100).toFixed(2) + '%' : '0%',
      funnelData: [
        { stage: '曝光', count: activity.viewCount, label: '活动浏览' },
        { stage: '分享', count: shares.length, label: '分享次数' },
        { stage: '点击', count: totalClicks, label: '点击访问' },
        { stage: '报名', count: totalRegisters, label: '成功报名' },
        { stage: '投稿', count: totalSubmits, label: '作品提交' }
      ]
    },
    channelBreakdown,
    topSpreaders,
    shareRecords: shares.slice(0, 50)
  });
});

router.get('/user/:userId/my-activities', (req, res) => {
  const userId = req.params.userId;
  const { type } = req.query;

  const registrations = registrationsData.filter(r => r.userId === userId);
  const submissions = submissionsData.filter(s => s.userId === userId);

  let activityIds = [];
  if (type === 'registered' || !type) {
    activityIds = [...new Set([...activityIds, ...registrations.map(r => r.activityId)])];
  }
  if (type === 'submitted' || !type) {
    activityIds = [...new Set([...activityIds, ...submissions.map(s => s.activityId)])];
  }

  const myActivities = activityIds.map(activityId => {
    const activity = activitiesData.find(a => a.id === activityId);
    const registration = registrations.find(r => r.activityId === activityId);
    const userSubmissions = submissions.filter(s => s.activityId === activityId);
    return {
      activity,
      registration,
      submissions: userSubmissions
    };
  }).filter(item => item.activity);

  res.json({
    total: myActivities.length,
    myActivities
  });
});

module.exports = router;
