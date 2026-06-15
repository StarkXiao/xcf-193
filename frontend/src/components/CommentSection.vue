<template>
  <div class="comment-section" :class="{ 'is-mobile': isMobile }">
    <div class="comment-header-bar" :class="{ 'mobile-header-bar': isMobile }">
      <div class="header-left">
        <n-tag size="small" type="primary" round>
          💬 {{ commentStats.total }} 条评论
        </n-tag>
        <n-tag v-if="commentStats.pinnedCount > 0" size="small" type="warning" round>
          📌 {{ commentStats.pinnedCount }} 条置顶
        </n-tag>
      </div>
      <div class="header-right">
        <n-button-group size="small">
          <n-button
            v-for="opt in scopeOptions"
            :key="opt.value"
            :type="currentScope === opt.value ? 'primary' : 'default'"
            @click="handleScopeChange(opt.value)"
          >
            {{ opt.label }}
          </n-button>
        </n-button-group>
        <n-button-group size="small">
          <n-button
            v-for="opt in sortOptions"
            :key="opt.value"
            :type="currentSort === opt.value ? 'primary' : 'default'"
            @click="handleSortChange(opt.value)"
          >
            {{ opt.label }}
          </n-button>
        </n-button-group>
      </div>
    </div>

    <div
      v-if="pinnedComments.length > 0"
      class="pinned-section"
      :class="{ 'mobile-pinned-section': isMobile }"
    >
      <div class="pinned-label">
        <span class="pinned-icon">📌</span>
        <span>作者置顶</span>
      </div>
      <div class="pinned-list">
        <CommentItem
          v-for="comment in pinnedComments"
          :key="comment.id"
          :comment="comment"
          :depth="0"
          :current-user="currentUser"
          :is-author="isStoryAuthor"
          :is-mobile="isMobile"
          @reply="handleReply"
          @like="handleLike"
          @pin="handlePin"
          @delete="handleDelete"
        />
      </div>
      <n-divider v-if="!isMobile" style="margin: 16px 0;" />
      <div v-else class="mobile-divider"></div>
    </div>

    <div class="comment-input-area" :class="{ 'mobile-input-area': isMobile }">
      <n-avatar round :size="isMobile ? 'small' : 'medium'" class="comment-avatar">
        {{ currentUser.avatar }}
      </n-avatar>
      <div class="input-wrapper">
        <div v-if="replyingTo" class="replying-to-bar">
          <div class="replying-info">
            <n-tag size="small" type="info">
              正在回复 @{{ replyingTo.username }}
            </n-tag>
            <span v-if="replyingTo.content" class="replying-quote">
              "{{ truncateText(replyingTo.content, 60) }}"
            </span>
          </div>
          <n-button text size="tiny" @click="cancelReply">
            取消
          </n-button>
        </div>
        <n-input
          v-model:value="newComment"
          type="textarea"
          :rows="isMobile ? 2 : 3"
          :placeholder="replyingTo ? '写下你的回复...' : '写下你的想法...'"
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

      <div v-else-if="normalComments.length === 0" class="empty-comments" :class="{ 'mobile-empty': isMobile }">
        <div class="empty-icon">💬</div>
        <p>暂无评论，来发表第一条评论吧~</p>
      </div>

      <div v-else class="normal-comments">
        <CommentItem
          v-for="comment in normalComments"
          :key="comment.id"
          :comment="comment"
          :depth="0"
          :current-user="currentUser"
          :is-author="isStoryAuthor"
          :is-mobile="isMobile"
          @reply="handleReply"
          @like="handleLike"
          @pin="handlePin"
          @delete="handleDelete"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch, nextTick, defineComponent, h } from 'vue'
import { NAvatar, NInput, NButton, NDivider, NSpace, NSpin, NTag, useMessage, NPopconfirm, NDropdown, NButtonGroup } from 'naive-ui'
import { commentApi, storyApi } from '../api'
import { useResponsive } from '../composables/useResponsive'

const props = defineProps({
  storyId: {
    type: String,
    required: true
  },
  nodeId: {
    type: String,
    default: null
  },
  authorId: {
    type: String,
    default: null
  }
})

const emit = defineEmits(['comments-loaded', 'hot-comment-click'])

