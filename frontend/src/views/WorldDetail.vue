<template>
  <div class="world-detail">
    <div class="detail-header">
      <n-button text @click="goBack">
        <template #icon>←</template>
        返回列表
      </n-button>
    </div>

    <n-spin :show="loading" size="large">
      <div v-if="world" class="world-content">
        <div class="world-header-card">
          <div class="world-cover-large">{{ world.cover }}</div>
          <div class="world-main-info">
            <h1 class="world-title">{{ world.name }}</h1>
            <p class="world-desc">{{ world.description }}</p>
            <div class="world-meta">
              <span class="meta-item">
                <span class="meta-icon">👤</span>
                {{ world.authorName }}
              </span>
              <span class="meta-item">
                <span class="meta-icon">📝</span>
                {{ world.entries?.length || 0 }} 条目
              </span>
              <span class="meta-item">
                <span class="meta-icon">❤️</span>
                {{ world.likes }}
              </span>
            </div>
            <div class="world-actions">
              <n-button :type="isFavorited ? 'warning' : 'default'" @click="toggleFavorite">
                <template #icon>{{ isFavorited ? '⭐' : '☆' }}</template>
                {{ isFavorited ? '已收藏' : '收藏' }}
              </n-button>
              <n-button type="primary" @click="toggleLike">
                <template #icon>{{ isLiked ? '❤️' : '🤍' }}</template>
                {{ isLiked ? '已喜欢' : '喜欢' }}
              </n-button>
              <n-button @click="goToEditor">
                <template #icon>✏️</template>
                编辑
              </n-button>
              <n-button type="info" @click="goToCollaboration">
                <template #icon>🤝</template>
                共创管理
              </n-button>
            </div>
          </div>
        </div>

        <div class="entries-section">
          <div class="section-header">
            <h2 class="section-title">📚 设定条目</h2>
            <div class="category-filter">
              <n-tag 
                v-for="cat in categories" 
                :key="cat"
                :type="selectedCategory === cat ? 'primary' : 'default'"
                :checkable="true"
                :checked="selectedCategory === cat"
                @click="toggleCategory(cat)"
                style="margin-right: 8px; cursor: pointer;"
              >
                {{ cat }}
              </n-tag>
            </div>
          </div>

          <div class="entries-grid">
            <n-card 
              v-for="entry in filteredEntries" 
              :key="entry.id"
              hoverable
              class="entry-card"
              @click="selectedEntry = entry"
            >
              <n-tag size="small" type="primary" class="entry-category">
                {{ entry.category }}
              </n-tag>
              <h3 class="entry-title">{{ entry.title }}</h3>
              <p class="entry-content-preview">{{ entry.content }}</p>
            </n-card>
          </div>

          <div v-if="filteredEntries.length === 0" class="empty-entries">
            <div class="empty-icon">📝</div>
            <p>暂无相关条目</p>
          </div>
        </div>
      </div>
    </n-spin>

    <n-modal 
      v-model:show="showEntryModal" 
      preset="card"
      :title="selectedEntry?.title || ''"
      style="width: 600px"
    >
      <div v-if="selectedEntry" class="entry-detail">
        <n-tag type="primary" style="margin-bottom: 16px;">
          {{ selectedEntry.category }}
        </n-tag>
        <p class="entry-detail-content">{{ selectedEntry.content }}</p>
      </div>
    </n-modal>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  NButton,
  NCard,
  NTag,
  NSpin,
  NModal,
  useMessage
} from 'naive-ui'
import { worldApi, userApi } from '../api'

const route = useRoute()
const router = useRouter()
const message = useMessage()
const userId = 'user-1'

const world = ref(null)
const loading = ref(false)
const isLiked = ref(false)
const isFavorited = ref(false)
const selectedCategory = ref('全部')
const selectedEntry = ref(null)

const showEntryModal = computed({
  get: () => !!selectedEntry.value,
  set: (val) => { if (!val) selectedEntry.value = null }
})

