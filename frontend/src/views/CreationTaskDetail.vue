<template>
  <div class="creation-task-detail">
    <div class="back-btn" @click="goBack">
      <span class="back-icon">←</span>
      返回任务中心
    </div>

    <div class="task-header" :style="{ background: task?.gradient }">
      <div class="header-overlay"></div>
      <div class="header-content">
        <div class="task-cover">
          <span class="cover-emoji">{{ task?.cover }}</span>
        </div>
        <div class="task-info">
          <div class="task-meta">
            <n-tag :type="getDifficultyType(task?.difficulty)" size="small">
              {{ getDifficultyText(task?.difficulty) }}
            </n-tag>
            <n-tag type="info" size="small">
              {{ getTypeText(task?.type) }}
            </n-tag>
            <n-tag :type="getStatusTagType(task?.status)" size="small">
              {{ getStatusText(task?.status) }}
            </n-tag>
          </div>
          <h1 class="task-title">{{ task?.title }}</h1>
          <p class="task-desc">{{ task?.description }}</p>
          <div class="task-stats">
            <div class="stat-item">
              <span class="stat-icon">👥</span>
              <span class="stat-value">{{ task?.totalParticipants }}</span>
              <span class="stat-label">人参与</span>
            </div>
            <div class="stat-item">
              <span class="stat-icon">✅</span>
              <span class="stat-value">{{ task?.completedCount }}</span>
              <span class="stat-label">人完成</span>
            </div>
            <div class="stat-item">
              <span class="stat-icon">📊</span>
              <span class="stat-value">{{ completionRate }}</span>
              <span class="stat-label">完成率</span>
            </div>
            <div class="stat-item">
              <span class="stat-icon">📅</span>
              <span class="stat-value">{{ task?.startDate }}</span>
              <span class="stat-label">开始</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="task-body">
      <div class="main-content">
        <div class="section">
          <h2 class="section-title">
            <span class="section-icon">📋</span>
            任务要求
          </h2>
          <div class="requirements-card">
            <div class="req-row">
              <div class="req-item">
                <span class="req-label">最低字数</span>
                <span class="req-value">{{ task?.requirements.minWordCount }}字</span>
              </div>
              <div class="req-item">
                <span class="req-label">最少结局</span>
                <span class="req-value">{{ task?.requirements.minEndings }}个</span>
              </div>
            </div>
            <div class="req-row" v-if="task?.requirements.mustIncludeTags?.length > 0">
              <div class="req-item full">
                <span class="req-label">必须包含标签</span>
                <div class="req-tags">
                  <n-tag 
                    v-for="tag in task?.requirements.mustIncludeTags" 
                    :key="tag" 
                    size="small" 
                    type="success"
                  >
                    {{ tag }}
                  </n-tag>
                </div>
              </div>
            </div>
            <div class="req-row" v-if="task?.requirements.forbiddenTags?.length > 0">
              <div class="req-item full">
                <span class="req-label">禁止标签</span>
                <div class="req-tags">
                  <n-tag 
                    v-for="tag in task?.requirements.forbiddenTags" 
                    :key="tag" 
                    size="small" 
                    type="error"
                  >
                    {{ tag }}
                  </n-tag>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="section">
          <h2 class="section-title">
            <span class="section-icon">🎯</span>
            阶段目标
            <span class="title-badge">{{ task?.stages?.length }}个阶段</span>
          </h2>
          <div class="stages-timeline">
            <div 
              v-for="(stage, index) in task?.stages" 
              :key="stage.id" 
              class="stage-item"
              :class="{ 
                active: getStageStatus(stage.id) === 'in_progress',
                completed: getStageStatus(stage.id) === 'completed',
                pending: getStageStatus(stage.id) === 'pending'
              }"
            >
              <div class="stage-line" v-if="index < task.stages.length - 1"></div>
              <div class="stage-dot">
                <span v-if="getStageStatus(stage.id) === 'completed'">✓</span>
                <span v-else>{{ index + 1 }}</span>
              </div>
              <div class="stage-content">
                <div class="stage-header">
                  <h3 class="stage-name">{{ stage.name }}</h3>
                  <n-tag :type="getStageTagType(stage.id)" size="small">
                    {{ getStageStatusText(stage.id) }}
                  </n-tag>
                </div>
                <p class="stage-desc">{{ stage.description }}</p>
                <div class="stage-requirements">
                  <span class="stage-req-icon">📝</span>
                  <span class="stage-req-text">{{ stage.requirements }}</span>
                </div>
                <div class="stage-footer">
                  <div class="stage-deadline">
                    <span class="deadline-icon">⏰</span>
                    截止: {{ stage.deadline }}
                  </div>
                  <div class="stage-reward">
                    <span class="reward-icon">🎁</span>
                    {{ stage.reward.description }}
                  </div>
                </div>
                <div class="stage-actions" v-if="getStageStatus(stage.id) === 'in_progress'">
                  <n-button 
                    type="primary" 
                    size="medium" 
                    @click="openSubmitModal(stage)"
                  >
                    提交作品
                  </n-button>
                  <n-button 
                    size="medium" 
                    @click="goToEditor"
                  >
                    前往创作
                  </n-button>
                </div>
                <div class="stage-review" v-if="getStageStatus(stage.id) === 'in_review'">
                  <n-alert type="warning" title="审核中">
                    你的作品已提交，正在等待审核...
                  </n-alert>
                </div>
                <div class="stage-review" v-if="getStageStatus(stage.id) === 'completed'">
                  <n-alert type="success" :title="`已完成 - ${getStageReviewComment(stage.id)}`">
                    <template v-if="getStageSubmittedAt(stage.id)">
                      提交时间: {{ getStageSubmittedAt(stage.id) }}
                    </template>
                  </n-alert>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="side-content">
        <div class="side-card" v-if="userProgress">
          <h3 class="side-title">我的进度</h3>
          <div class="progress-overview">
            <n-progress 
              type="circle"
              :percentage="userProgress.overallProgress" 
              :show-indicator="false"
              :stroke-width="8"
              color="#9d4edd"
            >
              <div class="progress-text">
                <span class="progress-value">{{ userProgress.overallProgress }}%</span>
                <span class="progress-label">完成度</span>
              </div>
            </n-progress>
          </div>
          <div class="progress-info">
            <div class="info-row">
              <span class="info-label">当前阶段</span>
              <span class="info-value">第{{ userProgress.currentStage }}阶段</span>
            </div>
            <div class="info-row">
              <span class="info-label">任务状态</span>
              <n-tag :type="userProgress.status === 'completed' ? 'success' : 'info'" size="small">
                {{ userProgress.status === 'completed' ? '已完成' : '进行中' }}
              </n-tag>
            </div>
            <div class="info-row">
              <span class="info-label">参与时间</span>
              <span class="info-value">{{ userProgress.joinedAt }}</span>
            </div>
          </div>
        </div>

        <div class="side-card">
          <h3 class="side-title">奖励预览</h3>
          <div class="rewards-list">
            <div class="reward-item">
              <span class="reward-icon">💎</span>
              <div class="reward-info">
                <span class="reward-name">积分奖励</span>
                <span class="reward-value">{{ task?.rewards.points }}积分</span>
              </div>
            </div>
            <div class="reward-item" v-if="task?.rewards.badge">
              <span class="reward-icon">{{ task?.rewards.badgeIcon }}</span>
              <div class="reward-info">
                <span class="reward-name">专属徽章</span>
                <span class="reward-value">{{ task?.rewards.badge }}</span>
              </div>
            </div>
            <div class="reward-item" v-if="task?.rewards.cashReward">
              <span class="reward-icon">💰</span>
              <div class="reward-info">
                <span class="reward-name">现金奖励</span>
                <span class="reward-value">¥{{ task?.rewards.cashReward }}</span>
              </div>
            </div>
            <div class="reward-item" v-if="task?.rewards.featured">
              <span class="reward-icon">🌟</span>
              <div class="reward-info">
                <span class="reward-name">首页推荐</span>
                <span class="reward-value">作品优先展示</span>
              </div>
            </div>
          </div>
        </div>

        <div class="side-card" v-if="!userProgress && task?.status === 'active'">
          <h3 class="side-title">参与任务</h3>
          <p class="join-desc">立即参与任务，开启你的创作之旅，赢取丰厚奖励！</p>
          <n-button 
            type="primary" 
            size="large" 
            block
            :loading="joining"
            @click="joinTask"
          >
            立即参与
          </n-button>
        </div>

        <div class="side-card" v-if="userProgress && userProgress.totalPointsEarned > 0">
          <h3 class="side-title">已获奖励</h3>
          <div class="earned-rewards">
            <div class="earned-item">
              <span class="earned-icon">💎</span>
              <div class="earned-info">
                <span class="earned-name">累计积分</span>
                <span class="earned-value">{{ userProgress.totalPointsEarned }}积分</span>
              </div>
            </div>
            <div class="earned-item" v-if="userProgress.badgesEarned?.length > 0">
              <span class="earned-icon">🏆</span>
              <div class="earned-info">
                <span class="earned-name">获得徽章</span>
                <div class="badge-list">
                  <n-tag 
                    v-for="badge in userProgress.badgesEarned" 
                    :key="badge" 
                    size="small" 
                    type="warning"
                  >
                    {{ badge }}
                  </n-tag>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="side-card">
          <h3 class="side-title">任务标签</h3>
          <div class="task-tags">
            <n-tag 
              v-for="tag in task?.tags" 
              :key="tag" 
              size="medium" 
              type="info"
              round
            >
              {{ tag }}
            </n-tag>
          </div>
        </div>
      </div>
    </div>

    <n-modal v-model:show="showSubmitModal" preset="card" title="提交作品" :mask-closable="false" style="width: 600px">
      <div class="submit-form">
        <div class="form-item">
          <label class="form-label">当前阶段</label>
          <n-tag type="primary">{{ currentStage?.name }}</n-tag>
        </div>
        <div class="form-item">
          <label class="form-label">提交内容</label>
          <n-input 
            v-model:value="submitContent" 
            type="textarea" 
            :rows="6" 
            placeholder="请输入提交内容..."
          />
        </div>
        <div class="form-item">
          <label class="form-label">关联作品 (可选)</label>
          <n-select 
            v-model:value="selectedStoryId" 
            :options="storyOptions" 
            placeholder="选择已创建的作品"
            clearable
          />
        </div>
        <div class="form-actions">
          <n-button @click="showSubmitModal = false">取消</n-button>
          <n-button type="primary" :loading="submitting" @click="submitStage">
            提交审核
          </n-button>
        </div>
      </div>
    </n-modal>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { 
  NTag, NButton, NAlert, NProgress, NModal, NInput, NSelect,
  useMessage
} from 'naive-ui'
import { creationTaskApi, storyApi } from '../api'