const { isMobile } = useResponsive()
const message = useMessage()

const currentUser = ref({
  id: 'user-1',
  username: '月下独酌',
  avatar: '🌸'
})

const sortOptions = [
  { label: '最新', value: 'newest' },
  { label: '最热', value: 'hot' }
]

const scopeOptions = [
  { label: '本章', value: 'current' },
  { label: '全故事', value: 'story' }
]

const commentsTree = ref([])
const newComment = ref('')
const loading = ref(false)
const submitting = ref(false)
const replyingTo = ref(null)
const currentSort = ref('newest')
const currentScope = ref('current')
const commentStats = ref({ total: 0, pinnedCount: 0 })

const isStoryAuthor = computed(() => {
  return props.authorId === currentUser.value.id
})

const pinnedComments = computed(() => {
  return commentsTree.value.filter(c => c.isPinned)
})

const normalComments = computed(() => {
  return commentsTree.value.filter(c => !c.isPinned)
})

const truncateText = (text, maxLen = 60) => {
  if (!text) return ''
  return text.length > maxLen ? text.substring(0, maxLen) + '...' : text
}

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

const addIsLikedRecursive = (comments) => {
  return comments.map(c => ({
    ...c,
    isLiked: false,
    replies: c.replies ? addIsLikedRecursive(c.replies) : []
  }))
}

