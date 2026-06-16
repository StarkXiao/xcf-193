<template>
  <div class="content-audit">
    <div class="page-header">
      <h1 class="page-title">🛡️ 内容审核后台</h1>
      <p class="page-desc">管理故事、设定、评论的内容审核与分级</p>
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
          <n-card class="stat-card approved" hoverable>
            <div class="stat-icon">✅</div>
            <div class="stat-info">
              <div class="stat-value">{{ stats?.approved?.total || 0 }}</div>
              <div class="stat-label">已通过</div>
            </div>
          </n-card>
          <n-card class="stat-card rejected" hoverable>
            <div class="stat-icon">❌</div>
            <div class="stat-info">
              <div class="stat-value">{{ stats?.rejected?.total || 0 }}</div>
              <div class="stat-label">已驳回</div>
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
                <n-radio-group v-model:value="reportStatus" @update:value="loadReports">
                  <n-radio-button value="">全部状态</n-radio-button>
                  <n-radio-button value="pending">待处理</n-radio-button>
                  <n-radio-button value="processing">处理中</n-radio-button>
                  <n-radio-button value="resolved">已处理</n-radio-button>
                  <n-radio-button value="rejected">已驳回</n-radio-button>
                </n-radio-group>
                <n-radio-group v-model:value="reportType" @update:value="loadReports">
                  <n-radio-button value="">全部类型</n-radio-button>
                  <n-radio-button value="story">故事</n-radio-button>
                  <n-radio-button value="comment">评论</n-radio-button>
                  <n-radio-button value="world_entry">设定条目</n-radio-button>
                </n-radio-group>
              </div>

              <div v-if="reports.length === 0" class="empty-state">
                <div class="empty-icon">✨</div>
                <div class="empty-text">暂无举报记录</div>
              </div>

              <div v-else class="reports-list">
                <n-card 
                  v-for="report in reports" 
                  :key="report.id"
                  hoverable
                  class="report-item"
                >
                  <div class="report-header">
                    <div class="report-status" :class="report.status">
                      {{ getReportStatusLabel(report.status) }}
                    </div>
                    <div class="report-type-badge" :class="report.targetType">
                      {{ getTypeLabel(report.targetType) }}
                    </div>
                    <div class="report-time">{{ report.createdAt }}</div>
                  </div>

                  <div class="report-body">
                    <div class="report-reason">
                      <span class="report-label">举报原因：</span>
                      <n-tag size="small" type="warning">{{ report.reasonLabel }}</n-tag>
                    </div>
                    <div class="report-target">
                      <span class="report-label">举报内容：</span>
                      <span class="report-value">{{ report.targetTitle }}</span>
                    </div>
                    <div class="report-desc" v-if="report.description">
                      <span class="report-label">详细描述：</span>
                      <span class="report-value">{{ report.description }}</span>
                    </div>
                    <div class="report-reporter">
                      <span class="report-label">举报人：</span>
                      <span class="report-value">{{ report.reporterName }}</span>
                    </div>
                    <div class="report-handle" v-if="report.handlerName">
                      <span class="report-label">处理人：</span>
                      <span class="report-value">{{ report.handlerName }}</span>
                    </div>
                    <div class="report-handle-result" v-if="report.handleResult">
                      <span class="report-label">处理结果：</span>
                      <span class="report-value">
                        {{ report.handleResult === 'take_down' ? '已下架' : '举报不成立' }}
                      </span>
                    </div>
                    <div class="report-handle-remark" v-if="report.handleRemark">
                      <span class="report-label">处理备注：</span>
                      <span class="report-value">{{ report.handleRemark }}</span>
                    </div>
                  </div>

                  <div class="report-actions" v-if="report.status === 'pending' || report.status === 'processing'">
                    <n-button 
                      size="small"
                      @click="showTakeDownDialog(report)"
                      type="error"
                    >
                      下架内容
                    </n-button>
                    <n-button 
                      size="small"
                      @click="showDismissDialog(report)"
                    >
                      驳回举报
                    </n-button>
                    <n-button 
                      size="small"
                      @click="markReportProcessing(report)"
                      v-if="report.status === 'pending'"
                    >
                      标记处理中
                    </n-button>
                  </div>
                </n-card>
              </div>

              <div v-if="reportsTotal > reportPageSize" class="pagination">
                <n-pagination
                  v-model:page="reportCurrentPage"
                  :page-size="reportPageSize"
                  :item-count="reportsTotal"
                  @update:page="loadReports"
                />
              </div>
            </div>
          </n-tab-pane>

          <n-tab-pane name="taken-down" tab="⬇️ 已下架">
            <div class="tab-content">
              <div class="filter-bar">
                <n-radio-group v-model:value="takenDownType" @update:value="loadTakenDownItems">
                  <n-radio-button value="">全部</n-radio-button>
                  <n-radio-button value="story">故事</n-radio-button>
                  <n-radio-button value="world">设定</n-radio-button>
                  <n-radio-button value="world_entry">设定条目</n-radio-button>
                  <n-radio-button value="comment">评论</n-radio-button>
                </n-radio-group>
              </div>

              <div v-if="takenDownItems.length === 0" class="empty-state">
                <div class="empty-icon">📦</div>
                <div class="empty-text">暂无已下架内容</div>
              </div>

              <div v-else class="taken-down-list">
                <n-card 
                  v-for="item in takenDownItems" 
                  :key="`${item.type}-${item.id}`"
                  hoverable
                  class="taken-down-item"
                >
                  <div class="item-header">
                    <div class="item-type-badge" :class="item.type">
                      {{ getTypeLabel(item.type) }}
                    </div>
                    <div class="item-time">下架时间：{{ item.takenDownAt || item.createdAt }}</div>
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
                        <span class="meta-item" v-if="item.worldName">
                          🌍 {{ item.worldName }}
                        </span>
                        <span class="meta-item" v-if="item.category">
                          📂 {{ item.category }}
                        </span>
                      </div>
                      <div class="item-reject-reason" v-if="item.rejectReason">
                        <span class="reject-label">下架原因：</span>
                        <span class="reject-value">{{ item.rejectReason }}</span>
                      </div>
                    </div>
                  </div>

                  <div class="item-actions">
                    <n-select 
                      v-model:value="restoreLevels[`${item.type}-${item.id}`]" 
                      placeholder="恢复等级"
                      :options="levelOptions"
                      size="small"
                      style="width: 120px"
                    />
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

              <div v-if="takenDownTotal > takenDownPageSize" class="pagination">
                <n-pagination
                  v-model:page="takenDownCurrentPage"
                  :page-size="takenDownPageSize"
                  :item-count="takenDownTotal"
                  @update:page="loadTakenDownItems"
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
                  <n-radio-button value="world_entry">设定条目</n-radio-button>
                  <n-radio-button value="comment">评论</n-radio-button>
                </n-radio-group>
                <n-radio-group v-model:value="logFilterAction" @update:value="loadAuditLogs">
                  <n-radio-button value="">全部操作</n-radio-button>
                  <n-radio-button value="approve">通过</n-radio-button>
                  <n-radio-button value="reject">驳回</n-radio-button>
                  <n-radio-button value="take_down">下架</n-radio-button>
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
                      {{ getLogActionLabel(log.action) }}
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
      v-model:show="takeDownDialogVisible" 
      preset="dialog"
      title="下架内容"
      :positive-text="'确认下架'"
      :negative-text="'取消'"
      positive-button-props="{ type: 'error' }"
      @positive-click="handleTakeDown"
    >
      <div class="take-down-form">
        <p class="dialog-desc">确定要下架该内容吗？下架后内容将不再对公众可见。</p>
        <n-input 
          v-model:value="takeDownReason" 
          type="textarea"
          placeholder="请输入下架原因..."
          :rows="4"
        />
      </div>
    </n-modal>

    <n-modal 
      v-model:show="dismissDialogVisible" 
      preset="dialog"
      title="驳回举报"
      :positive-text="'确认驳回'"
      :negative-text="'取消'"
      @positive-click="handleDismiss"
    >
      <div class="dismiss-form">
        <p class="dialog-desc">确定要驳回该举报吗？</p>
        <n-input 
          v-model:value="dismissReason" 
          type="textarea"
          placeholder="请输入驳回理由（可选）..."
          :rows="4"
        />
      </div>
    </n-modal>
  </div>
