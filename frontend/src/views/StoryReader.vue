<template>
  <div 
    class="story-reader" 
    :class="{ 
      'is-mobile': isMobile,
      'immersive': isMobile && immersiveMode
    }"
    ref="readerRef"
  >
    <div class="reader-header" :class="{ 'mobile-header': isMobile, 'header-hidden': isMobile && immersiveMode }">
      <div class="header-left">
        <n-button text @click="goBack">
          <template #icon>←</template>
          <span v-if="!isMobile">返回</span>
        </n-button>
      </div>
      <div class="story-title-section" v-if="story">
        <h1 class="story-title" :class="{ 'mobile-title': isMobile }">{{ story.title }}</h1>
        <div v-if="!isMobile" class="story-author">作者：{{ story.authorName }}</div>
      </div>
      <div class="header-actions">
        <n-button text @click="toggleFavorite" :class="{ 'is-favorited': isFavorited }">
          <template #icon>{{ isFavorited ? '⭐' : ' ☆' }}</template>
          <span v-if="!isMobile">{{ isFavorited ? '已收藏' : '收藏' }}</span>
        </n-button>
        <n-button text @click="toggleLike">
          <template #icon>{{ isLiked ? '❤️' : '🤍' }}</template>
          <span v-if="!isMobile">{{ story?.likes || 0 }}</span>
          <span v-else class="mobile-count">{{ story?.likes || 0 }}</span>
        </n-button>
        <n-button text @click="showBranchPanel = !showBranchPanel" :class="{ 'active-btn': showBranchPanel }">
          <template #icon>🌳</template>
          <span v-if="!isMobile">分支</span>
        </n-button>
        <n-button v-if="isMobile" text @click="toggleSettingPanel = !toggleSettingPanel">
          <template #icon>⚙️</template>
        </n-button>
      </div>
    </div>

    <transition name="fade">
      <div v-if="isMobile && toggleSettingPanel" class="settings-panel">
        <div class="settings-backdrop" @click="toggleSettingPanel = false"></div>
        <div class="settings-content">
          <div class="settings-title">阅读设置</div>
          <div class="setting-group">
            <div class="setting-label">字号大小</div>
            <div class="font-size-control">
              <n-button text size="small" @click="adjustFontSize(-1)" :disabled="fontSize <= 14">A-</n-button>
              <span class="font-size-display">{{ fontSize }}px</span>
              <n-button text size="small" @click="adjustFontSize(1)" :disabled="fontSize >= 24">A+</n-button>
            </div>
          </div>
          <div class="setting-group">
            <div class="setting-label">主题背景</div>
            <div class="theme-options">
              <div 
                v-for="t in themeOptions" 
                :key="t.key"
                class="theme-option"
                :class="{ active: themeKey === t.key }"
                :style="{ background: t.bg, color: t.text }"
                @click="themeKey = t.key"
              >
                {{ t.label }}
              </div>
            </div>
          </div>
          <div class="setting-group">
            <div class="setting-row">
              <span>沉浸式阅读</span>
              <n-switch v-model:value="immersiveMode" />
            </div>
          </div>
        </div>
      </div>
    </transition>

    <transition name="fade">
      <div v-if="showBranchPanel && history.length > 0" class="branch-panel">
        <div class="branch-backdrop" @click="showBranchPanel = false"></div>
        <div class="branch-content" :class="{ 'mobile-branch-content': isMobile }">
          <div class="branch-header">
            <span class="branch-title">🌳 分支路径</span>
            <n-button text size="small" @click="showBranchPanel = false">✕</n-button>
          </div>
          <div class="branch-path">
            <div 
              v-for="(node, index) in history" 
              :key="node.id"
              class="branch-step"
              :class="{ 
                active: index === history.length - 1,
                past: index < history.length - 1 
              }"
              @click="jumpToNode(index)"
            >
              <div class="step-connector" v-if="index > 0">
                <div class="connector-line"></div>
                <div class="connector-arrow">▼</div>
              </div>
              <div class="step-card">
                <div class="step-index">{{ index + 1 }}</div>
                <div class="step-info">
                  <div class="step-title">{{ node.title }}</div>
                  <div v-if="node.choices && index < history.length - 1" class="step-choice">
                    → {{ history[index + 1]?._choiceText || '选择了分支' }}
                  </div>
                </div>
                <div v-if="index === history.length - 1" class="step-current">当前</div>
                <div v-if="index < history.length - 1" class="step-back-hint">回溯</div>
              </div>
            </div>
          </div>
          <div v-if="history.length > 1" class="branch-actions">
            <n-button size="small" @click="restartStory">
              <template #icon>🔄</template>
              重新开始
            </n-button>
          </div>
        </div>
      </div>
    </transition>

    <div 
      class="reader-container" 
      :class="{ 'mobile-container': isMobile }"
      :style="readerStyle"
      @click="handleReaderClick"
    >
      <n-spin :show="loading" size="large">
        <div v-if="currentNode" class="node-content">
          <div class="node-header" :class="{ 'mobile-node-header': isMobile }">
            <h2 class="node-title" :class="{ 'mobile-node-title': isMobile }">{{ currentNode.title }}</h2>
            <div v-if="currentNode.isEnding" class="ending-badge" :class="currentNode.endingType">
              <span v-if="currentNode.endingType === 'good'">✨ 完美结局</span>
              <span v-else-if="currentNode.endingType === 'normal'">🌟 普通结局</span>
              <span v-else-if="currentNode.endingType === 'bad'">💔 遗憾结局</span>
            </div>
          </div>

          <div class="story-text" :class="{ 'mobile-story-text': isMobile }">
            <p v-for="(paragraph, index) in paragraphs" :key="index" class="story-paragraph">
              {{ paragraph }}
            </p>
          </div>

          <div v-if="!currentNode.isEnding && currentNode.choices?.length > 0" class="choices-section">
            <div class="choices-label">请选择你的行动：</div>
            <div class="choices-list" :class="{ 'mobile-choices-list': isMobile }">
              <n-button 
                v-for="choice in currentNode.choices" 
                :key="choice.id"
                type="primary"
                ghost
                block
                class="choice-btn"
                :class="{ 'mobile-choice-btn': isMobile }"
                @click="makeChoice(choice)"
              >
                {{ choice.text }}
              </n-button>
            </div>
          </div>

          <div v-if="currentNode.isEnding" class="ending-actions" :class="{ 'mobile-ending-actions': isMobile }">
            <p class="ending-text">恭喜你达成了一个结局！</p>
            <div class="ending-buttons" :class="{ 'mobile-ending-buttons': isMobile }">
              <n-button :size="isMobile ? 'medium' : 'default'" @click="restartStory">
                <template #icon>🔄</template>
                重新开始
              </n-button>
              <n-button type="primary" :size="isMobile ? 'medium' : 'default'" @click="goBack">
                <template #icon>📚</template>
                查看其他故事
              </n-button>
            </div>
          </div>

          <div v-if="history.length > 1" class="history-section" :class="{ 'mobile-history-section': isMobile }">
            <div class="history-header">
              <n-divider v-if="!isMobile">阅读进度</n-divider>
              <div v-if="isMobile" class="mobile-history-label">📜 阅读路径</div>
              <n-button text type="primary" size="small" @click="showBranchPanel = true">
                <template #icon>🌳</template>
                查看分支
              </n-button>
            </div>
            <div class="history-trail" :class="{ 'mobile-history-trail': isMobile }">
              <template v-for="(node, index) in history" :key="node.id">
                <span 
                  class="history-node"
                  :class="{ active: index === history.length - 1, 'mobile-history-node': isMobile }"
                  @click="jumpToNode(index)"
                >
                  {{ isMobile ? (index + 1) : node.title }}
                </span>
                <span v-if="index < history.length - 1" class="history-arrow">›</span>
              </template>
            </div>
          </div>

          <div 
            v-if="currentNode?.referencedEntries?.length > 0 || storyWideReferences?.length > 0" 
            class="world-settings-section"
            :class="{ 'mobile-world-settings-section': isMobile }"
          >
            <div class="settings-header">
              <n-divider v-if="!isMobile">🌍 相关设定</n-divider>
              <div v-if="isMobile" class="mobile-settings-label">🌍 相关设定</div>
            </div>
            <div class="settings-list" :class="{ 'mobile-settings-list': isMobile }">
              <div 
                v-for="ref in allReferencedEntries" 
                :key="ref.entryId"
                class="setting-card"
                :class="{ 'mobile-setting-card': isMobile }"
                @click="goToWorldEntry(ref)"
              >
                <div class="setting-icon">📚</div>
                <div class="setting-info">
                  <div class="setting-world" :title="ref.worldName">
                    {{ ref.worldName }}
                  </div>
                  <div class="setting-name">
                    <n-tag size="small" type="primary" style="margin-right: 6px;">
                      {{ ref.entryCategory }}
                    </n-tag>
                    {{ ref.entryTitle }}
                  </div>
                </div>
                <div class="setting-arrow">→</div>
              </div>
            </div>
          </div>
        </div>
      </n-spin>
    </div>

    <div v-if="isMobile" class="mobile-reading-tips" :class="{ 'tips-hidden': immersiveMode }">
      <span class="tip-icon">💡</span>
      点击屏幕中间可切换沉浸式模式，左右滑动翻页
    </div>

    <div class="comments-section" :class="{ 'mobile-comments': isMobile }">
      <n-divider v-if="!isMobile">评论互动</n-divider>
      <div v-if="isMobile" class="mobile-comments-header">💬 评论互动</div>
      <CommentSection 
        :story-id="storyId" 
        :node-id="currentNodeId" 
        @comments-loaded="handleCommentsLoaded"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { NButton, NSpin, NDivider, NTag, useMessage, NSwitch } from 'naive-ui'