const loadComments = async () => {
  loading.value = true
  try {
    const res = await commentApi.getComments(props.storyId, props.nodeId, {
      sort: currentSort.value,
      scope: currentScope.value
    })
    commentsTree.value = addIsLikedRecursive(res.data.comments)
    commentStats.value = {
      total: res.data.total,
      pinnedCount: res.data.pinnedCount
    }
    emit('comments-loaded', commentsTree.value)
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
    const newCommentObj = { ...res.data, isLiked: false, replies: [] }
    
    if (newCommentObj.replyToCommentId) {
      insertReplyRecursive(commentsTree.value, newCommentObj.replyToCommentId, newCommentObj)
    } else {
      if (newCommentObj.isPinned) {
        commentsTree.value.unshift(newCommentObj)
      } else {
        const insertIndex = pinnedComments.value.length
        commentsTree.value.splice(insertIndex, 0, newCommentObj)
      }
    }
    
    commentStats.value.total += 1
    
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

const insertReplyRecursive = (comments, parentId, reply) => {
  for (let i = 0; i < comments.length; i++) {
    if (comments[i].id === parentId) {
      if (!comments[i].replies) comments[i].replies = []
      comments[i].replies.push(reply)
      if (!comments[i].replyCount) comments[i].replyCount = 0
      comments[i].replyCount += 1
      return true
    }
    if (comments[i].replies && insertReplyRecursive(comments[i].replies, parentId, reply)) {
      return true
    }
  }
  return false
}

const findAndUpdateComment = (comments, commentId, updater) => {
  for (let i = 0; i < comments.length; i++) {
    if (comments[i].id === commentId) {
      updater(comments[i])
      return true
    }
    if (comments[i].replies && findAndUpdateComment(comments[i].replies, commentId, updater)) {
      return true
    }
  }
  return false
}

const findAndRemoveComment = (comments, commentId) => {
  for (let i = 0; i < comments.length; i++) {
    if (comments[i].id === commentId) {
      const removed = comments[i]
      comments.splice(i, 1)
      return removed
    }
    if (comments[i].replies) {
      const removed = findAndRemoveComment(comments[i].replies, commentId)
      if (removed) {
        if (comments[i].replyCount > 0) comments[i].replyCount -= 1
        return removed
      }
    }
  }
  return null
}

const handleReply = (comment) => {
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

const handleLike = async (comment) => {
  if (comment.isLiked) return
  
  try {
    const res = await commentApi.likeComment(comment.id, {
      userId: currentUser.value.id,
      username: currentUser.value.username,
      avatar: currentUser.value.avatar
    })
    findAndUpdateComment(commentsTree.value, comment.id, (c) => {
      c.likes = res.data.likes
      c.isLiked = true
    })
  } catch (err) {
    console.error('点赞失败:', err)
  }
}

const handlePin = async (comment) => {
  if (!isStoryAuthor.value) {
    message.warning('只有作者可以置顶评论')
    return
  }
  
  try {
    const res = await commentApi.pinComment(comment.id, {
      userId: currentUser.value.id,
      username: currentUser.value.username
    })
    findAndUpdateComment(commentsTree.value, comment.id, (c) => {
      c.isPinned = res.data.isPinned
      c.pinnedAt = res.data.comment.pinnedAt
      c.pinnedBy = res.data.comment.pinnedBy
    })
    
    if (res.data.isPinned) {
      commentStats.value.pinnedCount += 1
      message.success('已置顶该评论')
    } else {
      commentStats.value.pinnedCount -= 1
      message.success('已取消置顶')
    }
  } catch (err) {
    console.error('置顶操作失败:', err)
    message.error(err.response?.data?.message || '操作失败')
  }
}

const handleDelete = async (comment) => {
  try {
    await commentApi.deleteComment(comment.id, {
      userId: currentUser.value.id
    })
    findAndRemoveComment(commentsTree.value, comment.id)
    commentStats.value.total -= 1
    if (comment.isPinned) {
      commentStats.value.pinnedCount -= 1
    }
    message.success('评论已删除')
  } catch (err) {
    console.error('删除评论失败:', err)
    message.error(err.response?.data?.message || '删除失败')
  }
}

const cancelReply = () => {
  replyingTo.value = null
  newComment.value = ''
}

const handleSortChange = (value) => {
  currentSort.value = value
  loadComments()
}

const handleScopeChange = (value) => {
  currentScope.value = value
  loadComments()
}

watch(() => props.nodeId, () => {
  loadComments()
})

watch(() => props.storyId, () => {
  loadComments()
})

const CommentItem = defineComponent({
  name: 'CommentItem',
  props: {
    comment: { type: Object, required: true },
    depth: { type: Number, default: 0 },
    currentUser: { type: Object, required: true },
    isAuthor: { type: Boolean, default: false },
    isMobile: { type: Boolean, default: false }
  },
  emits: ['reply', 'like', 'pin', 'delete'],
  setup(props, { emit }) {
    const message = useMessage()
    const showAllReplies = ref(false)
    
    const displayedReplies = computed(() => {
      if (!props.comment.replies) return []
      if (showAllReplies.value || props.comment.replies.length <= 3) {
        return props.comment.replies
      }
      return props.comment.replies.slice(0, 3)
    })
    
    const hiddenRepliesCount = computed(() => {
      if (!props.comment.replies) return 0
      return Math.max(0, props.comment.replies.length - 3)
    })
    
    const canDelete = computed(() => {
      return props.comment.userId === props.currentUser.id || props.isAuthor
    })
    
    const handleReplyClick = () => {
      emit('reply', props.comment)
    }
    
    const handleLikeClick = () => {
      emit('like', props.comment)
    }
    
    const handlePinClick = () => {
      emit('pin', props.comment)
    }
    
    const handleDeleteClick = () => {
      emit('delete', props.comment)
    }
    
    const scrollToNode = (nodeId, nodeTitle) => {
      if (nodeId) {
        message.info(`跳转到「${nodeTitle || nodeId}」`)
      }
    }
    
    return () => {
      const c = props.comment
      const maxDepth = 3
      const actualDepth = Math.min(props.depth, maxDepth)
      
      return h('div', {
        class: [
          'comment-item',
          props.isMobile && 'mobile-comment-item',
          c.isPinned && 'comment-pinned',
          c.isAuthor && 'comment-by-author'
        ],
        style: props.depth > 0 ? { marginLeft: `${actualDepth * 16}px` } : {}
      }, [
        h(NAvatar, { round: true, size: props.isMobile ? 'small' : 'medium', class: 'comment-avatar' }, {
          default: () => c.avatar
        }),
        h('div', { class: 'comment-content' }, [
          h('div', { class: ['comment-header', props.isMobile && 'mobile-comment-header'] }, [
            h('div', { class: 'header-user-info' }, [
              h('span', { class: ['comment-username', props.isMobile && 'mobile-comment-username'] }, c.username),
              c.isAuthor && h(NTag, { size: 'tiny', type: 'warning', round: true, style: 'margin-left:6px' }, {
                default: () => '作者'
              }),
              c.replyToUsername && h('span', { class: 'reply-target' }, [
                h('span', { class: 'reply-arrow' }, ' → '),
                h('span', { class: 'reply-to-user' }, '@' + c.replyToUsername)
              ])
            ]),
            h('div', { class: 'header-meta' }, [
              props.nodeId !== c.nodeId && c.nodeTitle && c.nodeId && h(NTag, {
                size: 'tiny',
                type: 'info',
                style: 'margin-right:6px;cursor:pointer',
                onClick: () => scrollToNode(c.nodeId, c.nodeTitle)
              }, { default: () => '📖 ' + c.nodeTitle }),
              h('span', { class: ['comment-time', props.isMobile && 'mobile-comment-time'] }, c.createdAt)
            ])
          ]),
          c.isPinned && h('div', { class: 'pinned-badge' }, [
            h('span', { class: 'pinned-icon' }, '📌'),
            h('span', null, '作者置顶'),
            c.pinnedBy && h('span', { class: 'pinned-by' }, ' by ' + c.pinnedBy.username)
          ]),
          h('p', { class: ['comment-text', props.isMobile && 'mobile-comment-text'] }, c.content),
          h('div', { class: ['comment-actions', props.isMobile && 'mobile-comment-actions'] }, [
            h(NButton, { text: true, size: 'tiny', onClick: handleLikeClick }, {
              icon: () => c.isLiked ? '❤️' : '🤍',
              default: () => h('span', { class: 'action-count' }, c.likes)
            }),
            h(NButton, { text: true, size: 'tiny', onClick: handleReplyClick }, {
              icon: () => props.isMobile ? '↩️' : '💬',
              default: () => !props.isMobile ? '回复' : null
            }),
            c.replyCount > 0 && h('span', { class: 'reply-count-badge' }, [
              h('span', { class: 'reply-count-num' }, c.replyCount),
              h('span', null, ' 条回复')
            ]),
            props.isAuthor && !c.replyToCommentId && h(NButton, {
              text: true,
              size: 'tiny',
              onClick: handlePinClick,
              class: c.isPinned ? 'pin-btn pinned' : 'pin-btn'
            }, {
              default: () => c.isPinned ? '取消置顶' : '📌 置顶'
            }),
            canDelete.value && h(NPopconfirm, {
              onPositiveClick: handleDeleteClick
            }, {
              trigger: () => h(NButton, { text: true, size: 'tiny', class: 'delete-btn' }, {
                default: () => props.isMobile ? '🗑️' : '删除'
              }),
              default: () => '确定删除这条评论吗？'
            })
          ]),
          props.comment.replies && props.comment.replies.length > 0 && h('div', { class: 'replies-container' }, [
            displayedReplies.value.map(reply => h(CommentItem, {
              key: reply.id,
              comment: reply,
              depth: props.depth + 1,
              currentUser: props.currentUser,
              isAuthor: props.isAuthor,
              isMobile: props.isMobile,
              onReply: (rc) => emit('reply', rc),
              onLike: (lc) => emit('like', lc),
              onPin: (pc) => emit('pin', pc),
              onDelete: (dc) => emit('delete', dc)
            })),
            hiddenRepliesCount.value > 0 && h(NButton, {
              text: true,
              size: 'tiny',
              class: 'expand-replies-btn',
              onClick: () => showAllReplies.value = true
            }, {
              default: () => `展开剩余 ${hiddenRepliesCount.value} 条回复 ⬇️`
            })
          ])
        ])
      ])
    }
  }
})

onMounted(() => {
  loadComments()
})
</script>

<style scoped>
.comment-section {
  padding: 10px 0;
}

.comment-header-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
  gap: 12px;
  flex-wrap: wrap;
}

.comment-header-bar.mobile-header-bar {
  padding: 8px 0;
  gap: 8px;
}

.header-left {
  display: flex;
  gap: 8px;
  align-items: center;
  flex-wrap: wrap;
}

.header-right {
  display: flex;
  gap: 8px;
  align-items: center;
}

.pinned-section {
  background: linear-gradient(135deg, #fffbe6 0%, #fff1cc 100%);
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 16px;
  border: 1px solid #ffe58f;
}

.pinned-section.mobile-pinned-section {
  padding: 12px;
  margin-bottom: 12px;
  border-radius: 10px;
}

.pinned-label {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  font-weight: 600;
  color: #d46b08;
  margin-bottom: 12px;
}

.pinned-icon {
  font-size: 16px;
}

.comment-input-area {
  display: flex;
  gap: 12px;
  padding: 16px;
  background: linear-gradient(135deg, #faf5ff 0%, #f3e8ff 100%);
  border-radius: 12px;
  border: 1px solid #e8d5ff;
}

.comment-input-area.mobile-input-area {
  gap: 8px;
  padding: 12px;
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
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 8px;
  padding: 10px 12px;
  background: rgba(255, 255, 255, 0.8);
  border-radius: 8px;
  border-left: 3px solid #9d4edd;
  gap: 8px;
}

.replying-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
}

.replying-quote {
  font-size: 12px;
  color: #888;
  font-style: italic;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
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
  background: linear-gradient(90deg, transparent 0%, #f0f0f0 50%, transparent 100%);
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
  opacity: 0.6;
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

.comment-item.comment-pinned {
  background: rgba(255, 251, 230, 0.3);
  border-radius: 8px;
  padding: 16px 12px;
  margin-bottom: 8px;
  border-bottom: none;
}

.comment-item.comment-by-author {
  position: relative;
}

.comment-item.comment-by-author::before {
  content: '';
  position: absolute;
  left: 0;
  top: 16px;
  bottom: 16px;
  width: 3px;
  background: linear-gradient(180deg, #9d4edd 0%, #c77dff 100%);
  border-radius: 2px;
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
  align-items: flex-start;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 6px;
  flex-wrap: wrap;
}

.comment-header.mobile-comment-header {
  gap: 6px;
}

.header-user-info {
  display: flex;
  align-items: center;
  gap: 4px;
  flex-wrap: wrap;
}

.comment-username {
  font-weight: 600;
  color: #333;
  font-size: 14px;
}

.comment-username.mobile-comment-username {
  font-size: 13px;
}

.reply-target {
  display: flex;
  align-items: center;
  font-size: 12px;
  color: #888;
}

.reply-arrow {
  color: #ccc;
  margin: 0 2px;
}

.reply-to-user {
  color: #9d4edd;
  font-weight: 500;
}

.header-meta {
  display: flex;
  align-items: center;
  gap: 4px;
  flex-shrink: 0;
}

.comment-time {
  font-size: 12px;
  color: #999;
}

.comment-time.mobile-comment-time {
  font-size: 11px;
}

.pinned-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 10px;
  background: linear-gradient(135deg, #fff1cc 0%, #ffe58f 100%);
  border-radius: 12px;
  font-size: 12px;
  color: #d46b08;
  margin-bottom: 8px;
  font-weight: 500;
}

.pinned-by {
  font-size: 11px;
  color: #d48806;
  opacity: 0.8;
}

.comment-text {
  font-size: 14px;
  color: #444;
  line-height: 1.7;
  margin: 0 0 10px 0;
  word-break: break-word;
}

.comment-text.mobile-comment-text {
  font-size: 14px;
  line-height: 1.6;
  margin-bottom: 8px;
}

.comment-actions {
  display: flex;
  gap: 12px;
  align-items: center;
  flex-wrap: wrap;
}

.comment-actions.mobile-comment-actions {
  gap: 8px;
}

.action-count {
  font-size: 12px;
  margin-left: 2px;
}

.reply-count-badge {
  display: inline-flex;
  align-items: center;
  gap: 2px;
  padding: 2px 8px;
  background: #f3e8ff;
  border-radius: 10px;
  font-size: 11px;
  color: #9d4edd;
  font-weight: 500;
}

.reply-count-num {
  font-weight: 600;
}

.pin-btn {
  color: #999;
}

.pin-btn.pinned {
  color: #d46b08;
}

.delete-btn {
  color: #ff4d4f;
}

.replies-container {
  margin-top: 12px;
  padding-left: 4px;
  border-left: 2px solid #f0e6ff;
}

.expand-replies-btn {
  margin-top: 8px;
  margin-left: 12px;
  color: #9d4edd;
  font-size: 12px;
}

.expand-replies-btn:hover {
  color: #7b2cbf;
}
</style>
