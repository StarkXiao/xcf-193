const express = require('express');
const router = express.Router();
const store = require('../data/store');

const storiesData = store.stories;
const storyNodesData = store.storyNodes;
const commentsData = store.comments;
const worldSettingsData = store.worldSettings;

const calculateRelevance = (text, keyword) => {
  if (!text || !keyword) return 0;
  const lowerText = text.toLowerCase();
  const lowerKeyword = keyword.toLowerCase();
  
  if (lowerText === lowerKeyword) return 100;
  if (lowerText.startsWith(lowerKeyword)) return 80;
  if (lowerText.includes(lowerKeyword)) {
    const count = lowerText.split(lowerKeyword).length - 1;
    return Math.min(60 + count * 10, 80);
  }
  return 0;
};

const highlightText = (text, keyword) => {
  if (!text || !keyword) return text;
  const regex = new RegExp(`(${keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
  return text.replace(regex, '<mark>$1</mark>');
};

const truncateText = (text, maxLength = 150) => {
  if (!text || text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

router.get('/', (req, res) => {
  const { keyword, type = 'all', page = 1, limit = 10, tag } = req.query;
  
  if (!keyword && !tag) {
    return res.json({
      total: 0,
      page: parseInt(page),
      limit: parseInt(limit),
      keyword: keyword || '',
      type,
      results: {
        stories: [],
        worlds: [],
        comments: []
      },
      counts: {
        stories: 0,
        worlds: 0,
        comments: 0
      }
    });
  }

  const searchKeyword = keyword || '';
  let storyResults = [];
  let worldResults = [];
  let commentResults = [];

  if (type === 'all' || type === 'stories') {
    storiesData.forEach(story => {
      let score = 0;
      let matchedFields = [];

      const titleScore = calculateRelevance(story.title, searchKeyword);
      if (titleScore > 0) {
        score += titleScore;
        matchedFields.push('title');
      }

      const summaryScore = calculateRelevance(story.summary, searchKeyword) * 0.6;
      if (summaryScore > 0) {
        score += summaryScore;
        matchedFields.push('summary');
      }

      if (story.tags) {
        story.tags.forEach(t => {
          const tagScore = calculateRelevance(t, searchKeyword);
          if (tagScore > 0) {
            score += tagScore * 0.8;
            matchedFields.push('tags');
          }
        });
      }

      if (tag && story.tags && !story.tags.includes(tag)) {
        return;
      }

      if (tag && story.tags && story.tags.includes(tag)) {
        score += 50;
        matchedFields.push('tag');
      }

      const nodes = storyNodesData[story.id] || [];
      nodes.forEach(node => {
        const nodeTitleScore = calculateRelevance(node.title, searchKeyword) * 0.4;
        if (nodeTitleScore > 0) {
          score += nodeTitleScore;
          matchedFields.push('nodeTitle');
        }
        const nodeContentScore = calculateRelevance(node.content, searchKeyword) * 0.2;
        if (nodeContentScore > 0) {
          score += nodeContentScore;
          matchedFields.push('nodeContent');
        }
      });

      if (score > 0 || (tag && story.tags && story.tags.includes(tag))) {
        storyResults.push({
          ...story,
          type: 'story',
          score,
          matchedFields: [...new Set(matchedFields)],
          highlightedTitle: highlightText(story.title, searchKeyword),
          highlightedSummary: highlightText(truncateText(story.summary, 120), searchKeyword)
        });
      }
    });

    storyResults.sort((a, b) => b.score - a.score);
  }

  if (type === 'all' || type === 'worlds') {
    worldSettingsData.forEach(world => {
      let score = 0;
      let matchedFields = [];
      let matchedEntries = [];

      const nameScore = calculateRelevance(world.name, searchKeyword);
      if (nameScore > 0) {
        score += nameScore;
        matchedFields.push('name');
      }

      const descScore = calculateRelevance(world.description, searchKeyword) * 0.6;
      if (descScore > 0) {
        score += descScore;
        matchedFields.push('description');
      }

      if (world.entries) {
        world.entries.forEach(entry => {
          let entryScore = 0;
          const entryTitleScore = calculateRelevance(entry.title, searchKeyword) * 0.7;
          if (entryTitleScore > 0) {
            entryScore += entryTitleScore;
            matchedFields.push('entryTitle');
          }
          const entryContentScore = calculateRelevance(entry.content, searchKeyword) * 0.3;
          if (entryContentScore > 0) {
            entryScore += entryContentScore;
            matchedFields.push('entryContent');
          }
          const entryCategoryScore = calculateRelevance(entry.category, searchKeyword) * 0.5;
          if (entryCategoryScore > 0) {
            entryScore += entryCategoryScore;
            matchedFields.push('entryCategory');
          }
          
          if (entryScore > 0) {
            score += entryScore;
            matchedEntries.push({
              ...entry,
              highlightedTitle: highlightText(entry.title, searchKeyword),
              highlightedContent: highlightText(truncateText(entry.content, 80), searchKeyword)
            });
          }
        });
      }

      if (tag) {
        const tagInWorld = calculateRelevance(world.name, tag) || 
                           calculateRelevance(world.description, tag) ||
                           (world.entries && world.entries.some(e => 
                             calculateRelevance(e.title, tag) || 
                             calculateRelevance(e.content, tag)
                           ));
        if (tagInWorld) {
          score += 50;
          matchedFields.push('tag');
        } else {
          return;
        }
      }

      if (score > 0 || (tag && matchedFields.includes('tag'))) {
        worldResults.push({
          ...world,
          type: 'world',
          score,
          matchedFields: [...new Set(matchedFields)],
          matchedEntries,
          highlightedName: highlightText(world.name, searchKeyword),
          highlightedDescription: highlightText(truncateText(world.description, 120), searchKeyword)
        });
      }
    });

    worldResults.sort((a, b) => b.score - a.score);
  }

  if (type === 'all' || type === 'comments') {
    Object.keys(commentsData).forEach(storyId => {
      const storyComments = commentsData[storyId] || [];
      const story = storiesData.find(s => s.id === storyId);
      
      storyComments.forEach(comment => {
        let score = 0;
        let matchedFields = [];

        const contentScore = calculateRelevance(comment.content, searchKeyword);
        if (contentScore > 0) {
          score += contentScore;
          matchedFields.push('content');
        }

        const usernameScore = calculateRelevance(comment.username, searchKeyword) * 0.5;
        if (usernameScore > 0) {
          score += usernameScore;
          matchedFields.push('username');
        }

        if (tag) {
          return;
        }

        if (score > 0) {
          const node = storyNodesData[storyId]?.find(n => n.id === comment.nodeId);
          commentResults.push({
            ...comment,
            type: 'comment',
            storyId,
            storyTitle: story?.title || '',
            nodeTitle: node?.title || '',
            score,
            matchedFields: [...new Set(matchedFields)],
            highlightedContent: highlightText(truncateText(comment.content, 120), searchKeyword),
            highlightedUsername: highlightText(comment.username, searchKeyword)
          });
        }
      });
    });

    commentResults.sort((a, b) => b.score - a.score);
  }

  const allResults = {
    stories: storyResults,
    worlds: worldResults,
    comments: commentResults
  };

  const counts = {
    stories: storyResults.length,
    worlds: worldResults.length,
    comments: commentResults.length
  };

  const start = (page - 1) * limit;
  const end = start + parseInt(limit);

  if (type === 'all') {
    const combined = [
      ...storyResults.map(r => ({ ...r, resultType: 'story' })),
      ...worldResults.map(r => ({ ...r, resultType: 'world' })),
      ...commentResults.map(r => ({ ...r, resultType: 'comment' }))
    ].sort((a, b) => b.score - a.score);

    const paginated = combined.slice(start, end);
    const total = combined.length;

    res.json({
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      keyword: searchKeyword,
      type,
      results: paginated,
      counts
    });
  } else {
    const targetResults = type === 'stories' ? storyResults : 
                          type === 'worlds' ? worldResults : commentResults;
    const paginated = targetResults.slice(start, end);
    
    res.json({
      total: targetResults.length,
      page: parseInt(page),
      limit: parseInt(limit),
      keyword: searchKeyword,
      type,
      results: paginated,
      counts
    });
  }
});

router.get('/tags/suggest', (req, res) => {
  const { keyword, limit = 10 } = req.query;
  
  if (!keyword) {
    return res.json({ tags: [] });
  }

  const allTags = new Set();

  storiesData.forEach(story => {
    if (story.tags) {
      story.tags.forEach(tag => allTags.add(tag));
    }
  });

  const tagArray = Array.from(allTags);
  const lowerKeyword = keyword.toLowerCase();
  
  const suggestions = tagArray
    .filter(tag => tag.toLowerCase().includes(lowerKeyword))
    .map(tag => {
      let score = 0;
      if (tag.toLowerCase() === lowerKeyword) score = 100;
      else if (tag.toLowerCase().startsWith(lowerKeyword)) score = 80;
      else score = 60;
      
      const storyCount = storiesData.filter(s => s.tags?.includes(tag)).length;
      
      return { tag, score, storyCount };
    })
    .sort((a, b) => b.score - a.score || b.storyCount - a.storyCount)
    .slice(0, parseInt(limit));

  res.json({ tags: suggestions });
});

router.get('/tags/popular', (req, res) => {
  const { limit = 20 } = req.query;
  
  const tagCount = {};

  storiesData.forEach(story => {
    if (story.tags) {
      story.tags.forEach(tag => {
        if (!tagCount[tag]) {
          tagCount[tag] = 0;
        }
        tagCount[tag]++;
      });
    }
  });

  const popularTags = Object.entries(tagCount)
    .map(([tag, count]) => ({ tag, storyCount: count }))
    .sort((a, b) => b.storyCount - a.storyCount)
    .slice(0, parseInt(limit));

  res.json({ tags: popularTags });
});

router.get('/hot-keywords', (req, res) => {
  const hotKeywords = [
    { keyword: '浮城', count: 156, trend: 'up' },
    { keyword: '九尾狐', count: 142, trend: 'up' },
    { keyword: '星际', count: 98, trend: 'stable' },
    { keyword: '古风', count: 87, trend: 'up' },
    { keyword: '恋爱', count: 76, trend: 'stable' },
    { keyword: '奇幻', count: 65, trend: 'down' },
    { keyword: '治愈', count: 54, trend: 'up' },
    { keyword: '科幻', count: 43, trend: 'stable' }
  ];

  res.json({ keywords: hotKeywords });
});

module.exports = router;
