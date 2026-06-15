const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const store = require('../data/store');

let creationTasksData = store.creationTasks;
let userTaskProgressData = store.userTaskProgress;
let taskSubmissionsData = store.taskSubmissions;
let taskRewardsData = store.taskRewards;
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
  const { status, type, difficulty, userId, page = 1, limit = 10 } = req.query;
  let result = [...creationTasksData];

  if (status) {
    result = result.filter(t => t.status === status);
  }

  if (type) {
    result = result.filter(t => t.type === type);
  }

  if (difficulty) {
    result = result.filter(t => t.difficulty === difficulty);
  }

  result.sort((a, b) => {
    if (a.status === 'active' && b.status !== 'active') return -1;
    if (a.status !== 'active' && b.status === 'active') return 1;
    return new Date(b.createdAt) - new Date(a.createdAt);
  });

  const start = (page - 1) * limit;
  const end = start + parseInt(limit);
  const paginatedResult = result.slice(start, end);

  let tasksWithProgress = paginatedResult;
  if (userId) {
    tasksWithProgress = paginatedResult.map(task => {
      const progress = userTaskProgressData.find(p => p.taskId === task.id && p.userId === userId);
      return {
        ...task,
        userProgress: progress || null
      };
    });
  }

  res.json({
    total: result.length,
    page: parseInt(page),
    limit: parseInt(limit),
    tasks: tasksWithProgress
  });
});

router.get('/featured', (req, res) => {
  const active = creationTasksData.filter(t => t.status === 'active');
  const sorted = active.sort((a, b) => b.totalParticipants - a.totalParticipants);
  res.json({
    featured: sorted.slice(0, 3)
  });
});

router.get('/:id', (req, res) => {
  const task = creationTasksData.find(t => t.id === req.params.id);
  if (!task) {
    return res.status(404).json({ message: '任务不存在' });
  }
  res.json(task);
});

router.get('/:id/stats', (req, res) => {
  const taskId = req.params.id;
  const task = creationTasksData.find(t => t.id === taskId);
  if (!task) {
    return res.status(404).json({ message: '任务不存在' });
  }

  const participants = userTaskProgressData.filter(p => p.taskId === taskId);
  const completed = participants.filter(p => p.status === 'completed');
  const inProgress = participants.filter(p => p.status === 'in_progress');
  const submissions = taskSubmissionsData.filter(s => s.taskId === taskId);

  const stageStats = task.stages.map(stage => {
    const stageSubmissions = submissions.filter(s => s.stageId === stage.id);
    const approved = stageSubmissions.filter(s => s.status === 'approved');
    const pending = stageSubmissions.filter(s => s.status === 'pending');
    return {
      stageId: stage.id,
      stageName: stage.name,
      totalSubmissions: stageSubmissions.length,
      approvedCount: approved.length,
      pendingCount: pending.length
    };
  });

  res.json({
    taskId,
    totalParticipants: task.totalParticipants,
    completedCount: completed.length,
    inProgressCount: inProgress.length,
    totalSubmissions: submissions.length,
    completionRate: task.totalParticipants > 0 
      ? ((completed.length / task.totalParticipants) * 100).toFixed(1) + '%' 
      : '0%',
    stageStats
  });
});

router.get('/user/:userId/my-tasks', (req, res) => {
  const { userId } = req.params;
  const { status, page = 1, limit = 10 } = req.query;
  
  let progressList = userTaskProgressData.filter(p => p.userId === userId);
  
  if (status) {
    progressList = progressList.filter(p => p.status === status);
  }

  progressList.sort((a, b) => new Date(b.joinedAt) - new Date(a.joinedAt));

  const start = (page - 1) * limit;
  const end = start + parseInt(limit);
  const paginatedProgress = progressList.slice(start, end);

  const result = paginatedProgress.map(progress => {
    const task = creationTasksData.find(t => t.id === progress.taskId);
    return {
      ...progress,
      task
    };
  });

  res.json({
    total: progressList.length,
    page: parseInt(page),
    limit: parseInt(limit),
    myTasks: result
  });
});

