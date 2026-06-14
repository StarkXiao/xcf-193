<template>
  <div class="activity-detail" v-if="activity">
    <div class="activity-banner">
      <div class="banner-overlay">
        <div class="banner-content">
          <div class="activity-status" :class="activity.status">
            {{ getStatusText(activity.status) }}
          </div>
          <h1 class="activity-title">{{ activity.title }}</h1>
          <p class="activity-subtitle">{{ activity.subtitle }}</p>
          <div class="activity-meta">
            <span class="meta-item">
              <span class="meta-icon">🏛️</span>
              {{ activity.organizerName }}
            </span>
            <span class="meta-item">
              <span class="meta-icon">📅</span>
              {{ activity.startTime }} ~ {{ activity.endTime }}
            </span>
            <span class="meta-item">
              <span class="meta-icon">👥</span>
              {{ activity.participantCount }}人参与
            </span>
            <span class="meta-item">
              <span class="meta-icon">📝</span>
              {{ activity.submissionCount }}篇作品
            </span>
          </div>
        </div>
      </div>
    </div>

    <div class="detail-body">
      <div class="main-content">
        <n-tabs v-model:value="activeTab" type="line">
          <n-tab-pane name="intro" tab="活动介绍">
            <div class="tab-content">
              <section class="content-section">
                <h3 class="section-title">
                  <span class="title-icon">📖</span>
                  活动主题
                </h3>
                <div class="theme-badge">「{{ activity.theme }}」</div>
                <p class="activity-description">{{ activity.description }}</p>
              </section>

              <section class="content-section">
                <h3 class="section-title">
                  <span class="title-icon">📋</span>
                  参赛规则
                </h3>
                <div class="rules-list">
                  <div
                    v-for="(rule, index) in activity.rules"
                    :key="index"
                    class="rule-item"
                  >
                    <span class="rule-number">{{ index + 1 }}</span>
                    <span class="rule-text">{{ rule }}</span>
                  </div>
                </div>
              </section>

              <section class="content-section">
                <h3 class="section-title">
                  <span class="title-icon">🏆</span>
                  奖项设置
                </h3>
                <div class="prizes-grid">
                  <div
                    v-for="(prize, index) in activity.prizes"
                    :key="index"
                    class="prize-card"
                    :class="getPrizeClass(index)"
                  >
                    <div class="prize-rank">{{ prize.rank }}</div>
                    <div class="prize-name">{{ prize.name }}</div>
                    <div class="prize-count">
                      {{ typeof prize.count === 'number' ? prize.count + '名' : prize.count }}
                    </div>
                    <div class="prize-reward">{{ prize.reward }}</div>
                  </div>
                </div>
              </section>
            </div>
          </n-tab-pane>

          <n-tab-pane name="works" :tab="'作品展示 (' + submissions.length + ')'">
            <div class="tab-content">
              <div class="submissions-filter">
                <n-select
                  v-model:value="submissionSort"
                  :options="submissionSortOptions"
                  style="width: 140px"
                  @update:value="loadSubmissions"
                />
              </div>
              <div class="submissions-grid">
                <div
                  v-for="submission in submissions"
                  :key="submission.id"
                  class="submission-card"
                  @click="viewSubmission(submission)"
                >
                  <div class="submission-cover">
                    <span class="cover-emoji">{{ submission.cover }}</span>
                  </div>
                  <div class="submission-info">
                    <h4 class="submission-title">{{ submission.storyTitle }}</h4>
                    <p class="submission-summary">{{ submission.summary }}</p>
                    <div class="submission-meta">
                      <div class="author-info">
                        <n-avatar round size="small">{{ submission.avatar }}</n-avatar>
                        <span class="author-name">{{ submission.username }}</span>
                      </div>
                      <div class="submission-stats">
                        <span class="stat">
                          <span class="stat-icon">👍</span>
                          {{ submission.voteCount }}
                        </span>
                        <span class="stat">
                          <span class="stat-icon">👁️</span>
                          {{ submission.viewCount }}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div v-if="submissions.length === 0" class="empty-state">
                <span class="empty-icon">📝</span>
                <p class="empty-text">暂无投稿作品</p>
              </div>
            </div>
          </n-tab-pane>

          <n-tab-pane name="ranking" tab="排行榜">
            <div class="tab-content">
              <div class="ranking-tabs">
                <n-radio-group v-model:value="rankingType" @update:value="loadRanking">
                  <n-radio value="votes">人气榜</n-radio>
                  <n-radio value="score">评分榜</n-radio>
                  <n-radio value="views">阅读榜</n-radio>
                  <n-radio value="comprehensive">综合榜</n-radio>
                </n-radio-group>
              </div>
              <div class="ranking-list">
                <div
                  v-for="item in ranking"
                  :key="item.submissionId"
                  class="ranking-item"
                  @click="viewSubmission(item)"
                >
                  <div class="rank-number" :class="getRankClass(item.rank)">
                    {{ item.rank <= 3 ? getRankIcon(item.rank) : item.rank }}
                  </div>
                  <div class="rank-cover">
                    <span class="cover-emoji">{{ item.cover }}</span>
                  </div>
                  <div class="rank-info">
                    <h4 class="rank-title">{{ item.storyTitle }}</h4>
                    <div class="rank-author">
                      <n-avatar round size="small">{{ item.avatar }}</n-avatar>
                      <span>{{ item.username }}</span>
                    </div>
                  </div>
                  <div class="rank-stats">
                    <div class="rank-score" v-if="rankingType === 'score' || rankingType === 'comprehensive'">
                      <span class="score-label">评分</span>
                      <span class="score-value">{{ item.score }}</span>
                    </div>
                    <div class="rank-votes">
                      <span class="stat-icon">👍</span>
                      {{ item.voteCount }}
                    </div>
                    <div class="rank-views">
                      <span class="stat-icon">👁️</span>
                      {{ item.viewCount }}
                    </div>
                  </div>
                </div>
              </div>
              <div v-if="ranking.length === 0" class="empty-state">
                <span class="empty-icon">🏆</span>
                <p class="empty-text">暂无排行数据</p>
              </div>
            </div>
          </n-tab-pane>

          <n-tab-pane name="propagation" tab="传播链路">
            <div class="tab-content">
              <div class="propagation-summary" v-if="propagationData">
                <div class="funnel-section">
                  <h3 class="section-title">
                    <span class="title-icon">📊</span>
                    传播漏斗
                  </h3>
                  <div class="funnel-chart">
                    <div
                      v-for="(item, index) in propagationData.summary.funnelData"
                      :key="item.stage"
                      class="funnel-item"
                      :style="{ width: getFunnelWidth(index, propagationData.summary.funnelData) + '%' }"
                    >
                      <span class="funnel-label">{{ item.label }}</span>
                      <span class="funnel-value">{{ item.count.toLocaleString() }}</span>
                    </div>
                  </div>
                </div>

                <div class="stats-section">
                  <div class="stat-card">
                    <span class="stat-icon-large">🔗</span>
                    <span class="stat-value-large">{{ propagationData.summary.totalShares }}</span>
                    <span class="stat-label-large">总分享次数</span>
                  </div>
                  <div class="stat-card">
                    <span class="stat-icon-large">👆</span>
                    <span class="stat-value-large">{{ propagationData.summary.totalClicks }}</span>
                    <span class="stat-label-large">总点击量</span>
                  </div>
                  <div class="stat-card">
                    <span class="stat-icon-large">📝</span>
                    <span class="stat-value-large">{{ propagationData.summary.totalRegisters }}</span>
                    <span class="stat-label-large">分享带来报名</span>
                  </div>
                  <div class="stat-card">
                    <span class="stat-icon-large">✨</span>
                    <span class="stat-value-large">{{ propagationData.summary.overallConversionRate }}</span>
                    <span class="stat-label-large">整体转化率</span>
                  </div>
                </div>

                <div class="channel-section" v-if="Object.keys(propagationData.channelBreakdown).length > 0">
                  <h3 class="section-title">
                    <span class="title-icon">📱</span>
                    渠道分布
                  </h3>
                  <div class="channel-grid">
                    <div
                      v-for="(data, channel) in propagationData.channelBreakdown"
                      :key="channel"
                      class="channel-card"
                    >
                      <div class="channel-name">{{ getChannelName(channel) }}</div>
                      <div class="channel-stats">
                        <div class="channel-stat">
                          <span class="label">分享</span>
                          <span class="value">{{ data.shareCount }}</span>
                        </div>
                        <div class="channel-stat">
                          <span class="label">点击</span>
                          <span class="value">{{ data.clickCount }}</span>
                        </div>
                        <div class="channel-stat">
                          <span class="label">转化</span>
                          <span class="value">{{ data.conversionRate }}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div class="spreaders-section" v-if="propagationData.topSpreaders.length > 0">
                  <h3 class="section-title">
                    <span class="title-icon">🌟</span>
                    传播达人榜
                  </h3>
                  <div class="spreaders-list">
                    <div
                      v-for="(spreader, index) in propagationData.topSpreaders"
                      :key="spreader.userId"
                      class="spreader-item"
                    >
                      <span class="spreader-rank">{{ index + 1 }}</span>
                      <n-avatar round size="medium">{{ spreader.avatar }}</n-avatar>
                      <span class="spreader-name">{{ spreader.username }}</span>
                      <div class="spreader-stats">
                        <span>点击 {{ spreader.clickCount }}</span>
                        <span>报名 {{ spreader.registerCount }}</span>
                        <span>投稿 {{ spreader.submitCount }}</span>
                      </div>
                      <span class="influence-score">影响力 {{ spreader.influenceScore }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </n-tab-pane>
        </n-tabs>
      </div>

      <div class="side-bar">
        <div class="action-card">
          <div class="action-stats">
            <div class="stat-row">
              <span class="label">浏览量</span>
              <span class="value">{{ formatNumber(activity.viewCount) }}</span>
            </div>
            <div class="stat-row">
              <span class="label">分享次数</span>
              <span class="value">{{ activity.shareCount }}</span>
            </div>
          </div>

          <div class="action-buttons">
            <n-button
              v-if="!isRegistered"
              type="primary"
              size="large"
              block
              :disabled="activity.status !== 'ongoing'"
              @click="showRegisterModal = true"
            >
              <span>📝</span>
              立即报名
            </n-button>
            <n-button
              v-else
              type="success"
              size="large"
              block
              ghost
              disabled
            >
              ✅ 已报名
            </n-button>

            <n-button
              type="warning"
              size="large"
              block
              :disabled="!isRegistered || activity.status !== 'ongoing'"
              @click="showSubmitModal = true"
            >
              <span>📖</span>
              提交作品
            </n-button>

            <n-dropdown
              :options="shareOptions"
              @select="handleShare"
              trigger="click"
            >
              <n-button size="large" block>
                <span>🔗</span>
                分享活动
              </n-button>
            </n-dropdown>
          </div>
        </div>

        <div class="tags-card">
          <h4 class="card-title">活动标签</h4>
          <div class="tag-list">
            <n-tag
              v-for="tag in activity.tags"
              :key="tag"
              type="info"
              round
              size="medium"
            >
              {{ tag }}
            </n-tag>
          </div>
        </div>
      </div>
    </div>

    <n-modal
      v-model:show="showRegisterModal"
      preset="card"
      title="活动报名"
      style="width: 500px"
    >
      <n-form ref="registerFormRef" :model="registerForm" label-placement="top">
        <n-form-item label="笔名" required>
          <n-input v-model:value="registerForm.penName" placeholder="请输入您的笔名" />
        </n-form-item>
        <n-form-item label="联系方式" required>
          <n-input v-model:value="registerForm.contactInfo" placeholder="微信/QQ/邮箱，方便联系您" />
        </n-form-item>
        <n-form-item label="参赛宣言">
          <n-input
            v-model:value="registerForm.motivation"
            type="textarea"
            :rows="3"
            placeholder="说点什么，为自己加油吧~"
          />
        </n-form-item>
      </n-form>
      <template #footer>
        <n-button @click="showRegisterModal = false">取消</n-button>
        <n-button type="primary" @click="handleRegister">确认报名</n-button>
      </template>
    </n-modal>

    <n-modal
      v-model:show="showSubmitModal"
      preset="card"
      title="提交作品"
      style="width: 560px"
    >
      <n-form ref="submitFormRef" :model="submitForm" label-placement="top">
        <n-form-item label="关联作品ID" required>
          <n-input v-model:value="submitForm.storyId" placeholder="请输入您创建的故事ID" />
        </n-form-item>
        <n-form-item label="作品标题" required>
          <n-input v-model:value="submitForm.storyTitle" placeholder="请输入作品标题" />
        </n-form-item>
        <n-form-item label="作品简介" required>
          <n-input
            v-model:value="submitForm.summary"
            type="textarea"
            :rows="3"
            placeholder="简要描述您的作品"
          />
        </n-form-item>
        <n-form-item label="封面表情">
          <n-input v-model:value="submitForm.cover" placeholder="选一个表情作为封面，如 🏰" maxlength="4" />
        </n-form-item>
        <n-form-item label="字数">
          <n-input-number v-model:value="submitForm.wordCount" :min="0" style="width: 100%" />
        </n-form-item>
        <n-form-item label="结局数量">
          <n-input-number v-model:value="submitForm.endingCount" :min="0" style="width: 100%" />
        </n-form-item>
      </n-form>
      <template #footer>
        <n-button @click="showSubmitModal = false">取消</n-button>
        <n-button type="primary" @click="handleSubmit">提交作品</n-button>
      </template>
    </n-modal>
  </div>

  <div v-else class="loading-state">
    <n-spin size="large" />
    <p>加载中...</p>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  NTabs, NTabPane, NButton, NTag, NAvatar, NModal, NForm, NFormItem,
  NInput, NInputNumber, NDropdown, NRadioGroup, NRadio, NSelect, NSpin,
  useMessage
} from 'naive-ui'
import { activityApi, storyApi } from '../api'

