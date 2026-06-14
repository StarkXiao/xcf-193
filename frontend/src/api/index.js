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

export default api