router.get('/:id/progress/:userId', (req, res) => {
  const { id, userId } = req.params;
  const progress = userTaskProgressData.find(p => p.taskId === id && p.userId === userId);
  
  if (!progress) {
    return res.json({ progress: null });
  }

  const task = creationTasksData.find(t => t.id === id);
  const submissions = taskSubmissionsData.filter(s => s.taskId === id && s.userId === userId);

  res.json({
    progress,
    task,
    submissions
  });
});

router.post('/:id/join', (req, res) => {
  const { id } = req.params;
  const { userId, username, avatar } = req.body;

  const task = creationTasksData.find(t => t.id === id);
  if (!task) {
    return res.status(404).json({ message: '任务不存在' });
  }

  if (task.status !== 'active') {
    return res.status(400).json({ message: '该任务当前不可参与' });
  }

  const existingProgress = userTaskProgressData.find(p => p.taskId === id && p.userId === userId);
  if (existingProgress) {
    return res.status(400).json({ message: '你已经参与了该任务' });
  }

  const stages = task.stages.map((stage, index) => ({
    stageId: stage.id,
    status: index === 0 ? 'in_progress' : 'pending',
    submittedAt: null,
    reviewedAt: null,
    reviewStatus: null,
    reviewComment: null,
    rewardClaimed: false
  }));

  const newProgress = {
    id: `progress-${uuidv4()}`,
    taskId: id,
    userId,
    username,
    avatar,
    storyId: null,
    storyTitle: null,
    currentStage: 1,
    overallProgress: 0,
    status: 'in_progress',
    joinedAt: formatDate(),
    stages,
    totalPointsEarned: 0,
    badgesEarned: []
  };

  userTaskProgressData.push(newProgress);
  task.totalParticipants++;

  createNotification(
    userId,
    'task',
    `你已成功加入「${task.title}」创作任务，开始你的创作之旅吧！`,
    id,
    'creationTask',
    {
      relatedTitle: task.title,
      taskType: task.type
    }
  );

  res.json({
    message: '参与成功',
    progress: newProgress
  });
});

router.post('/:id/submit', (req, res) => {
  const { id } = req.params;
  const { userId, username, avatar, stageId, content, attachments = [] } = req.body;

  const task = creationTasksData.find(t => t.id === id);
  if (!task) {
    return res.status(404).json({ message: '任务不存在' });
  }

  const progress = userTaskProgressData.find(p => p.taskId === id && p.userId === userId);
  if (!progress) {
    return res.status(400).json({ message: '请先参与该任务' });
  }

  const stageProgress = progress.stages.find(s => s.stageId === stageId);
  if (!stageProgress) {
    return res.status(404).json({ message: '阶段不存在' });
  }

  if (stageProgress.status !== 'in_progress') {
    return res.status(400).json({ message: '该阶段不可提交' });
  }

  const newSubmission = {
    id: `submission-task-${uuidv4()}`,
    taskId: id,
    stageId,
    userId,
    username,
    avatar,
    content,
    attachments,
    submittedAt: formatDate(),
    status: 'pending',
    reviewedBy: null,
    reviewedAt: null,
    reviewComment: null
  };

  taskSubmissionsData.push(newSubmission);
  stageProgress.status = 'in_review';
  stageProgress.submittedAt = formatDate();
  stageProgress.reviewStatus = 'pending';

  createNotification(
    userId,
    'task',
    `「${task.title}」第${progress.currentStage}阶段作品已提交，等待审核中...`,
    id,
    'creationTask',
    {
      relatedTitle: task.title,
      stageId
    }
  );

  res.json({
    message: '提交成功',
    submission: newSubmission,
    progress
  });
});