</template>

<script setup>
import { ref, onMounted, reactive, watch } from 'vue'
import { useMessage } from 'naive-ui'
import { auditApi, reportApi } from '../api'

const message = useMessage()

const loading = ref(true)
const stats = ref(null)
const activeTab = ref('pending')

const filterType = ref('')
const pendingItems = ref([])
const pendingTotal = ref(0)
const currentPage = ref(1)
const pageSize = 10

const reportStatus = ref('')
const reportType = ref('')
const reports = ref([])
const reportsTotal = ref(0)
const reportCurrentPage = ref(1)
const reportPageSize = 10

const takenDownType = ref('')
const takenDownItems = ref([])
const takenDownTotal = ref(0)
const takenDownCurrentPage = ref(1)
const takenDownPageSize = 10

const logFilterType = ref('')
const logFilterAction = ref('')
const auditLogs = ref([])
const logsTotal = ref(0)
const logCurrentPage = ref(1)
const logPageSize = 10

const selectedLevels = reactive({})
const restoreLevels = reactive({})
const levelOptions = [
  { label: 'G 全年龄', value: 'G' },
  { label: 'PG 辅导级', value: 'PG' },
  { label: 'PG-13 13+', value: 'PG-13' },
  { label: 'R 限制级', value: 'R' }
]

