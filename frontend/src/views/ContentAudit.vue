<template>
  <div class="content-audit">
    <div class="page-header">
      <h1 class="page-title">🛡️ 内容审核后台</h1>
      <p class="page-desc">管理故事、设定、评论的内容审核、举报处理与内容下架</p>
    </div>

    <n-spin :show="loading" size="large">
      <div v-if="!loading" class="audit-content">
        <div class="stats-cards">
          <n-card class="stat-card pending" hoverable>
            <div class="stat-icon">⏳</div>
            <div class="stat-info">
              <div class="stat-value">{{ stats?.pending?.total || 0 }}</div>
              <div class="stat-label">待审核</div>
            </div>
          </n-card>
          <n-card class="stat-card reports" hoverable>
            <div class="stat-icon">🚨</div>
            <div class="stat-info">
              <div class="stat-value">{{ reportStats?.stats?.pending || 0 }}</div>
              <div class="stat-label">待处理举报</div>
            </div>
          </n-card>
          <n-card class="stat-card takedown" hoverable>
            <div class="stat-icon">🚫</div>
            <div class="stat-info">
              <div class="stat-value">{{ reportStats?.stats?.resolved_takedown || 0 }}</div>
              <div class="stat-label">已下架</div>
            </div>
          </n-card>
          <n-card class="stat-card approved" hoverable>
            <div class="stat-icon">✅</div>
            <div class="stat-info">
              <div class="stat-value">{{ stats?.approved?.total || 0 }}</div>
              <div class="stat-label">已通过</div>
            </div>
          </n-card>
        </div>

        <n-tabs v-model:value="activeTab" type="line" size="large" class="audit-tabs">
          <n-tab-pane name="pending" tab="📋 待审核">
            <div class="tab-content">
              <div class="filter-bar">
                <n-radio-group v-model:value="filterType" @update:value="loadPendingItems">
                  <n-radio-button value="">全部</n-radio-button>
                  <n-radio-button value="story">故事</n-radio-button>
                  <n-radio-button value="world">设定</n-radio-button>
                  <n-radio-button value="comment">评论</n-radio-button>
                </n-radio-group>
              </div>

              <div v-if="pendingItems.length === 0" class="empty-state">
                <div class="empty-icon">🎉</div>
                <div class="empty-text">暂无待审核内容</div>
              </div>

              <div v-else class="pending-list">
                <n-card 
                  v-for="item in pendingItems" 
                  :key="`${item.type}-${item.id}`"
                  hoverable
                  class="audit-item"
                >
                  <div class="item-header">
                    <div class="item-type-badge" :class="item.type">
                      {{ getTypeLabel(item.type) }}
                    </div>
                    <div class="item-time">{{ item.createdAt }}</div>
                  </div>

                  <div class="item-body">
                    <div class="item-cover" v-if="item.cover">{{ item.cover }}</div>
                    <div class="item-main">
                      <h3 class="item-title">{{ item.title }}</h3>
                      <p class="item-summary" v-if="item.summary || item.content">
                        {{ item.summary || item.content }}
                      </p>
                      <div class="item-meta">
                        <span class="meta-item">
                          👤 {{ item.authorName }}
                        </span>
                        <span class="meta-item" v-if="item.storyTitle">
                          📖 {{ item.storyTitle }}
                        </span>
                        <span class="meta-item" v-if="item.entryCount !== undefined">
                          📝 {{ item.entryCount }} 个条目
                        </span>
                        <span class="meta-item" v-if="item.tags">
                          🏷️ {{ item.tags?.join('、') }}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div class="item-actions">
                    <n-select 
                      v-model:value="selectedLevels[`${item.type}-${item.id}`]" 
                      placeholder="选择等级"
                      :options="levelOptions"
                      size="small"
                      style="width: 120px"
                    />
                    <n-button 
                      type="success" 
                      size="small"
                      @click="handleApprove(item)"
                    >
                      通过
                    </n-button>
                    <n-button 
                      type="error" 
                      size="small"
                      @click="showRejectDialog(item)"
                    >
                      驳回
                    </n-button>
                    <n-button 
                      type="warning" 
                      size="small"
                      @click="showTakedownDialog(item, 'audit')"
                    >
                      下架
                    </n-button>
                  </div>
                </n-card>
              </div>

              <div v-if="pendingTotal > pageSize" class="pagination">
                <n-pagination
                  v-model:page="currentPage"
                  :page-size="pageSize"
                  :item-count="pendingTotal"
                  @update:page="loadPendingItems"
                />
              </div>
            </div>
          </n-tab-pane>

          <n-tab-pane name="reports" tab="🚨 举报管理">
            <div class="tab-content">
              <div class="filter-bar">
                <n-radio-group v-model:value="reportFilterStatus" @update:value="loadReports">
                  <n-radio-button value="pending">待处理</n-radio-button>
                  <n-radio-button value="">全部</n-radio-button>
                  <n-radio-button value="dismissed">已驳回</n-radio-button>
                  <n-radio-button value="takedown">已下架</n-radio-button>
                </n-radio-group>
                <n-radio-group v-model:value="reportFilterType" @update:value="loadReports">
                  <n-radio-button value="">全部类型</n-radio-button>
                  <n-radio-button value="story">故事</n-radio-button>
                  <n-radio-button value="comment">评论</n-radio-button>
                  <n-radio-button value="world_entry">设定条目</n-radio-button>
                </n-radio-group>
              </div>

              <div v-if="reportItems.length === 0" class="empty-state">
                <div class="empty-icon">✨</div>
                <div class="empty-text">暂无举报记录</div>
              </div>

              <div v-else class="reports-list">
                <n-card 
                  v-for="report in reportItems" 
                  :key="report.id"
                  hoverable
                  class="report-item"
                  :class="{ 'report-pending': report.status === 'pending', 'report-takedown': report.status === 'takedown' }"
                >
                  <div class="report-header">
                    <div class="report-type-badge" :class="report.targetType">
                      {{ getTargetTypeLabel(report.targetType) }}
                    </div>
                    <n-tag 
                      size="small" 
                      :type="getReportStatusType(report.status)"
                      round
                    >
                      {{ getReportStatusLabel(report.status) }}
                    </n-tag>
                    <n-tag size="small" type="error" round>
                      {{ report.reasonLabel }}
                    </n-tag>
                    <div class="report-time">{{ report.createdAt }}</div>
                  </div>

                  <div class="report-body">
                    <div class="report-target-info">
                      <span class="report-label">举报对象：</span>
                      <span class="report-value highlight">{{ report.targetTitle }}</span>
                    </div>
                    <div class="report-author-info">
                      <span class="report-label">内容作者：</span>
                      <span class="report-value">{{ report.targetAuthorName }}</span>
                    </div>
                    <div class="report-reporter-info">
                      <span class="report-label">举报人：</span>
                      <span class="report-value">{{ report.reporterName }}</span>
                    </div>
                    <div class="report-description" v-if="report.description">
                      <span class="report-label">举报说明：</span>
                      <span class="report-value desc">{{ report.description }}</span>
                    </div>
                    <div v-if="report.status !== 'pending'" class="report-review-info">
                      <span class="report-label">处理结果：</span>
                      <span class="report-value">{{ report.reviewRemark }}</span>
                      <span class="report-label" style="margin-left: 12px;">处理人：</span>
                      <span class="report-value">{{ report.reviewerName }}</span>
                    </div>
                  </div>

                  <div v-if="report.status === 'pending'" class="report-actions">
                    <n-button 
                      size="small"
                      @click="handleDismissReport(report)"
                    >
                      驳回举报
                    </n-button>
                    <n-button 
                      type="error" 
                      size="small"
                      @click="showTakedownDialog(report, 'report')"
                    >
                      确认违规并下架
                    </n-button>
                  </div>
                </n-card>
              </div>

              <div v-if="reportTotal > reportPageSize" class="pagination">
                <n-pagination
                  v-model:page="reportCurrentPage"
                  :page-size="reportPageSize"
                  :item-count="reportTotal"
                  @update:page="loadReports"
                />
              </div>
            </div>
          </n-tab-pane>

          <n-tab-pane name="takedown" tab="🚫 已下架">
            <div class="tab-content">
              <div class="filter-bar">
                <n-radio-group v-model:value="takedownFilterType" @update:value="loadTakedownItems">
                  <n-radio-button value="">全部</n-radio-button>
                  <n-radio-button value="story">故事</n-radio-button>
                  <n-radio-button value="world">设定</n-radio-button>
                  <n-radio-button value="comment">评论</n-radio-button>
                </n-radio-group>
              </div>

              <div v-if="takedownItems.length === 0" class="empty-state">
                <div class="empty-icon">📦</div>
                <div class="empty-text">暂无已下架内容</div>
              </div>

              <div v-else class="takedown-list">
                <n-card 
                  v-for="item in takedownItems" 
                  :key="`${item.type}-${item.id}`"
                  hoverable
                  class="takedown-item"
                >
                  <div class="takedown-header">
                    <div class="takedown-type-badge" :class="item.type">
                      {{ getTypeLabel(item.type) }}
                    </div>
                    <n-tag size="small" type="error" round>已下架</n-tag>
                  </div>

                  <div class="takedown-body">
                    <h3 class="takedown-title">{{ item.title }}</h3>
                    <div class="takedown-meta">
                      <span class="meta-item">👤 {{ item.authorName }}</span>
                      <span class="meta-item" v-if="item.storyTitle">📖 {{ item.storyTitle }}</span>
                    </div>
                    <div class="takedown-reason" v-if="item.takedownReason">
                      <span class="report-label">下架原因：</span>
                      <span class="report-value">{{ item.takedownReason }}</span>
                    </div>
                  </div>

                  <div class="takedown-actions">
                    <n-button 
                      type="success" 
                      size="small"
                      @click="handleRestore(item)"
                    >
                      恢复上架
                    </n-button>
                  </div>
                </n-card>
              </div>

              <div v-if="takedownTotal > takedownPageSize" class="pagination">
                <n-pagination
                  v-model:page="takedownCurrentPage"
                  :page-size="takedownPageSize"
                  :item-count="takedownTotal"
                  @update:page="loadTakedownItems"
                />
              </div>
            </div>
          </n-tab-pane>

          <n-tab-pane name="logs" tab="📜 审核日志">
            <div class="tab-content">
              <div class="filter-bar">
                <n-radio-group v-model:value="logFilterType" @update:value="loadAuditLogs">
                  <n-radio-button value="">全部类型</n-radio-button>
                  <n-radio-button value="story">故事</n-radio-button>
                  <n-radio-button value="world">设定</n-radio-button>
                  <n-radio-button value="comment">评论</n-radio-button>
                </n-radio-group>
                <n-radio-group v-model:value="logFilterAction" @update:value="loadAuditLogs">
                  <n-radio-button value="">全部操作</n-radio-button>
                  <n-radio-button value="approve">通过</n-radio-button>
                  <n-radio-button value="reject">驳回</n-radio-button>
                  <n-radio-button value="takedown">下架</n-radio-button>
                  <n-radio-button value="restore">恢复</n-radio-button>
                </n-radio-group>
              </div>

              <div class="logs-list">
                <n-card 
                  v-for="log in auditLogs" 
                  :key="log.id"
                  class="log-item"
                >
                  <div class="log-header">
                    <div class="log-type-badge" :class="log.targetType">
                      {{ getTypeLabel(log.targetType) }}
                    </div>
                    <div class="log-action" :class="log.action">
                      {{ getActionLabel(log.action) }}
                    </div>
                    <div class="log-time">{{ log.createdAt }}</div>
                  </div>
                  <div class="log-body">
                    <div class="log-target">
                      <span class="log-label">审核对象：</span>
                      <span class="log-value">{{ log.targetTitle }}</span>
                    </div>
                    <div class="log-level" v-if="log.auditLevel">
                      <span class="log-label">审核等级：</span>
                      <n-tag size="small" :type="getLevelTagType(log.auditLevel)">
                        {{ log.auditLevel }}
                      </n-tag>
                    </div>
                    <div class="log-auditor">
                      <span class="log-label">审核人：</span>
                      <span class="log-value">{{ log.auditorName }}</span>
                    </div>
                    <div class="log-remark" v-if="log.remark">
                      <span class="log-label">备注：</span>
                      <span class="log-value">{{ log.remark }}</span>
                    </div>
                  </div>
                </n-card>
              </div>

              <div v-if="logsTotal > logPageSize" class="pagination">
                <n-pagination
                  v-model:page="logCurrentPage"
                  :page-size="logPageSize"
                  :item-count="logsTotal"
                  @update:page="loadAuditLogs"
                />
              </div>
            </div>
          </n-tab-pane>
        </n-tabs>
      </div>
    </n-spin>

    <n-modal 
      v-model:show="rejectDialogVisible" 
      preset="dialog"
      title="驳回原因"
      :positive-text="'确认驳回'"
      :negative-text="'取消'"
      @positive-click="handleReject"
    >
      <div class="reject-form">
        <n-input 
          v-model:value="rejectReason" 
          type="textarea"
          placeholder="请输入驳回原因..."
          :rows="4"
        />
      </div>
    </n-modal>

    <n-modal 
      v-model:show="takedownDialogVisible" 
      preset="dialog"
      title="确认下架"
      :positive-text="'确认下架'"
      :negative-text="'取消'"
      @positive-click="handleTakedown"
    >
      <div class="takedown-form">
        <p class="takedown-warning">
          ⚠️ 下架后内容将不可被普通用户查看，作者将收到下架通知。
        </p>
        <n-input 
          v-model:value="takedownReason" 
          type="textarea"
          placeholder="请输入下架原因..."
          :rows="4"
        />
      </div>
    </n-modal>
  </div>
