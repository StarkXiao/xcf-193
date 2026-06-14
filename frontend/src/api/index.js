import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  timeout: 10000
})

export const storyApi = {
  getStories(params = {}) {
    return api.get('/stories', { params })
  },
  
  getStory(id) {
    return api.get(`/stories/${id}`)
  },
  
  getStoryNodes(id) {
    return api.get(`/stories/${id}/nodes`)
  },
  
  getStoryNode(id, nodeId) {
    return api.get(`/stories/${id}/nodes/${nodeId}`)
  },
  
  createStory(data) {
    return api.post('/stories', data)
  },
  
  createNode(storyId, data) {
    return api.post(`/stories/${storyId}/nodes`, data)
  },
  
  updateNode(storyId, nodeId, data) {
    return api.put(`/stories/${storyId}/nodes/${nodeId}`, data)
  },
  
  deleteNode(storyId, nodeId) {
    return api.delete(`/stories/${storyId}/nodes/${nodeId}`)
  },
  
  likeStory(id) {
    return api.post(`/stories/${id}/like`)
  },
  
  viewStory(id) {
    return api.post(`/stories/${id}/view`)
  }
}

export const commentApi = {
  getComments(storyId, nodeId = null) {
    const params = nodeId ? { nodeId } : {}
    return api.get(`/comments/story/${storyId}`, { params })
  },
  
  addComment(storyId, data) {
    return api.post(`/comments/story/${storyId}`, data)
  },
  
  likeComment(commentId) {
    return api.post(`/comments/${commentId}/like`)
  },
  
  deleteComment(commentId) {
    return api.delete(`/comments/${commentId}`)
  }
}

export const worldApi = {
  getWorlds(params = {}) {
    return api.get('/worlds', { params })
  },
  
  getWorld(id) {
    return api.get(`/worlds/${id}`)
  },
  
  createWorld(data) {
    return api.post('/worlds', data)
  },
  
  addEntry(worldId, data) {
    return api.post(`/worlds/${worldId}/entries`, data)
  },
  
  updateEntry(worldId, entryId, data) {
    return api.put(`/worlds/${worldId}/entries/${entryId}`, data)
  },
  
  deleteEntry(worldId, entryId) {
    return api.delete(`/worlds/${worldId}/entries/${entryId}`)
  },
  
  likeWorld(id) {
    return api.post(`/worlds/${id}/like`)
  }
}

export const userApi = {
  getUser(id) {
    return api.get(`/users/${id}`)
  },
  
  getUserStories(id, params = {}) {
    return api.get(`/users/${id}/stories`, { params })
  },
  
  getUserWorlds(id, params = {}) {
    return api.get(`/users/${id}/worlds`, { params })
  },
  
  getFavorites(id, params = {}) {
    return api.get(`/users/${id}/favorites`, { params })
  },
  
  addFavorite(id, data) {
    return api.post(`/users/${id}/favorites`, data)
  },
  
  removeFavorite(id, data) {
    return api.delete(`/users/${id}/favorites`, { data })
  },
  
  checkFavorite(id, params = {}) {
    return api.get(`/users/${id}/favorites/check`, { params })
  },
  
  getNotifications(id, params = {}) {
    return api.get(`/users/${id}/notifications`, { params })
  },
  
  markAsRead(id, data = {}) {
    return api.post(`/users/${id}/notifications/read`, data)
  },
  
  deleteNotification(id, notificationId) {
    return api.delete(`/users/${id}/notifications/${notificationId}`)
  }
}

export const collaborationApi = {
  getMembers(worldId) {
    return api.get(`/collaboration/${worldId}/members`)
  },

  inviteMember(worldId, data) {
    return api.post(`/collaboration/${worldId}/invite`, data)
  },

  updateMember(worldId, memberId, data) {
    return api.put(`/collaboration/${worldId}/members/${memberId}`, data)
  },

  removeMember(worldId, memberId) {
    return api.delete(`/collaboration/${worldId}/members/${memberId}`)
  },

  getInvitations(worldId, params = {}) {
    return api.get(`/collaboration/${worldId}/invitations`, { params })
  },

  respondToInvitation(worldId, inviteId, data) {
    return api.post(`/collaboration/${worldId}/invitations/${inviteId}/respond`, data)
  },

  getUserInvitations(userId, params = {}) {
    return api.get(`/collaboration/user/${userId}/invitations`, { params })
  },

  getChangeRequests(worldId, params = {}) {
    return api.get(`/collaboration/${worldId}/changes`, { params })
  },

  submitChangeRequest(worldId, data) {
    return api.post(`/collaboration/${worldId}/changes`, data)
  },

  reviewChangeRequest(worldId, changeId, data) {
    return api.put(`/collaboration/${worldId}/changes/${changeId}/review`, data)
  },

  getVersionHistory(worldId, params = {}) {
    return api.get(`/collaboration/${worldId}/versions`, { params })
  },

  getVersionDetail(worldId, versionId) {
    return api.get(`/collaboration/${worldId}/versions/${versionId}`)
  },

  rollbackToVersion(worldId, versionId, data) {
    return api.post(`/collaboration/${worldId}/versions/${versionId}/rollback`, data)
  },

  getCollaborationRole(worldId, userId) {
    return api.get(`/collaboration/${worldId}/role/${userId}`)
  }
}

export default api
