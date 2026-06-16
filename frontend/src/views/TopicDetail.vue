<template>
  <div class="topic-detail" :class="{ 'is-mobile': isMobile }">
    <div class="back-bar" :class="{ 'mobile-back-bar': isMobile }">
      <n-button text @click="goBack">
        <template #icon>←</template>
        返回首页
      </n-button>
    </div>

    <n-spin :show="loading" size="large">
      <div v-if="topic" class="detail-container">
        <div class="topic-header" :style="{ background: topic.color }">
          <div class="header-overlay"></div>
          <div class="header-content">
            <div class="topic-big-icon">{{ topic.cover }}</div>
            <div class="topic-intro">
              <h1 class="topic-title">{{ topic.title }}</h1>
              <p class="topic-description">{{ topic.description }}</p>
              <div class="topic-stats">
                <span class="stat-item">
                  <span class="stat-icon">📖</span>
                  <span class="stat-text">{{ topic.storyCount }} 个故事</span>
                </span>
              </div>
            </div>
          </div>
        </div>

        <div class="topic-content">
          <div class="filter-bar" :class="{ 'mobile-filter-bar': isMobile }">
            <div class="filter-label">排序方式</div>
            <n-radio-group v-model:value="sortBy" :size="isMobile ? 'small' : 'medium'" @update:value="loadTopicStories">
              <n-radio-button value="popular">最受欢迎</n-radio-button>
              <n-radio-button value="newest">最新上架</n-radio-button>
              <n-radio-button value="rating">编辑推荐</n-radio-button>
            </n-radio-group>
          </div>

          <div v-if="stories.length > 0" class="stories-list">
            <n-card 
              v-for="story in stories" 
              :key="story.id"
              hoverable
              class="story-card"
              :class="{ 'mobile-story-card': isMobile }"
              @click="openStory(story.id)"
            >
              <div class="story-card-left">
                <div class="story-cover" :class="{ 'mobile-story-cover': isMobile }">
                  {{ story.cover }}
                  <span v-if="story.status === 'completed'" class="status-badge completed">完结</span>
                  <span v-else class="status-badge ongoing">连载中</span>
                </div>
              </div>
              <div class="story-card-right">
                <h3 class="story-title" :class="{ 'mobile-story-title': isMobile }">{{ story.title }}</h3>
                <p class="story-summary" :class="{ 'mobile-story-summary': isMobile }">{{ story.summary }}</p>
                <div class="story-tags">
                  <n-tag 
                    v-for="tag in (story.tags || []).slice(0, isMobile ? 2 : 4)" 
                    :key="tag" 
                    size="small" 
                    type="primary"
                  >
                    {{ tag }}
                  </n-tag>
                </div>
                <div class="story-meta">
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

          <div v-if="stories.length === 0 && !loading" class="empty-state">
            <div class="empty-icon">📭</div>
            <p>该专题暂无故事</p>
          </div>

          <div v-if="hasMore" class="load-more-section">
            <n-button :loading="loadingMore" @click="loadMore">
              加载更多
            </n-button>
          </div>
        </div>
      </div>
    </n-spin>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { NButton, NCard, NTag, NRadioGroup, NRadioButton, NSpin } from 'naive-ui'
import { storyApi } from '../api'
import { useResponsive } from '../composables/useResponsive'

const router = useRouter()
const route = useRoute()
const { isMobile } = useResponsive()

const topic = ref(null)
const stories = ref([])
const loading = ref(false)
const loadingMore = ref(false)
const sortBy = ref('popular')
const page = ref(1)
const total = ref(0)
const pageSize = 10

const hasMore = computed(() => stories.value.length < total.value)

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

const loadTopicDetail = async () => {
  loading.value = true
  try {
    const res = await storyApi.getFeaturedTopicDetail(route.params.id, { 
      sort: sortBy.value,
      page: 1,
      limit: pageSize
    })
    topic.value = res.data.topic
    stories.value = res.data.stories
    total.value = res.data.total
    page.value = 1
  } catch (err) {
    console.error('加载专题详情失败:', err)
  } finally {
    loading.value = false
  }
}

const loadTopicStories = async () => {
  loading.value = true
  try {
    const res = await storyApi.getFeaturedTopicDetail(route.params.id, { 
      sort: sortBy.value,
      page: 1,
      limit: pageSize
    })
    stories.value = res.data.stories
    total.value = res.data.total
    page.value = 1
  } catch (err) {
    console.error('加载故事失败:', err)
  } finally {
    loading.value = false
  }
}