const rejectDialogVisible = ref(false)
const rejectReason = ref('')
const currentRejectItem = ref(null)

const takeDownDialogVisible = ref(false)
const takeDownReason = ref('')
const currentTakeDownReport = ref(null)

const dismissDialogVisible = ref(false)
const dismissReason = ref('')
const currentDismissReport = ref(null)

const loadStats = async () => {
  try {
    const res = await auditApi.getStats()
    stats.value = res.data
  } catch (err) {
    console.error('加载审核统计失败:', err)
    message.error('加载审核统计失败')
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
      status: reportStatus.value || undefined,
      targetType: reportType.value || undefined,
      page: reportCurrentPage.value,
      limit: reportPageSize
    })
    reports.value = res.data.reports
    reportsTotal.value = res.data.total
  } catch (err) {
    console.error('加载举报列表失败:', err)
    message.error('加载举报列表失败')
  }
}

const loadTakenDownItems = async () => {
  try {
    const res = await auditApi.getTakenDownItems({
      type: takenDownType.value || undefined,
      page: takenDownCurrentPage.value,
      limit: takenDownPageSize
    })
    takenDownItems.value = res.data.items
    takenDownTotal.value = res.data.total
    
    takenDownItems.value.forEach(item => {
      const key = `${item.type}-${item.id}`
      if (!restoreLevels[key]) {
        restoreLevels[key] = 'G'
      }
    })
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
    world_entry: '设定条目',
    comment: '评论'
  }
  return labels[type] || type
}

const getReportStatusLabel = (status) => {
  const labels = {
    pending: '待处理',
    processing: '处理中',
    resolved: '已处理',
    rejected: '已驳回'
  }
  return labels[status] || status
}

const getLogActionLabel = (action) => {
  const labels = {
    approve: '✅ 通过',
    reject: '❌ 驳回',
    take_down: '⬇️ 下架',
    restore: '⬆️ 恢复'
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
    loadTakenDownItems()
    return true
  } catch (err) {
    console.error('审核驳回失败:', err)
    message.error('审核操作失败')
    return false
  }
}

const showTakeDownDialog = (report) => {
  currentTakeDownReport.value = report
  takeDownReason.value = ''
  takeDownDialogVisible.value = true
}

const handleTakeDown = async () => {
  if (!takeDownReason.value.trim()) {
    message.warning('请填写下架原因')
    return false
  }
  
  const report = currentTakeDownReport.value
  if (!report) return false
  
  try {
    await reportApi.handleReport(report.id, {
      result: 'take_down',
      remark: takeDownReason.value,
      handlerId: 'admin-1',
      handlerName: '管理员'
    })
    message.success('已下架内容')
    takeDownDialogVisible.value = false
    loadReports()
    loadTakenDownItems()
    loadAuditLogs()
    return true
  } catch (err) {
    console.error('下架失败:', err)
    message.error('操作失败')
    return false
  }
}

const showDismissDialog = (report) => {
  currentDismissReport.value = report
  dismissReason.value = ''
  dismissDialogVisible.value = true
}

const handleDismiss = async () => {
  const report = currentDismissReport.value
  if (!report) return false
  
  try {
    await reportApi.handleReport(report.id, {
      result: 'dismiss',
      remark: dismissReason.value || '举报不成立',
      handlerId: 'admin-1',
      handlerName: '管理员'
    })
    message.success('已驳回举报')
    dismissDialogVisible.value = false
    loadReports()
    return true
  } catch (err) {
    console.error('驳回举报失败:', err)
    message.error('操作失败')
    return false
  }
}

const markReportProcessing = async (report) => {
  try {
    await reportApi.updateReportStatus(report.id, {
      status: 'processing',
      handlerId: 'admin-1',
      handlerName: '管理员',
      remark: '正在核实中'
    })
    message.success('已标记为处理中')
    loadReports()
  } catch (err) {
    console.error('标记失败:', err)
    message.error('操作失败')
  }
}

const handleRestore = async (item) => {
  const key = `${item.type}-${item.id}`
  const level = restoreLevels[key]
  
  try {
    await auditApi.restoreContent(item.type, item.id, {
      auditLevel: level || undefined,
      auditorId: 'admin-1',
      auditorName: '管理员'
    })
    message.success('已恢复上架')
    loadStats()
    loadTakenDownItems()
    loadPendingItems()
    loadAuditLogs()
  } catch (err) {
    console.error('恢复失败:', err)
    message.error('操作失败')
  }
}

