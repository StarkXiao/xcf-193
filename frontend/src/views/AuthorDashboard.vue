<template>
  <div class="author-dashboard">
    <div class="page-header">
      <h1 class="page-title">📊 作者数据看板</h1>
      <p class="page-desc">集中展示你的创作数据和读者反馈</p>
    </div>

    <n-spin :show="loading" size="large">
      <div v-if="!loading" class="dashboard-content">
        <div class="summary-cards">
          <n-card class="summary-card" hoverable>
            <div class="card-icon card-icon-views">👁️</div>
            <div class="card-content">
              <div class="card-value">{{ summary?.performance?.totalViews || 0 }}</div>
              <div class="card-label">总阅读量</div>
              <div class="card-trend up">↑ {{ summary?.performance?.weeklyGrowth || 0 }}% 周增长</div>
            </div>
          </n-card>
          <n-card class="summary-card" hoverable>
            <div class="card-icon card-icon-likes">❤️</div>
            <div class="card-content">
              <div class="card-value">{{ summary?.performance?.totalLikes || 0 }}</div>
              <div class="card-label">总点赞数</div>
              <div class="card-trend up">↑ 持续增长中</div>
            </div>
          </n-card>
          <n-card class="summary-card" hoverable>
            <div class="card-icon card-icon-stories">📖</div>
            <div class="card-content">
              <div class="card-value">{{ summary?.performance?.totalStories || 0 }}</div>
              <div class="card-label">作品数量</div>
              <div class="card-trend">平均完成率 {{ summary?.performance?.avgCompletionRate || 0 }}%</div>
            </div>
          </n-card>
          <n-card class="summary-card" hoverable>
            <div class="card-icon card-icon-refs">🔗</div>
            <div class="card-content">
              <div class="card-value">{{ summary?.settingReferences?.totalReferences || 0 }}</div>
              <div class="card-label">设定引用数</div>
              <div class="card-trend up">↑ 本周 {{ summary?.settingReferences?.weeklyReferences || 0 }} 次</div>
            </div>
          </n-card>
        </div>

        <n-tabs v-model:value="activeTab" type="line" size="large" class="dashboard-tabs">
          <n-tab-pane name="performance" tab="📈 作品表现">
            <div class="tab-panel">
              <div class="section-title">作品数据概览</div>
              <div class="stories-list">
                <n-card 
                  v-for="story in performanceData?.stories || []" 
                  :key="story.id"
                  hoverable
                  class="story-card"
                >
                  <div class="story-header">
                    <div class="story-cover">{{ story.cover }}</div>
                    <div class="story-info">
                      <h3 class="story-title">{{ story.title }}</h3>
                      <n-tag :type="story.status === 'ongoing' ? 'success' : 'default'" size="small">
                        {{ story.status === 'ongoing' ? '连载中' : '已完结' }}
                      </n-tag>
                    </div>
                  </div>
                  
                  <div class="story-metrics">
                    <div class="metric-item">
                      <span class="metric-label">阅读量</span>
                      <span class="metric-value">{{ story.views }}</span>
                    </div>
                    <div class="metric-item">
                      <span class="metric-label">点赞数</span>
                      <span class="metric-value">{{ story.likes }}</span>
                    </div>
                    <div class="metric-item">
                      <span class="metric-label">收藏数</span>
                      <span class="metric-value">{{ story.favorites }}</span>
                    </div>
                    <div class="metric-item">
                      <span class="metric-label">分享数</span>
                      <span class="metric-value">{{ story.shares }}</span>
                    </div>
                    <div class="metric-item">
                      <span class="metric-label">完成率</span>
                      <span class="metric-value">{{ story.completionRate }}%</span>
                    </div>
                    <div class="metric-item">
                      <span class="metric-label">平均阅读时长</span>
                      <span class="metric-value">{{ story.avgReadingTime }}分钟</span>
                    </div>
                  </div>

                  <div class="trend-chart">
                    <div class="chart-title">近7天数据趋势</div>
                    <div class="chart-bars">
                      <div 
                        v-for="(item, idx) in story.trend" 
                        :key="idx"
                        class="chart-bar-group"
                      >
                        <div class="bar-wrapper">
                          <div 
                            class="bar bar-views" 
                            :style="{ height: (item.views / getMaxViews(story.trend) * 100) + '%' }"
                          >
                            <div class="bar-tooltip">阅读: {{ item.views }}</div>
                          </div>
                        </div>
                        <div class="bar-label">{{ item.date.slice(5) }}</div>
                      </div>
                    </div>
                  </div>
                </n-card>
              </div>

              <div class="section-title" v-if="performanceData?.topEndings?.length">热门结局排行</div>
              <div class="endings-ranking" v-if="performanceData?.topEndings?.length">
                <n-card hoverable class="endings-card">
                  <div 
                    v-for="(ending, idx) in performanceData.topEndings" 
                    :key="ending.id"
                    class="ending-item"
                  >
                    <div class="ending-rank" :class="'rank-' + (idx + 1)">{{ idx + 1 }}</div>
                    <div class="ending-info">
                      <div class="ending-title">{{ ending.title }}</div>
                      <div class="ending-bar-wrapper">
                        <div 
                          class="ending-bar" 
                          :style="{ width: ending.rate + '%' }"
                        ></div>
                      </div>
                    </div>
                    <div class="ending-stats">
                      <div class="ending-count">{{ ending.count }} 人达成</div>
                      <div class="ending-rate">{{ ending.rate }}%</div>
                    </div>
                  </div>
                </n-card>
              </div>
            </div>
          </n-tab-pane>

          <n-tab-pane name="readers" tab="👥 读者画像">
            <div class="tab-panel">
              <div class="reader-grid">
                <div class="reader-column">
                  <div class="section-title">读者性别分布</div>
                  <n-card hoverable class="chart-card">
                    <div class="pie-chart">
                      <div class="pie-center">
                        <div class="pie-total">读者</div>
                      </div>
                      <svg viewBox="0 0 100 100" class="pie-svg">
                        <circle 
                          cx="50" cy="50" r="40" 
                          fill="none" 
                          stroke="#e74c3c" 
                          :stroke-width="20"
                          :stroke-dasharray="(readerData?.demographics?.gender?.male || 0) * 2.51 + ' ' + 251"
                          stroke-dashoffset="0"
                          transform="rotate(-90 50 50)"
                        />
                        <circle 
                          cx="50" cy="50" r="40" 
                          fill="none" 
                          stroke="#9b59b6" 
                          :stroke-width="20"
                          :stroke-dasharray="(readerData?.demographics?.gender?.female || 0) * 2.51 + ' ' + 251"
                          :stroke-dashoffset="-((readerData?.demographics?.gender?.male || 0) * 2.51)"
                          transform="rotate(-90 50 50)"
                        />
                        <circle 
                          cx="50" cy="50" r="40" 
                          fill="none" 
                          stroke="#3498db" 
                          :stroke-width="20"
                          :stroke-dasharray="(readerData?.demographics?.gender?.other || 0) * 2.51 + ' ' + 251"
                          :stroke-dashoffset="-((readerData?.demographics?.gender?.male || 0) + (readerData?.demographics?.gender?.female || 0)) * 2.51"
                          transform="rotate(-90 50 50)"
                        />
                      </svg>
                    </div>
                    <div class="pie-legend">
                      <div class="legend-item">
                        <span class="legend-dot legend-male"></span>
                        <span>男性 {{ readerData?.demographics?.gender?.male || 0 }}%</span>
                      </div>
                      <div class="legend-item">
                        <span class="legend-dot legend-female"></span>
                        <span>女性 {{ readerData?.demographics?.gender?.female || 0 }}%</span>
                      </div>
                      <div class="legend-item">
                        <span class="legend-dot legend-other"></span>
                        <span>其他 {{ readerData?.demographics?.gender?.other || 0 }}%</span>
                      </div>
                    </div>
                  </n-card>

                  <div class="section-title">读者年龄分布</div>
                  <n-card hoverable class="chart-card">
                    <div class="bar-chart-horizontal">
                      <div 
                        v-for="(value, key) in readerData?.demographics?.ageGroups || {}" 
                        :key="key"
                        class="bar-row"
                      >
                        <div class="bar-row-label">{{ key }}岁</div>
                        <div class="bar-row-track">
                          <div 
                            class="bar-row-fill bar-age"
                            :style="{ width: value + '%' }"
                          ></div>
                        </div>
                        <div class="bar-row-value">{{ value }}%</div>
                      </div>
                    </div>
                  </n-card>
                </div>

                <div class="reader-column">
                  <div class="section-title">读者地域分布</div>
                  <n-card hoverable class="chart-card">
                    <div class="region-list">
                      <div 
                        v-for="region in readerData?.demographics?.regions || []" 
                        :key="region.name"
                        class="region-item"
                      >
                        <span class="region-name">{{ region.name }}</span>
                        <div class="region-bar-wrapper">
                          <div 
                            class="region-bar"
                            :style="{ width: region.value + '%' }"
                          ></div>
                        </div>
                        <span class="region-value">{{ region.value }}%</span>
                      </div>
                    </div>
                  </n-card>

                  <div class="section-title">读者阅读习惯</div>
                  <n-card hoverable class="chart-card">
                    <div class="habit-list">
                      <div class="habit-item">
                        <span class="habit-icon">📚</span>
                        <div class="habit-info">
                          <div class="habit-label">日均阅读次数</div>
                          <div class="habit-value">{{ readerData?.preferences?.readingHabits?.avgSessions || 0 }} 次</div>
                        </div>
                      </div>
                      <div class="habit-item">
                        <span class="habit-icon">⏱️</span>
                        <div class="habit-info">
                          <div class="habit-label">平均阅读时长</div>
                          <div class="habit-value">{{ readerData?.preferences?.readingHabits?.avgDuration || 0 }} 分钟</div>
                        </div>
                      </div>
                      <div class="habit-item">
                        <span class="habit-icon">🕐</span>
                        <div class="habit-info">
                          <div class="habit-label">活跃时段</div>
                          <div class="habit-value">{{ readerData?.preferences?.readingHabits?.preferredTime || '-' }}</div>
                        </div>
                      </div>
                    </div>
                  </n-card>

                  <div class="section-title">一周活跃读者趋势</div>
                  <n-card hoverable class="chart-card">
                    <div class="chart-bars weekly-bars">
                      <div 
                        v-for="day in readerData?.preferences?.engagement?.activeDays || []" 
                        :key="day.day"
                        class="chart-bar-group"
                      >
                        <div class="bar-wrapper tall">
                          <div 
                            class="bar bar-readers" 
                            :style="{ height: (day.readers / getMaxReaders(readerData?.preferences?.engagement?.activeDays) * 100) + '%' }"
                          >
                            <div class="bar-tooltip">{{ day.readers }}人</div>
                          </div>
                        </div>
                        <div class="bar-label">{{ day.day }}</div>
                      </div>
                    </div>
                  </n-card>
                </div>

                <div class="reader-column full-width">
                  <div class="section-title">读者偏好标签</div>
                  <n-card hoverable class="chart-card">
                    <div class="tag-cloud">
                      <div 
                        v-for="tag in readerData?.preferences?.favoriteTags || []" 
                        :key="tag.name"
                        class="tag-item"
                        :style="{ fontSize: (12 + tag.value / 10) + 'px' }"
                      >
                        {{ tag.name }}
                      </div>
                    </div>
                  </n-card>
                </div>
              </div>
            </div>
          </n-tab-pane>

          <n-tab-pane name="branches" tab="🔀 分支转化">
            <div class="tab-panel">
              <div class="branch-selector">
                <div class="section-title" style="margin-bottom: 0;">选择故事查看分支转化</div>
                <n-select 
                  v-model:value="selectedStoryId" 
                  :options="storyOptions"
                  placeholder="请选择故事"
                  @update:value="loadBranchData"
                  style="width: 280px;"
                />
              </div>

              <div v-if="branchData" class="branch-content">
                <div class="section-title">阅读漏斗</div>
                <n-card hoverable class="funnel-card">
                  <div class="funnel">
                    <div 
                      v-for="(stage, idx) in branchData.overallFunnel" 
                      :key="stage.stage"
                      class="funnel-stage"
                      :style="{ width: stage.rate + '%' }"
                    >
                      <div class="funnel-content">
                        <div class="funnel-stage-name">{{ stage.stage }}</div>
                        <div class="funnel-stage-count">{{ stage.count }} 人</div>
                        <div class="funnel-stage-rate">{{ stage.rate }}%</div>
                      </div>
                    </div>
                  </div>
                </n-card>

                <div class="section-title">分支节点详情</div>
                <div class="branch-nodes">
                  <n-card 
                    v-for="node in branchData.nodes" 
                    :key="node.nodeId"
                    hoverable
                    class="node-card"
                  >
                    <div class="node-header">
                      <h4 class="node-title">{{ node.title }}</h4>
                      <n-tag type="info" size="small">{{ node.visitors }} 人到达</n-tag>
                    </div>
                    <div class="node-choices">
                      <div 
                        v-for="choice in node.choices" 
                        :key="choice.id"
                        class="choice-item"
                      >
                        <div class="choice-text">{{ choice.text }}</div>
                        <div class="choice-stats">
                          <div class="choice-bar-wrapper">
                            <div 
                              class="choice-bar"
                              :style="{ width: choice.rate + '%' }"
                            ></div>
                          </div>
                          <span class="choice-count">{{ choice.count }}人</span>
                          <span class="choice-rate">{{ choice.rate }}%</span>
                        </div>
                      </div>
                    </div>
                  </n-card>
                </div>
              </div>
            </div>
          </n-tab-pane>

          <n-tab-pane name="settings" tab="🔥 设定引用热度">
            <div class="tab-panel">
              <div class="settings-grid">
                <div class="settings-summary">
                  <div class="section-title">引用数据总览</div>
                  <n-card hoverable class="summary-detail-card">
                    <div class="summary-metric">
                      <span class="summary-metric-icon">📊</span>
                      <div>
                        <div class="summary-metric-value">{{ settingData?.summary?.totalReferences || 0 }}</div>
                        <div class="summary-metric-label">总引用次数</div>
                      </div>
                    </div>
                    <div class="summary-metric">
                      <span class="summary-metric-icon">📅</span>
                      <div>
                        <div class="summary-metric-value">{{ settingData?.summary?.weeklyReferences || 0 }}</div>
                        <div class="summary-metric-label">本周引用</div>
                      </div>
                    </div>
                  </n-card>

                  <div class="section-title">引用来源分布</div>
                  <n-card hoverable class="chart-card">
                    <div class="source-list">
                      <div 
                        v-for="source in settingData?.referenceSources || []" 
                        :key="source.source"
                        class="source-item"
                      >
                        <div class="source-info">
                          <span class="source-name">{{ source.source }}</span>
                          <div class="source-bar-wrapper">
                            <div 
                              class="source-bar"
                              :style="{ width: (source.count / (settingData?.summary?.totalReferences || 1) * 100) + '%' }"
                            ></div>
                          </div>
                        </div>
                        <span class="source-count">{{ source.count }} 次</span>
                      </div>
                    </div>
                  </n-card>
                </div>

                <div class="settings-trend">
                  <div class="section-title">周引用趋势</div>
                  <n-card hoverable class="chart-card">
                    <div class="chart-bars weekly-bars">
                      <div 
                        v-for="item in settingData?.trendData || []" 
                        :key="item.week"
                        class="chart-bar-group"
                      >
                        <div class="bar-wrapper tall">
                          <div 
                            class="bar bar-refs" 
                            :style="{ height: (item.references / getMaxRefs(settingData?.trendData) * 100) + '%' }"
                          >
                            <div class="bar-tooltip">{{ item.references }}次</div>
                          </div>
                        </div>
                        <div class="bar-label">{{ item.week }}</div>
                      </div>
                    </div>
                  </n-card>
                </div>

                <div class="settings-top full-width">
                  <div class="section-title">热门设定条目排行</div>
                  <n-card hoverable class="top-settings-card">
                    <div 
                      v-for="(item, idx) in settingData?.summary?.topReferenced || []" 
                      :key="item.entryId"
                      class="top-setting-item"
                    >
                      <div class="top-setting-rank" :class="'rank-' + (idx + 1)">{{ idx + 1 }}</div>
                      <div class="top-setting-info">
                        <div class="top-setting-title">{{ item.title }}</div>
                        <div class="top-setting-category">
                          <n-tag size="small" type="primary">{{ item.category }}</n-tag>
                        </div>
                      </div>
                      <div class="top-setting-count">
                        <div class="count-value">{{ item.referenceCount }} 次引用</div>
                        <div class="count-trend" :class="item.trend">
                          {{ item.trend === 'up' ? '↑' : item.trend === 'down' ? '↓' : '→' }} 
                          {{ Math.abs(item.weeklyChange) }} 本周
                        </div>
                      </div>
                    </div>
                  </n-card>
                </div>
              </div>
            </div>
          </n-tab-pane>
        </n-tabs>
      </div>
    </n-spin>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { NCard, NTag, NTabs, NTabPane, NSpin, NSelect } from 'naive-ui'