const route = useRoute()
const router = useRouter()
const message = useMessage()

const currentUser = ref({
  id: 'user-1',
  username: '月下独酌',
  avatar: '🌸'
})

const activity = ref(null)
const activeTab = ref('intro')
const isRegistered = ref(false)
const submissions = ref([])
const submissionSort = ref('votes')
const ranking = ref([])
const rankingType = ref('votes')
const propagationData = ref(null)
const sourceShareId = ref(null)

const showRegisterModal = ref(false)
const showSubmitModal = ref(false)
const registerForm = reactive({
  penName: '',
  contactInfo: '',
  motivation: ''
})
const submitForm = reactive({
  storyId: '',
  storyTitle: '',
  summary: '',
  cover: '📖',
  wordCount: 0,
  endingCount: 0
})

const submissionSortOptions = [
  { label: '最新投稿', value: 'newest' },
  { label: '最多投票', value: 'votes' },
  { label: '最多阅读', value: 'views' },
  { label: '评分最高', value: 'score' }
]

const shareOptions = [
  { label: '分享到微信', key: 'wechat', icon: () => '💬' },
  { label: '分享到QQ', key: 'qq', icon: () => '🐧' },
  { label: '分享到微博', key: 'weibo', icon: () => '📢' },
  { label: '复制链接', key: 'link', icon: () => '🔗' }
]

