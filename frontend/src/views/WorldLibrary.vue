<template>
  <div class="world-library">
    <div class="library-header">
      <div>
        <h1 class="page-title">🌍 世界设定库</h1>
        <p class="page-desc">探索奇幻世界的设定，或者创建属于你自己的世界观</p>
      </div>
      <n-button type="primary" size="large" @click="goToEditor">
        <template #icon>✏️</template>
        创建新世界
      </n-button>
    </div>

    <div class="filter-bar">
      <n-radio-group v-model:value="sortBy" size="medium" @update:value="loadWorlds">
        <n-radio-button value="newest">最新</n-radio-button>
        <n-radio-button value="popular">热门</n-radio-button>
      </n-radio-group>
    </div>

    <n-spin :show="loading" size="large">
      <div class="worlds-grid">
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
            <div class="world-stats">
              <span class="stat-item">
                <span class="stat-icon">📝</span>
                {{ world.entries?.length || 0 }} 条目
              </span>
              <span class="stat-item">
                <span class="stat-icon">❤️</span>
                {{ world.likes }}
              </span>
            </div>
            <div class="world-author">
              <span class="author-label">作者：</span>
              <span>{{ world.authorName }}</span>
            </div>
          </div>
        </n-card>
      </div>
    </n-spin>

    <div v-if="worlds.length === 0 && !loading" class="empty-state">
      <div class="empty-icon">🌍</div>
      <p>还没有世界设定</p>
      <p class="hint">创建第一个世界观，开启你的幻想之旅吧！</p>
      <n-button type="primary" @click="goToEditor">
        <template #icon>✨</template>
        开始创建
      </n-button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { NButton, NCard, NSpin, NRadioGroup, NRadioButton } from 'naive-ui'
import { worldApi } from '../api'

const router = useRouter()

const worlds = ref([])
const loading = ref(false)
const sortBy = ref('popular')

const loadWorlds = async () => {
  loading.value = true
  try {
    const res = await worldApi.getWorlds({ sort: sortBy.value })
    worlds.value = res.data.worlds
  } catch (err) {
    console.error('加载世界设定失败:', err)
  } finally {
    loading.value = false
  }
}

const openWorld = (id) => {
  router.push(`/world/${id}`)
}

const goToEditor = () => {
  router.push('/world-editor')
}

onMounted(() => {
  loadWorlds()
})
</script>

<style scoped>
.world-library {
  padding-bottom: 40px;
}

.library-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-bottom: 24px;
  padding: 30px;
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
  border-radius: 16px;
  color: white;
}

.page-title {
  font-size: 28px;
  margin: 0 0 8px 0;
}

.page-desc {
  margin: 0;
  color: #c77dff;
  font-size: 14px;
}

.filter-bar {
  margin-bottom: 24px;
}

.worlds-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
}

.world-card {
  cursor: pointer;
  transition: transform 0.3s, box-shadow 0.3s;
}

.world-card:hover {
  transform: translateY(-4px);
}

.world-cover {
  font-size: 56px;
  text-align: center;
  padding: 30px 0;
  background: linear-gradient(135deg, #e6f7ff 0%, #bae7ff 100%);
  border-radius: 8px;
  margin-bottom: 16px;
}

.world-name {
  font-size: 18px;
  margin: 0 0 8px 0;
  color: #333;
}

.world-desc {
  font-size: 14px;
  color: #666;
  line-height: 1.6;
  margin: 0 0 12px 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.world-stats {
  display: flex;
  gap: 16px;
  margin-bottom: 12px;
  font-size: 13px;
  color: #999;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 4px;
}

.stat-icon {
  font-size: 14px;
}

.world-author {
  font-size: 13px;
  color: #999;
  padding-top: 12px;
  border-top: 1px solid #f0f0f0;
}

.author-label {
  color: #bbb;
}

.empty-state {
  text-align: center;
  padding: 80px 20px;
}

.empty-icon {
  font-size: 80px;
  margin-bottom: 20px;
}

.empty-state p {
  color: #666;
  margin: 8px 0;
}

.empty-state .hint {
  font-size: 14px;
  color: #999;
  margin-bottom: 24px;
}
</style>
