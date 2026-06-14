<template>
  <div class="notification-center">
    <div class="page-header">
      <div>
        <h1 class="page-title">🔔 消息通知中心</h1>
        <p class="page-desc">
          <span v-if="unreadCount > 0">
            你有 <n-tag type="error" round size="small">{{ unreadCount }}</n-tag> 条未读消息
          </span>
          <span v-else>暂无未读消息</span>
        </p>
      </div>
      <div class="header-actions">
        <n-popover trigger="click" :show-arrow="false">
          <template #trigger>
            <n-button>
              <template #icon>⚙️</template>
              批量操作
            </n-button>
          </template>
          <div class="popover-actions">
            <n-button 
              v-if="unreadCount > 0" 
              block 
              @click="markAllAsRead"
              class="action-btn"
            >
              <template #icon>📖</template>
              全部标记已读
            </n-button>
            <n-button 
              block 
              @click="clearReadNotifications"
              class="action-btn"
            >
              <template #icon>🗑️</template>
              清空已读消息
            </n-button>
          </div>
        </n-popover>
      </div>
    </div>

    <div class="content-wrapper">
      <div class="sidebar">
        <div class="type-list">
          <div 
            v-for="item in typeList" 
            :key="item.type"
            class="type-item"
            :class="{ active: filterType === item.type }"
            @click="selectType(item.type)"
          >
            <span class="type-icon">{{ item.icon }}</span>
            <span class="type-label">{{ item.label }}</span>
            <n-badge 
              v-if="item.count > 0" 
              :value="item.count" 
              :max="99" 
              type="error" 
              size="small"
              class="type-badge"
            />
          </div>
        </div>
      </div>

      <div class="main-content">
        <div class="filter-bar">
          <n-radio-group v-model:value="filterRead" size="medium" @update:value="loadNotifications">
            <n-radio-button value="all">全部状态</n-radio-button>
            <n-radio-button value="unread">未读</n-radio-button>
            <n-radio-button value="read">已读</n-radio-button>
          </n-radio-group>
          <div class="filter-right">
            <n-select 
              v-model:value="sortOrder" 
              :options="sortOptions" 
              size="medium"
              style="width: 140px"
              @update:value="loadNotifications"
            />
          </div>
        </div>

        <n-spin :show="loading" size="large">
          <div v-if="notifications.length > 0" class="messages-list">
            <n-card 
              v-for="notif in notifications" 
              :key="notif.id"
              class="message-card"
              :class="{ unread: !notif.isRead }"
              hoverable
              @click="handleNotificationClick(notif)"
            >
              <div class="message-icon" :class="`icon-${notif.type}`">
                <span>{{ getTypeIcon(notif.type) }}</span>
              </div>
              
              <div class="message-content">
                <div class="message-header">
                  <n-tag :type="getTagType(notif.type)" size="small" class="type-tag">
                    {{ getTypeLabel(notif.type) }}
                  </n-tag>
                  <span class="message-time">📅 {{ formatTime(notif.createdAt) }}</span>
                </div>
                
                <p class="message-text">{{ notif.content }}</p>
                
                <div v-if="notif.relatedTitle" class="related-info">
                  <n-tag size="small" type="info" class="related-tag">
                    {{ getRelatedTypeLabel(notif.relatedType) }}: {{ notif.relatedTitle }}
                  </n-tag>
                </div>

                <div v-if="notif.replyContent" class="reply-preview">
                  <n-card size="small" class="reply-card">
                    <template #header>
                      <span class="reply-title">回复你的评论：</span>
                    </template>
                    <p class="reply-content">{{ notif.replyContent }}</p>
                  </n-card>
                </div>

                <div v-if="notif.updateType" class="update-info">
                  <n-tag size="small" type="success">
                    {{ notif.updateType === 'new_ending' ? '🎉 新结局' : '📖 新章节' }}: {{ notif.chapterTitle }}
                  </n-tag>
                </div>

                <div v-if="notif.referenceTitle" class="reference-info">
                  <n-tag size="small" type="warning">
                    🔗 引用设定: {{ notif.referenceTitle }}
                  </n-tag>
                </div>
                
                <div class="message-meta">
                  <template v-if="notif.inviterName">
                    <n-avatar round size="small" class="inviter-avatar">
                      {{ notif.inviterAvatar || '👤' }}
                    </n-avatar>
                    <span class="inviter-name">{{ notif.inviterName }}</span>
                  </template>
                  
                  <n-tag v-if="!notif.isRead" size="small" type="error" round>未读</n-tag>
                  <n-tag v-else size="small" type="default" round>已读</n-tag>
                  
                  <template v-if="notif.type === 'invitation' && notif.invitationRole">
                    <n-tag size="small" type="info">
                      角色：{{ getRoleLabel(notif.invitationRole) }}
                    </n-tag>
                  </template>
                  <template v-if="notif.type === 'invitation' && notif.invitationCategories?.length > 0">
                    <n-tag size="small" type="warning">
                      负责分类：{{ notif.invitationCategories.join('、') }}
                    </n-tag>
                  </template>
                </div>
                
                <div v-if="notif.type === 'invitation' && !notif.invitationStatus" class="invitation-actions" @click.stop>
                  <n-button type="success" size="small" @click="acceptInvitation(notif)">
                    <template #icon>✅</template>
                    接受邀请
                  </n-button>
                  <n-button type="error" size="small" @click="rejectInvitation(notif)">
                    <template #icon>❌</template>
                    拒绝邀请
                  </n-button>
                </div>
                <div v-else-if="notif.type === 'invitation' && notif.invitationStatus" class="invitation-status">
                  <n-tag :type="notif.invitationStatus === 'accepted' ? 'success' : 'error'" size="small">
                    {{ notif.invitationStatus === 'accepted' ? '已接受' : '已拒绝' }}
                  </n-tag>
                </div>
              </div>
              
              <div class="message-actions" @click.stop>
                <n-button 
                  v-if="!notif.isRead" 
                  size="small" 
                  type="primary" 
                  @click="markAsRead(notif.id)"
                >
                  标记已读
                </n-button>
                <n-button 
                  v-if="notif.relatedId && notif.type !== 'invitation'" 
                  size="small" 
                  @click="openRelated(notif)"
                >
                  <template #icon>👁️</template>
                  查看
                </n-button>
                <n-button 
                  v-if="notif.type === 'invitation' && !notif.invitationStatus && notif.relatedWorldId" 
                  size="small" 
                  @click="openWorld(notif.relatedWorldId)"
                >
                  <template #icon>🌍</template>
                  查看世界
                </n-button>
                <n-button 
                  size="small" 
                  type="error" 
                  quaternary
                  @click="deleteNotif(notif.id)"
                >
                  <template #icon>🗑️</template>
                  删除
                </n-button>
              </div>
            </n-card>
          </div>
          
          <div v-else class="empty-state">
            <div class="empty-icon">{{ getEmptyIcon() }}</div>
            <p>{{ getEmptyText() }}</p>
            <p class="empty-sub">互动消息会在这里显示哦~</p>
          </div>

          <div v-if="total > limit" class="pagination">
            <n-pagination
              v-model:page="currentPage"
              :page-count="Math.ceil(total / limit)"
              :page-size="limit"
              :item-count="total"
              show-size-picker
              :page-sizes="[10, 20, 50, 100]"
              @update:page="loadNotifications"
              @update:page-size="handlePageSizeChange"
            />
          </div>
        </n-spin>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { 
  NButton, NCard, NTag, NRadioGroup, NRadioButton, NSpin, 
  useMessage, useDialog, NAvatar, NBadge, NPopover, NSelect, 
  NPagination 
} from 'naive-ui'
import { notificationApi, collaborationApi } from '../api'