import { storyApi, userApi } from '../api'
import CommentSection from '../components/CommentSection.vue'
import { useResponsive, useTouchGestures } from '../composables/useResponsive'

const route = useRoute()
const router = useRouter()
const message = useMessage()
const userId = 'user-1'
const { isMobile } = useResponsive()

const storyId = computed(() => route.params.id)
const story = ref(null)
const currentNode = ref(null)
const currentNodeId = ref('')
const loading = ref(false)
const history = ref([])
const isLiked = ref(false)
const isFavorited = ref(false)
const allNodes = ref([])
const pendingCommentId = ref(null)
const showBranchPanel = ref(false)

const fontSize = ref(16)
const themeKey = ref('default')
const immersiveMode = ref(false)
const toggleSettingPanel = ref(false)
const storyWideReferences = ref([])

const readerRef = ref(null)

const themeOptions = [
  { key: 'default', label: '默认', bg: '#fafafa', text: '#444' },
  { key: 'sepia', label: '护眼', bg: '#f4ecd8', text: '#5b4636' },
  { key: 'green', label: '绿屏', bg: '#cce8cf', text: '#002b36' },
  { key: 'dark', label: '夜间', bg: '#1a1a2e', text: '#c77dff' }
]

const readerStyle = computed(() => {
  const theme = themeOptions.find(t => t.key === themeKey.value) || themeOptions[0]
  return {
    '--reader-font-size': `${fontSize.value}px`,
    '--reader-bg': theme.bg,
    '--reader-text': theme.text
  }
})