const getStatusText = (status) => {
  const map = { upcoming: '即将开始', ongoing: '进行中', ended: '已结束' }
  return map[status] || status
}

const formatNumber = (num) => {
  if (!num) return 0
  if (num >= 10000) return (num / 10000).toFixed(1) + 'w'
  if (num >= 1000) return (num / 1000).toFixed(1) + 'k'
  return num
}

const getPrizeClass = (index) => {
  if (index === 0) return 'gold'
  if (index === 1) return 'silver'
  if (index === 2) return 'bronze'
  return ''
}

const getRankClass = (rank) => {
  if (rank === 1) return 'rank-gold'
  if (rank === 2) return 'rank-silver'
  if (rank === 3) return 'rank-bronze'
  return ''
}

const getRankIcon = (rank) => {
  const icons = { 1: '🥇', 2: '🥈', 3: '🥉' }
  return icons[rank] || rank
}

const getChannelName = (channel) => {
  const map = { wechat: '微信', qq: 'QQ', weibo: '微博', other: '其他' }
  return map[channel] || channel
}

const getFunnelWidth = (index, data) => {
  const max = Math.max(...data.map(d => d.count))
  const min = 20
  const val = data[index].count
  return Math.max(min, (val / max) * 100)
}

const loadActivity = async () => {
  try {
    const res = await activityApi.getActivity(route.params.id)
    activity.value = res.data
    checkRegistration()
  } catch (err) {
    console.error('加载活动详情失败:', err)
  }
}