router.put('/submissions/:submissionId/review', (req, res) => {
  const { submissionId } = req.params;
  const { status, reviewComment, reviewedBy } = req.body;

  const submission = taskSubmissionsData.find(s => s.id === submissionId);
  if (!submission) {
    return res.status(404).json({ message: '提交记录不存在' });
  }

  submission.status = status;
  submission.reviewComment = reviewComment;
  submission.reviewedBy = reviewedBy;
  submission.reviewedAt = formatDate();

  const progress = userTaskProgressData.find(
    p => p.taskId === submission.taskId && p.userId === submission.userId
  );

  if (progress) {
    const stageProgress = progress.stages.find(s => s.stageId === submission.stageId);
    if (stageProgress) {
      stageProgress.status = status === 'approved' ? 'completed' : 'in_progress';
      stageProgress.reviewStatus = status;
      stageProgress.reviewedAt = formatDate();
      stageProgress.reviewComment = reviewComment;

      if (status === 'approved') {
        stageProgress.rewardClaimed = true;
        const task = creationTasksData.find(t => t.id === submission.taskId);
        const stage = task.stages.find(s => s.id === submission.stageId);
        
        if (stage && stage.reward && stage.reward.points) {
          progress.totalPointsEarned += stage.reward.points;
          
          const newReward = {
            id: `reward-${uuidv4()}`,
            userId: submission.userId,
            taskId: submission.taskId,
            stageId: submission.stageId,
            type: 'points',
            value: stage.reward.points,
            description: `完成「${task.title}」${stage.name}奖励`,
            claimedAt: formatDate()
          };
          taskRewardsData.push(newReward);
        }

        const currentStageOrder = task.stages.findIndex(s => s.id === submission.stageId);
        if (currentStageOrder < task.stages.length - 1) {
          progress.currentStage = currentStageOrder + 2;
          const nextStage = progress.stages[currentStageOrder + 1];
          if (nextStage) {
            nextStage.status = 'in_progress';
          }
        } else {
          progress.status = 'completed';
          task.completedCount++;
          
          if (task.rewards && task.rewards.badge) {
            progress.badgesEarned.push(task.rewards.badge);
            
            const badgeReward = {
              id: `reward-${uuidv4()}`,
              userId: submission.userId,
              taskId: submission.taskId,
              stageId: null,
              type: 'badge',
              value: task.rewards.badge,
              description: `获得「${task.rewards.badge}」专属徽章`,
              claimedAt: formatDate()
            };
            taskRewardsData.push(badgeReward);
          }
        }

        const completedStages = progress.stages.filter(s => s.status === 'completed').length;
        progress.overallProgress = Math.round((completedStages / task.stages.length) * 100);

        createNotification(
          submission.userId,
          'task',
          `🎉 恭喜！「${task.title}」第${currentStageOrder + 1}阶段审核通过，获得${stage.reward.points}积分奖励！`,
          submission.taskId,
          'creationTask',
          {
            relatedTitle: task.title,
            reward: stage.reward.description,
            isCompleted: progress.status === 'completed'
          }
        );
      } else if (status === 'rejected') {
        createNotification(
          submission.userId,
          'task',
          `「${task.title}」作品审核未通过：${reviewComment}`,
          submission.taskId,
          'creationTask',
          {
            relatedTitle: task.title,
            stageId: submission.stageId
          }
        );
      }
    }
  }

  res.json({
    message: '审核完成',
    submission,
    progress
  });
});

router.get('/user/:userId/rewards', (req, res) => {
  const { userId } = req.params;
  const rewards = taskRewardsData.filter(r => r.userId === userId);
  
  const totalPoints = rewards
    .filter(r => r.type === 'points')
    .reduce((sum, r) => sum + r.value, 0);
  
  const badges = rewards
    .filter(r => r.type === 'badge')
    .map(r => r.value);

  res.json({
    totalPoints,
    badges,
    rewardHistory: rewards.sort((a, b) => new Date(b.claimedAt) - new Date(a.claimedAt))
  });
});

router.get('/:id/submissions', (req, res) => {
  const { id } = req.params;
  const { stageId, status, userId, page = 1, limit = 10 } = req.query;

  let submissions = taskSubmissionsData.filter(s => s.taskId === id);

  if (stageId) {
    submissions = submissions.filter(s => s.stageId === stageId);
  }

  if (status) {
    submissions = submissions.filter(s => s.status === status);
  }

  if (userId) {
    submissions = submissions.filter(s => s.userId === userId);
  }

  submissions.sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt));

  const start = (page - 1) * limit;
  const end = start + parseInt(limit);
  const paginated = submissions.slice(start, end);

  res.json({
    total: submissions.length,
    page: parseInt(page),
    limit: parseInt(limit),
    submissions: paginated
  });
});

module.exports = router;