</template>

<script setup>
import { ref, onMounted, reactive } from 'vue'
import { useMessage } from 'naive-ui'
import { auditApi, reportApi } from '../api'

const message = useMessage()

const loading = ref(true)
const stats = ref(null)
const reportStats = ref({ stats: { pending: 0, resolved_takedown: 0 } })
const activeTab = ref('pending')

const filterType = ref('')
const pendingItems = ref([])
const pendingTotal = ref(0)
const currentPage = ref(1)
const pageSize = 10

const reportFilterStatus = ref('pending')
const reportFilterType = ref('')
const reportItems = ref([])
const reportTotal = ref(0)
const reportCurrentPage = ref(1)
const reportPageSize = 10

const takedownFilterType = ref('')
const takedownItems = ref([])
const takedownTotal = ref(0)
const takedownCurrentPage = ref(1)
const takedownPageSize = 10

const logFilterType = ref('')
const logFilterAction = ref('')
const auditLogs = ref([])
const logsTotal = ref(0)
const logCurrentPage = ref(1)
const logPageSize = 10

const selectedLevels = reactive({})
const levelOptions = [
  { label: 'G 全年龄', value: 'G' },
  { label: 'PG 辅导级', value: 'PG' },
  { label: 'PG-13 13+', value: 'PG-13' },
  { label: 'R 限制级', value: 'R' }
]