const loadMore = async () => {
  if (loadingMore.value || !hasMore.value) return
  loadingMore.value = true
  try {
    const nextPage = page.value + 1
    const res = await storyApi.getFeaturedTopicDetail(route.params.id, { 
      sort: sortBy.value,
      page: nextPage,
      limit: pageSize
    })
    stories.value = [...stories.value, ...res.data.stories]
    page.value = nextPage
  } catch (err) {
    console.error('加载更多失败:', err)
  } finally {
    loadingMore.value = false
  }
}

const openStory = (id) => {
  router.push(`/story/${id}`)
}

const goBack = () => {
  router.push('/')
}

onMounted(() => {
  loadTopicDetail()
})
</script>

<style scoped>
.topic-detail {
  padding-bottom: 40px;
}

.back-bar {
  margin-bottom: 20px;
}

.back-bar.mobile-back-bar {
  margin-bottom: 16px;
}

.topic-header {
  border-radius: 20px;
  padding: 48px 40px;
  margin-bottom: 32px;
  position: relative;
  overflow: hidden;
  color: #333;
}

.topic-header .header-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
}

.header-content {
  position: relative;
  z-index: 2;
  display: flex;
  align-items: center;
  gap: 32px;
}

.topic-big-icon {
  font-size: 80px;
  flex-shrink: 0;
}

.topic-intro {
  flex: 1;
  min-width: 0;
}

.topic-title {
  font-size: 36px;
  font-weight: bold;
  margin: 0 0 12px 0;
  color: #333;
}

.topic-description {
  font-size: 16px;
  color: #555;
  margin: 0 0 16px 0;
  line-height: 1.6;
}

.topic-stats {
  display: flex;
  gap: 24px;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  color: #666;
  background: rgba(255, 255, 255, 0.6);
  padding: 6px 12px;
  border-radius: 20px;
}

.stat-icon {
  font-size: 16px;
}

.topic-content {
  max-width: 900px;
  margin: 0 auto;
}

.filter-bar {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 24px;
  padding: 16px 20px;
  background: #fafafa;
  border-radius: 12px;
}

.filter-bar.mobile-filter-bar {
  flex-direction: column;
  align-items: flex-start;
  gap: 12px;
  padding: 14px 16px;
  margin-bottom: 16px;
}

.filter-label {
  font-size: 14px;
  color: #666;
  font-weight: 500;
}

.stories-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.story-card {
  cursor: pointer;
  transition: transform 0.3s, box-shadow 0.3s;
}

.story-card:hover {
  transform: translateY(-2px);
}

.story-card :deep(.n-card__content) {
  display: flex;
  gap: 20px;
  padding: 20px;
}

.story-card.mobile-story-card :deep(.n-card__content) {
  padding: 16px;
  gap: 14px;
}

.story-card-left {
  flex-shrink: 0;
}

.story-cover {
  width: 100px;
  height: 140px;
  font-size: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #f0e6ff 0%, #e0ccff 100%);
  border-radius: 8px;
  position: relative;
}

.story-cover.mobile-story-cover {
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

.story-card-right {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
}

.story-title {
  font-size: 18px;
  font-weight: 600;
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
  margin: 0 0 10px 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  flex: 1;
}

.story-summary.mobile-story-summary {
  font-size: 13px;
}

.story-tags {
  margin-bottom: 10px;
}

.story-meta {
  display: flex;
  gap: 16px;
  font-size: 13px;
  color: #999;
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

.empty-icon {
  font-size: 64px;
  margin-bottom: 16px;
}

.empty-state p {
  color: #999;
  margin: 0;
}

.load-more-section {
  text-align: center;
  margin-top: 32px;
}

@media (max-width: 768px) {
  .topic-header {
    border-radius: 16px;
    padding: 32px 24px;
    margin-bottom: 24px;
  }

  .header-content {
    flex-direction: column;
    text-align: center;
    gap: 20px;
  }

  .topic-big-icon {
    font-size: 64px;
  }

  .topic-title {
    font-size: 28px;
  }

  .topic-description {
    font-size: 14px;
  }

  .topic-stats {
    justify-content: center;
  }
}
</style>
