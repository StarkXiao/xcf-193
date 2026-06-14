<template>
  <div class="user-creations">
    <div class="page-header">
      <h1 class="page-title">✏️ 创作记录</h1>
      <p class="page-desc">管理你创作的故事和世界设定</p>
    </div>

    <n-tabs v-model:value="activeTab" type="line" size="large" class="creation-tabs">
      <n-tab-pane name="stories" tab="📖 我的故事">
        <div class="tab-content">
          <div class="toolbar">
            <n-radio-group v-model:value="storySort" size="medium" @update:value="loadStories">
              <n-radio-button value="newest">最新创作</n-radio-button>
              <n-radio-button value="popular">最受欢迎</n-radio-button>
            </n-radio-group>
            <n-button type="primary" @click="goToStoryEditor">
              <template #icon>✏️</template>
              创作新故事
            </n-button>
          </div>

          <n-spin :show="loadingStories" size="large">
            <div v-if="stories.length > 0" class="stories-list">
              <n-card 
                v-for="story in stories" 
                :key="story.id"
                hoverable
                class="creation-item"
              >
                <div class="item-cover">{{ story.cover }}</div>
                <div class="item-content">
                  <div class="item-header">
                    <h3 class="item-title" @click="openStory(story.id)">{{ story.title }}</h3>
                    <n-tag :type="story.status === 'ongoing' ? 'success' : 'default'" size="small">
                      {{ story.status === 'ongoing' ? '连载中' : '已完结' }}
                    </n-tag>
                  </div>
                  <p class="item-summary">{{ story.summary }}</p>
                  <div class="item-tags">
                    <n-tag 
                      v-for="tag in story.tags" 
                      :key="tag" 
                      size="small" 
                      type="primary"
                      style="margin-right: 6px;"
                    >
                      {{ tag }}
                    </n-tag>
                  </div>
                  <div class="item-meta">
                    <span>❤️ {{ story.likes }} 点赞</span>
                    <span>👁️ {{ story.views }} 阅读</span>
                    <span>📅 创建于 {{ story.createdAt }}</span>
                    <span>🔄 更新于 {{ story.updatedAt }}</span>
                  </div>
                </div>
                <div class="item-actions">
                  <n-button size="small" type="primary" @click="editStory(story.id)">
                    <template #icon>✏️</template>
                    编辑
                  </n-button>
                  <n-button size="small" @click="openStory(story.id)">
                    <template #icon>👁️</template>
                    预览
                  </n-button>
                </div>
              </n-card>
            </div>
            <div v-else class="empty-state">
              <div class="empty-icon">📝</div>
              <p>还没有创作故事，开始你的第一个创作吧！</p>
              <n-button type="primary" @click="goToStoryEditor">
                <template #icon>✏️</template>
                创作新故事
              </n-button>
            </div>
          </n-spin>
        </div>
      </n-tab-pane>

      <n-tab-pane name="worlds" tab="🌍 我的世界设定">
        <div class="tab-content">
          <div class="toolbar">
            <n-radio-group v-model:value="worldSort" size="medium" @update:value="loadWorlds">
              <n-radio-button value="newest">最新创作</n-radio-button>
              <n-radio-button value="popular">最受欢迎</n-radio-button>
            </n-radio-group>
            <n-button type="primary" @click="goToWorldEditor">
              <template #icon>🌍</template>
              新建世界设定
            </n-button>
          </div>

          <n-spin :show="loadingWorlds" size="large">
            <div v-if="worlds.length > 0" class="worlds-list">
              <n-card 
                v-for="world in worlds" 
                :key="world.id"
                hoverable
                class="creation-item"
              >
                <div class="item-cover world-cover">{{ world.cover }}</div>
                <div class="item-content">
                  <div class="item-header">
                    <h3 class="item-title" @click="openWorld(world.id)">{{ world.name }}</h3>
                  </div>
                  <p class="item-summary">{{ world.description }}</p>
                  <div class="item-meta">
                    <span>📝 {{ world.entries?.length || 0 }} 条目</span>
                    <span>❤️ {{ world.likes }} 点赞</span>
                    <span>📅 创建于 {{ world.createdAt }}</span>
                  </div>
                </div>
                <div class="item-actions">
                  <n-button size="small" type="primary" @click="editWorld(world.id)">
                    <template #icon>✏️</template>
                    编辑
                  </n-button>
                  <n-button size="small" @click="openWorld(world.id)">
                    <template #icon>👁️</template>
                    查看
                  </n-button>
                </div>
              </n-card>
            </div>
            <div v-else class="empty-state">
              <div class="empty-icon">🌍</div>
              <p>还没有创建世界设定，开始构建你的幻想世界吧！</p>
              <n-button type="primary" @click="goToWorldEditor">
                <template #icon>🌍</template>
                新建世界设定
              </n-button>
            </div>
          </n-spin>
        </div>
      </n-tab-pane>
    </n-tabs>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { NButton, NCard, NTag, NTabs, NTabPane, NRadioGroup, NRadioButton, NSpin } from 'naive-ui'
