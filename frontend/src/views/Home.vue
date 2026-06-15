<template>
  <div class="home" :class="{ 'is-mobile': isMobile }">
    <div class="hero-section" :class="{ 'mobile-hero': isMobile }">
      <div class="hero-content">
        <h1 class="hero-title" :class="{ 'mobile-title': isMobile }">浮城回声</h1>
        <p class="hero-subtitle" :class="{ 'mobile-subtitle': isMobile }">幻想恋爱叙事社区</p>
        <p v-if="!isMobile" class="hero-desc">在云端之城，编织属于你的浪漫故事</p>
        <div class="hero-actions" :class="{ 'mobile-actions': isMobile }">
          <n-button type="primary" :size="isMobile ? 'medium' : 'large'" @click="goToEditor">
            <template #icon>✏️</template>
            开始创作
          </n-button>
          <n-button :size="isMobile ? 'medium' : 'large'" @click="scrollToStories">
            <template #icon>📖</template>
            浏览故事
          </n-button>
        </div>
      </div>
      <div v-if="!isMobile" class="hero-decoration">
        <span class="deco-icon">🏰</span>
        <span class="deco-icon">⭐</span>
        <span class="deco-icon">🌙</span>
        <span class="deco-icon">🦊</span>
        <span class="deco-icon">🚀</span>
      </div>
    </div>

    <div v-if="recentReads.length > 0 || favoriteStoryIds.length > 0" 
         class="quick-access-section" 
         :class="{ 'mobile-quick-access': isMobile }"
    >
      <div v-if="recentReads.length > 0" class="quick-access-block">
        <div class="section-header" :class="{ 'mobile-section-header': isMobile }">
          <h2 class="section-title" :class="{ 'mobile-section-title': isMobile }">📖 继续阅读</h2>
          <n-button text type="primary" size="small" @click="goToProfile">查看全部 →</n-button>
        </div>
        <div class="recent-reads-row" :class="{ 'mobile-recent-reads-row': isMobile }">
          <n-card 
            v-for="record in recentReads" 
            :key="record.storyId"
            hoverable
            class="recent-card"
            :class="{ 'mobile-recent-card': isMobile }"
            @click="continueReading(record)"
          >
            <div class="recent-card-cover">{{ record.story?.cover || '📖' }}</div>
            <div class="recent-card-info">
              <h4 class="recent-card-title">{{ record.story?.title }}</h4>
              <p class="recent-card-progress">读到：{{ record.currentNodeTitle || '开始' }}</p>
              <p class="recent-card-time">{{ formatReadTime(record.readAt) }}</p>
            </div>
            <n-button type="primary" size="small" class="continue-btn">
              继续
            </n-button>
          </n-card>
        </div>
      </div>

      <div v-if="favoriteStoryIds.length > 0" class="quick-access-block">
        <div class="section-header" :class="{ 'mobile-section-header': isMobile }">
          <h2 class="section-title" :class="{ 'mobile-section-title': isMobile }">⭐ 我的收藏</h2>
          <n-button text type="primary" size="small" @click="goToFavorites">管理收藏 →</n-button>
        </div>
        <div class="favorite-summary" :class="{ 'mobile-favorite-summary': isMobile }">
          <span class="fav-stat">
            <span class="fav-icon">📖</span>
            {{ favoriteStoryIds.length }} 个故事
          </span>
          <span class="fav-stat">
            <span class="fav-icon">🌍</span>
            {{ favoriteWorldIds.length }} 个世界设定
          </span>
        </div>
      </div>
    </div>

    <div class="filter-section" ref="storiesSection">
      <div class="section-header" :class="{ 'mobile-section-header': isMobile }">
        <h2 class="section-title" :class="{ 'mobile-section-title': isMobile }">📚 故事广场</h2>
        <div class="filter-tabs">
          <n-radio-group v-model:value="sortBy" :size="isMobile ? 'small' : 'medium'" @update:value="loadStories">
            <n-radio-button value="newest">最新</n-radio-button>
            <n-radio-button value="popular">热门</n-radio-button>
          </n-radio-group>
        </div>
      </div>
      
      <div class="tags-filter" :class="{ 'mobile-tags': isMobile }">
        <div 
          v-for="tag in allTags" 
          :key="tag"
          class="tag-item"
          :class="{ active: selectedTag === tag, 'mobile-tag': isMobile }"
          @click="toggleTag(tag)"
        >
          {{ tag }}
        </div>
      </div>
    </div>

    <n-spin :show="loading" size="large">
      <div class="stories-grid" :class="{ 'mobile-stories-grid': isMobile }">
        <n-card 
          v-for="story in stories" 
          :key="story.id"
          hoverable
          class="story-card"
          :class="{ 'mobile-story-card': isMobile }"
          @click="openStory(story.id)"
        >
          <div class="story-cover" :class="{ 'mobile-story-cover': isMobile }">
            {{ story.cover }}
            <span v-if="favoriteStoryIds.includes(story.id)" class="fav-badge">⭐</span>
          </div>
          <div class="story-info">
            <h3 class="story-title" :class="{ 'mobile-story-title': isMobile }">{{ story.title }}</h3>
            <p class="story-summary" :class="{ 'mobile-story-summary': isMobile }">{{ story.summary }}</p>
            <div class="story-tags" :class="{ 'mobile-story-tags': isMobile }">
              <n-tag 
                v-for="tag in (story.tags || []).slice(0, isMobile ? 2 : 3)" 
                :key="tag" 
                size="small" 
                type="primary"
                style="margin-right: 4px; margin-top: 4px;"
              >
                {{ tag }}
              </n-tag>
            </div>
            <div class="story-meta" :class="{ 'mobile-story-meta': isMobile }">
              <span class="meta-item">
                <span class="meta-icon">👤</span>
                <span v-if="!isMobile">{{ story.authorName }}</span>
              </span>
              <span class="meta-item">
                <span class="meta-icon">❤️</span>
                {{ formatNumber(story.likes) }}
              </span>
              <span class="meta-item">
                <span class="meta-icon">👁️</span>
                {{ formatNumber(story.views) }}
              </span>
            </div>
          </div>
        </n-card>
      </div>
    </n-spin>

    <div v-if="stories.length === 0 && !loading" class="empty-state" :class="{ 'mobile-empty': isMobile }">
      <div class="empty-icon" :class="{ 'mobile-empty-icon': isMobile }">📝</div>
      <p>还没有故事，快来创作第一个吧！</p>
      <n-button type="primary" :size="isMobile ? 'medium' : 'default'" @click="goToEditor">
        <template #icon>✏️</template>
        开始创作
      </n-button>
    </div>

    <div class="worlds-preview" :class="{ 'mobile-worlds': isMobile }">
      <div class="section-header" :class="{ 'mobile-section-header': isMobile }">
        <h2 class="section-title" :class="{ 'mobile-section-title': isMobile }">🌍 世界设定库</h2>
        <n-button text type="primary" @click="goToWorlds">
          查看全部
          <span style="margin-left: 2px;">→</span>
        </n-button>
      </div>
      <div class="worlds-row" :class="{ 'mobile-worlds-row': isMobile }">
        <n-card 
          v-for="world in worlds" 
          :key="world.id"
          hoverable
          class="world-card"
          :class="{ 'mobile-world-card': isMobile }"
          @click="openWorld(world.id)"
        >
          <div class="world-cover" :class="{ 'mobile-world-cover': isMobile }">{{ world.cover }}</div>
          <div class="world-info">
            <h3 class="world-name" :class="{ 'mobile-world-name': isMobile }">{{ world.name }}</h3>
            <p class="world-desc" :class="{ 'mobile-world-desc': isMobile }">{{ world.description }}</p>
            <div class="world-meta">
              <span>📝 {{ world.entries?.length || 0 }} 条目</span>
              <span>❤️ {{ formatNumber(world.likes) }}</span>
            </div>
          </div>
        </n-card>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { NButton, NCard, NTag, NRadioGroup, NRadioButton, NSpin } from 'naive-ui'