const router = useRouter()
const message = useMessage()
const dialog = useDialog()
const userId = 'user-1'
const currentUsername = '月下独酌'

const notifications = ref([])
const unreadCount = ref(0)
const loading = ref(false)
const filterType = ref('all')
const filterRead = ref('all')
const sortOrder = ref('newest')
const currentPage = ref(1)
const limit = ref(20)
const total = ref(0)
const typeStats = ref({})

const typeConfig = {
  all: { label: '全部消息', icon: '📬' },
  like: { label: '点赞', icon: '❤️' },
  comment: { label: '评论', icon: '💬' },
  comment_reply: { label: '回复', icon: '↩️' },
  favorite: { label: '收藏', icon: '⭐' },
  reference: { label: '引用', icon: '🔗' },
  story_update: { label: '作品动态', icon: '📖' },
  collaboration: { label: '协作', icon: '🤝' },
  invitation: { label: '邀请', icon: '✉️' },
  activity: { label: '活动', icon: '🎯' },
  system: { label: '系统', icon: '🔔' }
}

const sortOptions = [
  { label: '最新优先', value: 'newest' },
  { label: '最早优先', value: 'oldest' }
]

const typeList = computed(() => {
  const list = [
    { type: 'all', label: '全部消息', icon: '📬', count: unreadCount.value }
  ]
  
  Object.keys(typeConfig).forEach(type => {
    if (type !== 'all') {
      list.push({
        type,
        label: typeConfig[type].label,
        icon: typeConfig[type].icon,
        count: typeStats.value[type] || 0
      })
    }
  })
  
  return list
})