const rejectDialogVisible = ref(false)
const rejectReason = ref('')
const currentRejectItem = ref(null)

const takedownDialogVisible = ref(false)
const takedownReason = ref('')
const takedownTarget = ref(null)
const takedownSource = ref('audit')

const loadStats = async () => {
  try {
    const res = await auditApi.getStats()
    stats.value = res.data
  } catch (err) {
    console.error('加载审核统计失败:', err)
    message.error('加载审核统计失败')
  }
}

const loadReportStats = async () => {
  try {
    const res = await reportApi.getReportStats()
    reportStats.value = res.data
  } catch (err) {
    console.error('加载举报统计失败:', err)
  }
}

const loadPendingItems = async () => {
  try {
    const res = await auditApi.getPendingItems({
      type: filterType.value || undefined,
      page: currentPage.value,
      limit: pageSize
    })
    pendingItems.value = res.data.items
    pendingTotal.value = res.data.total
    
    pendingItems.value.forEach(item => {
      const key = `${item.type}-${item.id}`
      if (!selectedLevels[key]) {
        selectedLevels[key] = 'G'
      }
    })
  } catch (err) {
    console.error('加载待审核列表失败:', err)
    message.error('加载待审核列表失败')
  }
}

const loadReports = async () => {
  try {
    const res = await reportApi.getReports({
      status: reportFilterStatus.value || undefined,
      targetType: reportFilterType.value || undefined,
      page: reportCurrentPage.value,
      limit: reportPageSize
    })
    reportItems.value = res.data.reports
    reportTotal.value = res.data.total
  } catch (err) {
    console.error('加载举报列表失败:', err)
    message.error('加载举报列表失败')
  }
}

