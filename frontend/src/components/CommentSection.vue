<template>
  <div class="comment-section" :class="{ 'is-mobile': isMobile }">
    <div class="comment-input-area" :class="{ 'mobile-input-area': isMobile }">
      <n-avatar round :size="isMobile ? 'small' : 'medium'" class="comment-avatar">
        {{ currentUser.avatar }}
      </n-avatar>
      <div class="input-wrapper">
        <div v-if="replyingTo" class="replying-to-bar">
          <n-tag size="small" type="info">
            正在回复 @{{ replyingTo.username }}
          </n-tag>
          <n-button text size="tiny" @click="cancelReply">
            取消
          </n-button>
        </div>
        <n-input
          v-model:value="newComment"
          type="textarea"
          :rows="isMobile ? 2 : 3"
          placeholder="写下你的想法..."
          class="comment-input"
          :class="{ 'mobile-comment-input': isMobile }"
          @focus="scrollInputIntoView"
        />
        <div class="input-actions" :class="{ 'mobile-input-actions': isMobile }">
          <span class="char-count">{{ newComment.length }}/500</span>
          <n-button 
            type="primary" 
            :size="isMobile ? 'small' : 'small'"
            :disabled="!newComment.trim()"
            @click="submitComment"
            :loading="submitting"
          >
            {{ replyingTo ? '发送回复' : '发表评论' }}
          </n-button>
        </div>
      </div>
    </div>

    <n-divider v-if="!isMobile" style="margin: 20px 0;" />
    <div v-else class="mobile-divider"></div>

    <div class="comments-list" :class="{ 'mobile-comments-list': isMobile }">
      <div v-if="loading" class="loading-state">
        <n-spin size="small" />
        <span>加载评论中...</span>
      </div>

      <div v-else-if="comments.length === 0" class="empty-comments" :class="{ 'mobile-empty': isMobile }">
        <div class="empty-icon">💬</div>
        <p>暂无评论，来发表第一条评论吧~</p>
      </div>

      <div v-else>
        <div 
          v-for="comment in comments" 
          :key="comment.id"
          :id="`comment-${comment.id}`"
          class="comment-item"
          :class="{ 'mobile-comment-item': isMobile, 'comment-highlighted': highlightedCommentId === comment.id }"
        >
          <n-avatar round :size="isMobile ? 'small' : 'medium'" class="comment-avatar">
            {{ comment.avatar }}
          </n-avatar>
          <div class="comment-content">
            <div class="comment-header" :class="{ 'mobile-comment-header': isMobile }">
              <span class="comment-username" :class="{ 'mobile-comment-username': isMobile }">{{ comment.username }}</span>
              <span class="comment-time" :class="{ 'mobile-comment-time': isMobile }">{{ comment.createdAt }}</span>
            </div>
            <p class="comment-text" :class="{ 'mobile-comment-text': isMobile }">{{ comment.content }}</p>
            <div class="comment-actions" :class="{ 'mobile-comment-actions': isMobile }">
              <n-button text size="tiny" @click="likeComment(comment)">
                <template #icon>{{ comment.isLiked ? '❤️' : '🤍' }}</template>
                <span class="action-count">{{ comment.likes }}</span>
              </n-button>
              <n-button v-if="!isMobile" text size="tiny" @click="replyTo(comment)">
                <template #icon>💬</template>
                回复
              </n-button>
              <n-button v-else text size="tiny" @click="replyTo(comment)">
                <template #icon>↩️</template>
              </n-button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, nextTick } from 'vue'
import { NAvatar, NInput, NButton, NDivider, NSpace, NSpin, NTag, useMessage } from 'naive-ui'
import { commentApi } from '../api'
import { useResponsive } from '../composables/useResponsive'

const props = defineProps({
  storyId: {
    type: String,
    required: true
  },
  nodeId: {
    type: String,
    default: null
  }
})

const emit = defineEmits(['comments-loaded'])

const { isMobile } = useResponsive()
const message = useMessage()

const currentUser = ref({
  id: 'user-1',
  username: '月下独酌',
  avatar: '🌸'
})

const comments = ref([])
const newComment = ref('')
const loading = ref(false)
const submitting = ref(false)
const replyingTo = ref(null)
const highlightedCommentId = ref(null)

const scrollInputIntoView = () => {
  if (isMobile.value) {
    nextTick(() => {
      const input = document.querySelector('.comment-input-area')
      if (input) {
        setTimeout(() => {
          input.scrollIntoView({ behavior: 'smooth', block: 'center' })
        }, 300)
      }
    })
  }
}

const loadComments = async () => {
  loading.value = true
  try {
    const res = await commentApi.getComments(props.storyId, props.nodeId)
    comments.value = res.data.map(c => ({ ...c, isLiked: false }))
    emit('comments-loaded', comments.value)
  } catch (err) {
    console.error('加载评论失败:', err)
  } finally {
    loading.value = false
  }
}

