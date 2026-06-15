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
  
  likeStory(id, data) {
    return api.post(`/stories/${id}/like`, data)
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
  
  likeComment(commentId, data) {
    return api.post(`/comments/${commentId}/like`, data)
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
  
  likeWorld(id, data) {
    return api.post(`/worlds/${id}/like`, data)
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

export const notificationApi = {
  getNotifications(userId, params = {}) {
    return api.get(`/notifications/user/${userId}`, { params })
  },

  getUnreadCount(userId) {
    return api.get(`/notifications/user/${userId}/unread-count`)
  },

  createNotification(data) {
    return api.post('/notifications', data)
  },

  createBatchNotifications(data) {
    return api.post('/notifications/batch', data)
  },

  markAsRead(notificationId, userId) {
    return api.post(`/notifications/${notificationId}/read`, { userId })
  },

  markAllAsRead(userId, type = null) {
    return api.post(`/notifications/user/${userId}/read-all`, { type })
  },

  deleteNotification(notificationId, userId) {
    return api.delete(`/notifications/${notificationId}`, { data: { userId } })
  },

  clearNotifications(userId, options = {}) {
    return api.delete(`/notifications/user/${userId}/clear`, { data: options })
  },

  getNotificationTypes() {
    return api.get('/notifications/types')
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

export const activityApi = {
  getActivities(params = {}) {
    return api.get('/activities', { params })
  },

  getFeaturedActivities() {
    return api.get('/activities/featured')
  },

  getActivity(id) {
    return api.get(`/activities/${id}`)
  },

  getActivityStats(id) {
    return api.get(`/activities/${id}/stats`)
  },

  createActivity(data) {
    return api.post('/activities', data)
  },

  updateActivity(id, data) {
    return api.put(`/activities/${id}`, data)
  },

  deleteActivity(id) {
    return api.delete(`/activities/${id}`)
  },

  registerActivity(id, data) {
    return api.post(`/activities/${id}/register`, data)
  },

  getActivityRegistrations(id, params = {}) {
    return api.get(`/activities/${id}/registrations`, { params })
  },

  checkRegistration(id, params = {}) {
    return api.get(`/activities/${id}/registration/check`, { params })
  },

  submitWork(id, data) {
    return api.post(`/activities/${id}/submit`, data)
  },

  getActivitySubmissions(id, params = {}) {
    return api.get(`/activities/${id}/submissions`, { params })
  },

  getSubmission(submissionId) {
    return api.get(`/activities/submissions/${submissionId}`)
  },

  reviewSubmission(submissionId, data) {
    return api.put(`/activities/submissions/${submissionId}/review`, data)
  },

  voteSubmission(submissionId, data) {
    return api.post(`/activities/submissions/${submissionId}/vote`, data)
  },

  getActivityRanking(id, params = {}) {
    return api.get(`/activities/${id}/ranking`, { params })
  },

  shareActivity(id, data) {
    return api.post(`/activities/${id}/share`, data)
  },

  recordShareClick(shareId) {
    return api.post(`/activities/share/${shareId}/click`)
  },

  getActivityPropagation(id, params = {}) {
    return api.get(`/activities/${id}/propagation`, { params })
  },

  getUserActivities(userId, params = {}) {
    return api.get(`/activities/user/${userId}/my-activities`, { params })
  }
}

export const searchApi = {
  search(params = {}) {
    return api.get('/search', { params })
  },

  suggestTags(keyword, limit = 10) {
    return api.get('/search/tags/suggest', { params: { keyword, limit } })
  },

  getPopularTags(limit = 20) {
    return api.get('/search/tags/popular', { params: { limit } })
  },

  getHotKeywords() {
    return api.get('/search/hot-keywords')
  }
}

export const analyticsApi = {
  getAuthorPerformance(userId) {
    return api.get(`/analytics/author/${userId}/performance`)
  },

  getReaderProfile(userId) {
    return api.get(`/analytics/author/${userId}/reader-profile`)
  },

  getBranchConversions(storyId) {
    return api.get(`/analytics/story/${storyId}/branch-conversions`)
  },

  getSettingReferences(userId) {
    return api.get(`/analytics/author/${userId}/setting-references`)
  },

  getAuthorSummary(userId) {
    return api.get(`/analytics/author/${userId}/summary`)
  }
}

export const auditApi = {
  getStats() {
    return api.get('/audit/stats')
  },

  getPendingItems(params = {}) {
    return api.get('/audit/pending', { params })
  },

  getAuditLogs(params = {}) {
    return api.get('/audit/logs', { params })
  },

  approveItem(type, id, data) {
    return api.post(`/audit/${type}/${id}/approve`, data)
  },

  rejectItem(type, id, data) {
    return api.post(`/audit/${type}/${id}/reject`, data)
  },

  getAuditLevels() {
    return api.get('/audit/levels')
  }
}

export const themeHallApi = {
  getThemeHalls(params = {}) {
    return api.get('/theme-halls', { params })
  },

  getThemeHall(id) {
    return api.get(`/theme-halls/${id}`)
  },

  getThemeHallCharacters(id, params = {}) {
    return api.get(`/theme-halls/${id}/characters`, { params })
  },

  getThemeHallFactions(id, params = {}) {
    return api.get(`/theme-halls/${id}/factions`, { params })
  },

  getThemeHallTimeline(id, params = {}) {
    return api.get(`/theme-halls/${id}/timeline`, { params })
  },

  getThemeHallStories(id, params = {}) {
    return api.get(`/theme-halls/${id}/stories`, { params })
  },

  getFeaturedThemeHalls() {
    return api.get('/theme-halls/featured')
  },

  likeThemeHall(id, data) {
    return api.post(`/theme-halls/${id}/like`, data)
  }
}

export default api
