const express = require('express');
const router = express.Router();
const store = require('../data/store');

let storyPerformanceData = store.storyPerformance;
let readerProfilesData = store.readerProfiles;
let branchConversionsData = store.branchConversions;
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

module.exports = router;