const submitComment = async () => {
  if (!newComment.value.trim() || newComment.value.length > 500) return
  
  submitting.value = true
  try {
    const commentData = {
      nodeId: props.nodeId,
      userId: currentUser.value.id,
      username: currentUser.value.username,
      avatar: currentUser.value.avatar,
      content: newComment.value.trim()
    }
    
    if (replyingTo.value) {
      commentData.replyToCommentId = replyingTo.value.id
    }
    
    const res = await commentApi.addComment(props.storyId, commentData)
    const newCommentObj = { ...res.data, isLiked: false }
    comments.value.unshift(newCommentObj)
    newComment.value = ''
    replyingTo.value = null
    message.success('评论发表成功')
  } catch (err) {
    console.error('发表评论失败:', err)
    message.error('评论失败，请重试')
  } finally {
    submitting.value = false
  }
}

const likeComment = async (comment) => {
  if (comment.isLiked) return
  
  try {
    const res = await commentApi.likeComment(comment.id, {
      userId: currentUser.value.id,
      username: currentUser.value.username,
      avatar: currentUser.value.avatar
    })
    comment.likes = res.data.likes
    comment.isLiked = true
    highlightedCommentId.value = comment.id
    setTimeout(() => {
      highlightedCommentId.value = null
    }, 1000)
  } catch (err) {
    console.error('点赞失败:', err)
  }
}

const replyTo = (comment) => {
  replyingTo.value = comment
  newComment.value = `@${comment.username} `
  if (isMobile.value) {
    scrollInputIntoView()
  }
  nextTick(() => {
    const input = document.querySelector('.comment-input textarea')
    if (input) {
      input.focus()
    }
  })
}

const cancelReply = () => {
  replyingTo.value = null
  newComment.value = ''
}

watch(() => props.nodeId, () => {
  loadComments()
})

watch(() => props.storyId, () => {
  loadComments()
})

onMounted(() => {
  loadComments()
})
</script>

<style scoped>
.comment-section {
  padding: 10px 0;
}

.comment-input-area {
  display: flex;
  gap: 12px;
  padding: 12px;
  background: #fafafa;
  border-radius: 12px;
}

.comment-input-area.mobile-input-area {
  gap: 8px;
  padding: 10px;
  border-radius: 10px;
}

.comment-avatar {
  flex-shrink: 0;
}

.input-wrapper {
  flex: 1;
  min-width: 0;
}

.replying-to-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
  padding: 6px 12px;
  background: rgba(157, 78, 221, 0.06);
  border-radius: 8px;
}

.comment-input {
  width: 100%;
}

.comment-input.mobile-comment-input :deep(.n-input__input) {
  font-size: 15px;
}

.input-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 8px;
}

.input-actions.mobile-input-actions {
  margin-top: 6px;
}

.char-count {
  font-size: 12px;
  color: #999;
}

.mobile-divider {
  height: 1px;
  background: #f0f0f0;
  margin: 16px 0;
}

.comments-list {
  margin-top: 10px;
}

.comments-list.mobile-comments-list {
  margin-top: 0;
}

.loading-state {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 30px;
  color: #999;
  font-size: 14px;
}

.empty-comments {
  text-align: center;
  padding: 40px 20px;
}

.empty-comments.mobile-empty {
  padding: 30px 16px;
}

.empty-icon {
  font-size: 48px;
  margin-bottom: 12px;
}

.empty-comments p {
  color: #999;
  margin: 0;
  font-size: 14px;
}

.comment-item {
  display: flex;
  gap: 12px;
  padding: 16px 0;
  border-bottom: 1px solid #f0f0f0;
  transition: background-color 0.3s;
}

.comment-item.mobile-comment-item {
  gap: 10px;
  padding: 14px 0;
}

.comment-item.comment-highlighted {
  background: rgba(157, 78, 221, 0.08);
  border-radius: 8px;
  padding: 16px 12px;
  margin: 0 -12px;
}

.comment-item:last-child {
  border-bottom: none;
}

.comment-content {
  flex: 1;
  min-width: 0;
}

.comment-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 6px;
}

.comment-header.mobile-comment-header {
  gap: 8px;
}

.comment-username {
  font-weight: 500;
  color: #333;
  font-size: 14px;
}

.comment-username.mobile-comment-username {
  font-size: 13px;
}

.comment-time {
  font-size: 12px;
  color: #999;
}

.comment-time.mobile-comment-time {
  font-size: 11px;
}

.comment-text {
  font-size: 14px;
  color: #444;
  line-height: 1.6;
  margin: 0 0 8px 0;
  word-break: break-word;
}

.comment-text.mobile-comment-text {
  font-size: 14px;
  line-height: 1.5;
}

.comment-actions {
  display: flex;
  gap: 16px;
}

.comment-actions.mobile-comment-actions {
  gap: 12px;
}

.action-count {
  font-size: 12px;
  margin-left: 2px;
}
</style>