import { storyApi, worldApi, userApi } from '../api'
import { useResponsive } from '../composables/useResponsive'

const router = useRouter()
const { isMobile } = useResponsive()

const userId = 'user-1'
const stories = ref([])
const worlds = ref([])
const loading = ref(false)
const sortBy = ref('newest')
const selectedTag = ref('')
const allTags = ['奇幻', '恋爱', '冒险', '科幻', '百合', '治愈', '古风']
const recentReads = ref([])
const favoriteStoryIds = ref([])
const favoriteWorldIds = ref([])

const storiesSection = ref(null)

const formatNumber = (num) => {
  if (!num) return 0
  if (num >= 10000) {
    return (num / 10000).toFixed(1) + 'w'
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'k'
  }
  return num
}

const loadStories = async () => {
  loading.value = true
  try {
    const params = { sort: sortBy.value }
    if (selectedTag.value) {
      params.tag = selectedTag.value
    }
    const res = await storyApi.getStories(params)
    stories.value = res.data.stories
  } catch (err) {
    console.error('加载故事失败:', err)
  } finally {
    loading.value = false
  }
}

const loadWorlds = async () => {
  try {
    const res = await worldApi.getWorlds({ sort: 'popular', limit: 3 })
    worlds.value = res.data.worlds
  } catch (err) {
    console.error('加载世界设定失败:', err)
  }
}