const getTypeIcon = (type) => typeConfig[type]?.icon || '📬'
const getTypeLabel = (type) => typeConfig[type]?.label || '其他'

const getTagType = (type) => {
  const map = {
    like: 'error',
    comment: 'primary',
    comment_reply: 'info',
    favorite: 'warning',
    reference: 'success',
    story_update: 'primary',
    collaboration: 'info',
    invitation: 'warning',
    activity: 'success',
    system: 'default'
  }
  return map[type] || 'default'
}

const getRoleLabel = (role) => {
  const map = { owner: '主理人', editor: '编辑者', reviewer: '审核者' }
  return map[role] || role
}

const getRelatedTypeLabel = (type) => {
  const map = { story: '作品', world: '世界设定', activity: '活动' }
  return map[type] || type
}

const formatTime = (timeStr) => {
  if (!timeStr) return ''
  const now = new Date()
  const time = new Date(timeStr.replace(/-/g, '/'))
  const diff = now - time
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)
  
  if (minutes < 1) return '刚刚'
  if (minutes < 60) return `${minutes}分钟前`
  if (hours < 24) return `${hours}小时前`
  if (days < 7) return `${days}天前`
  return timeStr
}

const getEmptyIcon = () => {
  if (filterType.value !== 'all') return typeConfig[filterType.value]?.icon || '📭'
  return '📭'
}

const getEmptyText = () => {
  if (filterRead.value === 'unread') return '暂无未读消息'
  if (filterType.value !== 'all') return `暂无${typeConfig[filterType.value]?.label}消息`
  return '暂无消息'
}

const selectType = (type) => {
  filterType.value = type
  currentPage.value = 1
  loadNotifications()
}

const loadNotifications = async () => {
  loading.value = true
  try {
    const params = {
      page: currentPage.value,
      limit: limit.value,
      sort: sortOrder.value
    }
    if (filterType.value !== 'all') {
      params.type = filterType.value
    }
    if (filterRead.value !== 'all') {
      params.isRead = filterRead.value === 'read' ? 'true' : 'false'
    }
    const res = await notificationApi.getNotifications(userId, params)
    notifications.value = res.data.notifications
    total.value = res.data.total
    unreadCount.value = res.data.unreadCount
    typeStats.value = res.data.typeStats || {}
  } catch (err) {
    console.error('加载消息失败:', err)
    message.error('加载消息失败')
  } finally {
    loading.value = false
  }
}

const loadUnreadCount = async () => {
  try {
    const res = await notificationApi.getUnreadCount(userId)
    unreadCount.value = res.data.unreadCount
    typeStats.value = res.data.typeStats || {}
  } catch (err) {
    console.error('加载未读计数失败:', err)
  }
}

const markAsRead = async (notificationId) => {
  try {
    await notificationApi.markAsRead(notificationId, userId)
    message.success('已标记为已读')
    loadNotifications()
    loadUnreadCount()
  } catch (err) {
    console.error('标记已读失败:', err)
    message.error('操作失败')
  }
}

const markAllAsRead = async () => {
  dialog.warning({
    title: '确认全部已读',
    content: filterType.value !== 'all' 
      ? `确定要将所有${typeConfig[filterType.value]?.label}消息标记为已读吗？`
      : '确定要将所有消息标记为已读吗？',
    positiveText: '确认',
    negativeText: '取消',
    onPositiveClick: async () => {
      try {
        await notificationApi.markAllAsRead(userId, filterType.value !== 'all' ? filterType.value : null)
        message.success('已全部标记为已读')
        loadNotifications()
        loadUnreadCount()
      } catch (err) {
        console.error('标记已读失败:', err)
        message.error('操作失败')
      }
    }
  })
}

const deleteNotif = async (notificationId) => {
  dialog.warning({
    title: '确认删除',
    content: '确定要删除这条消息吗？',
    positiveText: '删除',
    negativeText: '取消',
    onPositiveClick: async () => {
      try {
        await notificationApi.deleteNotification(notificationId, userId)
        message.success('已删除')
        loadNotifications()
        loadUnreadCount()
      } catch (err) {
        console.error('删除失败:', err)
        message.error('删除失败')
      }
    }
  })
}

