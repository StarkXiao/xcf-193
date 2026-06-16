const express = require('express');
const router = express.Router();
const store = require('../data/store');
const { analyzeSentiment, analyzeSentiments } = require('../data/sentiment');

let storyPerformanceData = store.storyPerformance;
let readerProfilesData = store.readerProfiles;
let branchConversionsData = store.branchConversions;
let endingAchievementsData = store.endingAchievements;
let popularBranchesData = store.popularBranches;
let readerEndingDistributionData = store.readerEndingDistribution;
let settingReferenceTrendsData = store.settingReferenceTrends;
let nodeReadingEventsData = store.nodeReadingEvents;
let commentsData = store.comments;
let storyNodesData = store.storyNodes;

router.get('/author/:userId/performance', (req, res) => {
  const userId = req.params.userId;
  const performance = storyPerformanceData[userId];
  
  if (!performance) {
    return res.status(404).json({ message: '未找到该作者的作品表现数据' });
  }
  
  res.json(performance);
});

router.get('/author/:userId/reader-profile', (req, res) => {
  const userId = req.params.userId;
  const profile = readerProfilesData[userId];
  
  if (!profile) {
    return res.status(404).json({ message: '未找到该作者的读者画像数据' });
  }
  
  res.json(profile);
});

router.get('/story/:storyId/branch-conversions', (req, res) => {
  const storyId = req.params.storyId;
  const conversions = branchConversionsData[storyId];
  
  if (!conversions) {
    return res.status(404).json({ message: '未找到该故事的分支转化数据' });
  }
  
  res.json(conversions);
});

router.get('/author/:userId/setting-references', (req, res) => {
  const userId = req.params.userId;
  const trends = settingReferenceTrendsData[userId];
  
  if (!trends) {
    return res.status(404).json({ message: '未找到该作者的设定引用数据' });
  }
  
  res.json(trends);
});

router.get('/author/:userId/summary', (req, res) => {
  const userId = req.params.userId;
  const performance = storyPerformanceData[userId];
  const readerProfile = readerProfilesData[userId];
  const settingTrends = settingReferenceTrendsData[userId];
  
  if (!performance || !readerProfile || !settingTrends) {
    return res.status(404).json({ message: '未找到该作者的数据' });
  }
  
  res.json({
    performance: performance.summary,
    readerProfile: {
      demographics: readerProfile.demographics,
      readingHabits: readerProfile.preferences.readingHabits
    },
    settingReferences: settingTrends.summary
  });
});

router.get('/story/:storyId/ending-achievements', (req, res) => {
  const storyId = req.params.storyId;
  const achievements = endingAchievementsData[storyId];
  
  if (!achievements) {
    return res.status(404).json({ message: '未找到该故事的结局达成数据' });
  }
  
  res.json(achievements);
});

router.get('/story/:storyId/popular-branches', (req, res) => {
  const storyId = req.params.storyId;
  const { limit = 10, sortBy = 'selectCount' } = req.query;
  const branches = popularBranchesData[storyId];
  
  if (!branches) {
    return res.status(404).json({ message: '未找到该故事的热门分支数据' });
  }
  
  let ranking = [...branches.ranking];
  
  if (sortBy === 'selectRate') {
    ranking.sort((a, b) => b.selectRate - a.selectRate);
  } else {
    ranking.sort((a, b) => b.selectCount - a.selectCount);
  }
  
  ranking = ranking.slice(0, parseInt(limit));
  
  res.json({
    ...branches,
    ranking
  });
});

router.get('/author/:userId/ending-distribution', (req, res) => {
  const userId = req.params.userId;
  const { storyId } = req.query;
  const distribution = readerEndingDistributionData[userId];
  
  if (!distribution) {
    return res.status(404).json({ message: '未找到该作者的读者结局分布数据' });
  }
  
  if (storyId) {
    const storyDist = distribution.stories.find(s => s.storyId === storyId);
    if (!storyDist) {
      return res.status(404).json({ message: '未找到该故事的读者结局分布数据' });
    }
    return res.json({
      authorId: userId,
      story: storyDist,
      overallInsights: distribution.overallInsights
    });
  }
  
  res.json(distribution);
});

