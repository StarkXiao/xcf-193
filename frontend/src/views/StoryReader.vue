<template>
  <div class="story-reader">
    <div class="reader-header">
      <n-button text @click="goBack">
        <template #icon>←</template>
        返回
      </n-button>
      <div class="story-title-section" v-if="story">
        <h1 class="story-title">{{ story.title }}</h1>
        <div class="story-author">作者：{{ story.authorName }}</div>
      </div>
      <div class="header-actions">
        <n-button text @click="toggleFavorite" :class="{ 'is-favorited': isFavorited }">
          <template #icon>{{ isFavorited ? '⭐' : ' ☆' }}</template>
          {{ isFavorited ? '已收藏' : '收藏' }}
        </n-button>
        <n-button text @click="toggleLike">
          <template #icon>{{ isLiked ? '❤️' : '🤍' }}</template>
          {{ story?.likes || 0 }}
        </n-button>
      </div>
    </div>

    <div class="reader-container">
      <n-spin :show="loading" size="large">
        <div v-if="currentNode" class="node-content">
          <div class="node-header">
            <h2 class="node-title">{{ currentNode.title }}</h2>
            <div v-if="currentNode.isEnding" class="ending-badge" :class="currentNode.endingType">
              <span v-if="currentNode.endingType === 'good'">✨ 完美结局</span>
              <span v-else-if="currentNode.endingType === 'normal'">🌟 普通结局</span>
              <span v-else-if="currentNode.endingType === 'bad'">💔 遗憾结局</span>
            </div>
          </div>

          <div class="story-text">
            <p v-for="(paragraph, index) in paragraphs" :key="index" class="story-paragraph">
              {{ paragraph }}
            </p>
          </div>

          <div v-if="!currentNode.isEnding && currentNode.choices?.length > 0" class="choices-section">
            <div class="choices-label">请选择你的行动：</div>
            <div class="choices-list">
              <n-button 
                v-for="choice in currentNode.choices" 
                :key="choice.id"
                type="primary"
                ghost
                block
                class="choice-btn"
                @click="makeChoice(choice)"
              >
                {{ choice.text }}
              </n-button>
            </div>
          </div>

          <div v-if="currentNode.isEnding" class="ending-actions">
            <p class="ending-text">恭喜你达成了一个结局！</p>
            <div class="ending-buttons">
              <n-button @click="restartStory">
                <template #icon>🔄</template>
                重新开始
              </n-button>
              <n-button type="primary" @click="goBack">
                <template #icon>📚</template>
                查看其他故事
              </n-button>
            </div>
          </div>

          <div v-if="history.length > 1" class="history-section">
            <n-divider>阅读进度</n-divider>
            <div class="history-trail">
              <span 
                v-for="(node, index) in history" 
                :key="node.id"
                class="history-node"
                :class="{ active: index === history.length - 1 }"
                @click="jumpToNode(index)"
              >
                {{ node.title }}
              </span>
            </div>
          </div>
        </div>
      </n-spin>
    </div>

    <div class="comments-section">
      <n-divider>评论互动</n-divider>
      <CommentSection :story-id="storyId" :node-id="currentNodeId" />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { NButton, NSpin, NDivider, useMessage } from 'naive-ui'
import { storyApi, userApi } from '../api'
import CommentSection from '../components/CommentSection.vue'

const route = useRoute()
const router = useRouter()
const message = useMessage()
const userId = 'user-1'

const storyId = computed(() => route.params.id)
const story = ref(null)
const currentNode = ref(null)
const currentNodeId = ref('')
const loading = ref(false)
const history = ref([])
const isLiked = ref(false)
const isFavorited = ref(false)
const allNodes = ref([])

const paragraphs = computed(() => {
  if (!currentNode.value?.content) return []
  return currentNode.value.content.split('\n').filter(p => p.trim())
})

const loadStory = async () => {
  loading.value = true
  try {
    const [storyRes, nodesRes] = await Promise.all([
      storyApi.getStory(storyId.value),
      storyApi.getStoryNodes(storyId.value)
    ])
    story.value = storyRes.data
    allNodes.value = nodesRes.data
    
    if (story.value.startNodeId) {
      const startNode = nodesRes.data.find(n => n.id === story.value.startNodeId)
      if (startNode) {
        currentNode.value = startNode
        currentNodeId.value = startNode.id
        history.value = [startNode]
      }
    }
    
    storyApi.viewStory(storyId.value)
    checkFavorite()
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
        targetType: 'story'
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
    currentNode.value = nextNode
    currentNodeId.value = nextNode.id
    history.value.push(nextNode)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
}

const jumpToNode = (index) => {
  if (index < history.value.length) {
    history.value = history.value.slice(0, index + 1)
    currentNode.value = history.value[index]
    currentNodeId.value = history.value[index].id
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
}

const restartStory = () => {
  if (story.value?.startNodeId) {
    const startNode = allNodes.value.find(n => n.id === story.value.startNodeId)
    if (startNode) {
      currentNode.value = startNode
      currentNodeId.value = startNode.id
      history.value = [startNode]
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }
}

const toggleLike = async () => {
  try {
    const res = await storyApi.likeStory(storyId.value)
    if (story.value) {
      story.value.likes = res.data.likes
    }
    isLiked.value = true
  } catch (err) {
    console.error('点赞失败:', err)
  }
}

const goBack = () => {
  router.push('/')
}

onMounted(() => {
  loadStory()
})
</script>

<style scoped>
.story-reader {
  max-width: 800px;
  margin: 0 auto;
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
}

.story-title-section {
  text-align: center;
  flex: 1;
}

.story-title {
  font-size: 20px;
  margin: 0 0 4px 0;
  color: #333;
}

.story-author {
  font-size: 13px;
  color: #999;
}

.header-actions {
  min-width: 80px;
  text-align: right;
  display: flex;
  gap: 8px;
  align-items: center;
}

.header-actions .is-favorited {
  color: #f0a020;
}

.reader-container {
  padding: 30px 0;
}

.node-header {
  text-align: center;
  margin-bottom: 30px;
}

.node-title {
  font-size: 24px;
  margin: 0 0 12px 0;
  color: #333;
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
  background: linear-gradient(135deg, #fafafa 0%, #f5f5f5 100%);
  padding: 40px;
  border-radius: 16px;
  margin-bottom: 30px;
}

.story-paragraph {
  font-size: 16px;
  line-height: 2;
  color: #444;
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

.ending-actions {
  text-align: center;
  margin-top: 40px;
  padding: 30px;
  background: linear-gradient(135deg, #f9f0ff 0%, #f0e6ff 100%);
  border-radius: 16px;
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

.history-section {
  margin-top: 40px;
}

.history-trail {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  justify-content: center;
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

.comments-section {
  margin-top: 40px;
  padding-bottom: 40px;
}
</style>
