<template>
  <div class="home">
    <div class="hero-section">
      <div class="hero-content">
        <h1 class="hero-title">浮城回声</h1>
        <p class="hero-subtitle">幻想恋爱叙事社区</p>
        <p class="hero-desc">在云端之城，编织属于你的浪漫故事</p>
        <div class="hero-actions">
          <n-button type="primary" size="large" @click="goToEditor">
            <template #icon>✏️</template>
            开始创作
          </n-button>
          <n-button size="large" @click="scrollToStories">
            <template #icon>📖</template>
            浏览故事
          </n-button>
        </div>
      </div>
      <div class="hero-decoration">
        <span class="deco-icon">🏰</span>
        <span class="deco-icon">⭐</span>
        <span class="deco-icon">🌙</span>
        <span class="deco-icon">🦊</span>
        <span class="deco-icon">🚀</span>
      </div>
    </div>

    <div class="filter-section" ref="storiesSection">
      <div class="section-header">
        <h2 class="section-title">📚 故事广场</h2>
        <div class="filter-tabs">
          <n-radio-group v-model:value="sortBy" size="medium" @update:value="loadStories">
            <n-radio-button value="newest">最新</n-radio-button>
            <n-radio-button value="popular">热门</n-radio-button>
          </n-radio-group>
        </div>
      </div>
      
      <div class="tags-filter">
        <n-tag 
          v-for="tag in allTags" 
          :key="tag"
          :type="selectedTag === tag ? 'primary' : 'default'"
          :checkable="true"
          :checked="selectedTag === tag"
          @click="toggleTag(tag)"
          style="margin-right: 8px; margin-bottom: 8px; cursor: pointer;"
        >
          {{ tag }}
        </n-tag>
      </div>
    </div>

    <n-spin :show="loading" size="large">
      <div class="stories-grid">
        <n-card 
          v-for="story in stories" 
          :key="story.id"
          hoverable
          class="story-card"
          @click="openStory(story.id)"
        >
          <div class="story-cover">{{ story.cover }}</div>
          <div class="story-info">
            <h3 class="story-title">{{ story.title }}</h3>
            <p class="story-summary">{{ story.summary }}</p>
            <div class="story-tags">
              <n-tag 
                v-for="tag in story.tags" 
                :key="tag" 
                size="small" 
                type="primary"
                style="margin-right: 4px;"
              >
                {{ tag }}
              </n-tag>
            </div>
            <div class="story-meta">
              <span class="meta-item">
                <span class="meta-icon">👤</span>
                {{ story.authorName }}
              </span>
              <span class="meta-item">
                <span class="meta-icon">❤️</span>
                {{ story.likes }}
              </span>
              <span class="meta-item">
                <span class="meta-icon">👁️</span>
                {{ story.views }}
              </span>
            </div>
          </div>
        </n-card>
      </div>
    </n-spin>

    <div v-if="stories.length === 0 && !loading" class="empty-state">
      <div class="empty-icon">📝</div>
      <p>还没有故事，快来创作第一个吧！</p>
      <n-button type="primary" @click="goToEditor">
        <template #icon>✏️</template>
        开始创作
      </n-button>
    </div>

    <div class="worlds-preview">
      <div class="section-header">
        <h2 class="section-title">🌍 世界设定库</h2>
        <n-button text type="primary" @click="goToWorlds">查看全部 →</n-button>
      </div>
      <div class="worlds-row">
        <n-card 
          v-for="world in worlds" 
          :key="world.id"
          hoverable
          class="world-card"
          @click="openWorld(world.id)"
        >
          <div class="world-cover">{{ world.cover }}</div>
          <div class="world-info">
            <h3 class="world-name">{{ world.name }}</h3>
            <p class="world-desc">{{ world.description }}</p>
            <div class="world-meta">
              <span>📝 {{ world.entries?.length || 0 }} 条目</span>
              <span>❤️ {{ world.likes }}</span>
            </div>
          </div>
        </n-card>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { NButton, NCard, NTag, NRadioGroup, NRadioButton, NSpin } from 'naive-ui'
import { storyApi, worldApi } from '../api'

const router = useRouter()

const stories = ref([])
const worlds = ref([])
const loading = ref(false)
const sortBy = ref('newest')
const selectedTag = ref('')
const allTags = ['奇幻', '恋爱', '冒险', '科幻', '百合', '治愈', '古风']

const storiesSection = ref(null)