const loadTakedownItems = async () => {
  try {
    const res = await auditApi.getTakedownItems({
      type: takedownFilterType.value || undefined,
      page: takedownCurrentPage.value,
      limit: takedownPageSize
    })
    takedownItems.value = res.data.items
    takedownTotal.value = res.data.total
  } catch (err) {
    console.error('加载已下架列表失败:', err)
    message.error('加载已下架列表失败')
  }
}

const loadAuditLogs = async () => {
  try {
    const res = await auditApi.getAuditLogs({
      targetType: logFilterType.value || undefined,
      action: logFilterAction.value || undefined,
      page: logCurrentPage.value,
      limit: logPageSize
    })
    auditLogs.value = res.data.logs
    logsTotal.value = res.data.total
  } catch (err) {
    console.error('加载审核日志失败:', err)
    message.error('加载审核日志失败')
  }
}

const getTypeLabel = (type) => {
  const labels = {
    story: '故事',
    world: '设定',
    comment: '评论'
  }
  return labels[type] || type
}

const getTargetTypeLabel = (type) => {
  const labels = {
    story: '故事',
    world: '设定',
    comment: '评论',
    world_entry: '设定条目'
  }
  return labels[type] || type
}

const getReportStatusLabel = (status) => {
  const labels = {
    pending: '待处理',
    reviewing: '审核中',
    dismissed: '已驳回',
    takedown: '已下架'
  }
  return labels[status] || status
}

