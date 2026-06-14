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
  versionHistory
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
  versionHistory: [...versionHistory]
};

module.exports = store;