router.get('/story/:storyId/node-feedback', (req, res) => {
  const { storyId } = req.params;

  const events = nodeReadingEventsData[storyId] || [];
  const nodes = storyNodesData[storyId] || [];
  const storyComments = commentsData[storyId] || [];

  if (nodes.length === 0) {
    return res.status(404).json({ message: '未找到该故事的节点数据' });
  }

  const nodeEventMap = {};
  events.forEach(event => {
    if (!nodeEventMap[event.nodeId]) {
      nodeEventMap[event.nodeId] = [];
    }
    nodeEventMap[event.nodeId].push(event);
  });

  const nodeCommentsMap = {};
  storyComments.forEach(comment => {
    if (comment.nodeId) {
      if (!nodeCommentsMap[comment.nodeId]) {
        nodeCommentsMap[comment.nodeId] = [];
      }
      nodeCommentsMap[comment.nodeId].push(comment);
    }
  });

  const nodesData = nodes.map(node => {
    const nodeEvents = nodeEventMap[node.id] || [];
    const nodeComments = nodeCommentsMap[node.id] || [];

    const visitors = nodeEvents.length;

    const choiceEvents = nodeEvents.filter(e => e.selectedChoiceId && e.nextNodeId);
    const choseCount = choiceEvents.length;
    const dropOffCount = visitors - choseCount;
    const dropOffRate = visitors > 0 ? Math.round((dropOffCount / visitors) * 1000) / 10 : 0;

    const timeSpentValues = nodeEvents
      .filter(e => e.timeSpent > 0)
      .map(e => e.timeSpent);
    const avgTimeSpent = timeSpentValues.length > 0
      ? Math.round(timeSpentValues.reduce((a, b) => a + b, 0) / timeSpentValues.length)
      : 0;

    const choiceStats = [];
    if (node.choices && node.choices.length > 0) {
      node.choices.forEach(choice => {
        const count = choiceEvents.filter(e => e.selectedChoiceId === choice.id).length;
        const rate = choseCount > 0 ? Math.round((count / choseCount) * 1000) / 10 : 0;
        choiceStats.push({
          id: choice.id,
          text: choice.text,
          selectCount: count,
          selectRate: rate,
          nextNodeId: choice.nextNodeId
        });
      });
    }

    const sentimentResult = analyzeSentiments(nodeComments);

    const topComments = nodeComments
      .filter(c => !c.replyToCommentId)
      .sort((a, b) => b.likes - a.likes)
      .slice(0, 3)
      .map(c => ({
        id: c.id,
        content: c.content,
        username: c.username,
        avatar: c.avatar,
        likes: c.likes,
        sentiment: analyzeSentiment(c.content).label,
        createdAt: c.createdAt
      }));

    return {
      nodeId: node.id,
      title: node.title,
      isEnding: node.isEnding || false,
      visitors,
      choseCount,
      dropOffCount,
      dropOffRate,
      avgTimeSpent,
      choices: choiceStats,
      comments: {
        totalCount: nodeComments.length,
        sentiment: sentimentResult,
        topComments
      }
    };
  });

  const totalVisitors = nodesData.length > 0 ? nodesData[0].visitors : 0;
  const endingNodes = nodesData.filter(n => n.isEnding);
  const totalEndingReaches = endingNodes.reduce((sum, n) => sum + n.visitors, 0);
  const avgCompletionRate = totalVisitors > 0 ? Math.round((totalEndingReaches / totalVisitors) * 1000) / 10 : 0;

  const overallSentiment = analyzeSentiments(storyComments.filter(c => !c.replyToCommentId));

  const summary = {
    totalReads: totalVisitors,
    avgCompletionRate,
    totalComments: storyComments.length,
    overallSentiment
  };

  res.json({
    storyId,
    generatedAt: new Date().toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    }).replace(/\//g, '-'),
    summary,
    nodes: nodesData
  });
});

module.exports = router;