const route = useRoute()
const router = useRouter()
const message = useMessage()

const currentUser = ref({
  id: 'user-1',
  username: '月下独酌',
  avatar: '🌸'
})

const task = ref(null)
const userProgress = ref(null)
const userStories = ref([])
const joining = ref(false)
const submitting = ref(false)
const showSubmitModal = ref(false)
const currentStage = ref(null)
const submitContent = ref('')
const selectedStoryId = ref(null)

const storyOptions = computed(() => {
  return userStories.value.map(s => ({
    label: s.title,
    value: s.id
  }))
})

const completionRate = computed(() => {
  if (!task.value || !task.value.totalParticipants) return '0%'
  return ((task.value.completedCount / task.value.totalParticipants) * 100).toFixed(1) + '%'
})

const getStatusText = (status) => {
  const map = {
    active: '进行中',
    upcoming: '即将开始',
    completed: '已结束'
  }
  return map[status] || status
}

const getStatusTagType = (status) => {
  const map = {
    active: 'success',
    upcoming: 'warning',
    completed: 'default'
  }
  return map[status] || 'default'
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

const getTypeText = (type) => {
  const map = {
    themed: '主题创作',
    fanfic: '同人创作',
    worldbuilding: '世界共建'
  }
  return map[type] || type
}

const getStageStatus = (stageId) => {
  if (!userProgress.value) return 'pending'
  const stage = userProgress.value.stages.find(s => s.stageId === stageId)
  return stage?.status || 'pending'
}

const getStageStatusText = (stageId) => {
  const status = getStageStatus(stageId)
  const map = {
    pending: '未开始',
    in_progress: '进行中',
    in_review: '审核中',
    completed: '已完成'
  }
  return map[status] || status
}

const getStageTagType = (stageId) => {
  const status = getStageStatus(stageId)
  const map = {
    pending: 'default',
    in_progress: 'info',
    in_review: 'warning',
    completed: 'success'
  }
  return map[status] || 'default'
}

const getStageReviewComment = (stageId) => {
  if (!userProgress.value) return ''
  const stage = userProgress.value.stages.find(s => s.stageId === stageId)
  return stage?.reviewComment || '审核通过'
}

const getStageSubmittedAt = (stageId) => {
  if (!userProgress.value) return ''
  const stage = userProgress.value.stages.find(s => s.stageId === stageId)
  return stage?.submittedAt || ''
}

const loadTask = async () => {
  try {
    const res = await creationTaskApi.getTask(route.params.id)
    task.value = res.data
  } catch (err) {
    console.error('加载任务详情失败:', err)
    message.error('加载任务详情失败')
  }
}

const loadProgress = async () => {
  try {
    const res = await creationTaskApi.getTaskProgress(route.params.id, currentUser.value.id)
    userProgress.value = res.data.progress
  } catch (err) {
    console.error('加载进度失败:', err)
  }
}

const loadUserStories = async () => {
  try {
    const res = await storyApi.getStories({ authorId: currentUser.value.id })
    userStories.value = res.data.stories || []
  } catch (err) {
    console.error('加载用户作品失败:', err)
  }
}

const joinTask = async () => {
  joining.value = true
  try {
    const res = await creationTaskApi.joinTask(route.params.id, {
      userId: currentUser.value.id,
      username: currentUser.value.username,
      avatar: currentUser.value.avatar
    })
    userProgress.value = res.data.progress
    message.success('参与成功！开始你的创作之旅吧~')
  } catch (err) {
    console.error('参与任务失败:', err)
    message.error(err.response?.data?.message || '参与失败')
  } finally {
    joining.value = false
  }
}

const openSubmitModal = (stage) => {
  currentStage.value = stage
  submitContent.value = ''
  selectedStoryId.value = null
  showSubmitModal.value = true
}

const submitStage = async () => {
  if (!submitContent.value.trim()) {
    message.warning('请输入提交内容')
    return
  }
  
  submitting.value = true
  try {
    const attachments = selectedStoryId.value 
      ? [{ type: 'story', id: selectedStoryId.value }]
      : []
    
    await creationTaskApi.submitTask(route.params.id, {
      userId: currentUser.value.id,
      username: currentUser.value.username,
      avatar: currentUser.value.avatar,
      stageId: currentStage.value.id,
      content: submitContent.value,
      attachments
    })
    
    message.success('提交成功！等待审核中...')
    showSubmitModal.value = false
    loadProgress()
  } catch (err) {
    console.error('提交失败:', err)
    message.error(err.response?.data?.message || '提交失败')
  } finally {
    submitting.value = false
  }
}

const goToEditor = () => {
  router.push('/editor')
}

const goBack = () => {
  router.push('/creation-tasks')
}

onMounted(() => {
  loadTask()
  loadProgress()
  loadUserStories()
})
</script>

<style scoped>
.creation-task-detail {
  max-width: 1200px;
  margin: 0 auto;
}

.back-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: #c77dff;
  cursor: pointer;
  margin-bottom: 20px;
  padding: 8px 16px;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.back-btn:hover {
  background: rgba(199, 125, 255, 0.1);
  color: #e0aaff;
}

.back-icon {
  font-size: 18px;
}

.task-header {
  border-radius: 20px;
  overflow: hidden;
  position: relative;
  margin-bottom: 32px;
}

.header-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, rgba(0, 0, 0, 0.5) 0%, rgba(0, 0, 0, 0.3) 100%);
}

