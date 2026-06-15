<template>
  <div class="creation-task-center">
    <div class="page-header">
      <h1 class="page-title">
        <span class="title-icon">📝</span>
        创作任务中心
      </h1>
      <p class="page-subtitle">接受平台派发任务，完成阶段目标，赢取丰厚奖励</p>
    </div>

    <div class="stats-overview">
      <div class="stat-card">
        <div class="stat-icon">🎯</div>
        <div class="stat-content">
          <div class="stat-value">{{ myTasks.length }}</div>
          <div class="stat-label">参与任务</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">✅</div>
        <div class="stat-content">
          <div class="stat-value">{{ completedCount }}</div>
          <div class="stat-label">已完成</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">💎</div>
        <div class="stat-content">
          <div class="stat-value">{{ totalPoints }}</div>
          <div class="stat-label">累计积分</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">🏆</div>
        <div class="stat-content">
          <div class="stat-value">{{ badges.length }}</div>
          <div class="stat-label">获得徽章</div>
        </div>
      </div>
    </div>

    <div class="featured-section" v-if="featuredTasks.length > 0">
      <h2 class="section-title">
        <span class="section-icon">🔥</span>
        热门任务
      </h2>
      <div class="featured-list">
        <div
          v-for="task in featuredTasks"
          :key="task.id"
          class="featured-card"
          :style="{ background: task.gradient }"
          @click="goToTask(task.id)"
        >
          <div class="featured-cover">
            <span class="cover-emoji">{{ task.cover }}</span>
            <div class="status-badge" :class="task.status">
              {{ getStatusText(task.status) }}
            </div>
          </div>
          <div class="featured-info">
            <h3 class="featured-title">{{ task.title }}</h3>
            <p class="featured-desc">{{ task.description }}</p>
            <div class="featured-meta">
              <n-tag :type="getDifficultyType(task.difficulty)" size="small">
                {{ getDifficultyText(task.difficulty) }}
              </n-tag>
              <n-tag type="info" size="small">
                {{ task.stages.length }}个阶段
              </n-tag>
              <span class="meta-item">
                <span class="meta-icon">👥</span>
                {{ task.totalParticipants }}人参与
              </span>
            </div>
            <div class="featured-rewards">
              <span class="reward-item">
                <span class="reward-icon">💎</span>
                {{ task.rewards.points }}积分
              </span>
              <span class="reward-item" v-if="task.rewards.badge">
                <span class="reward-icon">{{ task.rewards.badgeIcon }}</span>
                {{ task.rewards.badge }}
              </span>
              <span class="reward-item" v-if="task.rewards.cashReward">
                <span class="reward-icon">💰</span>
                ¥{{ task.rewards.cashReward }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="filter-section">
      <n-tabs v-model:value="activeTab" type="line" @update:value="handleTabChange">
        <n-tab-pane name="all" tab="全部任务" />
        <n-tab-pane name="active" tab="进行中" />
        <n-tab-pane name="upcoming" tab="即将开始" />
        <n-tab-pane name="completed" tab="已完成" />
        <n-tab-pane name="my" tab="我的任务" />
      </n-tabs>
      <div class="filter-area">
        <n-select
          v-model:value="typeFilter"
          :options="typeOptions"
          placeholder="任务类型"
          style="width: 120px"
          @update:value="loadTasks"
        />
        <n-select
          v-model:value="difficultyFilter"
          :options="difficultyOptions"
          placeholder="难度"
          style="width: 100px"
          @update:value="loadTasks"
        />
      </div>
    </div>

    <div class="task-list">
      <div
        v-for="task in displayTasks"
        :key="task.id"
        class="task-card"
        @click="goToTask(task.id)"
      >
        <div class="card-left">
          <div class="card-cover" :style="{ background: task.gradient }">
            <span class="cover-emoji">{{ task.cover }}</span>
          </div>
        </div>
        <div class="card-middle">
          <div class="card-header">
            <h3 class="card-title">{{ task.title }}</h3>
            <n-tag :type="getTaskStatusTagType(task)" size="small">
              {{ getTaskStatusText(task) }}
            </n-tag>
          </div>
          <p class="card-desc">{{ task.description }}</p>
          <div class="card-tags">
            <n-tag
              v-for="tag in task.tags.slice(0, 4)"
              :key="tag"
              size="small"
              type="info"
              round
            >
              {{ tag }}
            </n-tag>
          </div>
          <div class="card-requirements">
            <span class="req-item">最低字数: {{ task.requirements.minWordCount }}字</span>
            <span class="req-item">最少结局: {{ task.requirements.minEndings }}个</span>
          </div>
          <div class="card-progress" v-if="task.userProgress">
            <n-progress 
              type="line" 
              :percentage="task.userProgress.overallProgress"
              color="#9d4edd"
              :stroke-width="8"
            />
            <span class="progress-text">{{ task.userProgress.overallProgress }}% · 第{{ task.userProgress.currentStage }}阶段</span>
          </div>
        </div>
        <div class="card-right">
          <div class="card-stages">
            <div 
              v-for="stage in task.stages" 
              :key="stage.id" 
              class="stage-dot"
              :class="{ completed: task.userProgress && task.userProgress.stages.find(s => s.stageId === stage.id)?.status === 'completed' }"
              :title="stage.name"
            >
              {{ stage.order }}
            </div>
          </div>
          <div class="card-rewards">
            <div class="reward-preview">
              <span class="reward-preview-icon">💎</span>
              <span class="reward-preview-value">{{ task.rewards.points }}</span>
            </div>
            <div class="reward-preview" v-if="task.rewards.badge">
              <span class="reward-preview-icon">{{ task.rewards.badgeIcon }}</span>
              <span class="reward-preview-value">徽章</span>
            </div>
          </div>
          <div class="card-info">
            <span class="info-item">
              <span class="info-icon">👥</span>
              {{ task.totalParticipants }}人
            </span>
            <span class="info-item">
              <span class="info-icon">✅</span>
              {{ task.completedCount }}人完成
            </span>
          </div>
          <n-button type="primary" size="medium" @click.stop="goToTask(task.id)">
            {{ task.userProgress ? '继续创作' : '立即参与' }}
          </n-button>
        </div>
      </div>

      <div v-if="displayTasks.length === 0 && !loading" class="empty-state">
        <span class="empty-icon">📭</span>
        <p class="empty-text">暂无任务</p>
      </div>
    </div>

    <div v-if="total > displayTasks.length" class="pagination-area">
      <n-pagination
        v-model:page="currentPage"
        :page-size="pageSize"
        :item-count="total"
        :page-sizes="[10, 20, 50]"
        show-size-picker
        @update:page="loadTasks"
        @update:page-size="handlePageSizeChange"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { NTag, NButton, NTabs, NTabPane, NSelect, NPagination, NProgress } from 'naive-ui'
import { creationTaskApi } from '../api'

const router = useRouter()

const currentUser = ref({
  id: 'user-1',
  username: '月下独酌',
  avatar: '🌸'
})

const featuredTasks = ref([])
const allTasks = ref([])
const myTasks = ref([])
const total = ref(0)
const currentPage = ref(1)
const pageSize = ref(10)
const activeTab = ref('all')
const typeFilter = ref(null)
const difficultyFilter = ref(null)
const loading = ref(false)
const totalPoints = ref(0)
const badges = ref([])

const typeOptions = [
  { label: '主题创作', value: 'themed' },
  { label: '同人创作', value: 'fanfic' },
  { label: '世界共建', value: 'worldbuilding' }
]

const difficultyOptions = [
  { label: '简单', value: 'easy' },
  { label: '中等', value: 'medium' },
  { label: '困难', value: 'hard' }
]

const completedCount = computed(() => {
  return myTasks.value.filter(t => t.status === 'completed').length
})

const displayTasks = computed(() => {
  if (activeTab.value === 'my') {
    return myTasks.value.map(pt => ({
      ...pt.task,
      userProgress: {
        currentStage: pt.currentStage,
        overallProgress: pt.overallProgress,
        stages: pt.stages,
        status: pt.status
      }
    }))
  }
  return allTasks.value
})

const getStatusText = (status) => {
  const map = {
    active: '进行中',
    upcoming: '即将开始',
    completed: '已结束'
  }
  return map[status] || status
}

const getDifficultyText = (difficulty) => {
  const map = {
    easy: '简单',
    medium: '中等',
    hard: '困难'
  }
  return map[difficulty] || difficulty
}

const getDifficultyType = (difficulty) => {
  const map = {
    easy: 'success',
    medium: 'warning',
    hard: 'error'
  }
  return map[difficulty] || 'default'
}

const getTaskStatusText = (task) => {
  if (task.userProgress) {
    const map = {
      'in_progress': '进行中',
      'completed': '已完成',
      'in_review': '审核中'
    }
    return map[task.userProgress.status] || '进行中'
  }
  return getStatusText(task.status)
}

const getTaskStatusTagType = (task) => {
  if (task.userProgress) {
    const map = {
      'in_progress': 'info',
      'completed': 'success',
      'in_review': 'warning'
    }
    return map[task.userProgress.status] || 'info'
  }
  const map = {
    active: 'success',
    upcoming: 'warning',
    completed: 'default'
  }
  return map[task.status] || 'default'
}

const loadFeatured = async () => {
  try {
    const res = await creationTaskApi.getFeaturedTasks()
    featuredTasks.value = res.data.featured || []
  } catch (err) {
    console.error('加载热门任务失败:', err)
  }
}

const loadTasks = async () => {
  loading.value = true
  try {
    const params = {
      page: currentPage.value,
      limit: pageSize.value,
      userId: currentUser.value.id
    }
    if (activeTab.value !== 'all' && activeTab.value !== 'my') {
      params.status = activeTab.value
    }
    if (typeFilter.value) params.type = typeFilter.value
    if (difficultyFilter.value) params.difficulty = difficultyFilter.value

    const res = await creationTaskApi.getTasks(params)
    allTasks.value = res.data.tasks || []
    total.value = res.data.total || 0
  } catch (err) {
    console.error('加载任务列表失败:', err)
  } finally {
    loading.value = false
  }
}

const loadMyTasks = async () => {
  try {
    const res = await creationTaskApi.getMyTasks(currentUser.value.id)
    myTasks.value = res.data.myTasks || []
  } catch (err) {
    console.error('加载我的任务失败:', err)
  }
}

const loadUserRewards = async () => {
  try {
    const res = await creationTaskApi.getUserRewards(currentUser.value.id)
    totalPoints.value = res.data.totalPoints || 0
    badges.value = res.data.badges || []
  } catch (err) {
    console.error('加载用户奖励失败:', err)
  }
}

const handleTabChange = () => {
  currentPage.value = 1
  if (activeTab.value === 'my') {
    loadMyTasks()
  } else {
    loadTasks()
  }
}

const handlePageSizeChange = () => {
  currentPage.value = 1
  loadTasks()
}

const goToTask = (id) => {
  router.push(`/creation-task/${id}`)
}

onMounted(() => {
  loadFeatured()
  loadTasks()
  loadMyTasks()
  loadUserRewards()
})
</script>

<style scoped>
.creation-task-center {
  max-width: 1200px;
  margin: 0 auto;
}

.page-header {
  text-align: center;
  margin-bottom: 32px;
}

.page-title {
  font-size: 32px;
  font-weight: bold;
  color: #e0aaff;
  margin: 0 0 8px 0;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
}

.title-icon {
  font-size: 36px;
}

.page-subtitle {
  color: #c77dff;
  font-size: 16px;
  margin: 0;
  opacity: 0.8;
}

.stats-overview {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-bottom: 32px;
}

.stat-card {
  background: linear-gradient(135deg, rgba(157, 78, 221, 0.1) 0%, rgba(199, 125, 255, 0.1) 100%);
  border: 1px solid rgba(199, 125, 255, 0.2);
  border-radius: 16px;
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 16px;
  transition: all 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-2px);
  border-color: rgba(199, 125, 255, 0.4);
}

