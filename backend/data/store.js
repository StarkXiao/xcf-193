const {
  users,
  stories,
  storyNodes,
  comments,
  worldSettings,
  favorites,
  notifications,
  collaborators,
  invitations,
  changeRequests,
  versionHistory,
  activities,
  activityRegistrations,
  activitySubmissions,
  activityRankings,
  activityShares,
  activityVotes
} = require('./mockData');

const store = {
  users: [...users],
  stories: [...stories],
  storyNodes: [...storyNodes],
  comments: [...comments],
  worldSettings: JSON.parse(JSON.stringify(worldSettings)),
  favorites: JSON.parse(JSON.stringify(favorites)),
  notifications: [...notifications],
  collaborators: JSON.parse(JSON.stringify(collaborators)),
  invitations: [...invitations],
  changeRequests: [...changeRequests],
  versionHistory: [...versionHistory],
  activities: [...activities],
  activityRegistrations: [...activityRegistrations],
  activitySubmissions: [...activitySubmissions],
  activityRankings: JSON.parse(JSON.stringify(activityRankings)),
  activityShares: [...activityShares],
  activityVotes: [...activityVotes]
};

module.exports = store;