const paragraphs = computed(() => {
  if (!currentNode.value?.content) return []
  return currentNode.value.content.split('\n').filter(p => p.trim())
})

const allReferencedEntries = computed(() => {
  const seen = new Set()
  const result = []
  
  const nodeRefs = currentNode.value?.referencedEntries || []
  nodeRefs.forEach(ref => {
    if (!seen.has(ref.entryId)) {
      seen.add(ref.entryId)
      result.push({ ...ref, scope: '本章' })
    }
  })
  
  storyWideReferences.value.forEach(ref => {
    if (!seen.has(ref.entryId)) {
      seen.add(ref.entryId)
      result.push({ ...ref, scope: '全局' })
    }
  })
  
  return result
})

const restoreChoiceTexts = (nodes) => {
  for (let i = 1; i < nodes.length; i++) {
    const prevNode = nodes[i - 1]
    const currNode = nodes[i]
    if (prevNode.choices && !currNode._choiceText) {
      const choice = prevNode.choices.find(c => c.nextNodeId === currNode.id)
      if (choice) {
        currNode._choiceText = choice.text
      }
    }
  }
  return nodes
}

useTouchGestures(readerRef, {
  onSwipeLeft: () => {
    if (!isMobile.value) return
    const currentIndex = history.value.length - 1
    if (currentIndex < history.value.length - 1) {
      jumpToNode(currentIndex + 1)
    }
  },
  onSwipeRight: () => {
    if (!isMobile.value) return
    const currentIndex = history.value.length - 1
    if (currentIndex > 0) {
      jumpToNode(currentIndex - 1)
    } else {
      goBack()
    }
  },
  onTap: () => {
    if (isMobile.value && !toggleSettingPanel.value) {
      immersiveMode.value = !immersiveMode.value
    }
  }
})