.stat-icon {
  font-size: 36px;
  width: 56px;
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(199, 125, 255, 0.1);
  border-radius: 12px;
}

.stat-content {
  flex: 1;
}

.stat-value {
  font-size: 24px;
  font-weight: bold;
  color: #e0aaff;
  margin-bottom: 4px;
}

.stat-label {
  font-size: 13px;
  color: #c77dff;
  opacity: 0.7;
}

.section-title {
  font-size: 20px;
  font-weight: bold;
  color: #e0aaff;
  margin: 0 0 20px 0;
  display: flex;
  align-items: center;
  gap: 8px;
}

.section-icon {
  font-size: 24px;
}

.featured-section {
  margin-bottom: 32px;
}

.featured-list {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
}

.featured-card {
  border-radius: 16px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
}

.featured-card::before {
  content: '';
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  z-index: 1;
}

.featured-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 32px rgba(157, 78, 221, 0.3);
}

.featured-cover {
  padding: 32px;
  position: relative;
  z-index: 2;
}

.cover-emoji {
  font-size: 64px;
  display: block;
  margin-bottom: 12px;
}

.status-badge {
  display: inline-block;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
  background: rgba(255, 255, 255, 0.2);
  color: white;
  backdrop-filter: blur(10px);
}

.status-badge.active {
  background: rgba(72, 187, 120, 0.8);
}