import { userApi } from '../api'

const router = useRouter()
const userId = 'user-1'

const activeTab = ref('stories')
const storySort = ref('newest')
const worldSort = ref('newest')
const stories = ref([])
const worlds = ref([])
const loadingStories = ref(false)
const loadingWorlds = ref(false)

const loadStories = async () => {
  loadingStories.value = true
  try {
    const res = await userApi.getUserStories(userId, { sort: storySort.value })
    stories.value = res.data.stories
  } catch (err) {
    console.error('加载故事失败:', err)
  } finally {
    loadingStories.value = false
  }
}

const loadWorlds = async () => {
  loadingWorlds.value = true
  try {
    const res = await userApi.getUserWorlds(userId, { sort: worldSort.value })
    worlds.value = res.data.worlds
  } catch (err) {
    console.error('加载世界设定失败:', err)
  } finally {
    loadingWorlds.value = false
  }
}

const openStory = (id) => {
  router.push(`/story/${id}`)
}

const openWorld = (id) => {
  router.push(`/world/${id}`)
}

const editStory = (id) => {
  router.push(`/editor/${id}`)
}

const editWorld = (id) => {
  router.push(`/world-editor/${id}`)
}

const goToStoryEditor = () => {
  router.push('/editor')
}

const goToWorldEditor = () => {
  router.push('/world-editor')
}

watch(activeTab, (newVal) => {
  if (newVal === 'stories' && stories.value.length === 0) {
    loadStories()
  } else if (newVal === 'worlds' && worlds.value.length === 0) {
    loadWorlds()
  }
})

onMounted(() => {
  loadStories()
})
</script>

<style scoped>
.user-creations {
  padding-bottom: 40px;
}

.page-header {
  margin-bottom: 30px;
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
}

.creation-tabs {
  margin-bottom: 20px;
}

.tab-content {
  padding-top: 20px;
}

.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  flex-wrap: wrap;
  gap: 16px;
}

.stories-list,
.worlds-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.creation-item {
  display: flex;
  gap: 20px;
  align-items: center;
  transition: transform 0.3s;
}

.creation-item:hover {
  transform: translateX(4px);
}

.item-cover {
  font-size: 40px;
  width: 80px;
  height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #f0e6ff 0%, #e0ccff 100%);
  border-radius: 12px;
  flex-shrink: 0;
}

.world-cover {
  background: linear-gradient(135deg, #e6f7ff 0%, #bae7ff 100%);
}

.item-content {
  flex: 1;
  min-width: 0;
}

.item-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 8px;
}

.item-title {
  font-size: 18px;
  margin: 0;
  color: #333;
  cursor: pointer;
  transition: color 0.2s;
}

.item-title:hover {
  color: #9d4edd;
}

.item-summary {
  font-size: 14px;
  color: #666;
  line-height: 1.6;
  margin: 0 0 10px 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.item-tags {
  margin-bottom: 10px;
}

.item-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  font-size: 12px;
  color: #999;
}

.item-actions {
  display: flex;
  flex-direction: column;
  gap: 8px;
  flex-shrink: 0;
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
  color: #999;
  margin-bottom: 20px;
  font-size: 14px;
}
</style>