const categories = computed(() => {
  if (!world.value?.entries) return ['全部']
  const cats = [...new Set(world.value.entries.map(e => e.category))]
  return ['全部', ...cats]
})

const filteredEntries = computed(() => {
  if (!world.value?.entries) return []
  if (selectedCategory.value === '全部') return world.value.entries
  return world.value.entries.filter(e => e.category === selectedCategory.value)
})

const loadWorld = async () => {
  loading.value = true
  try {
    const res = await worldApi.getWorld(route.params.id)
    world.value = res.data
    checkFavorite()
  } catch (err) {
    console.error('加载世界设定失败:', err)
  } finally {
    loading.value = false
  }
}

const checkFavorite = async () => {
  try {
    const res = await userApi.checkFavorite(userId, {
      targetId: route.params.id,
      targetType: 'world'
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
        targetId: route.params.id,
        targetType: 'world'
      })
      isFavorited.value = false
      message.success('已取消收藏')
    } else {
      await userApi.addFavorite(userId, {
        targetId: route.params.id,
        targetType: 'world'
      })
      isFavorited.value = true
      message.success('已加入收藏')
    }
  } catch (err) {
    console.error('收藏操作失败:', err)
    message.error('操作失败，请重试')
  }
}

const toggleLike = async () => {
  try {
    const res = await worldApi.likeWorld(route.params.id)
    if (world.value) {
      world.value.likes = res.data.likes
    }
    isLiked.value = true
  } catch (err) {
    console.error('点赞失败:', err)
  }
}

const toggleCategory = (cat) => {
  selectedCategory.value = cat
}

const goBack = () => {
  router.push('/worlds')
}

const goToEditor = () => {
  router.push(`/world-editor/${route.params.id}`)
}

const goToCollaboration = () => {
  router.push(`/world/${route.params.id}/collaboration`)
}

onMounted(() => {
  loadWorld()
})
</script>

<style scoped>
.world-detail {
  padding-bottom: 40px;
}

.detail-header {
  margin-bottom: 20px;
}

.world-header-card {
  display: flex;
  gap: 30px;
  padding: 30px;
  background: linear-gradient(135deg, #f0f5ff 0%, #e6e6ff 100%);
  border-radius: 16px;
  margin-bottom: 30px;
}

.world-cover-large {
  width: 120px;
  height: 120px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 60px;
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  flex-shrink: 0;
}

.world-main-info {
  flex: 1;
}

.world-title {
  font-size: 28px;
  margin: 0 0 10px 0;
  color: #333;
}

.world-desc {
  font-size: 15px;
  color: #666;
  line-height: 1.6;
  margin: 0 0 16px 0;
}

.world-meta {
  display: flex;
  gap: 20px;
  margin-bottom: 20px;
  font-size: 14px;
  color: #888;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 6px;
}

.meta-icon {
  font-size: 16px;
}

.world-actions {
  display: flex;
  gap: 12px;
}

.entries-section {
  margin-top: 30px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  flex-wrap: wrap;
  gap: 12px;
}

.section-title {
  font-size: 20px;
  margin: 0;
  color: #333;
}

.category-filter {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.entries-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 16px;
}

.entry-card {
  cursor: pointer;
  transition: transform 0.2s;
}

.entry-card:hover {
  transform: translateY(-2px);
}

.entry-category {
  margin-bottom: 8px;
}

.entry-title {
  font-size: 16px;
  margin: 0 0 8px 0;
  color: #333;
}

.entry-content-preview {
  font-size: 13px;
  color: #666;
  line-height: 1.6;
  margin: 0;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.empty-entries {
  text-align: center;
  padding: 60px 20px;
  color: #999;
}

.empty-icon {
  font-size: 48px;
  margin-bottom: 12px;
}

.entry-detail-content {
  font-size: 15px;
  line-height: 1.8;
  color: #444;
  margin: 0;
}
</style>
