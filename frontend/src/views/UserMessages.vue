<template>
  <div class="user-messages">
    <div class="page-header">
      <div>
        <h1 class="page-title">💬 互动消息</h1>
        <p class="page-desc">
          <span v-if="unreadCount > 0">
            你有 <n-tag type="error" round size="small">{{ unreadCount }}</n-tag> 条未读消息
          </span>
          <span v-else>暂无未读消息</span>
        </p>
      </div>
      <div class="header-actions">
        <n-button 
          v-if="unreadCount > 0" 
          @click="markAllAsRead"
        >
          <template #icon>📖</template>
          全部已读
        </n-button>
      </div>
    </div>

    <div class="filter-bar">
      <n-radio-group v-model:value="filterType" size="medium" @update:value="loadNotifications">
        <n-radio-button value="all">全部</n-radio-button>
        <n-radio-button value="like">点赞</n-radio-button>
        <n-radio-button value="comment">评论</n-radio-button>
        <n-radio-button value="favorite">收藏</n-radio-button>
        <n-radio-button value="system">系统</n-radio-button>
      </n-radio-group>
      <n-radio-group v-model:value="filterRead" size="medium" @update:value="loadNotifications">
        <n-radio-button value="all">全部状态</n-radio-button>
        <n-radio-button value="unread">未读</n-radio-button>
        <n-radio-button value="read">已读</n-radio-button>
      </n-radio-group>
    </div>

    <n-spin :show="loading" size="large">
      <div v-if="notifications.length > 0" class="messages-list">
        <n-card 
          v-for="notif in notifications" 
          :key="notif.id"
          class="message-card"
          :class="{ unread: !notif.isRead }"
          hoverable
        >
          <div class="message-icon">
            <span v-if="notif.type === 'like'">❤️</span>
            <span v-else-if="notif.type === 'comment'">💬</span>
            <span v-else-if="notif.type === 'favorite'">⭐</span>
            <span v-else-if="notif.type === 'system'">🔔</span>
            <span v-else>📬</span>
          </div>
          <div class="message-content">
            <p class="message-text">{{ notif.content }}</p>
            <div class="message-meta">
              <span class="message-time">📅 {{ notif.createdAt }}</span>
              <n-tag v-if="!notif.isRead" size="small" type="error" round>未读</n-tag>
              <n-tag v-else size="small" type="default" round>已读</n-tag>
            </div>
          </div>
          <div class="message-actions">
            <n-button 
              v-if="!notif.isRead" 
              size="small" 
              type="primary" 
              @click="markAsRead(notif.id)"
            >
              标记已读
            </n-button>
            <n-button 
              v-if="notif.relatedId" 
              size="small" 
              @click="openRelated(notif)"
            >
              <template #icon>👁️</template>
              查看
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
        <div class="empty-icon">📭</div>
        <p>暂无消息</p>
        <p class="empty-sub">互动消息会在这里显示哦~</p>
      </div>
    </n-spin>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { NButton, NCard, NTag, NRadioGroup, NRadioButton, NSpin, useMessage } from 'naive-ui'
import { userApi } from '../api'

const router = useRouter()
const message = useMessage()
const userId = 'user-1'

const notifications = ref([])
const unreadCount = ref(0)
const loading = ref(false)
const filterType = ref('all')
const filterRead = ref('all')

const loadNotifications = async () => {
  loading.value = true
  try {
    const params = {}
    if (filterType.value !== 'all') {
      params.type = filterType.value
    }
    if (filterRead.value !== 'all') {
      params.isRead = filterRead.value === 'read' ? 'true' : 'false'
    }
    const res = await userApi.getNotifications(userId, params)
    notifications.value = res.data.notifications
    unreadCount.value = res.data.unreadCount
  } catch (err) {
    console.error('加载消息失败:', err)
    message.error('加载消息失败')
  } finally {
    loading.value = false
  }
}

const markAsRead = async (notificationId) => {
  try {
    await userApi.markAsRead(userId, { notificationId })
    message.success('已标记为已读')
    loadNotifications()
  } catch (err) {
    console.error('标记已读失败:', err)
    message.error('操作失败')
  }
}

const markAllAsRead = async () => {
  try {
    await userApi.markAsRead(userId)
    message.success('已全部标记为已读')
    loadNotifications()
  } catch (err) {
    console.error('标记已读失败:', err)
    message.error('操作失败')
  }
}

const deleteNotif = async (notificationId) => {
  try {
    await userApi.deleteNotification(userId, notificationId)
    message.success('已删除')
    loadNotifications()
  } catch (err) {
    console.error('删除失败:', err)
    message.error('删除失败')
  }
}

const openRelated = (notif) => {
  if (notif.relatedType === 'story') {
    router.push(`/story/${notif.relatedId}`)
  } else if (notif.relatedType === 'world') {
    router.push(`/world/${notif.relatedId}`)
  }
}

onMounted(() => {
  loadNotifications()
})
</script>

<style scoped>
.user-messages {
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

.filter-bar {
  display: flex;
  gap: 16px;
  margin-bottom: 24px;
  flex-wrap: wrap;
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
  transition: transform 0.2s;
}

.message-card:hover {
  transform: translateX(4px);
}

.message-card.unread {
  background: linear-gradient(135deg, rgba(157, 78, 221, 0.05) 0%, rgba(199, 125, 255, 0.05) 100%);
  border-left: 4px solid #9d4edd;
}

.message-icon {
  font-size: 28px;
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #f0e6ff 0%, #e0ccff 100%);
  border-radius: 50%;
  flex-shrink: 0;
}

.message-content {
  flex: 1;
  min-width: 0;
}

.message-text {
  font-size: 15px;
  color: #333;
  margin: 0 0 8px 0;
  line-height: 1.6;
}

.message-meta {
  display: flex;
  align-items: center;
  gap: 12px;
}

.message-time {
  font-size: 12px;
  color: #999;
}

.message-actions {
  display: flex;
  gap: 8px;
  flex-shrink: 0;
  flex-wrap: wrap;
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
</style>