const getReportStatusType = (status) => {
  const types = {
    pending: 'warning',
    reviewing: 'info',
    dismissed: 'default',
    takedown: 'error'
  }
  return types[status] || 'default'
}

const getActionLabel = (action) => {
  const labels = {
    approve: '✅ 通过',
    reject: '❌ 驳回',
    takedown: '🚫 下架',
    restore: '♻️ 恢复'
  }
  return labels[action] || action
}

const getLevelTagType = (level) => {
  const types = {
    'G': 'success',
    'PG': 'info',
    'PG-13': 'warning',
    'R': 'error'
  }
  return types[level] || 'default'
}

const handleApprove = async (item) => {
  const key = `${item.type}-${item.id}`
  const level = selectedLevels[key] || 'G'
  
  try {
    await auditApi.approveItem(item.type, item.id, {
      auditLevel: level,
      auditorId: 'admin-1',
      auditorName: '管理员'
    })
    message.success('审核通过')
    loadStats()
    loadPendingItems()
  } catch (err) {
    console.error('审核通过失败:', err)
    message.error('审核操作失败')
  }
}

const showRejectDialog = (item) => {
  currentRejectItem.value = item
  rejectReason.value = ''
  rejectDialogVisible.value = true
}

const handleReject = async () => {
  if (!rejectReason.value.trim()) {
    message.warning('请填写驳回原因')
    return false
  }
  
  const item = currentRejectItem.value
  if (!item) return false
  
  try {
    await auditApi.rejectItem(item.type, item.id, {
      reason: rejectReason.value,
      auditorId: 'admin-1',
      auditorName: '管理员'
    })
    message.success('已驳回')
    rejectDialogVisible.value = false
    loadStats()
    loadPendingItems()
    return true
  } catch (err) {
    console.error('审核驳回失败:', err)
    message.error('审核操作失败')
    return false
  }
}

const showTakedownDialog = (item, source) => {
  takedownTarget.value = item
  takedownSource.value = source
  takedownReason.value = ''
  takedownDialogVisible.value = true
}