const checkRegistration = async () => {
  try {
    const res = await activityApi.checkRegistration(route.params.id, {
      userId: currentUser.value.id
    })
    isRegistered.value = res.data.isRegistered
    if (res.data.isRegistered && res.data.registration?.sourceShareId && !sourceShareId.value) {
      sourceShareId.value = res.data.registration.sourceShareId
    }
  } catch (err) {
    console.error('检查报名状态失败:', err)
  }
}

const loadSubmissions = async () => {
  try {
    const res = await activityApi.getActivitySubmissions(route.params.id, {
      sort: submissionSort.value,
      limit: 50
    })
    submissions.value = res.data.submissions || []
  } catch (err) {
    console.error('加载作品列表失败:', err)
  }
}

const loadRanking = async () => {
  try {
    const res = await activityApi.getActivityRanking(route.params.id, {
      type: rankingType.value
    })
    ranking.value = res.data.ranking || []
  } catch (err) {
    console.error('加载排行榜失败:', err)
  }
}

const loadPropagation = async () => {
  try {
    const res = await activityApi.getActivityPropagation(route.params.id)
    propagationData.value = res.data
  } catch (err) {
    console.error('加载传播数据失败:', err)
  }
}

const handleRegister = async () => {
  if (!registerForm.penName || !registerForm.contactInfo) {
    message.warning('请填写必填信息')
    return
  }
  try {
    await activityApi.registerActivity(route.params.id, {
      userId: currentUser.value.id,
      username: currentUser.value.username,
      avatar: currentUser.value.avatar,
      ...registerForm,
      shareId: sourceShareId.value || undefined
    })
    message.success('报名成功！')
    showRegisterModal.value = false
    isRegistered.value = true
    loadActivity()
    loadPropagation()
  } catch (err) {
    message.error(err.response?.data?.message || '报名失败')
  }
}

