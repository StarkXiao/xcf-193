<template>
  <div class="user-profile">
    <n-spin :show="loading" size="large">
      <div v-if="user" class="profile-container">
        <div class="profile-header">
          <div class="avatar-section">
            <n-avatar round size="huge" class="user-avatar">
              {{ user.avatar }}
            </n-avatar>
          </div>
          <div class="info-section">
            <h1 class="username">{{ user.username }}</h1>
            <p class="user-bio">{{ user.bio || '这个人很懒，什么都没留下~' }}</p>
            <p class="join-date">📅 加入于 {{ user.createdAt }}</p>
          </div>
        </div>

        <div class="stats-section">
          <n-grid :cols="3" responsive="screen" x-gap="16" y-gap="16">
            <n-grid-item>
              <n-card hoverable class="stat-card" @click="goToCreations">
                <div class="stat-item">
                  <span class="stat-icon">📖</span>
                  <span class="stat-value">{{ user.stats.storyCount }}</span>
                  <span class="stat-label">创作故事</span>
                </div>
              </n-card>
            </n-grid-item>
            <n-grid-item>
              <n-card hoverable class="stat-card" @click="goToCreations">
                <div class="stat-item">
                  <span class="stat-icon">🌍</span>
                  <span class="stat-value">{{ user.stats.worldCount }}</span>
                  <span class="stat-label">世界设定</span>
                </div>
              </n-card>
            </n-grid-item>
            <n-grid-item>
              <n-card hoverable class="stat-card" @click="goToFavorites">
                <div class="stat-item">
                  <span class="stat-icon">⭐</span>
                  <span class="stat-value">{{ user.stats.favoriteStoryCount + user.stats.favoriteWorldCount }}</span>
                  <span class="stat-label">我的收藏</span>
                </div>
              </n-card>
            </n-grid-item>
            <n-grid-item>
              <n-card class="stat-card">
                <div class="stat-item">
                  <span class="stat-icon">❤️</span>
                  <span class="stat-value">{{ user.stats.totalLikes }}</span>
                  <span class="stat-label">获得点赞</span>
                </div>
              </n-card>
            </n-grid-item>
            <n-grid-item>
              <n-card class="stat-card">
                <div class="stat-item">
                  <span class="stat-icon">👁️</span>
                  <span class="stat-value">{{ user.stats.totalViews }}</span>
                  <span class="stat-label">作品阅读</span>
                </div>
              </n-card>
            </n-grid-item>
            <n-grid-item>
              <n-card hoverable class="stat-card" @click="goToMessages">
                <div class="stat-item">
                  <span class="stat-icon">🔔</span>
                  <span class="stat-value">
                    {{ user.stats.unreadCount }}
                    <n-tag v-if="user.stats.unreadCount > 0" size="small" type="error" round class="unread-tag">
                      新消息
                    </n-tag>
                  </span>
                  <span class="stat-label">互动消息</span>
                </div>
              </n-card>
            </n-grid-item>
          </n-grid>
        </div>

        <div class="quick-actions">
          <h2 class="section-title">🚀 快捷操作</h2>
          <div class="action-buttons">
            <n-button type="primary" size="large" @click="goToEditor">
              <template #icon>✏️</template>
              创作新故事
            </n-button>
            <n-button size="large" @click="goToWorldEditor">
              <template #icon>🌍</template>
              新建世界设定
            </n-button>
            <n-button size="large" @click="goToFavorites">
              <template #icon>⭐</template>
              管理收藏
            </n-button>
            <n-button size="large" @click="goToMessages">
              <template #icon>💬</template>
              查看消息
            </n-button>
          </div>
        </div>

        <div class="recent-section">
          <div class="section-header">
            <h2 class="section-title">📚 最近创作</h2>
            <n-button text type="primary" @click="goToCreations">查看全部 →</n-button>
          </div>
          <n-spin :show="loadingStories">
            <div v-if="recentStories.length > 0" class="stories-grid">
              <n-card 
                v-for="story in recentStories" 
                :key="story.id"
                hoverable
                class="story-card"
                @click="openStory(story.id)"
              >
                <div class="story-cover">{{ story.cover }}</div>
                <div class="story-info">
                  <h3 class="story-title">{{ story.title }}</h3>
                  <p class="story-summary">{{ story.summary }}</p>
                  <div class="story-tags">
                    <n-tag 
                      v-for="tag in story.tags" 
                      :key="tag" 
                      size="small" 
                      type="primary"
                      style="margin-right: 4px;"
                    >
                      {{ tag }}
                    </n-tag>
                  </div>
                  <div class="story-meta">
                    <span>❤️ {{ story.likes }}</span>
                    <span>👁️ {{ story.views }}</span>
                    <span>📅 {{ story.updatedAt }}</span>
                    <n-tag :type="story.status === 'ongoing' ? 'success' : 'default'" size="small">
                      {{ story.status === 'ongoing' ? '连载中' : '已完结' }}
                    </n-tag>
                  </div>
                </div>
              </n-card>
            </div>
            <div v-else class="empty-state">
              <div class="empty-icon">📝</div>
              <p>还没有创作故事，快去开始你的创作之旅吧！</p>
              <n-button type="primary" @click="goToEditor">
                <template #icon>✏️</template>
                开始创作
              </n-button>
            </div>
          </n-spin>
        </div>
      </div>
    </n-spin>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { NButton, NCard, NAvatar, NTag, NGrid, NGridItem, NSpin } from 'naive-ui'