import { analyticsApi } from '../api'

const userId = 'user-1'
const loading = ref(false)
const activeTab = ref('performance')
const selectedStoryId = ref('story-1')

const summary = ref(null)
const performanceData = ref(null)
const readerData = ref(null)
const branchData = ref(null)
const settingData = ref(null)

const storyOptions = computed(() => {
  if (!performanceData.value?.stories) return []
  return performanceData.value.stories.map(s => ({
    label: `${s.cover} ${s.title}`,
    value: s.id
  }))
})

const loadAllData = async () => {
  loading.value = true
  try {
    const [summaryRes, perfRes, readerRes, settingRes] = await Promise.all([
      analyticsApi.getAuthorSummary(userId),
      analyticsApi.getAuthorPerformance(userId),
      analyticsApi.getReaderProfile(userId),
      analyticsApi.getSettingReferences(userId)
    ])
    summary.value = summaryRes.data
    performanceData.value = perfRes.data
    readerData.value = readerRes.data
    settingData.value = settingRes.data
    
    if (perfRes.data?.stories?.length > 0) {
      selectedStoryId.value = perfRes.data.stories[0].id
      await loadBranchData(perfRes.data.stories[0].id)
    }
  } catch (err) {
    console.error('加载看板数据失败:', err)
  } finally {
    loading.value = false
  }
}