const handleSubmit = async () => {
  if (!submitForm.storyId || !submitForm.storyTitle || !submitForm.summary) {
    message.warning('请填写必填信息')
    return
  }
  try {
    await activityApi.submitWork(route.params.id, {
      userId: currentUser.value.id,
      username: currentUser.value.username,
      avatar: currentUser.value.avatar,
      ...submitForm,
      tags: [],
      shareId: sourceShareId.value || undefined
    })
    message.success('作品提交成功，等待审核！')
    showSubmitModal.value = false
    loadSubmissions()
    loadActivity()
    loadPropagation()
  } catch (err) {
    message.error(err.response?.data?.message || '提交失败')
  }
}

const handleShare = async (channel) => {
  try {
    const shareRes = await activityApi.shareActivity(route.params.id, {
      userId: currentUser.value.id,
      username: currentUser.value.username,
      avatar: currentUser.value.avatar,
      channel,
      shareType: 'activity',
      targetId: route.params.id,
      targetType: 'activity'
    })
    const shareId = shareRes.data.id
    const shareUrl = `${window.location.origin}/activity/${route.params.id}?shareId=${shareId}`

    if (channel === 'link') {
      try {
        await navigator.clipboard.writeText(shareUrl)
        message.success('分享链接已复制！')
      } catch {
        message.success(`分享链接：${shareUrl}`)
      }
    } else {
      message.success(`已生成${getChannelName(channel)}分享链接`)
    }
    loadActivity()
    loadPropagation()
  } catch (err) {
    console.error('分享失败:', err)
  }
}