import { userApi } from '../api'

const router = useRouter()
const userId = 'user-1'

const user = ref(null)
const recentStories = ref([])
const loading = ref(false)
const loadingStories = ref(false)

const loadUser = async () => {
  loading.value = true
  try {
    const res = await userApi.getUser(userId)
    user.value = res.data
  } catch (err) {
    console.error('加载用户信息失败:', err)
  } finally {
    loading.value = false
  }
}

const loadRecentStories = async () => {
  loadingStories.value = true
  try {
    const res = await userApi.getUserStories(userId, { sort: 'newest', limit: 3 })
    recentStories.value = res.data.stories
  } catch (err) {
    console.error('加载最近创作失败:', err)
  } finally {
    loadingStories.value = false
  }
}

const openStory = (id) => {
  router.push(`/story/${id}`)
}

const goToEditor = () => {
  router.push('/editor')
}

const goToWorldEditor = () => {
  router.push('/world-editor')
}

const goToCreations = () => {
  router.push('/user/creations')
}

const goToFavorites = () => {
  router.push('/user/favorites')
}

const goToMessages = () => {
  router.push('/user/messages')
}

onMounted(() => {
  loadUser()
  loadRecentStories()
})
</script>

<style scoped>
.user-profile {
  padding-bottom: 40px;
}

.profile-container {
  max-width: 1000px;
  margin: 0 auto;
}

.profile-header {
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
  border-radius: 20px;
  padding: 40px;
  display: flex;
  align-items: center;
  gap: 30px;
  margin-bottom: 30px;
}

.avatar-section {
  flex-shrink: 0;
}

.user-avatar {
  font-size: 48px !important;
  width: 100px !important;
  height: 100px !important;
  background: linear-gradient(135deg, #e0aaff 0%, #c77dff 100%) !important;
}

.info-section {
  flex: 1;
}

.username {
  font-size: 32px;
  margin: 0 0 10px 0;
  color: #fff;
}

.user-bio {
  font-size: 16px;
  color: #e0e0e0;
  margin: 0 0 10px 0;
  line-height: 1.6;
}

.join-date {
  font-size: 14px;
  color: #c77dff;
  margin: 0;
}

.stats-section {
  margin-bottom: 40px;
}

.stat-card {
  cursor: pointer;
  transition: transform 0.3s;
}

.stat-card:hover {
  transform: translateY(-2px);
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 10px 0;
}

.stat-icon {
  font-size: 32px;
}

.stat-value {
  font-size: 28px;
  font-weight: bold;
  color: #9d4edd;
  display: flex;
  align-items: center;
  gap: 8px;
}

.stat-label {
  font-size: 14px;
  color: #666;
}

.unread-tag {
  margin-left: 4px;
}

.quick-actions {
  margin-bottom: 40px;
}

.section-title {
  font-size: 24px;
  margin: 0 0 20px 0;
  color: #333;
}

.action-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.stories-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
}

.story-card {
  cursor: pointer;
  transition: transform 0.3s, box-shadow 0.3s;
}

.story-card:hover {
  transform: translateY(-4px);
}

.story-cover {
  font-size: 48px;
  text-align: center;
  padding: 24px 0;
  background: linear-gradient(135deg, #f0e6ff 0%, #e0ccff 100%);
  border-radius: 8px;
  margin-bottom: 12px;
}

.story-title {
  font-size: 16px;
  margin: 0 0 8px 0;
  color: #333;
}

.story-summary {
  font-size: 13px;
  color: #666;
  line-height: 1.6;
  margin: 0 0 10px 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.story-tags {
  margin-bottom: 10px;
}

.story-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  font-size: 12px;
  color: #999;
  align-items: center;
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
}

.empty-icon {
  font-size: 64px;
  margin-bottom: 16px;
}

.empty-state p {
  color: #999;
  margin-bottom: 20px;
}
</style>