const loadBranchData = async (storyId) => {
  if (!storyId) return
  try {
    const res = await analyticsApi.getBranchConversions(storyId)
    branchData.value = res.data
  } catch (err) {
    console.error('加载分支数据失败:', err)
  }
}

const getMaxViews = (trend) => {
  if (!trend || trend.length === 0) return 1
  return Math.max(...trend.map(t => t.views))
}

const getMaxReaders = (days) => {
  if (!days || days.length === 0) return 1
  return Math.max(...days.map(d => d.readers))
}

const getMaxRefs = (trendData) => {
  if (!trendData || trendData.length === 0) return 1
  return Math.max(...trendData.map(t => t.references))
}

onMounted(() => {
  loadAllData()
})
</script>

<style scoped>
.author-dashboard {
  padding-bottom: 40px;
}

.page-header {
  margin-bottom: 30px;
}

.page-title {
  font-size: 28px;
  margin: 0 0 8px 0;
  color: #333;
}

.page-desc {
  font-size: 14px;
  color: #999;
  margin: 0;
}

.dashboard-content {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.summary-cards {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
}

.summary-card {
  display: flex;
  align-items: center;
  gap: 16px;
}

.card-icon {
  width: 56px;
  height: 56px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
  flex-shrink: 0;
}

.card-icon-views {
  background: linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%);
}

