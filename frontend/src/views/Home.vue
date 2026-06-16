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

    <div class="topics-section" :class="{ 'mobile-topics': isMobile }">
      <div class="section-header" :class="{ 'mobile-section-header': isMobile }">
        <h2 class="section-title" :class="{ 'mobile-section-title': isMobile }">🎯 精选专题</h2>
        <n-button text type="primary" size="small" @click="scrollToAllTopics">
          查看全部专题 →
        </n-button>
      </div>
      <div class="topics-grid" :class="{ 'mobile-topics-grid': isMobile }">
        <div 
          v-for="topic in topics.slice(0, isMobile ? 4 : 6)" 
          :key="topic.id"
          class="topic-card"
          :class="{ 'mobile-topic-card': isMobile }"
          :style="{ background: topic.color }"
          @click="openTopic(topic.id)"
        >
          <div class="topic-icon">{{ topic.cover }}</div>
          <div class="topic-content">
            <h3 class="topic-title">{{ topic.title }}</h3>
            <p class="topic-desc">{{ topic.description }}</p>
            <span class="topic-count">{{ topic.storyCount }} 个故事</span>
          </div>
        </div>
      </div>
    </div>

    <n-spin :show="loading" size="large">
      <div v-for="section in sections" :key="section.id" class="story-section" ref="storiesSection">
        <div class="section-header" :class="{ 'mobile-section-header': isMobile }">
          <div class="section-title-wrap">
            <h2 class="section-title" :class="{ 'mobile-section-title': isMobile }">{{ section.title }}</h2>
            <span class="section-subtitle">{{ section.subtitle }}</span>
          </div>
          <n-button text type="primary" size="small" @click="viewMore(section.type)">
            更多 →
          </n-button>
        </div>
        <div class="stories-row" :class="{ 'mobile-stories-row': isMobile }">
          <n-card 
            v-for="story in section.stories" 
            :key="story.id"
            hoverable
            class="story-card-horizontal"
            :class="{ 'mobile-story-card-horizontal': isMobile }"
            @click="openStory(story.id)"
          >
            <div class="story-card-h-cover" :class="{ 'mobile-story-card-h-cover': isMobile }">
              {{ story.cover }}
              <span v-if="favoriteStoryIds.includes(story.id)" class="fav-badge">⭐</span>
              <span v-if="story.status === 'completed'" class="status-badge completed">完结</span>
              <span v-else class="status-badge ongoing">连载中</span>
            </div>
            <div class="story-card-h-info">
              <h3 class="story-card-h-title" :class="{ 'mobile-story-card-h-title': isMobile }">{{ story.title }}</h3>
              <p class="story-card-h-summary" :class="{ 'mobile-story-card-h-summary': isMobile }">{{ story.summary }}</p>
              <div class="story-card-h-tags">
                <n-tag 
                  v-for="tag in (story.tags || []).slice(0, 2)" 
                  :key="tag" 
                  size="small" 
                  type="primary"
                >
                  {{ tag }}
                </n-tag>
              </div>
              <div class="story-card-h-meta">
                <span class="meta-item">
                  <span class="meta-icon">👤</span>
                  {{ story.authorName }}
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
      </div>
    </n-spin>

    <div class="all-topics-section" :class="{ 'mobile-all-topics': isMobile }" ref="allTopicsSection">
      <div class="section-header" :class="{ 'mobile-section-header': isMobile }">
        <h2 class="section-title" :class="{ 'mobile-section-title': isMobile }">📚 全部专题</h2>
      </div>
      <div class="all-topics-grid" :class="{ 'mobile-all-topics-grid': isMobile }">
        <div 
          v-for="topic in topics" 
          :key="topic.id"
          class="all-topic-card"
          :class="{ 'mobile-all-topic-card': isMobile }"
          :style="{ background: topic.color }"
          @click="openTopic(topic.id)"
        >
          <div class="all-topic-header">
            <span class="all-topic-icon">{{ topic.cover }}</span>
            <h3 class="all-topic-title">{{ topic.title }}</h3>
          </div>
          <p class="all-topic-desc">{{ topic.description }}</p>
          <div class="all-topic-footer">
            <span class="all-topic-count">{{ topic.storyCount }} 个故事</span>
            <span class="all-topic-arrow">→</span>
          </div>
          <div v-if="topic.previewStories && topic.previewStories.length > 0" class="all-topic-preview">
            <div 
              v-for="(previewStory, idx) in topic.previewStories" 
              :key="previewStory.id"
              class="preview-story-item"
            >
              <span class="preview-rank">{{ idx + 1 }}</span>
              <span class="preview-title">{{ previewStory.title }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="filter-section" v-if="stories.length > 0">
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

    <n-spin :show="loading" size="large" v-if="stories.length > 0">
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

    <div v-if="stories.length === 0 && sections.length === 0 && !loading" class="empty-state" :class="{ 'mobile-empty': isMobile }">
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

const sections = ref([])
const topics = ref([])
const allTopicsSection = ref(null)

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

const loadHomeRecommend = async () => {
  loading.value = true
  try {
    const res = await storyApi.getHomeRecommend({ userId, limit: isMobile.value ? 4 : 6 })
    sections.value = res.data.sections || []
    topics.value = res.data.topics || []
    if (res.data.popularTags && res.data.popularTags.length > 0) {
      allTags.value = res.data.popularTags.map(t => t.tag)
    }
  } catch (err) {
    console.error('加载首页推荐失败:', err)
  } finally {
    loading.value = false
  }
}

const loadStories = async () => {
  try {
    const params = { sort: sortBy.value }
    if (selectedTag.value) {
      params.tag = selectedTag.value
    }
    const res = await storyApi.getStories(params)
    stories.value = res.data.stories
  } catch (err) {
    console.error('加载故事失败:', err)
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

const openTopic = (id) => {
  router.push(`/topic/${id}`)
}

const viewMore = (type) => {
  router.push({ path: '/stories', query: { sort: type } })
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
  const firstSection = document.querySelector('.story-section')
  if (firstSection) {
    firstSection.scrollIntoView({ behavior: 'smooth' })
  }
}

const scrollToAllTopics = () => {
  if (allTopicsSection.value) {
    allTopicsSection.value.scrollIntoView({ behavior: 'smooth' })
  }
}

onMounted(() => {
  loadHomeRecommend()
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

.topics-section {
  margin-bottom: 40px;
}

.topics-section.mobile-topics {
  margin-bottom: 28px;
}

.topics-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}

.topics-grid.mobile-topics-grid {
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.topic-card {
  border-radius: 16px;
  padding: 20px;
  cursor: pointer;
  transition: transform 0.3s, box-shadow 0.3s;
  display: flex;
  align-items: center;
  gap: 16px;
  color: #333;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
}

.topic-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0,0,0,0.15);
}

.topic-card.mobile-topic-card {
  padding: 16px;
  gap: 12px;
}

.topic-icon {
  font-size: 48px;
  flex-shrink: 0;
}

.topic-card.mobile-topic-card .topic-icon {
  font-size: 36px;
}

.topic-content {
  flex: 1;
  min-width: 0;
}

.topic-title {
  font-size: 18px;
  font-weight: 600;
  margin: 0 0 6px 0;
  color: #333;
}

.topic-card.mobile-topic-card .topic-title {
  font-size: 15px;
}

.topic-desc {
  font-size: 13px;
  color: #666;
  margin: 0 0 8px 0;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.topic-card.mobile-topic-card .topic-desc {
  font-size: 12px;
  -webkit-line-clamp: 1;
}

.topic-count {
  font-size: 12px;
  color: #888;
  background: rgba(255,255,255,0.6);
  padding: 2px 8px;
  border-radius: 10px;
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

.section-title-wrap {
  display: flex;
  align-items: baseline;
  gap: 12px;
}

.section-title {
  font-size: 24px;
  margin: 0;
  color: #333;
}

.section-title.mobile-section-title {
  font-size: 18px;
}

.section-subtitle {
  font-size: 13px;
  color: #999;
}

.story-section {
  margin-bottom: 40px;
}

.story-section:last-of-type {
  margin-bottom: 30px;
}

.stories-row {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

.stories-row.mobile-stories-row {
  grid-template-columns: 1fr;
  gap: 12px;
}

.story-card-horizontal {
  cursor: pointer;
  transition: transform 0.3s, box-shadow 0.3s;
}

.story-card-horizontal:hover {
  transform: translateY(-2px);
}

.story-card-horizontal :deep(.n-card__content) {
  display: flex;
  gap: 16px;
  padding: 16px;
}

.story-card-horizontal.mobile-story-card-horizontal :deep(.n-card__content) {
  padding: 14px;
  gap: 12px;
}

.story-card-h-cover {
  width: 100px;
  height: 140px;
  font-size: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #f0e6ff 0%, #e0ccff 100%);
  border-radius: 8px;
  flex-shrink: 0;
  position: relative;
}

.story-card-h-cover.mobile-story-card-h-cover {
  width: 80px;
  height: 110px;
  font-size: 36px;
}

.status-badge {
  position: absolute;
  bottom: 6px;
  left: 50%;
  transform: translateX(-50%);
  font-size: 10px;
  padding: 2px 6px;
  border-radius: 4px;
  font-weight: 500;
}

.status-badge.completed {
  background: #52c41a;
  color: white;
}

.status-badge.ongoing {
  background: #1890ff;
  color: white;
}

.story-card-h-info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
}

.story-card-h-title {
  font-size: 16px;
  font-weight: 600;
  margin: 0 0 6px 0;
  color: #333;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.story-card-h-title.mobile-story-card-h-title {
  font-size: 15px;
}

.story-card-h-summary {
  font-size: 13px;
  color: #666;
  line-height: 1.5;
  margin: 0 0 8px 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  flex: 1;
}

.story-card-h-summary.mobile-story-card-h-summary {
  font-size: 12px;
}

.story-card-h-tags {
  margin-bottom: 8px;
}

.story-card-h-meta {
  display: flex;
  gap: 12px;
  font-size: 12px;
  color: #999;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 4px;
}

.meta-icon {
  font-size: 13px;
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

.all-topics-section {
  margin: 50px 0 40px 0;
}

.all-topics-section.mobile-all-topics {
  margin: 36px 0 28px 0;
}

.all-topics-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
}

.all-topics-grid.mobile-all-topics-grid {
  grid-template-columns: 1fr;
  gap: 14px;
}

.all-topic-card {
  border-radius: 16px;
  padding: 20px;
  cursor: pointer;
  transition: transform 0.3s, box-shadow 0.3s;
  color: #333;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.all-topic-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0,0,0,0.15);
}

.all-topic-card.mobile-all-topic-card {
  padding: 16px;
}

.all-topic-header {
  display: flex;
  align-items: center;
  gap: 12px;
}

.all-topic-icon {
  font-size: 40px;
}

.all-topic-card.mobile-all-topic-card .all-topic-icon {
  font-size: 32px;
}

.all-topic-title {
  font-size: 18px;
  font-weight: 600;
  margin: 0;
}

.all-topic-card.mobile-all-topic-card .all-topic-title {
  font-size: 16px;
}

.all-topic-desc {
  font-size: 13px;
  color: #666;
  margin: 0;
  line-height: 1.5;
}

.all-topic-card.mobile-all-topic-card .all-topic-desc {
  font-size: 12px;
}

.all-topic-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 8px;
  border-top: 1px solid rgba(0,0,0,0.08);
}

.all-topic-count {
  font-size: 12px;
  color: #888;
  background: rgba(255,255,255,0.6);
  padding: 2px 10px;
  border-radius: 10px;
}

.all-topic-arrow {
  font-size: 16px;
  color: #666;
  font-weight: 600;
}

.all-topic-preview {
  margin-top: 4px;
  padding-top: 12px;
  border-top: 1px solid rgba(0,0,0,0.06);
}

.preview-story-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 4px 0;
  font-size: 13px;
}

.all-topic-card.mobile-all-topic-card .preview-story-item {
  font-size: 12px;
}

.preview-rank {
  width: 18px;
  height: 18px;
  background: rgba(255,255,255,0.7);
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  font-weight: 600;
  color: #666;
  flex-shrink: 0;
}

.preview-story-item:nth-child(1) .preview-rank {
  background: #ff4d4f;
  color: white;
}

.preview-story-item:nth-child(2) .preview-rank {
  background: #ff7a45;
  color: white;
}

.preview-story-item:nth-child(3) .preview-rank {
  background: #ffa940;
  color: white;
}

.preview-title {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  color: #555;
}

.filter-section {
  margin-top: 40px;
  margin-bottom: 20px;
  padding-top: 30px;
  border-top: 1px solid #f0f0f0;
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