.status-badge.upcoming {
  background: rgba(245, 158, 11, 0.8);
}

.status-badge.completed {
  background: rgba(107, 114, 128, 0.8);
}

.featured-info {
  padding: 20px;
  position: relative;
  z-index: 2;
  background: rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(10px);
}

.featured-title {
  font-size: 18px;
  font-weight: bold;
  color: white;
  margin: 0 0 8px 0;
}

.featured-desc {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.8);
  margin: 0 0 12px 0;
  line-height: 1.6;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.featured-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
  margin-bottom: 12px;
}

.meta-item {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.7);
  display: flex;
  align-items: center;
  gap: 4px;
}

.meta-icon {
  font-size: 14px;
}

.featured-rewards {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.reward-item {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 13px;
  color: rgba(255, 255, 255, 0.9);
  background: rgba(255, 255, 255, 0.1);
  padding: 4px 10px;
  border-radius: 12px;
}

.reward-icon {
  font-size: 14px;
}

.filter-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  background: rgba(157, 78, 221, 0.05);
  padding: 16px 20px;
  border-radius: 12px;
  border: 1px solid rgba(199, 125, 255, 0.1);
}

.filter-area {
  display: flex;
  gap: 12px;
}

.task-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.task-card {
  display: flex;
  background: linear-gradient(135deg, rgba(26, 26, 46, 0.9) 0%, rgba(22, 33, 62, 0.9) 100%);
  border: 1px solid rgba(199, 125, 255, 0.15);
  border-radius: 16px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s ease;
}