const loadStories = async () => {
  loading.value = true
  try {
    const params = { sort: sortBy.value }
    if (selectedTag.value) {
      params.tag = selectedTag.value
    }
    const res = await storyApi.getStories(params)
    stories.value = res.data.stories
  } catch (err) {
    console.error('加载故事失败:', err)
  } finally {
    loading.value = false
  }
}

const loadWorlds = async () => {
  try {
    const res = await worldApi.getWorlds({ sort: 'popular', limit: 3 })
    worlds.value = res.data.worlds
  } catch (err) {
    console.error('加载世界设定失败:', err)
  }
}

const toggleTag = (tag) => {
  if (selectedTag.value === tag) {
    selectedTag.value = ''
  } else {
    selectedTag.value = tag
  }
  loadStories()
}

const openStory = (id) => {
  router.push(`/story/${id}`)
}

const openWorld = (id) => {
  router.push(`/world/${id}`)
}

const goToEditor = () => {
  router.push('/editor')
}

const goToWorlds = () => {
  router.push('/worlds')
}

const scrollToStories = () => {
  storiesSection.value?.scrollIntoView({ behavior: 'smooth' })
}

onMounted(() => {
  loadStories()
  loadWorlds()
})
</script>

<style scoped>
.home {
  padding-bottom: 40px;
}

.hero-section {
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
  border-radius: 20px;
  padding: 60px 40px;
  margin-bottom: 40px;
  position: relative;
  overflow: hidden;
}

.hero-content {
  position: relative;
  z-index: 2;
  max-width: 500px;
}

.hero-title {
  font-size: 48px;
  font-weight: bold;
  background: linear-gradient(135deg, #e0aaff 0%, #c77dff 50%, #9d4edd 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin: 0 0 10px 0;
}

.hero-subtitle {
  font-size: 24px;
  color: #c77dff;
  margin: 0 0 16px 0;
}

.hero-desc {
  font-size: 16px;
  color: #e0e0e0;
  margin: 0 0 30px 0;
  line-height: 1.6;
}

.hero-actions {
  display: flex;
  gap: 16px;
}

.hero-decoration {
  position: absolute;
  right: 40px;
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.deco-icon {
  font-size: 40px;
  opacity: 0.6;
  animation: float 3s ease-in-out infinite;
}

.deco-icon:nth-child(2) { animation-delay: 0.5s; }
.deco-icon:nth-child(3) { animation-delay: 1s; }
.deco-icon:nth-child(4) { animation-delay: 1.5s; }
.deco-icon:nth-child(5) { animation-delay: 2s; }

@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}

.filter-section {
  margin-bottom: 20px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.section-title {
  font-size: 24px;
  margin: 0;
  color: #333;
}

.tags-filter {
  display: flex;
  flex-wrap: wrap;
  margin-bottom: 20px;
}

.stories-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}

.story-card {
  cursor: pointer;
  transition: transform 0.3s, box-shadow 0.3s;
}

.story-card:hover {
  transform: translateY(-4px);
}

.story-cover {
  font-size: 60px;
  text-align: center;
  padding: 30px 0;
  background: linear-gradient(135deg, #f0e6ff 0%, #e0ccff 100%);
  border-radius: 8px;
  margin-bottom: 16px;
}

.story-title {
  font-size: 18px;
  margin: 0 0 8px 0;
  color: #333;
}

.story-summary {
  font-size: 14px;
  color: #666;
  line-height: 1.6;
  margin: 0 0 12px 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.story-tags {
  margin-bottom: 12px;
}

.story-meta {
  display: flex;
  gap: 16px;
  font-size: 13px;
  color: #999;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 4px;
}

.meta-icon {
  font-size: 14px;
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
}

.empty-icon {
  font-size: 64px;
  margin-bottom: 16px;
}

.empty-state p {
  color: #999;
  margin-bottom: 20px;
}

.worlds-preview {
  margin-top: 60px;
}

.worlds-row {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
}

.world-card {
  cursor: pointer;
}

.world-cover {
  font-size: 48px;
  text-align: center;
  padding: 20px 0;
  background: linear-gradient(135deg, #e6f7ff 0%, #bae7ff 100%);
  border-radius: 8px;
  margin-bottom: 12px;
}

.world-name {
  font-size: 16px;
  margin: 0 0 8px 0;
}

.world-desc {
  font-size: 13px;
  color: #666;
  margin: 0 0 10px 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.world-meta {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: #999;
}
</style>
