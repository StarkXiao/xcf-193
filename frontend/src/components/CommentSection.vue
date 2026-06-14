<template>
  <div class="comment-section">
    <div class="comment-input-area">
      <n-avatar round size="medium" class="comment-avatar">
        {{ currentUser.avatar }}
      </n-avatar>
      <div class="input-wrapper">
        <n-input
          v-model:value="newComment"
          type="textarea"
          :rows="3"
          placeholder="写下你的想法..."
          class="comment-input"
        />
        <div class="input-actions">
          <span class="char-count">{{ newComment.length }}/500</span>
          <n-button 
            type="primary" 
            size="small"
            :disabled="!newComment.trim()"
            @click="submitComment"
          >
            发表评论
          </n-button>
        </div>
      </div>
    </div>

    <n-divider style="margin: 20px 0;" />

    <div class="comments-list">
      <div v-if="loading" class="loading-state">
        <n-spin size="small" />
        <span>加载评论中...</span>
      </div>

      <div v-else-if="comments.length === 0" class="empty-comments">
        <div class="empty-icon">💬</div>
        <p>暂无评论，来发表第一条评论吧~</p>
      </div>

      <div v-else>
        <div 
          v-for="comment in comments" 
          :key="comment.id"
          class="comment-item"
        >
          <n-avatar round size="medium" class="comment-avatar">
            {{ comment.avatar }}
          </n-avatar>
          <div class="comment-content">
            <div class="comment-header">
              <span class="comment-username">{{ comment.username }}</span>
              <span class="comment-time">{{ comment.createdAt }}</span>
            </div>
            <p class="comment-text">{{ comment.content }}</p>
            <div class="comment-actions">
              <n-button text size="tiny" @click="likeComment(comment)">
                <template #icon>{{ comment.isLiked ? '❤️' : '🤍' }}</template>
                {{ comment.likes }}
              </n-button>
              <n-button text size="tiny" @click="replyTo(comment)">
                <template #icon>💬</template>
                回复
              </n-button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { NAvatar, NInput, NButton, NDivider, NSpace, NSpin } from 'naive-ui'
import { commentApi } from '../api'

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

const currentUser = ref({
  id: 'user-1',
  username: '月下独酌',
  avatar: '🌸'
})

const comments = ref([])
const newComment = ref('')
const loading = ref(false)

const loadComments = async () => {
  loading.value = true
  try {
    const res = await commentApi.getComments(props.storyId, props.nodeId)
    comments.value = res.data.map(c => ({ ...c, isLiked: false }))
  } catch (err) {
    console.error('加载评论失败:', err)
  } finally {
    loading.value = false
  }
}

const submitComment = async () => {
  if (!newComment.value.trim()) return
  
  try {
    const res = await commentApi.addComment(props.storyId, {
      nodeId: props.nodeId,
      userId: currentUser.value.id,
      username: currentUser.value.username,
      avatar: currentUser.value.avatar,
      content: newComment.value.trim()
    })
    comments.value.unshift({ ...res.data, isLiked: false })
    newComment.value = ''
  } catch (err) {
    console.error('发表评论失败:', err)
  }
}

const likeComment = async (comment) => {
  if (comment.isLiked) return
  
  try {
    const res = await commentApi.likeComment(comment.id)
    comment.likes = res.data.likes
    comment.isLiked = true
  } catch (err) {
    console.error('点赞失败:', err)
  }
}

const replyTo = (comment) => {
  newComment.value = `@${comment.username} `
}

watch(() => props.nodeId, () => {
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
}

.comment-avatar {
  flex-shrink: 0;
}

.input-wrapper {
  flex: 1;
}

.comment-input {
  width: 100%;
}

.input-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 8px;
}

.char-count {
  font-size: 12px;
  color: #999;
}

.comments-list {
  margin-top: 10px;
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
}

.comment-item:last-child {
  border-bottom: none;
}

.comment-content {
  flex: 1;
}

.comment-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 6px;
}

.comment-username {
  font-weight: 500;
  color: #333;
  font-size: 14px;
}

.comment-time {
  font-size: 12px;
  color: #999;
}

.comment-text {
  font-size: 14px;
  color: #444;
  line-height: 1.6;
  margin: 0 0 8px 0;
}

.comment-actions {
  display: flex;
  gap: 16px;
}
</style>
