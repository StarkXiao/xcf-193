<template>
  <div class="activity-center">
    <div class="page-header">
      <h1 class="page-title">
        <span class="title-icon">🎯</span>
        活动中心
      </h1>
      <p class="page-subtitle">参与主题征文，赢取丰厚奖励</p>
    </div>

    <div class="featured-section" v-if="featuredActivities.length > 0">
      <h2 class="section-title">
        <span class="section-icon">🔥</span>
        热门活动
      </h2>
      <div class="featured-list">
        <div
          v-for="activity in featuredActivities"
          :key="activity.id"
          class="featured-card"
          @click="goToActivity(activity.id)"
        >
          <div class="featured-cover">
            <span class="cover-emoji">{{ activity.cover }}</span>
            <div class="status-badge" :class="activity.status">
              {{ getStatusText(activity.status) }}
            </div>
          </div>
          <div class="featured-info">
            <h3 class="featured-title">{{ activity.title }}</h3>
            <p class="featured-subtitle">{{ activity.subtitle }}</p>
            <div class="featured-stats">
              <span class="stat-item">
                <span class="stat-icon">👥</span>
                {{ activity.participantCount }}人参与
              </span>
              <span class="stat-item">
                <span class="stat-icon">📝</span>
                {{ activity.submissionCount }}篇作品
              </span>
              <span class="stat-item">
                <span class="stat-icon">👁️</span>
                {{ formatNumber(activity.viewCount) }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="filter-section">
      <n-tabs v-model:value="activeTab" type="line" @update:value="handleTabChange">
        <n-tab-pane name="all" tab="全部活动" />
        <n-tab-pane name="ongoing" tab="进行中" />
        <n-tab-pane name="upcoming" tab="即将开始" />
        <n-tab-pane name="ended" tab="已结束" />
      </n-tabs>
      <div class="sort-area">
        <n-select
          v-model:value="sortBy"
          :options="sortOptions"
          style="width: 140px"
          @update:value="loadActivities"
        />
      </div>
    </div>

    <div class="activity-list">
      <div
        v-for="activity in activities"
        :key="activity.id"
        class="activity-card"
        @click="goToActivity(activity.id)"
      >
        <div class="card-left">
          <div class="card-cover">
            <span class="cover-emoji">{{ activity.cover }}</span>
          </div>
        </div>
        <div class="card-middle">
          <div class="card-header">
            <h3 class="card-title">{{ activity.title }}</h3>
            <n-tag :type="getTagType(activity.status)" size="small">
              {{ getStatusText(activity.status) }}
            </n-tag>
          </div>
          <p class="card-subtitle">{{ activity.subtitle }}</p>
          <div class="card-tags">
            <n-tag
              v-for="tag in activity.tags.slice(0, 4)"
              :key="tag"
              size="small"
              type="info"
              round
            >
              {{ tag }}
            </n-tag>
          </div>
          <div class="card-time">
            <span class="time-item">
              <span class="time-icon">📅</span>
              {{ activity.startTime }} ~ {{ activity.endTime }}
            </span>
          </div>
        </div>
        <div class="card-right">
          <div class="card-stats">
            <div class="stat-block">
              <span class="stat-value">{{ activity.participantCount }}</span>
              <span class="stat-label">参与人数</span>
            </div>
            <div class="stat-block">
              <span class="stat-value">{{ activity.submissionCount }}</span>
              <span class="stat-label">投稿数</span>
            </div>
            <div class="stat-block">
              <span class="stat-value">{{ formatNumber(activity.viewCount) }}</span>
              <span class="stat-label">浏览量</span>
            </div>
          </div>
          <n-button type="primary" size="medium" @click.stop="goToActivity(activity.id)">
            查看详情
          </n-button>
        </div>
      </div>

      <div v-if="activities.length === 0 && !loading" class="empty-state">
        <span class="empty-icon">📭</span>
        <p class="empty-text">暂无活动</p>
      </div>
    </div>

    <div v-if="total > activities.length" class="pagination-area">
      <n-pagination
        v-model:page="currentPage"
        :page-size="pageSize"
        :item-count="total"
        :page-sizes="[10, 20, 50]"
        show-size-picker
        @update:page="loadActivities"
        @update:page-size="handlePageSizeChange"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { NTag, NButton, NTabs, NTabPane, NSelect, NPagination } from 'naive-ui'
import { activityApi } from '../api'

const router = useRouter()

const featuredActivities = ref([])
const activities = ref([])
const total = ref(0)
const currentPage = ref(1)
const pageSize = ref(10)
const activeTab = ref('all')
const sortBy = ref('newest')
const loading = ref(false)

const sortOptions = [
  { label: '最新发布', value: 'newest' },
  { label: '最受欢迎', value: 'popular' },
  { label: '即将截止', value: 'ending' }
]

const getStatusText = (status) => {
  const map = {
    upcoming: '即将开始',
    ongoing: '进行中',
    ended: '已结束'
  }
  return map[status] || status
}

const getTagType = (status) => {
  const map = {
    upcoming: 'warning',
    ongoing: 'success',
    ended: 'default'
  }
  return map[status] || 'default'
}

const formatNumber = (num) => {
  if (!num) return 0
  if (num >= 10000) return (num / 10000).toFixed(1) + 'w'
  if (num >= 1000) return (num / 1000).toFixed(1) + 'k'
  return num
}

const loadFeatured = async () => {
  try {
    const res = await activityApi.getFeaturedActivities()
    featuredActivities.value = res.data.featured || []
  } catch (err) {
    console.error('加载热门活动失败:', err)
  }
}

const loadActivities = async () => {
  loading.value = true
  try {
    const params = {
      page: currentPage.value,
      limit: pageSize.value,
      sort: sortBy.value
    }
    if (activeTab.value !== 'all') {
      params.status = activeTab.value
    }
    const res = await activityApi.getActivities(params)
    activities.value = res.data.activities || []
    total.value = res.data.total || 0
  } catch (err) {
    console.error('加载活动列表失败:', err)
  } finally {
    loading.value = false
  }
}

const handleTabChange = () => {
  currentPage.value = 1
  loadActivities()
}

const handlePageSizeChange = () => {
  currentPage.value = 1
  loadActivities()
}

const goToActivity = (id) => {
  router.push(`/activity/${id}`)
}

onMounted(() => {
  loadFeatured()
  loadActivities()
})
</script>

<style scoped>
.activity-center {
  min-height: 100vh;
}

.page-header {
  text-align: center;
  margin-bottom: 32px;
  padding: 32px 0;
  background: linear-gradient(135deg, rgba(157, 78, 221, 0.1) 0%, rgba(199, 125, 255, 0.1) 100%);
  border-radius: 16px;
}

.page-title {
  font-size: 32px;
  margin: 0 0 8px 0;
  color: #e0aaff;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
}

.title-icon {
  font-size: 36px;
}

.page-subtitle {
  font-size: 16px;
  color: #c77dff;
  margin: 0;
  opacity: 0.8;
}

.featured-section {
  margin-bottom: 32px;
}

.section-title {
  font-size: 20px;
  color: #e0aaff;
  margin: 0 0 16px 0;
  display: flex;
  align-items: center;
  gap: 8px;
}

.section-icon {
  font-size: 22px;
}

.featured-list {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 20px;
}

.featured-card {
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
  border-radius: 16px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s;
  border: 1px solid rgba(199, 125, 255, 0.2);
}

.featured-card:hover {
  transform: translateY(-4px);
  border-color: rgba(199, 125, 255, 0.5);
  box-shadow: 0 8px 32px rgba(157, 78, 221, 0.2);
}

.featured-cover {
  height: 140px;
  background: linear-gradient(135deg, rgba(157, 78, 221, 0.3) 0%, rgba(199, 125, 255, 0.3) 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.cover-emoji {
  font-size: 64px;
}

.status-badge {
  position: absolute;
  top: 12px;
  right: 12px;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
}

.status-badge.ongoing {
  background: rgba(34, 197, 94, 0.2);
  color: #4ade80;
}

.status-badge.upcoming {
  background: rgba(234, 179, 8, 0.2);
  color: #facc15;
}

.status-badge.ended {
  background: rgba(107, 114, 128, 0.2);
  color: #9ca3af;
}

.featured-info {
  padding: 16px;
}

.featured-title {
  font-size: 18px;
  color: #ffffff;
  margin: 0 0 6px 0;
}

.featured-subtitle {
  font-size: 14px;
  color: #c77dff;
  margin: 0 0 12px 0;
  opacity: 0.8;
}

.featured-stats {
  display: flex;
  gap: 16px;
  font-size: 13px;
  color: #9ca3af;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 4px;
}

.stat-icon {
  font-size: 14px;
}

.filter-section {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
  padding: 16px;
  background: rgba(26, 26, 46, 0.6);
  border-radius: 12px;
}

.sort-area {
  display: flex;
  gap: 12px;
}

.activity-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.activity-card {
  display: flex;
  gap: 20px;
  padding: 20px;
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
  border-radius: 16px;
  cursor: pointer;
  transition: all 0.3s;
  border: 1px solid rgba(199, 125, 255, 0.1);
}

.activity-card:hover {
  border-color: rgba(199, 125, 255, 0.3);
  transform: translateX(4px);
}

.card-left {
  flex-shrink: 0;
}

.card-cover {
  width: 100px;
  height: 100px;
  background: linear-gradient(135deg, rgba(157, 78, 221, 0.2) 0%, rgba(199, 125, 255, 0.2) 100%);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.card-cover .cover-emoji {
  font-size: 48px;
}

.card-middle {
  flex: 1;
  min-width: 0;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 8px;
}

.card-title {
  font-size: 18px;
  color: #ffffff;
  margin: 0;
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.card-subtitle {
  font-size: 14px;
  color: #c77dff;
  margin: 0 0 10px 0;
  opacity: 0.8;
}

.card-tags {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
  margin-bottom: 10px;
}

.card-time {
  font-size: 13px;
  color: #9ca3af;
}

.time-item {
  display: flex;
  align-items: center;
  gap: 6px;
}

.time-icon {
  font-size: 14px;
}

.card-right {
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  justify-content: space-between;
  gap: 16px;
}

.card-stats {
  display: flex;
  gap: 24px;
}

.stat-block {
  text-align: center;
}

.stat-value {
  display: block;
  font-size: 20px;
  font-weight: bold;
  color: #e0aaff;
}

.stat-label {
  display: block;
  font-size: 12px;
  color: #9ca3af;
  margin-top: 2px;
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
}

.empty-icon {
  font-size: 64px;
  display: block;
  margin-bottom: 16px;
}

.empty-text {
  font-size: 16px;
  color: #9ca3af;
}

.pagination-area {
  display: flex;
  justify-content: center;
  margin-top: 32px;
  padding: 20px;
}
</style>