.card-icon-likes {
  background: linear-gradient(135deg, #ffebee 0%, #ffcdd2 100%);
}

.card-icon-stories {
  background: linear-gradient(135deg, #f3e5f5 0%, #e1bee7 100%);
}

.card-icon-refs {
  background: linear-gradient(135deg, #fff3e0 0%, #ffe0b2 100%);
}

.card-content {
  flex: 1;
}

.card-value {
  font-size: 28px;
  font-weight: bold;
  color: #333;
  line-height: 1.2;
}

.card-label {
  font-size: 13px;
  color: #999;
  margin: 4px 0;
}

.card-trend {
  font-size: 12px;
  color: #666;
}

.card-trend.up {
  color: #52c41a;
}

.dashboard-tabs {
  margin-top: 8px;
}

.tab-panel {
  padding-top: 20px;
}

.section-title {
  font-size: 18px;
  font-weight: 600;
  color: #333;
  margin: 0 0 16px 0;
}

.stories-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-bottom: 24px;
}

.story-card {
  padding: 20px;
}

.story-header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 20px;
}

.story-cover {
  font-size: 40px;
  width: 72px;
  height: 72px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #f0e6ff 0%, #e0ccff 100%);
  border-radius: 12px;
  flex-shrink: 0;
}

.story-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.story-title {
  font-size: 18px;
  margin: 0;
  color: #333;
}

.story-metrics {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 16px;
  margin-bottom: 20px;
  padding: 16px;
  background: #fafafa;
  border-radius: 8px;
}

.metric-item {
  text-align: center;
}

.metric-label {
  font-size: 12px;
  color: #999;
  display: block;
  margin-bottom: 4px;
}

.metric-value {
  font-size: 18px;
  font-weight: 600;
  color: #333;
}

.trend-chart {
  padding: 16px;
  background: #fafafa;
  border-radius: 8px;
}

.chart-title {
  font-size: 14px;
  color: #666;
  margin-bottom: 16px;
}

.chart-bars {
  display: flex;
  align-items: flex-end;
  gap: 12px;
  height: 140px;
}

.chart-bars.weekly-bars {
  height: 180px;
}

.chart-bar-group {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  height: 100%;
}

.bar-wrapper {
  width: 100%;
  height: calc(100% - 24px);
  display: flex;
  align-items: flex-end;
  position: relative;
}

.bar-wrapper.tall {
  height: calc(100% - 24px);
}

.bar {
  width: 100%;
  border-radius: 6px 6px 0 0;
  position: relative;
  transition: height 0.5s ease;
  cursor: pointer;
  min-height: 4px;
}

.bar-views {
  background: linear-gradient(180deg, #9d4edd 0%, #c77dff 100%);
}

.bar-readers {
  background: linear-gradient(180deg, #52c41a 0%, #95de64 100%);
}

.bar-refs {
  background: linear-gradient(180deg, #fa8c16 0%, #ffc069 100%);
}

.bar:hover .bar-tooltip {
  opacity: 1;
  transform: translateX(-50%) translateY(-8px);
}

.bar-tooltip {
  position: absolute;
  top: -8px;
  left: 50%;
  transform: translateX(-50%);
  background: #333;
  color: #fff;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  white-space: nowrap;
  opacity: 0;
  transition: all 0.2s;
  pointer-events: none;
}

.bar-label {
  font-size: 12px;
  color: #666;
}

.endings-ranking {
  margin-bottom: 16px;
}

.endings-card {
  padding: 16px 20px;
}

.ending-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 12px 0;
  border-bottom: 1px solid #f0f0f0;
}

.ending-item:last-child {
  border-bottom: none;
}

.ending-rank {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 14px;
  color: #fff;
  flex-shrink: 0;
}

.rank-1 {
  background: linear-gradient(135deg, #fadb14 0%, #faad14 100%);
}

.rank-2 {
  background: linear-gradient(135deg, #d9d9d9 0%, #bfbfbf 100%);
}

.rank-3 {
  background: linear-gradient(135deg, #d48806 0%, #ad6800 100%);
}

.ending-rank:not(.rank-1):not(.rank-2):not(.rank-3) {
  background: linear-gradient(135deg, #9d4edd 0%, #7b2cbf 100%);
}

.ending-info {
  flex: 1;
  min-width: 0;
}

.ending-title {
  font-size: 14px;
  color: #333;
  margin-bottom: 6px;
}

.ending-bar-wrapper {
  height: 8px;
  background: #f0f0f0;
  border-radius: 4px;
  overflow: hidden;
}

.ending-bar {
  height: 100%;
  background: linear-gradient(90deg, #9d4edd 0%, #c77dff 100%);
  border-radius: 4px;
  transition: width 0.5s ease;
}

.ending-stats {
  text-align: right;
  flex-shrink: 0;
}

.ending-count {
  font-size: 14px;
  font-weight: 600;
  color: #333;
}

.ending-rate {
  font-size: 12px;
  color: #9d4edd;
  margin-top: 2px;
}

.reader-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 24px;
}

.reader-column.full-width {
  grid-column: 1 / -1;
}

.chart-card {
  padding: 20px;
}

.pie-chart {
  position: relative;
  width: 200px;
  height: 200px;
  margin: 0 auto 20px;
}

.pie-center {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
  z-index: 1;
}

.pie-total {
  font-size: 16px;
  color: #333;
  font-weight: 600;
}

.pie-svg {
  width: 100%;
  height: 100%;
  transform: rotate(0deg);
}

.pie-legend {
  display: flex;
  justify-content: center;
  gap: 20px;
  flex-wrap: wrap;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: #666;
}

.legend-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
}

.legend-male {
  background: #e74c3c;
}

.legend-female {
  background: #9b59b6;
}

.legend-other {
  background: #3498db;
}

.bar-chart-horizontal {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.bar-row {
  display: flex;
  align-items: center;
  gap: 12px;
}

.bar-row-label {
  width: 60px;
  font-size: 13px;
  color: #666;
  flex-shrink: 0;
}

.bar-row-track {
  flex: 1;
  height: 12px;
  background: #f0f0f0;
  border-radius: 6px;
  overflow: hidden;
}

.bar-row-fill {
  height: 100%;
  border-radius: 6px;
  transition: width 0.5s ease;
}

.bar-age {
  background: linear-gradient(90deg, #9d4edd 0%, #c77dff 100%);
}

.bar-row-value {
  width: 50px;
  text-align: right;
  font-size: 13px;
  color: #333;
  font-weight: 600;
}

.region-list {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.region-item {
  display: flex;
  align-items: center;
  gap: 12px;
}

.region-name {
  width: 50px;
  font-size: 13px;
  color: #666;
  flex-shrink: 0;
}

.region-bar-wrapper {
  flex: 1;
  height: 10px;
  background: #f0f0f0;
  border-radius: 5px;
  overflow: hidden;
}

.region-bar {
  height: 100%;
  background: linear-gradient(90deg, #52c41a 0%, #95de64 100%);
  border-radius: 5px;
  transition: width 0.5s ease;
}

.region-value {
  width: 50px;
  text-align: right;
  font-size: 13px;
  color: #333;
  font-weight: 600;
}

.habit-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.habit-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 12px;
  background: #fafafa;
  border-radius: 8px;
}

.habit-icon {
  font-size: 28px;
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #fff;
  border-radius: 8px;
}

.habit-info {
  flex: 1;
}

.habit-label {
  font-size: 12px;
  color: #999;
  margin-bottom: 4px;
}

.habit-value {
  font-size: 16px;
  font-weight: 600;
  color: #333;
}

.tag-cloud {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  justify-content: center;
  padding: 16px;
}

.tag-item {
  padding: 8px 16px;
  background: linear-gradient(135deg, #f0e6ff 0%, #e0ccff 100%);
  color: #7b2cbf;
  border-radius: 20px;
  font-weight: 500;
  transition: all 0.2s;
  cursor: pointer;
}

.tag-item:hover {
  background: linear-gradient(135deg, #9d4edd 0%, #c77dff 100%);
  color: #fff;
  transform: translateY(-2px);
}

.branch-selector {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.branch-content {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.funnel-card {
  padding: 24px;
}

.funnel {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.funnel-stage {
  background: linear-gradient(90deg, #9d4edd 0%, #c77dff 100%);
  border-radius: 8px;
  padding: 12px 20px;
  color: #fff;
  transition: all 0.5s ease;
  margin: 0 auto;
}

.funnel-content {
  display: flex;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
  justify-content: center;
}

.funnel-stage-name {
  font-weight: 600;
  font-size: 14px;
}

.funnel-stage-count {
  font-size: 13px;
  opacity: 0.9;
}

.funnel-stage-rate {
  font-size: 16px;
  font-weight: bold;
}

.branch-nodes {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

.node-card {
  padding: 20px;
}

.node-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.node-title {
  font-size: 15px;
  margin: 0;
  color: #333;
}

.node-choices {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.choice-item {
  padding: 12px;
  background: #fafafa;
  border-radius: 8px;
}

.choice-text {
  font-size: 13px;
  color: #333;
  margin-bottom: 8px;
}

.choice-stats {
  display: flex;
  align-items: center;
  gap: 10px;
}

.choice-bar-wrapper {
  flex: 1;
  height: 8px;
  background: #f0f0f0;
  border-radius: 4px;
  overflow: hidden;
}

.choice-bar {
  height: 100%;
  background: linear-gradient(90deg, #fa8c16 0%, #ffc069 100%);
  border-radius: 4px;
  transition: width 0.5s ease;
}

.choice-count {
  font-size: 12px;
  color: #666;
  white-space: nowrap;
}

.choice-rate {
  font-size: 12px;
  font-weight: 600;
  color: #fa8c16;
  white-space: nowrap;
}

.settings-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
}

.settings-summary,
.settings-trend {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.settings-top.full-width {
  grid-column: 1 / -1;
}

.summary-detail-card {
  padding: 20px;
}

.summary-metric {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 12px 0;
  border-bottom: 1px solid #f0f0f0;
}

.summary-metric:last-child {
  border-bottom: none;
  padding-bottom: 0;
}

.summary-metric:first-child {
  padding-top: 0;
}

.summary-metric-icon {
  font-size: 32px;
  width: 56px;
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #fff3e0 0%, #ffe0b2 100%);
  border-radius: 12px;
}

.summary-metric-value {
  font-size: 24px;
  font-weight: bold;
  color: #333;
}

.summary-metric-label {
  font-size: 13px;
  color: #999;
  margin-top: 2px;
}

.source-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.source-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
}

.source-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.source-name {
  font-size: 14px;
  color: #333;
}

.source-bar-wrapper {
  height: 10px;
  background: #f0f0f0;
  border-radius: 5px;
  overflow: hidden;
}

.source-bar {
  height: 100%;
  background: linear-gradient(90deg, #fa8c16 0%, #ffc069 100%);
  border-radius: 5px;
  transition: width 0.5s ease;
}

.source-count {
  font-size: 14px;
  font-weight: 600;
  color: #333;
  white-space: nowrap;
}

.top-settings-card {
  padding: 16px 20px;
}

.top-setting-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 14px 0;
  border-bottom: 1px solid #f0f0f0;
}

.top-setting-item:last-child {
  border-bottom: none;
}

.top-setting-rank {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 14px;
  color: #fff;
  flex-shrink: 0;
}

.top-setting-info {
  flex: 1;
  min-width: 0;
}

.top-setting-title {
  font-size: 15px;
  color: #333;
  margin-bottom: 6px;
}

.top-setting-category {
  display: inline-block;
}

.top-setting-count {
  text-align: right;
  flex-shrink: 0;
}

.count-value {
  font-size: 15px;
  font-weight: 600;
  color: #333;
}

.count-trend {
  font-size: 12px;
  margin-top: 4px;
}

.count-trend.up {
  color: #52c41a;
}

.count-trend.down {
  color: #f5222d;
}

.count-trend.stable {
  color: #faad14;
}

@media (max-width: 1024px) {
  .summary-cards {
    grid-template-columns: repeat(2, 1fr);
  }

  .story-metrics {
    grid-template-columns: repeat(3, 1fr);
  }

  .reader-grid {
    grid-template-columns: 1fr;
  }

  .branch-nodes {
    grid-template-columns: 1fr;
  }

  .settings-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 640px) {
  .summary-cards {
    grid-template-columns: 1fr;
  }

  .story-metrics {
    grid-template-columns: repeat(2, 1fr);
  }

  .branch-selector {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
}
</style>