const handleTakedown = async () => {
  if (!takedownReason.value.trim()) {
    message.warning('请填写下架原因')
    return false
  }
  
  const target = takedownTarget.value
  if (!target) return false

  try {
    if (takedownSource.value === 'report') {
      await reportApi.takedownByReport(target.id, {
        reviewerId: 'admin-1',
        reviewerName: '管理员',
        reviewRemark: takedownReason.value
      })
    } else {
      await auditApi.takedownItem(target.type, target.id, {
        reason: takedownReason.value,
        operatorId: 'admin-1',
        operatorName: '管理员'
      })
    }
    message.success('内容已下架')
    takedownDialogVisible.value = false
    loadStats()
    loadReportStats()
    loadPendingItems()
    loadReports()
    loadTakedownItems()
    loadAuditLogs()
    return true
  } catch (err) {
    console.error('下架操作失败:', err)
    message.error('下架操作失败')
    return false
  }
}

const handleDismissReport = async (report) => {
  try {
    await reportApi.dismissReport(report.id, {
      reviewerId: 'admin-1',
      reviewerName: '管理员',
      reviewRemark: '举报不成立'
    })
    message.success('举报已驳回')
    loadReportStats()
    loadReports()
  } catch (err) {
    console.error('驳回举报失败:', err)
    message.error('操作失败')
  }
}

const handleRestore = async (item) => {
  try {
    await auditApi.restoreItem(item.type, item.id, {
      auditLevel: 'G',
      operatorId: 'admin-1',
      operatorName: '管理员'
    })
    message.success('内容已恢复上架')
    loadStats()
    loadReportStats()
    loadTakedownItems()
    loadAuditLogs()
  } catch (err) {
    console.error('恢复上架失败:', err)
    message.error('恢复操作失败')
  }
}

const loadAll = async () => {
  loading.value = true
  await Promise.all([
    loadStats(),
    loadReportStats(),
    loadPendingItems(),
    loadReports(),
    loadTakedownItems(),
    loadAuditLogs()
  ])
  loading.value = false
}

onMounted(() => {
  loadAll()
})
</script>

<style scoped>
.content-audit {
  max-width: 1000px;
  margin: 0 auto;
}

.page-header {
  margin-bottom: 24px;
}

