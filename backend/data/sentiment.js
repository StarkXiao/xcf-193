const POSITIVE_WORDS = [
  '好', '棒', '喜欢', '感动', '精彩', '不错', '厉害', '温暖', '治愈',
  '期待', '爱', '赞', '优秀', '完美', '好看', '舒服', '开心', '高兴',
  '惊喜', '满意', '支持', '加油', '精彩', '美好', '温柔', '可爱',
  '强', '牛', '神', '绝', '妙', '爽', '甜', '美'
];

const NEGATIVE_WORDS = [
  '差', '烂', '无聊', '失望', '尴尬', '难看', '讨厌', '气', '难过',
  '悲伤', '痛苦', '无语', '烂尾', '弃', '无聊', '没劲', '乏味',
  '垃圾', '辣鸡', '烂透', '糟糕', '可怕', '恶心', '烦', '郁闷',
  '哭', '虐', '惨', '痛', '怕', '吓人'
];

function analyzeSentiment(text) {
  if (!text || typeof text !== 'string') {
    return {
      score: 0,
      label: 'neutral',
      positive: 0,
      neutral: 1,
      negative: 0
    };
  }

  let positiveCount = 0;
  let negativeCount = 0;

  const lowerText = text.toLowerCase();

  POSITIVE_WORDS.forEach(word => {
    if (lowerText.includes(word)) {
      positiveCount++;
    }
  });

  NEGATIVE_WORDS.forEach(word => {
    if (lowerText.includes(word)) {
      negativeCount++;
    }
  });

  const total = positiveCount + negativeCount;

  if (total === 0) {
    return {
      score: 0,
      label: 'neutral',
      positive: 0,
      neutral: 1,
      negative: 0
    };
  }

  const positiveRatio = positiveCount / total;
  const negativeRatio = negativeCount / total;
  const neutralRatio = Math.max(0, 1 - positiveRatio - negativeRatio);

  let label = 'neutral';
  if (positiveRatio > negativeRatio && positiveRatio > 0.3) {
    label = 'positive';
  } else if (negativeRatio > positiveRatio && negativeRatio > 0.3) {
    label = 'negative';
  }

  return {
    score: positiveRatio - negativeRatio,
    label,
    positive: Math.round(positiveRatio * 100) / 100,
    neutral: Math.round(neutralRatio * 100) / 100,
    negative: Math.round(negativeRatio * 100) / 100
  };
}

function analyzeSentiments(comments) {
  if (!comments || comments.length === 0) {
    return {
      positive: 0,
      neutral: 1,
      negative: 0,
      positiveCount: 0,
      neutralCount: 0,
      negativeCount: 0
    };
  }

  let positiveCount = 0;
  let neutralCount = 0;
  let negativeCount = 0;

  comments.forEach(comment => {
    const result = analyzeSentiment(comment.content);
    if (result.label === 'positive') {
      positiveCount++;
    } else if (result.label === 'negative') {
      negativeCount++;
    } else {
      neutralCount++;
    }
  });

  const total = comments.length;

  return {
    positive: Math.round((positiveCount / total) * 100) / 100,
    neutral: Math.round((neutralCount / total) * 100) / 100,
    negative: Math.round((negativeCount / total) * 100) / 100,
    positiveCount,
    neutralCount,
    negativeCount
  };
}

module.exports = {
  analyzeSentiment,
  analyzeSentiments,
  POSITIVE_WORDS,
  NEGATIVE_WORDS
};