const adjustFontSize = (delta) => {
  const newSize = fontSize.value + delta
  if (newSize >= 14 && newSize <= 24) {
    fontSize.value = newSize
  }
}

const handleReaderClick = (e) => {
  if (!isMobile.value) return
  const target = e.target
  if (target.tagName === 'BUTTON' || 
      target.closest('.choice-btn') || 
      target.closest('.settings-panel') ||
      target.closest('.ending-buttons') ||
      target.closest('.history-trail') ||
      target.closest('.comments-section')) {
    return
  }
}

const scrollToComment = (commentId) => {
  setTimeout(() => {
    const commentEl = document.getElementById(`comment-${commentId}`)
    if (commentEl) {
      commentEl.scrollIntoView({ behavior: 'smooth', block: 'center' })
      commentEl.style.backgroundColor = 'rgba(157, 78, 221, 0.15)'
      setTimeout(() => {
        commentEl.style.backgroundColor = 'transparent'
      }, 2500)
    } else {
      const commentsSection = document.querySelector('.comments-section')
      if (commentsSection) {
        commentsSection.scrollIntoView({ behavior: 'smooth' })
      }
    }
  }, 200)
}

const handleCommentsLoaded = () => {
  if (pendingCommentId.value) {
    scrollToComment(pendingCommentId.value)
    pendingCommentId.value = null
  }
}

const loadStory = async () => {
  loading.value = true
  try {
    const [storyRes, nodesRes] = await Promise.all([
      storyApi.getStory(storyId.value),
      storyApi.getStoryNodes(storyId.value)
    ])
    story.value = storyRes.data
    allNodes.value = nodesRes.data
    
    const queryNodeId = route.query.nodeId
    const queryCommentId = route.query.commentId
    
    let restored = false
    let histRecord = null
    
    try {
      const histRes = await userApi.getReadingHistory(userId, { limit: 20 })
      histRecord = histRes.data.history.find(r => r.storyId === storyId.value)
    } catch (e) {
      console.error('获取阅读历史失败:', e)
    }
    
    if (queryNodeId) {
      const targetNode = nodesRes.data.find(n => n.id === queryNodeId)
      if (targetNode) {
        if (histRecord && histRecord.historyNodeIds && histRecord.historyNodeIds.length > 0) {
          const nodeIndex = histRecord.historyNodeIds.indexOf(queryNodeId)
          if (nodeIndex >= 0) {
            const pathNodeIds = histRecord.historyNodeIds.slice(0, nodeIndex + 1)
            const pathNodes = pathNodeIds
              .map(nid => nodesRes.data.find(n => n.id === nid))
              .filter(Boolean)
            if (pathNodes.length > 0) {
              restoreChoiceTexts(pathNodes)
              history.value = pathNodes
              currentNode.value = pathNodes[pathNodes.length - 1]
              currentNodeId.value = pathNodes[pathNodes.length - 1].id
              restored = true
            }
          }
        }
        if (!restored) {
          history.value = [targetNode]
          currentNode.value = targetNode
          currentNodeId.value = targetNode.id
        }
      }
    } else if (histRecord) {
      const restoreNodes = histRecord.historyNodeIds
        .map(nid => nodesRes.data.find(n => n.id === nid))
        .filter(Boolean)
      if (restoreNodes.length > 0) {
        restoreChoiceTexts(restoreNodes)
        history.value = restoreNodes
        const current = nodesRes.data.find(n => n.id === histRecord.currentNodeId)
        if (current) {
          currentNode.value = current
          currentNodeId.value = current.id
        } else {
          currentNode.value = restoreNodes[restoreNodes.length - 1]
          currentNodeId.value = restoreNodes[restoreNodes.length - 1].id
        }
        restored = true
      }
    }
    
    if (!restored && story.value.startNodeId) {
      const startNode = nodesRes.data.find(n => n.id === story.value.startNodeId)
      if (startNode) {
        currentNode.value = startNode
        currentNodeId.value = startNode.id
        history.value = [startNode]
      }
    }
    
    storyApi.viewStory(storyId.value)
    checkFavorite()
    saveReadingProgress()
    
    try {
      const refRes = await storyApi.getStoryReferences(storyId.value)
      storyWideReferences.value = refRes.data.references || []
    } catch (e) {
      console.error('加载故事设定引用失败:', e)
    }
    
    if (queryCommentId) {
      pendingCommentId.value = queryCommentId
    }
  } catch (err) {
    console.error('加载故事失败:', err)
  } finally {
    loading.value = false
  }
}