const viewSubmission = (submission) => {
  if (submission.storyId) {
    router.push(`/story/${submission.storyId}`)
  }
}

onMounted(async () => {
  const shareId = route.query.shareId
  if (shareId) {
    sourceShareId.value = shareId
    try {
      await activityApi.recordShareClick(shareId)
    } catch (err) {
      console.error('记录分享点击失败:', err)
    }
  }
  loadActivity()
  loadSubmissions()
  loadRanking()
  loadPropagation()
})
</script>

<style scoped>
.activity-detail {
  min-height: 100vh;
}

.activity-banner {
  margin: -24px -24px 24px;
  height: 280px;
  background: linear-gradient(135deg, rgba(157, 78, 221, 0.3) 0%, rgba(199, 125, 255, 0.3) 100%);
  position: relative;
  overflow: hidden;
}

.banner-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(to top, rgba(26, 26, 46, 0.95) 0%, transparent 60%);
  display: flex;
  align-items: flex-end;
}

.banner-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 24px 32px;
  width: 100%;
}

.activity-status {
  display: inline-block;
  padding: 4px 16px;
  border-radius: 12px;
  font-size: 13px;
  font-weight: 500;
  margin-bottom: 12px;
}

.activity-status.ongoing {
  background: rgba(34, 197, 94, 0.2);
  color: #4ade80;
}

.activity-status.upcoming {
  background: rgba(234, 179, 8, 0.2);
  color: #facc15;
}

.activity-status.ended {
  background: rgba(107, 114, 128, 0.2);
  color: #9ca3af;
}

.activity-title {
  font-size: 32px;
  color: #ffffff;
  margin: 0 0 8px 0;
}

.activity-subtitle {
  font-size: 16px;
  color: #c77dff;
  margin: 0 0 16px 0;
  opacity: 0.9;
}

.activity-meta {
  display: flex;
  gap: 24px;
  flex-wrap: wrap;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  color: #c77dff;
}

.meta-icon {
  font-size: 16px;
}

.detail-body {
  display: grid;
  grid-template-columns: 1fr 320px;
  gap: 24px;
  align-items: start;
}

.main-content {
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
  border-radius: 16px;
  padding: 24px;
  min-height: 600px;
}

.tab-content {
  padding-top: 24px;
}

.content-section {
  margin-bottom: 36px;
}

.section-title {
  font-size: 18px;
  color: #e0aaff;
  margin: 0 0 16px 0;
  display: flex;
  align-items: center;
  gap: 8px;
}

.title-icon {
  font-size: 20px;
}

.theme-badge {
  display: inline-block;
  padding: 8px 24px;
  background: linear-gradient(135deg, rgba(157, 78, 221, 0.3) 0%, rgba(199, 125, 255, 0.3) 100%);
  border-radius: 24px;
  font-size: 18px;
  font-weight: 600;
  color: #e0aaff;
  margin-bottom: 16px;
}

.activity-description {
  font-size: 15px;
  line-height: 1.8;
  color: #d1d5db;
  margin: 0;
}

.rules-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.rule-item {
  display: flex;
  gap: 12px;
  align-items: flex-start;
}

.rule-number {
  width: 28px;
  height: 28px;
  background: linear-gradient(135deg, #9d4edd 0%, #c77dff 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 14px;
  font-weight: 600;
  flex-shrink: 0;
}

.rule-text {
  font-size: 15px;
  line-height: 1.6;
  color: #d1d5db;
  padding-top: 3px;
}

.prizes-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
}