const clearReadNotifications = async () => {
  dialog.warning({
    title: '确认清空',
    content: '确定要清空所有已读消息吗？此操作不可恢复。',
    positiveText: '确认清空',
    negativeText: '取消',
    onPositiveClick: async () => {
      try {
        await notificationApi.clearNotifications(userId, { isRead: 'true' })
        message.success('已清空已读消息')
        loadNotifications()
        loadUnreadCount()
      } catch (err) {
        console.error('清空失败:', err)
        message.error('操作失败')
      }
    }
  })
}

const handleNotificationClick = async (notif) => {
  if (!notif.isRead) {
    try {
      await notificationApi.markAsRead(notif.id, userId)
      loadUnreadCount()
    } catch (err) {
      console.error('标记已读失败:', err)
    }
  }
  if (notif.relatedId && notif.type !== 'invitation') {
    openRelated(notif)
  }
}

const openRelated = (notif) => {
  if (notif.relatedType === 'story') {
    const routeData = { path: `/story/${notif.relatedId}` }
    if (notif.commentId) {
      routeData.query = { commentId: notif.commentId }
    }
    if (notif.nodeId) {
      routeData.query = routeData.query || {}
      routeData.query.nodeId = notif.nodeId
    }
    router.push(routeData)
  } else if (notif.relatedType === 'world') {
    const routeData = { path: `/world/${notif.relatedId}` }
    if (notif.referenceId) {
      routeData.query = { entryId: notif.referenceId }
    }
    router.push(routeData)
  } else if (notif.relatedType === 'activity') {
    router.push(`/activity/${notif.relatedId}`)
  } else if (notif.relatedType === 'comment' && notif.storyId) {
    const routeData = { path: `/story/${notif.storyId}` }
    if (notif.relatedId) {
      routeData.query = { commentId: notif.relatedId }
    }
    router.push(routeData)
  }
}

const openWorld = (worldId) => {
  router.push(`/world/${worldId}`)
}

const acceptInvitation = async (notif) => {
  if (!notif.relatedId || !notif.relatedWorldId) return
  try {
    await collaborationApi.respondToInvitation(notif.relatedWorldId, notif.relatedId, {
      accept: true,
      responderId: userId,
      responderName: currentUsername
    })
    message.success('已接受邀请')
    loadNotifications()
    loadUnreadCount()
  } catch (err) {
    message.error(err.response?.data?.message || '操作失败')
  }
}

const rejectInvitation = (notif) => {
  if (!notif.relatedId || !notif.relatedWorldId) return
  dialog.warning({
    title: '确认拒绝',
    content: '确定要拒绝这个协作邀请吗？',
    positiveText: '确认拒绝',
    negativeText: '再想想',
    onPositiveClick: async () => {
      try {
        await collaborationApi.respondToInvitation(notif.relatedWorldId, notif.relatedId, {
          accept: false,
          responderId: userId,
          responderName: currentUsername
        })
        message.success('已拒绝邀请')
        loadNotifications()
        loadUnreadCount()
      } catch (err) {
        message.error(err.response?.data?.message || '操作失败')
      }
    }
  })
}

const handlePageSizeChange = (size) => {
  limit.value = size
  currentPage.value = 1
  loadNotifications()
}

onMounted(() => {
  loadNotifications()
  loadUnreadCount()
})
</script>

<style scoped>
.notification-center {
  padding-bottom: 40px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 24px;
  flex-wrap: wrap;
  gap: 16px;
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
  display: flex;
  align-items: center;
  gap: 8px;
}

.header-actions {
  display: flex;
  gap: 12px;
}

.popover-actions {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 8px;
  min-width: 160px;
}

.action-btn {
  justify-content: flex-start;
}

.content-wrapper {
  display: flex;
  gap: 24px;
  align-items: flex-start;
}

.sidebar {
  width: 200px;
  flex-shrink: 0;
  position: sticky;
  top: 88px;
}

.type-list {
  background: #fff;
  border-radius: 12px;
  padding: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.type-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  margin-bottom: 4px;
}

.type-item:last-child {
  margin-bottom: 0;
}

.type-item:hover {
  background: rgba(157, 78, 221, 0.06);
}

.type-item.active {
  background: linear-gradient(135deg, rgba(157, 78, 221, 0.15) 0%, rgba(199, 125, 255, 0.15) 100%);
  color: #9d4edd;
}