.page-title {
  font-size: 28px;
  font-weight: bold;
  margin: 0 0 8px 0;
  background: linear-gradient(135deg, #e0aaff 0%, #c77dff 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.page-desc {
  color: #888;
  margin: 0;
  font-size: 14px;
}

.audit-content {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.stats-cards {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
}

.stat-card {
  display: flex;
  align-items: center;
  gap: 16px;
  border-radius: 12px;
}

.stat-card.pending {
  background: linear-gradient(135deg, rgba(250, 204, 21, 0.1) 0%, rgba(250, 204, 21, 0.05) 100%);
  border: 1px solid rgba(250, 204, 21, 0.3);
}

.stat-card.reports {
  background: linear-gradient(135deg, rgba(249, 115, 22, 0.1) 0%, rgba(249, 115, 22, 0.05) 100%);
  border: 1px solid rgba(249, 115, 22, 0.3);
}

.stat-card.takedown {
  background: linear-gradient(135deg, rgba(239, 68, 68, 0.1) 0%, rgba(239, 68, 68, 0.05) 100%);
  border: 1px solid rgba(239, 68, 68, 0.3);
}

.stat-card.approved {
  background: linear-gradient(135deg, rgba(34, 197, 94, 0.1) 0%, rgba(34, 197, 94, 0.05) 100%);
  border: 1px solid rgba(34, 197, 94, 0.3);
}

.stat-icon {
  font-size: 36px;
}

.stat-info {
  flex: 1;
}

.stat-value {
  font-size: 28px;
  font-weight: bold;
  color: #e0aaff;
  margin-bottom: 4px;
}

.stat-label {
  font-size: 14px;
  color: #888;
}

.audit-tabs {
  margin-top: 8px;
}

.tab-content {
  padding: 16px 0;
}

.filter-bar {
  display: flex;
  gap: 16px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
}

.empty-icon {
  font-size: 64px;
  margin-bottom: 16px;
}

.empty-text {
  color: #888;
  font-size: 16px;
}

.pending-list,
.reports-list,
.takedown-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.audit-item,
.report-item,
.takedown-item {
  border-radius: 12px;
}

.report-item.report-pending {
  border-left: 3px solid #f97316;
}

.report-item.report-takedown {
  border-left: 3px solid #ef4444;
}

.item-header,
.report-header,
.takedown-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  flex-wrap: wrap;
  gap: 8px;
}

.item-type-badge,
.report-type-badge,
.takedown-type-badge {
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
  color: #fff;
}

.item-type-badge.story,
.report-type-badge.story,
.takedown-type-badge.story {
  background: linear-gradient(135deg, #9d4edd 0%, #c77dff 100%);
}

.item-type-badge.world,
.report-type-badge.world,
.takedown-type-badge.world {
  background: linear-gradient(135deg, #0ea5e9 0%, #38bdf8 100%);
}

.item-type-badge.comment,
.report-type-badge.comment,
.takedown-type-badge.comment {
  background: linear-gradient(135deg, #f97316 0%, #fb923c 100%);
}

.report-type-badge.world_entry {
  background: linear-gradient(135deg, #10b981 0%, #34d399 100%);
}

.item-time,
.report-time {
  font-size: 12px;
  color: #888;
}

.item-body {
  display: flex;
  gap: 16px;
  margin-bottom: 16px;
}

.item-cover {
  font-size: 48px;
  width: 60px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(157, 78, 221, 0.1);
  border-radius: 12px;
}

.item-main {
  flex: 1;
  min-width: 0;
}

.item-title {
  font-size: 16px;
  font-weight: 600;
  margin: 0 0 8px 0;
  color: #e0aaff;
}

.item-summary {
  font-size: 14px;
  color: #aaa;
  margin: 0 0 8px 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.item-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.meta-item {
  font-size: 12px;
  color: #888;
}

.item-actions,
.report-actions,
.takedown-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  align-items: center;
  padding-top: 12px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.report-body {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 4px;
}

.report-label {
  color: #888;
  font-size: 13px;
  min-width: 80px;
  display: inline;
}

.report-value {
  color: #ddd;
  font-size: 13px;
  display: inline;
}

.report-value.highlight {
  color: #e0aaff;
  font-weight: 600;
}

.report-value.desc {
  color: #bbb;
}

.report-review-info {
  padding: 8px 12px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  margin-top: 4px;
}

.takedown-body {
  margin-bottom: 4px;
}

.takedown-title {
  font-size: 16px;
  font-weight: 600;
  margin: 0 0 8px 0;
  color: #e0aaff;
}

.takedown-meta {
  display: flex;
  gap: 12px;
  margin-bottom: 8px;
}

.takedown-reason {
  padding: 8px 12px;
  background: rgba(239, 68, 68, 0.08);
  border-radius: 8px;
  border-left: 3px solid #ef4444;
}

.pagination {
  display: flex;
  justify-content: center;
  margin-top: 24px;
}

.logs-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.log-item {
  border-radius: 12px;
}

.log-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.log-action {
  font-size: 14px;
  font-weight: 500;
}

.log-action.approve {
  color: #22c55e;
}

.log-action.reject {
  color: #ef4444;
}

.log-action.takedown {
  color: #f97316;
}

.log-action.restore {
  color: #38bdf8;
}

.log-time {
  margin-left: auto;
  font-size: 12px;
  color: #888;
}

.log-body {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.log-target,
.log-level,
.log-auditor,
.log-remark {
  display: flex;
  gap: 8px;
  font-size: 14px;
}

.log-label {
  color: #888;
  min-width: 80px;
}

.log-value {
  color: #ddd;
}

.reject-form,
.takedown-form {
  padding: 12px 0;
}

.takedown-warning {
  color: #f97316;
  font-size: 14px;
  margin: 0 0 12px 0;
  padding: 10px 14px;
  background: rgba(249, 115, 22, 0.1);
  border-radius: 8px;
  border: 1px solid rgba(249, 115, 22, 0.2);
}

@media (max-width: 768px) {
  .stats-cards {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .item-body {
    flex-direction: column;
  }
  
  .item-cover {
    width: 100%;
    height: auto;
    padding: 20px;
  }
  
  .item-actions,
  .report-actions,
  .takedown-actions {
    flex-wrap: wrap;
  }

  .filter-bar {
    flex-direction: column;
    gap: 10px;
  }
}
</style>