const checkFavorite = async () => {
  try {
    const res = await userApi.checkFavorite(userId, {
      targetId: storyId.value,
      targetType: 'story'
    })
    isFavorited.value = res.data.isFavorited
  } catch (err) {
    console.error('检查收藏状态失败:', err)
  }
}

const toggleFavorite = async () => {
  try {
    if (isFavorited.value) {
      await userApi.removeFavorite(userId, {
        targetId: storyId.value,
        targetType: 'story'
      })
      isFavorited.value = false
      message.success('已取消收藏')
    } else {
      await userApi.addFavorite(userId, {
        targetId: storyId.value,
        targetType: 'story',
        username: '月下独酌',
        avatar: '🌸'
      })
      isFavorited.value = true
      message.success('已加入收藏')
    }
  } catch (err) {
    console.error('收藏操作失败:', err)
    message.error('操作失败，请重试')
  }
}

const makeChoice = (choice) => {
  const nextNode = allNodes.value.find(n => n.id === choice.nextNodeId)
  if (nextNode) {
    nextNode._choiceText = choice.text
    currentNode.value = nextNode
    currentNodeId.value = nextNode.id
    history.value.push(nextNode)
    showBranchPanel.value = false
    window.scrollTo({ top: 0, behavior: 'smooth' })
    saveReadingProgress()
  }
}

const jumpToNode = (index) => {
  if (index < history.value.length) {
    history.value = history.value.slice(0, index + 1)
    currentNode.value = history.value[index]
    currentNodeId.value = history.value[index].id
    showBranchPanel.value = false
    window.scrollTo({ top: 0, behavior: 'smooth' })
    saveReadingProgress()
  }
}

const restartStory = () => {
  if (story.value?.startNodeId) {
    const startNode = allNodes.value.find(n => n.id === story.value.startNodeId)
    if (startNode) {
      currentNode.value = startNode
      currentNodeId.value = startNode.id
      history.value = [startNode]
      showBranchPanel.value = false
      window.scrollTo({ top: 0, behavior: 'smooth' })
      saveReadingProgress()
    }
  }
}

const toggleLike = async () => {
  try {
    const res = await storyApi.likeStory(storyId.value, {
      userId: userId,
      username: '月下独酌',
      avatar: '🌸'
    })
    if (story.value) {
      story.value.likes = res.data.likes
    }
    isLiked.value = true
  } catch (err) {
    console.error('点赞失败:', err)
  }
}