const loadAll = async () => {
  loading.value = true
  await Promise.all([
    loadStats(),
    loadPendingItems(),
    loadReports(),
    loadTakenDownItems(),
    loadAuditLogs()
  ])
  loading.value = false
}

watch(activeTab, (newTab) => {
  if (newTab === 'reports') {
    loadReports()
  } else if (newTab === 'taken-down') {
    loadTakenDownItems()
  } else if (newTab === 'logs') {
    loadAuditLogs()
  } else if (newTab === 'pending') {
    loadPendingItems()
  }
})

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
  grid-template-columns: repeat(3, 1fr);
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

.stat-card.approved {
  background: linear-gradient(135deg, rgba(34, 197, 94, 0.1) 0%, rgba(34, 197, 94, 0.05) 100%);
  border: 1px solid rgba(34, 197, 94, 0.3);
}

.stat-card.rejected {
  background: linear-gradient(135deg, rgba(239, 68, 68, 0.1) 0%, rgba(239, 68, 68, 0.05) 100%);
  border: 1px solid rgba(239, 68, 68, 0.3);
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

.pending-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.audit-item {
  border-radius: 12px;
}

.item-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.item-type-badge {
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
  color: #fff;
}

.item-type-badge.story {
  background: linear-gradient(135deg, #9d4edd 0%, #c77dff 100%);
}

.item-type-badge.world {
  background: linear-gradient(135deg, #0ea5e9 0%, #38bdf8 100%);
}

.item-type-badge.comment {
  background: linear-gradient(135deg, #f97316 0%, #fb923c 100%);
}

.item-time {
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

.item-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  align-items: center;
  padding-top: 12px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
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

.log-type-badge {
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
  color: #fff;
}

.log-type-badge.story {
  background: linear-gradient(135deg, #9d4edd 0%, #c77dff 100%);
}

.log-type-badge.world {
  background: linear-gradient(135deg, #0ea5e9 0%, #38bdf8 100%);
}

.log-type-badge.comment {
  background: linear-gradient(135deg, #f97316 0%, #fb923c 100%);
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
.take-down-form,
.dismiss-form {
  padding: 12px 0;
}

.dialog-desc {
  margin: 0 0 16px 0;
  color: #888;
  font-size: 14px;
}

.reports-list,
.taken-down-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.report-item,
.taken-down-item {
  border-radius: 12px;
}

.report-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}

.report-status {
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
  color: #fff;
}

.report-status.pending {
  background: linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%);
}

.report-status.processing {
  background: linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%);
}

.report-status.resolved {
  background: linear-gradient(135deg, #22c55e 0%, #4ade80 100%);
}

.report-status.rejected {
  background: linear-gradient(135deg, #6b7280 0%, #9ca3af 100%);
}

.report-type-badge {
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
  color: #fff;
}

.report-type-badge.story {
  background: linear-gradient(135deg, #9d4edd 0%, #c77dff 100%);
}

.report-type-badge.world_entry {
  background: linear-gradient(135deg, #0ea5e9 0%, #38bdf8 100%);
}

.report-type-badge.comment {
  background: linear-gradient(135deg, #f97316 0%, #fb923c 100%);
}

.report-time {
  margin-left: auto;
  font-size: 12px;
  color: #888;
}

.report-body {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 16px;
}

.report-reason,
.report-target,
.report-desc,
.report-reporter,
.report-handle,
.report-handle-result,
.report-handle-remark {
  display: flex;
  gap: 8px;
  font-size: 14px;
}

.report-label {
  color: #888;
  min-width: 80px;
  flex-shrink: 0;
}

.report-value {
  color: #ddd;
  flex: 1;
  word-break: break-all;
}

.report-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  padding-top: 12px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.item-reject-reason {
  display: flex;
  gap: 8px;
  font-size: 13px;
  margin-top: 8px;
  padding: 8px 12px;
  background: rgba(239, 68, 68, 0.1);
  border-radius: 8px;
}

.reject-label {
  color: #ef4444;
  font-weight: 500;
  flex-shrink: 0;
}

.reject-value {
  color: #fca5a5;
  flex: 1;
}

@media (max-width: 768px) {
  .stats-cards {
    grid-template-columns: 1fr;
  }
  
  .item-body {
    flex-direction: column;
  }
  
  .item-cover {
    width: 100%;
    height: auto;
    padding: 20px;
  }
  
  .item-actions {
    flex-wrap: wrap;
  }
}
</style>