.header-content {
  position: relative;
  z-index: 1;
  padding: 48px;
  display: flex;
  gap: 32px;
  align-items: center;
}

.task-cover {
  width: 140px;
  height: 140px;
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.task-cover .cover-emoji {
  font-size: 72px;
}

.task-info {
  flex: 1;
}

.task-meta {
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
}

.task-title {
  font-size: 32px;
  font-weight: bold;
  color: white;
  margin: 0 0 12px 0;
}

.task-desc {
  font-size: 15px;
  color: rgba(255, 255, 255, 0.85);
  margin: 0 0 20px 0;
  line-height: 1.7;
}

.task-stats {
  display: flex;
  gap: 32px;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 6px;
  color: rgba(255, 255, 255, 0.9);
}

.stat-icon {
  font-size: 18px;
}

.stat-value {
  font-weight: bold;
  font-size: 18px;
}

.stat-label {
  opacity: 0.8;
  font-size: 13px;
}

.task-body {
  display: grid;
  grid-template-columns: 1fr 340px;
  gap: 24px;
}

.section {
  margin-bottom: 32px;
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

.title-badge {
  font-size: 13px;
  font-weight: normal;
  color: #c77dff;
  background: rgba(199, 125, 255, 0.1);
  padding: 4px 12px;
  border-radius: 12px;
  margin-left: auto;
}

.requirements-card {
  background: linear-gradient(135deg, rgba(26, 26, 46, 0.9) 0%, rgba(22, 33, 62, 0.9) 100%);
  border: 1px solid rgba(199, 125, 255, 0.15);
  border-radius: 16px;
  padding: 24px;
}

.req-row {
  display: flex;
  gap: 24px;
  margin-bottom: 16px;
}

.req-row:last-child {
  margin-bottom: 0;
}

.req-item {
  flex: 1;
}

.req-item.full {
  flex: none;
  width: 100%;
}

.req-label {
  display: block;
  font-size: 13px;
  color: #a78bfa;
  margin-bottom: 8px;
}

.req-value {
  font-size: 16px;
  font-weight: 500;
  color: #e0aaff;
}

.req-tags {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.stages-timeline {
  position: relative;
  padding-left: 40px;
}

.stage-item {
  position: relative;
  padding: 20px;
  background: linear-gradient(135deg, rgba(26, 26, 46, 0.9) 0%, rgba(22, 33, 62, 0.9) 100%);
  border: 1px solid rgba(199, 125, 255, 0.15);
  border-radius: 16px;
  margin-bottom: 20px;
  transition: all 0.3s ease;
}

.stage-item:last-child {
  margin-bottom: 0;
}

.stage-item.active {
  border-color: rgba(199, 125, 255, 0.5);
  box-shadow: 0 0 20px rgba(157, 78, 221, 0.2);
}

.stage-item.completed {
  border-color: rgba(72, 187, 120, 0.3);
}

.stage-item.pending {
  opacity: 0.6;
}

.stage-line {
  position: absolute;
  left: -29px;
  top: 40px;
  bottom: -20px;
  width: 2px;
  background: linear-gradient(to bottom, rgba(199, 125, 255, 0.3), rgba(199, 125, 255, 0.1));
}

.stage-item.completed .stage-line {
  background: linear-gradient(to bottom, rgba(72, 187, 120, 0.5), rgba(72, 187, 120, 0.2));
}

.stage-dot {
  position: absolute;
  left: -42px;
  top: 24px;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: rgba(199, 125, 255, 0.2);
  border: 2px solid rgba(199, 125, 255, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 13px;
  color: #c77dff;
  z-index: 1;
}

.stage-item.active .stage-dot {
  background: linear-gradient(135deg, #9d4edd 0%, #c77dff 100%);
  border-color: #c77dff;
  color: white;
  animation: pulse 2s infinite;
}

.stage-item.completed .stage-dot {
  background: linear-gradient(135deg, #48bb78 0%, #38a169 100%);
  border-color: #48bb78;
  color: white;
}

@keyframes pulse {
  0%, 100% { box-shadow: 0 0 0 0 rgba(199, 125, 255, 0.4); }
  50% { box-shadow: 0 0 0 10px rgba(199, 125, 255, 0); }
}

.stage-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.stage-name {
  font-size: 18px;
  font-weight: bold;
  color: #e0aaff;
  margin: 0;
}

.stage-desc {
  font-size: 14px;
  color: #a78bfa;
  margin: 0 0 12px 0;
  line-height: 1.6;
}

.stage-requirements {
  display: flex;
  gap: 8px;
  align-items: flex-start;
  background: rgba(199, 125, 255, 0.05);
  padding: 12px 16px;
  border-radius: 8px;
  margin-bottom: 16px;
}

.stage-req-icon {
  font-size: 16px;
  flex-shrink: 0;
  margin-top: 2px;
}

.stage-req-text {
  font-size: 13px;
  color: #c77dff;
  line-height: 1.6;
}

.stage-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.stage-deadline,
.stage-reward {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: #a78bfa;
}

.deadline-icon,
.reward-icon {
  font-size: 16px;
}

.stage-actions {
  display: flex;
  gap: 12px;
}

.stage-review {
  margin-top: 16px;
}

.side-card {
  background: linear-gradient(135deg, rgba(26, 26, 46, 0.9) 0%, rgba(22, 33, 62, 0.9) 100%);
  border: 1px solid rgba(199, 125, 255, 0.15);
  border-radius: 16px;
  padding: 24px;
  margin-bottom: 20px;
}

.side-title {
  font-size: 16px;
  font-weight: bold;
  color: #e0aaff;
  margin: 0 0 16px 0;
}

.progress-overview {
  display: flex;
  justify-content: center;
  margin-bottom: 20px;
}

.progress-text {
  text-align: center;
}

.progress-value {
  display: block;
  font-size: 24px;
  font-weight: bold;
  color: #e0aaff;
}

.progress-label {
  font-size: 12px;
  color: #a78bfa;
}

.progress-info {
  border-top: 1px solid rgba(199, 125, 255, 0.1);
  padding-top: 16px;
}

.info-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.info-row:last-child {
  margin-bottom: 0;
}

.info-label {
  font-size: 13px;
  color: #a78bfa;
}

.info-value {
  font-size: 13px;
  color: #e0aaff;
  font-weight: 500;
}

.rewards-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.reward-item,
.earned-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: rgba(199, 125, 255, 0.05);
  border-radius: 8px;
  transition: all 0.3s ease;
}

.reward-item:hover {
  background: rgba(199, 125, 255, 0.1);
}

.reward-icon,
.earned-icon {
  font-size: 24px;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(199, 125, 255, 0.1);
  border-radius: 8px;
}

.reward-info,
.earned-info {
  flex: 1;
}

.reward-name,
.earned-name {
  display: block;
  font-size: 13px;
  color: #a78bfa;
  margin-bottom: 4px;
}

.reward-value,
.earned-value {
  font-size: 15px;
  font-weight: 600;
  color: #e0aaff;
}

.join-desc {
  font-size: 13px;
  color: #a78bfa;
  margin: 0 0 16px 0;
  line-height: 1.6;
}

.badge-list {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

.task-tags {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.submit-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-label {
  font-size: 14px;
  font-weight: 500;
  color: #e0aaff;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding-top: 12px;
  border-top: 1px solid rgba(199, 125, 255, 0.1);
}

@media (max-width: 1024px) {
  .task-body {
    grid-template-columns: 1fr;
  }
  
  .header-content {
    flex-direction: column;
    text-align: center;
  }
  
  .task-stats {
    justify-content: center;
    flex-wrap: wrap;
  }
  
  .stages-timeline {
    padding-left: 32px;
  }
  
  .stage-dot {
    left: -34px;
  }
  
  .stage-line {
    left: -21px;
  }
}

@media (max-width: 640px) {
  .header-content {
    padding: 32px 20px;
  }
  
  .task-title {
    font-size: 24px;
  }
  
  .task-stats {
    gap: 16px;
  }
  
  .req-row {
    flex-direction: column;
    gap: 16px;
  }
  
  .stage-footer {
    flex-direction: column;
    gap: 8px;
    align-items: flex-start;
  }
  
  .stage-actions {
    flex-direction: column;
  }
  
  .stage-actions > * {
    width: 100%;
  }
}
</style>