const toggleTag = (tag) => {
  if (selectedTag.value === tag) {
    selectedTag.value = ''
  } else {
    selectedTag.value = tag
  }
  loadStories()
}

const openStory = (id) => {
  router.push(`/story/${id}`)
}

const openWorld = (id) => {
  router.push(`/world/${id}`)
}

const goToEditor = () => {
  router.push('/editor')
}

const goToWorlds = () => {
  router.push('/worlds')
}

const loadRecentReads = async () => {
  try {
    const res = await userApi.getReadingHistory(userId, { limit: 4 })
    recentReads.value = res.data.history
  } catch (err) {
    console.error('加载阅读记录失败:', err)
  }
}

const loadFavorites = async () => {
  try {
    const res = await userApi.getFavorites(userId)
    favoriteStoryIds.value = (res.data.stories || []).map(s => s.id)
    favoriteWorldIds.value = (res.data.worlds || []).map(w => w.id)
  } catch (err) {
    console.error('加载收藏失败:', err)
  }
}

const formatReadTime = (timeStr) => {
  if (!timeStr) return ''
  const date = new Date(timeStr)
  const now = new Date()
  const diff = now - date
  if (diff < 60000) return '刚刚'
  if (diff < 3600000) return Math.floor(diff / 60000) + '分钟前'
  if (diff < 86400000) return Math.floor(diff / 3600000) + '小时前'
  return Math.floor(diff / 86400000) + '天前'
}

const continueReading = (record) => {
  router.push({
    path: `/story/${record.storyId}`,
    query: { nodeId: record.currentNodeId }
  })
}

const goToProfile = () => {
  router.push('/user/profile')
}

const goToFavorites = () => {
  router.push('/user/favorites')
}

const scrollToStories = () => {
  storiesSection.value?.scrollIntoView({ behavior: 'smooth' })
}

onMounted(() => {
  loadStories()
  loadWorlds()
  loadRecentReads()
  loadFavorites()
})
</script>

<style scoped>
.home {
  padding-bottom: 40px;
}

.hero-section {
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
  border-radius: 20px;
  padding: 60px 40px;
  margin-bottom: 40px;
  position: relative;
  overflow: hidden;
}

