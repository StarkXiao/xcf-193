const express = require('express');
const router = express.Router();
const store = require('../data/store');

let storyPerformanceData = store.storyPerformance;
let readerProfilesData = store.readerProfiles;
let branchConversionsData = store.branchConversions;
let endingAchievementsData = store.endingAchievements;
let popularBranchesData = store.popularBranches;
let readerEndingDistributionData = store.readerEndingDistribution;
let settingReferenceTrendsData = store.settingReferenceTrends;

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

module.exports = router;