const saveReadingProgress = async () => {
  if (!storyId.value || !currentNodeId.value) return
  try {
    await userApi.saveReadingHistory(userId, {
      storyId: storyId.value,
      currentNodeId: currentNodeId.value,
      historyNodeIds: history.value.map(n => n.id)
    })
  } catch (err) {
    console.error('保存阅读进度失败:', err)
  }
}

const goBack = () => {
  saveReadingProgress()
  router.push('/')
}

const goToWorldEntry = (ref) => {
  router.push({
    path: `/world/${ref.worldId}`,
    query: { entryId: ref.entryId }
  })
}

watch(() => route.params.id, () => {
  loadStory()
})

onMounted(() => {
  loadStory()
})

onUnmounted(() => {
  saveReadingProgress()
})
</script>

<style scoped>
.story-reader {
  max-width: 800px;
  margin: 0 auto;
  position: relative;
  padding-bottom: 20px;
}

.story-reader.immersive {
  padding-bottom: 0;
}

.reader-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 0;
  position: sticky;
  top: 64px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  z-index: 10;
  border-bottom: 1px solid #f0f0f0;
  transition: transform 0.3s, opacity 0.3s;
}

.reader-header.mobile-header {
  top: 56px;
  padding: 10px 0;
}

.reader-header.header-hidden {
  transform: translateY(-100%);
  opacity: 0;
  pointer-events: none;
}

.header-left {
  min-width: 60px;
}

.story-title-section {
  text-align: center;
  flex: 1;
  padding: 0 16px;
}

.story-title {
  font-size: 20px;
  margin: 0 0 4px 0;
  color: #333;
}

.story-title.mobile-title {
  font-size: 15px;
}

.story-author {
  font-size: 13px;
  color: #999;
}

.header-actions {
  min-width: 80px;
  text-align: right;
  display: flex;
  gap: 4px;
  align-items: center;
}

.header-actions .is-favorited {
  color: #f0a020;
}

.header-actions .active-btn {
  color: #9d4edd;
}

.mobile-count {
  font-size: 12px;
  margin-left: 2px;
}

.branch-panel {
  position: relative;
  margin-bottom: 20px;
}

.branch-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.3);
  z-index: 49;
}

.branch-content {
  background: white;
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  position: relative;
  z-index: 50;
  max-height: 60vh;
  overflow-y: auto;
}

.branch-content.mobile-branch-content {
  border-radius: 0;
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  max-height: 70vh;
  z-index: 201;
  border-radius: 20px 20px 0 0;
  padding-bottom: calc(20px + var(--safe-area-inset-bottom));
  animation: slideUp 0.3s ease;
}

.branch-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.branch-title {
  font-size: 16px;
  font-weight: 600;
  color: #333;
}

.branch-path {
  display: flex;
  flex-direction: column;
  gap: 0;
}

.branch-step {
  cursor: pointer;
  transition: all 0.2s;
}

.branch-step:hover .step-card {
  background: #f9f0ff;
}

.branch-step.active .step-card {
  background: linear-gradient(135deg, #f3e8ff 0%, #e8d5ff 100%);
  border-color: #9d4edd;
}

.step-connector {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 2px 0;
}

.connector-line {
  width: 2px;
  height: 8px;
  background: #e0e0e0;
}

.connector-arrow {
  font-size: 10px;
  color: #ccc;
  line-height: 1;
}

.step-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background: #fafafa;
  border-radius: 10px;
  border: 1px solid #f0f0f0;
  transition: all 0.2s;
}