.task-card:hover {
  border-color: rgba(199, 125, 255, 0.4);
  transform: translateX(4px);
}

.card-left {
  width: 120px;
  flex-shrink: 0;
}

.card-cover {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.card-cover .cover-emoji {
  font-size: 48px;
  margin: 0;
}

.card-middle {
  flex: 1;
  padding: 20px;
  border-left: 1px solid rgba(199, 125, 255, 0.1);
  border-right: 1px solid rgba(199, 125, 255, 0.1);
}

.card-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 8px;
}

.card-title {
  font-size: 18px;
  font-weight: bold;
  color: #e0aaff;
  margin: 0;
  flex: 1;
}

.card-desc {
  font-size: 14px;
  color: #a78bfa;
  margin: 0 0 12px 0;
  line-height: 1.6;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.card-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 12px;
}

.card-requirements {
  display: flex;
  gap: 16px;
  margin-bottom: 12px;
}

.req-item {
  font-size: 12px;
  color: #a78bfa;
  opacity: 0.7;
}

.card-progress {
  display: flex;
  align-items: center;
  gap: 12px;
}

.progress-text {
  font-size: 12px;
  color: #c77dff;
  white-space: nowrap;
}

.card-right {
  width: 180px;
  flex-shrink: 0;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.card-stages {
  display: flex;
  gap: 6px;
  justify-content: center;
}

.stage-dot {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: rgba(199, 125, 255, 0.1);
  border: 1px solid rgba(199, 125, 255, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  font-weight: bold;
  color: #c77dff;
  transition: all 0.3s ease;
}

.stage-dot.completed {
  background: linear-gradient(135deg, #9d4edd 0%, #c77dff 100%);
  border-color: #c77dff;
  color: white;
}

.card-rewards {
  display: flex;
  justify-content: center;
  gap: 12px;
}

.reward-preview {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.reward-preview-icon {
  font-size: 20px;
}

.reward-preview-value {
  font-size: 11px;
  color: #c77dff;
}

.card-info {
  display: flex;
  justify-content: center;
  gap: 16px;
}

.info-item {
  font-size: 12px;
  color: #a78bfa;
  display: flex;
  align-items: center;
  gap: 4px;
}

.info-icon {
  font-size: 14px;
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
  color: #a78bfa;
}

.empty-icon {
  font-size: 64px;
  display: block;
  margin-bottom: 16px;
  opacity: 0.5;
}

.empty-text {
  font-size: 16px;
  opacity: 0.6;
  margin: 0;
}

.pagination-area {
  display: flex;
  justify-content: center;
  margin-top: 32px;
}

@media (max-width: 1024px) {
  .stats-overview {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .featured-list {
    grid-template-columns: 1fr;
  }
  
  .task-card {
    flex-direction: column;
  }
  
  .card-left {
    width: 100%;
    height: 120px;
  }
  
  .card-right {
    width: 100%;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    border-top: 1px solid rgba(199, 125, 255, 0.1);
  }
}

@media (max-width: 640px) {
  .stats-overview {
    grid-template-columns: 1fr;
  }
  
  .filter-section {
    flex-direction: column;
    gap: 16px;
    align-items: stretch;
  }
  
  .filter-area {
    width: 100%;
  }
  
  .filter-area > * {
    flex: 1;
  }
}
</style>