.type-icon {
  font-size: 18px;
  width: 24px;
  text-align: center;
}

.type-label {
  flex: 1;
  font-size: 14px;
  font-weight: 500;
}

.type-badge {
  margin-left: auto;
}

.main-content {
  flex: 1;
  min-width: 0;
}

.filter-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  flex-wrap: wrap;
  gap: 12px;
}

.filter-right {
  display: flex;
  gap: 12px;
}

.messages-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.message-card {
  display: flex;
  gap: 16px;
  align-items: flex-start;
  transition: transform 0.2s, box-shadow 0.2s;
}

.message-card:hover {
  transform: translateX(4px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
}

.message-card.unread {
  background: linear-gradient(135deg, rgba(157, 78, 221, 0.05) 0%, rgba(199, 125, 255, 0.05) 100%);
  border-left: 4px solid #9d4edd;
}

.message-icon {
  font-size: 20px;
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  flex-shrink: 0;
}

.icon-like {
  background: linear-gradient(135deg, #ffe0e0 0%, #ffb3b3 100%);
}

.icon-comment {
  background: linear-gradient(135deg, #e0e6ff 0%, #b3c6ff 100%);
}

.icon-comment_reply {
  background: linear-gradient(135deg, #e0f0ff 0%, #b3d9ff 100%);
}

.icon-favorite {
  background: linear-gradient(135deg, #fff4e0 0%, #ffe0b3 100%);
}

.icon-reference {
  background: linear-gradient(135deg, #e0ffe6 0%, #b3ffc6 100%);
}

.icon-story_update {
  background: linear-gradient(135deg, #e6e0ff 0%, #c6b3ff 100%);
}

.icon-collaboration {
  background: linear-gradient(135deg, #e0f7ff 0%, #b3ebff 100%);
}

.icon-invitation {
  background: linear-gradient(135deg, #fff0e0 0%, #ffd9b3 100%);
}

.icon-activity {
  background: linear-gradient(135deg, #e0ffe0 0%, #b3ffb3 100%);
}

.icon-system {
  background: linear-gradient(135deg, #f0f0f0 0%, #d9d9d9 100%);
}

.message-content {
  flex: 1;
  min-width: 0;
}

.message-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 8px;
  flex-wrap: wrap;
}

.type-tag {
  font-weight: 500;
}

.message-time {
  font-size: 12px;
  color: #999;
}

.message-text {
  font-size: 15px;
  color: #333;
  margin: 0 0 10px 0;
  line-height: 1.6;
}

.related-info {
  margin-bottom: 10px;
}

.related-tag {
  font-weight: 500;
}

.reply-preview {
  margin-bottom: 12px;
}

.reply-card {
  background: #f8f9fa;
  border: none;
}

.reply-title {
  font-size: 12px;
  color: #666;
  font-weight: 500;
}

.reply-content {
  font-size: 13px;
  color: #555;
  margin: 0;
  line-height: 1.5;
}

.update-info,
.reference-info {
  margin-bottom: 10px;
}

.message-meta {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.inviter-avatar {
  font-size: 14px;
}

.inviter-name {
  font-size: 13px;
  color: #666;
  font-weight: 500;
}

.invitation-actions {
  display: flex;
  gap: 10px;
  margin-top: 12px;
}

.invitation-status {
  margin-top: 12px;
}

.message-actions {
  display: flex;
  gap: 8px;
  flex-shrink: 0;
  flex-wrap: wrap;
  justify-content: flex-end;
}

.empty-state {
  text-align: center;
  padding: 80px 20px;
}

.empty-icon {
  font-size: 64px;
  margin-bottom: 16px;
}

.empty-state p {
  color: #666;
  margin: 0 0 8px 0;
  font-size: 16px;
}

.empty-sub {
  color: #999 !important;
  font-size: 13px !important;
}

.pagination {
  display: flex;
  justify-content: center;
  margin-top: 24px;
}

@media (max-width: 768px) {
  .content-wrapper {
    flex-direction: column;
  }
  
  .sidebar {
    width: 100%;
    position: static;
  }
  
  .type-list {
    display: flex;
    overflow-x: auto;
    padding: 8px;
    gap: 4px;
  }
  
  .type-item {
    flex-shrink: 0;
    padding: 8px 12px;
    margin-bottom: 0;
  }
  
  .type-label {
    display: none;
  }
  
  .message-card {
    flex-wrap: wrap;
  }
  
  .message-actions {
    width: 100%;
    justify-content: flex-start;
  }
}
</style>