.step-index {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: linear-gradient(135deg, #9d4edd 0%, #c77dff 100%);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 600;
  flex-shrink: 0;
}

.branch-step.past .step-index {
  background: #e0e0e0;
  color: #999;
}

.step-info {
  flex: 1;
  min-width: 0;
}

.step-title {
  font-size: 14px;
  color: #333;
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.step-choice {
  font-size: 12px;
  color: #9d4edd;
  margin-top: 2px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.step-current {
  font-size: 11px;
  padding: 2px 8px;
  border-radius: 10px;
  background: linear-gradient(135deg, #9d4edd 0%, #c77dff 100%);
  color: white;
  flex-shrink: 0;
}

.step-back-hint {
  font-size: 11px;
  color: #999;
  flex-shrink: 0;
  opacity: 0;
  transition: opacity 0.2s;
}

.branch-step.past:hover .step-back-hint {
  opacity: 1;
  color: #9d4edd;
}

.branch-actions {
  margin-top: 16px;
  display: flex;
  justify-content: center;
}

.settings-panel {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 200;
}

.settings-backdrop {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
}

.settings-content {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: white;
  border-radius: 20px 20px 0 0;
  padding: 20px 16px;
  padding-bottom: calc(20px + var(--safe-area-inset-bottom));
  animation: slideUp 0.3s ease;
}

@keyframes slideUp {
  from {
    transform: translateY(100%);
  }
  to {
    transform: translateY(0);
  }
}

.settings-title {
  font-size: 18px;
  font-weight: 600;
  text-align: center;
  margin-bottom: 20px;
  color: #333;
}

.setting-group {
  margin-bottom: 20px;
}

.setting-label {
  font-size: 14px;
  color: #666;
  margin-bottom: 12px;
}

.font-size-control {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 20px;
}

.font-size-display {
  font-size: 16px;
  font-weight: 500;
  min-width: 60px;
  text-align: center;
}

.theme-options {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
}

.theme-option {
  padding: 14px;
  border-radius: 10px;
  text-align: center;
  cursor: pointer;
  font-size: 14px;
  border: 2px solid transparent;
  transition: all 0.2s;
}

.theme-option.active {
  border-color: #9d4edd;
  transform: scale(1.02);
}

.setting-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 4px 0;
}

.reader-container {
  padding: 30px 0;
}

.reader-container.mobile-container {
  padding: 16px 0;
}

.node-header {
  text-align: center;
  margin-bottom: 30px;
}

.node-header.mobile-node-header {
  margin-bottom: 20px;
}

.node-title {
  font-size: 24px;
  margin: 0 0 12px 0;
  color: #333;
}

.node-title.mobile-node-title {
  font-size: 18px;
  margin-bottom: 10px;
}

.ending-badge {
  display: inline-block;
  padding: 6px 16px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: bold;
}

.ending-badge.good {
  background: linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%);
  color: #d46b08;
}

.ending-badge.normal {
  background: linear-gradient(135deg, #e6f7ff 0%, #bae7ff 100%);
  color: #096dd9;
}

.ending-badge.bad {
  background: linear-gradient(135deg, #fff1f0 0%, #ffccc7 100%);
  color: #cf1322;
}

.story-text {
  background: var(--reader-bg, linear-gradient(135deg, #fafafa 0%, #f5f5f5 100%));
  padding: 40px;
  border-radius: 16px;
  margin-bottom: 30px;
  color: var(--reader-text, #444);
}

.story-text.mobile-story-text {
  padding: 16px;
  margin-bottom: 20px;
  border-radius: 12px;
}

.story-paragraph {
  font-size: var(--reader-font-size, 16px);
  line-height: 2;
  margin: 0 0 16px 0;
  text-indent: 2em;
}

.story-paragraph:last-child {
  margin-bottom: 0;
}

.choices-section {
  margin-top: 30px;
}

.choices-label {
  text-align: center;
  font-size: 16px;
  color: #666;
  margin-bottom: 20px;
}

.choices-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  max-width: 500px;
  margin: 0 auto;
}

.choices-list.mobile-choices-list {
  gap: 10px;
  max-width: 100%;
}

.choice-btn {
  padding: 16px 24px;
  font-size: 15px;
  border-radius: 12px;
  transition: all 0.3s;
}

.choice-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(157, 78, 221, 0.3);
}

.choice-btn.mobile-choice-btn {
  padding: 14px 16px;
  font-size: 14px;
  border-radius: 10px;
}

.ending-actions {
  text-align: center;
  margin-top: 40px;
  padding: 30px;
  background: linear-gradient(135deg, #f9f0ff 0%, #f0e6ff 100%);
  border-radius: 16px;
}

.ending-actions.mobile-ending-actions {
  margin-top: 24px;
  padding: 20px 16px;
  border-radius: 12px;
}

.ending-text {
  font-size: 18px;
  color: #666;
  margin: 0 0 20px 0;
}

.ending-buttons {
  display: flex;
  gap: 16px;
  justify-content: center;
}

.ending-buttons.mobile-ending-buttons {
  gap: 10px;
  flex-direction: column;
}

.ending-buttons.mobile-ending-buttons :deep(.n-button) {
  width: 100%;
}

.history-section {
  margin-top: 40px;
}

.history-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.history-header :deep(.n-divider) {
  flex: 1;
}

.history-section.mobile-history-section {
  margin-top: 24px;
}

.mobile-history-label {
  text-align: center;
  font-size: 14px;
  color: #666;
  margin-bottom: 12px;
}

.history-trail {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  justify-content: center;
  align-items: center;
}

.history-arrow {
  color: #ccc;
  font-size: 14px;
}

.history-trail.mobile-history-trail {
  gap: 6px;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  flex-wrap: nowrap;
  justify-content: flex-start;
  padding-bottom: 4px;
}

.history-node {
  padding: 6px 12px;
  background: #f5f5f5;
  border-radius: 6px;
  font-size: 13px;
  color: #999;
  cursor: pointer;
  transition: all 0.2s;
}

.history-node:hover {
  background: #e8e8e8;
  color: #666;
}

.history-node.active {
  background: linear-gradient(135deg, #9d4edd 0%, #c77dff 100%);
  color: white;
}

.history-node.mobile-history-node {
  flex-shrink: 0;
  width: 32px;
  height: 32px;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  font-size: 12px;
}

.world-settings-section {
  margin-top: 40px;
}

.world-settings-section.mobile-world-settings-section {
  margin-top: 24px;
}

.settings-header {
  margin-bottom: 16px;
}

.settings-header :deep(.n-divider) {
  flex: 1;
}

.mobile-settings-label {
  text-align: center;
  font-size: 14px;
  color: #666;
  padding: 12px 0;
  border-top: 1px solid #f0f0f0;
}

.settings-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 12px;
}

.settings-list.mobile-settings-list {
  grid-template-columns: 1fr;
  gap: 10px;
}

.setting-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 16px;
  background: linear-gradient(135deg, #e6f7ff 0%, #e6fffb 100%);
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s;
  border: 1px solid transparent;
}

.setting-card:hover {
  transform: translateY(-2px);
  border-color: #1890ff;
  box-shadow: 0 4px 12px rgba(24, 144, 255, 0.15);
}

.setting-card.mobile-setting-card {
  padding: 12px;
}

.setting-icon {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: white;
  border-radius: 8px;
  font-size: 20px;
  flex-shrink: 0;
}

.setting-info {
  flex: 1;
  min-width: 0;
}

.setting-world {
  font-size: 12px;
  color: #888;
  margin-bottom: 6px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.setting-name {
  font-size: 14px;
  color: #333;
  font-weight: 500;
  display: flex;
  align-items: center;
}

.setting-arrow {
  color: #999;
  font-size: 18px;
  flex-shrink: 0;
}

.mobile-reading-tips {
  position: fixed;
  bottom: calc(60px + var(--safe-area-inset-bottom));
  left: 50%;
  transform: translateX(-50%);
  background: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 12px;
  z-index: 50;
  white-space: nowrap;
  transition: opacity 0.3s, transform 0.3s;
}

.mobile-reading-tips.tips-hidden {
  opacity: 0;
  transform: translateX(-50%) translateY(20px);
  pointer-events: none;
}

.tip-icon {
  margin-right: 4px;
}

.comments-section {
  margin-top: 40px;
  padding-bottom: 40px;
}

.comments-section.mobile-comments {
  margin-top: 24px;
  padding-bottom: 0;
}

.mobile-comments-header {
  font-size: 16px;
  font-weight: 500;
  color: #333;
  padding: 12px 0;
  border-top: 1px solid #f0f0f0;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