.prize-card {
  padding: 20px;
  background: rgba(26, 26, 46, 0.6);
  border-radius: 12px;
  border: 1px solid rgba(199, 125, 255, 0.2);
  text-align: center;
}

.prize-card.gold {
  background: linear-gradient(135deg, rgba(234, 179, 8, 0.15) 0%, rgba(250, 204, 21, 0.15) 100%);
  border-color: rgba(250, 204, 21, 0.4);
}

.prize-card.silver {
  background: linear-gradient(135deg, rgba(156, 163, 175, 0.15) 0%, rgba(209, 213, 219, 0.15) 100%);
  border-color: rgba(209, 213, 219, 0.4);
}

.prize-card.bronze {
  background: linear-gradient(135deg, rgba(217, 119, 6, 0.15) 0%, rgba(245, 158, 11, 0.15) 100%);
  border-color: rgba(245, 158, 11, 0.4);
}

.prize-rank {
  font-size: 16px;
  font-weight: 600;
  color: #e0aaff;
  margin-bottom: 4px;
}

.prize-name {
  font-size: 20px;
  font-weight: bold;
  color: #ffffff;
  margin-bottom: 8px;
}

.prize-count {
  font-size: 13px;
  color: #9ca3af;
  margin-bottom: 12px;
}

.prize-reward {
  font-size: 13px;
  color: #c77dff;
  line-height: 1.5;
}

.submissions-filter {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 20px;
}

.submissions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 16px;
}

.submission-card {
  background: rgba(26, 26, 46, 0.6);
  border-radius: 12px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s;
  border: 1px solid rgba(199, 125, 255, 0.1);
}

.submission-card:hover {
  transform: translateY(-4px);
  border-color: rgba(199, 125, 255, 0.3);
  box-shadow: 0 8px 24px rgba(157, 78, 221, 0.15);
}

.submission-cover {
  height: 120px;
  background: linear-gradient(135deg, rgba(157, 78, 221, 0.2) 0%, rgba(199, 125, 255, 0.2) 100%);
  display: flex;
  align-items: center;
  justify-content: center;
}

.submission-cover .cover-emoji {
  font-size: 48px;
}

.submission-info {
  padding: 16px;
}