.hero-section.mobile-hero {
  border-radius: 16px;
  padding: 32px 20px;
  margin-bottom: 24px;
}

.hero-content {
  position: relative;
  z-index: 2;
  max-width: 500px;
}

.hero-title {
  font-size: 48px;
  font-weight: bold;
  background: linear-gradient(135deg, #e0aaff 0%, #c77dff 50%, #9d4edd 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin: 0 0 10px 0;
}

.hero-title.mobile-title {
  font-size: 32px;
}

.hero-subtitle {
  font-size: 24px;
  color: #c77dff;
  margin: 0 0 16px 0;
}

.hero-subtitle.mobile-subtitle {
  font-size: 16px;
  margin-bottom: 12px;
}

.hero-desc {
  font-size: 16px;
  color: #e0e0e0;
  margin: 0 0 30px 0;
  line-height: 1.6;
}

.hero-actions {
  display: flex;
  gap: 16px;
}

.hero-actions.mobile-actions {
  gap: 10px;
  flex-wrap: wrap;
}

.hero-actions.mobile-actions :deep(.n-button) {
  flex: 1;
  min-width: 120px;
}

.hero-decoration {
  position: absolute;
  right: 40px;
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.deco-icon {
  font-size: 40px;
  opacity: 0.6;
  animation: float 3s ease-in-out infinite;
}

.deco-icon:nth-child(2) { animation-delay: 0.5s; }
.deco-icon:nth-child(3) { animation-delay: 1s; }
.deco-icon:nth-child(4) { animation-delay: 1.5s; }
.deco-icon:nth-child(5) { animation-delay: 2s; }

@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}

.filter-section {
  margin-bottom: 20px;
}

.quick-access-section {
  margin-bottom: 40px;
  display: flex;
  gap: 24px;
}

.quick-access-section.mobile-quick-access {
  flex-direction: column;
  gap: 20px;
  margin-bottom: 24px;
}

.quick-access-block {
  flex: 1;
  min-width: 0;
}

.recent-reads-row {
  display: flex;
  gap: 12px;
  overflow-x: auto;
  padding-bottom: 4px;
}

.recent-reads-row.mobile-recent-reads-row {
  gap: 10px;
}

.recent-card {
  cursor: pointer;
  transition: transform 0.3s;
  min-width: 240px;
  flex-shrink: 0;
}

.recent-card.mobile-recent-card {
  min-width: 200px;
}

.recent-card:hover {
  transform: translateY(-2px);
}

.recent-card :deep(.n-card__content) {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px;
}

.recent-card-cover {
  font-size: 36px;
  flex-shrink: 0;
}

.recent-card-info {
  flex: 1;
  min-width: 0;
}

.recent-card-title {
  font-size: 14px;
  margin: 0 0 4px 0;
  color: #333;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.recent-card-progress {
  font-size: 12px;
  color: #9d4edd;
  margin: 0 0 2px 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.recent-card-time {
  font-size: 11px;
  color: #bbb;
  margin: 0;
}

.continue-btn {
  flex-shrink: 0;
}

.favorite-summary {
  display: flex;
  gap: 24px;
  padding: 16px;
  background: linear-gradient(135deg, #fff9f0 0%, #fff3e0 100%);
  border-radius: 12px;
}

.favorite-summary.mobile-favorite-summary {
  gap: 16px;
  padding: 14px;
}

.fav-stat {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  color: #666;
}

.fav-icon {
  font-size: 18px;
}

.fav-badge {
  position: absolute;
  top: 8px;
  right: 8px;
  font-size: 18px;
  filter: drop-shadow(0 1px 2px rgba(0,0,0,0.2));
}

.story-cover {
  position: relative;
}

.filter-section {
  margin-bottom: 20px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.section-header.mobile-section-header {
  margin-bottom: 14px;
}

.section-title {
  font-size: 24px;
  margin: 0;
  color: #333;
}

.section-title.mobile-section-title {
  font-size: 18px;
}

.tags-filter {
  display: flex;
  flex-wrap: wrap;
  margin-bottom: 20px;
  gap: 8px;
}

.tags-filter.mobile-tags {
  margin-bottom: 14px;
  gap: 6px;
}

.tag-item {
  padding: 6px 14px;
  border-radius: 20px;
  background: #f5f5f5;
  color: #666;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;
  border: 1px solid transparent;
}

.tag-item:hover {
  background: #e8e8e8;
}

.tag-item.active {
  background: linear-gradient(135deg, #9d4edd 0%, #c77dff 100%);
  color: white;
  border-color: transparent;
}

.tag-item.mobile-tag {
  padding: 5px 12px;
  font-size: 12px;
}

.stories-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}

.stories-grid.mobile-stories-grid {
  grid-template-columns: 1fr;
  gap: 12px;
}

.story-card {
  cursor: pointer;
  transition: transform 0.3s, box-shadow 0.3s;
}

.story-card:hover {
  transform: translateY(-4px);
}

.story-card.mobile-story-card :deep(.n-card__content) {
  padding: 14px;
}

.story-cover {
  font-size: 60px;
  text-align: center;
  padding: 30px 0;
  background: linear-gradient(135deg, #f0e6ff 0%, #e0ccff 100%);
  border-radius: 8px;
  margin-bottom: 16px;
}

.story-cover.mobile-story-cover {
  font-size: 48px;
  padding: 20px 0;
  margin-bottom: 12px;
  border-radius: 10px;
}

.story-title {
  font-size: 18px;
  margin: 0 0 8px 0;
  color: #333;
}

.story-title.mobile-story-title {
  font-size: 16px;
}

.story-summary {
  font-size: 14px;
  color: #666;
  line-height: 1.6;
  margin: 0 0 12px 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.story-summary.mobile-story-summary {
  font-size: 13px;
  -webkit-line-clamp: 2;
}

.story-tags {
  margin-bottom: 12px;
}

.story-tags.mobile-story-tags {
  margin-bottom: 10px;
}

.story-meta {
  display: flex;
  gap: 16px;
  font-size: 13px;
  color: #999;
}

.story-meta.mobile-story-meta {
  gap: 12px;
  font-size: 12px;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 4px;
}

.meta-icon {
  font-size: 14px;
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
}

.empty-state.mobile-empty {
  padding: 40px 20px;
}

.empty-icon {
  font-size: 64px;
  margin-bottom: 16px;
}

.empty-icon.mobile-empty-icon {
  font-size: 48px;
  margin-bottom: 12px;
}

.empty-state p {
  color: #999;
  margin-bottom: 20px;
}

.worlds-preview {
  margin-top: 60px;
}

.worlds-preview.mobile-worlds {
  margin-top: 36px;
}

.worlds-row {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
}

.worlds-row.mobile-worlds-row {
  grid-template-columns: 1fr;
  gap: 12px;
}

.world-card {
  cursor: pointer;
}

.world-card.mobile-world-card :deep(.n-card__content) {
  padding: 14px;
}

.world-cover {
  font-size: 48px;
  text-align: center;
  padding: 20px 0;
  background: linear-gradient(135deg, #e6f7ff 0%, #bae7ff 100%);
  border-radius: 8px;
  margin-bottom: 12px;
}

.world-cover.mobile-world-cover {
  font-size: 40px;
  padding: 16px 0;
  margin-bottom: 10px;
}

.world-name {
  font-size: 16px;
  margin: 0 0 8px 0;
}

.world-name.mobile-world-name {
  font-size: 15px;
}

.world-desc {
  font-size: 13px;
  color: #666;
  margin: 0 0 10px 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.world-desc.mobile-world-desc {
  font-size: 12px;
}

.world-meta {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: #999;
}
</style>