.submission-title {
  font-size: 16px;
  color: #ffffff;
  margin: 0 0 8px 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.submission-summary {
  font-size: 13px;
  color: #9ca3af;
  margin: 0 0 12px 0;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.submission-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.author-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.author-name {
  font-size: 13px;
  color: #c77dff;
}

.submission-stats {
  display: flex;
  gap: 12px;
}

.submission-stats .stat {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 13px;
  color: #9ca3af;
}

.stat-icon {
  font-size: 14px;
}

.ranking-tabs {
  margin-bottom: 20px;
}

.ranking-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.ranking-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  background: rgba(26, 26, 46, 0.6);
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s;
  border: 1px solid rgba(199, 125, 255, 0.1);
}

.ranking-item:hover {
  border-color: rgba(199, 125, 255, 0.3);
}

.rank-number {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  font-weight: bold;
  color: #9ca3af;
}

.rank-number.rank-gold {
  color: #facc15;
}

.rank-number.rank-silver {
  color: #d1d5db;
}

.rank-number.rank-bronze {
  color: #f59e0b;
}

.rank-cover {
  width: 56px;
  height: 56px;
  background: linear-gradient(135deg, rgba(157, 78, 221, 0.2) 0%, rgba(199, 125, 255, 0.2) 100%);
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.rank-cover .cover-emoji {
  font-size: 28px;
}

.rank-info {
  flex: 1;
  min-width: 0;
}

.rank-title {
  font-size: 16px;
  color: #ffffff;
  margin: 0 0 6px 0;
}

.rank-author {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: #c77dff;
}

.rank-stats {
  display: flex;
  gap: 20px;
  align-items: center;
}

.rank-score {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.rank-score .score-label {
  font-size: 11px;
  color: #9ca3af;
}

.rank-score .score-value {
  font-size: 18px;
  font-weight: bold;
  color: #e0aaff;
}

.rank-votes,
.rank-views {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 14px;
  color: #d1d5db;
}

.propagation-summary {
  display: flex;
  flex-direction: column;
  gap: 32px;
}

.funnel-section,
.channel-section,
.spreaders-section {
  margin-bottom: 0;
}

.funnel-chart {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.funnel-item {
  height: 48px;
  background: linear-gradient(135deg, rgba(157, 78, 221, 0.3) 0%, rgba(199, 125, 255, 0.3) 100%);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
  transition: all 0.3s;
}

.funnel-item:hover {
  background: linear-gradient(135deg, rgba(157, 78, 221, 0.5) 0%, rgba(199, 125, 255, 0.5) 100%);
}

.funnel-label {
  font-size: 14px;
  color: #e0aaff;
  font-weight: 500;
}

.funnel-value {
  font-size: 18px;
  font-weight: bold;
  color: #ffffff;
}

.stats-section {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  gap: 16px;
}

.stat-card {
  padding: 20px;
  background: rgba(26, 26, 46, 0.6);
  border-radius: 12px;
  text-align: center;
  border: 1px solid rgba(199, 125, 255, 0.1);
}

.stat-icon-large {
  font-size: 32px;
  display: block;
  margin-bottom: 8px;
}

.stat-value-large {
  display: block;
  font-size: 28px;
  font-weight: bold;
  color: #e0aaff;
  margin-bottom: 4px;
}

.stat-label-large {
  font-size: 13px;
  color: #9ca3af;
}

.channel-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 16px;
}

.channel-card {
  padding: 16px;
  background: rgba(26, 26, 46, 0.6);
  border-radius: 12px;
  border: 1px solid rgba(199, 125, 255, 0.1);
}

.channel-name {
  font-size: 16px;
  font-weight: 600;
  color: #ffffff;
  margin-bottom: 12px;
  text-align: center;
}

.channel-stats {
  display: flex;
  justify-content: space-around;
}

.channel-stat {
  text-align: center;
}

.channel-stat .label {
  display: block;
  font-size: 12px;
  color: #9ca3af;
  margin-bottom: 4px;
}

.channel-stat .value {
  display: block;
  font-size: 16px;
  font-weight: 600;
  color: #e0aaff;
}

.spreaders-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.spreader-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background: rgba(26, 26, 46, 0.6);
  border-radius: 10px;
  border: 1px solid rgba(199, 125, 255, 0.1);
}

.spreader-rank {
  width: 28px;
  height: 28px;
  background: linear-gradient(135deg, #9d4edd 0%, #c77dff 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 14px;
  font-weight: 600;
  flex-shrink: 0;
}

.spreader-name {
  font-size: 14px;
  color: #ffffff;
  font-weight: 500;
}

.spreader-stats {
  flex: 1;
  display: flex;
  justify-content: center;
  gap: 16px;
  font-size: 12px;
  color: #9ca3af;
}

.influence-score {
  font-size: 14px;
  font-weight: 600;
  color: #facc15;
}

.side-bar {
  position: sticky;
  top: 24px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.action-card,
.tags-card {
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
  border-radius: 16px;
  padding: 20px;
}

.action-stats {
  margin-bottom: 20px;
  padding-bottom: 20px;
  border-bottom: 1px solid rgba(199, 125, 255, 0.1);
}

.stat-row {
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
}

.stat-row .label {
  font-size: 14px;
  color: #9ca3af;
}

.stat-row .value {
  font-size: 16px;
  font-weight: 600;
  color: #e0aaff;
}

.action-buttons {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.card-title {
  font-size: 16px;
  color: #e0aaff;
  margin: 0 0 12px 0;
}

.tag-list {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
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

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  gap: 16px;
  color: #9ca3af;
}

@media (max-width: 960px) {
  .detail-body {
    grid-template-columns: 1fr;
  }
}
</style>
