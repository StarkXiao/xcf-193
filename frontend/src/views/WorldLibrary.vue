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

    <div class="filter-toolbar">
      <div class="filter-left">
        <n-input
          v-model:value="keyword"
          placeholder="搜索世界名称、描述、作者或设定条目..."
          class="search-input"
          clearable
          size="medium"
          @keyup.enter="loadWorlds"
          @update:value="onKeywordChange"
        >
          <template #prefix>🔍</template>
        </n-input>
      </div>
      <div class="filter-right">
        <n-select
          v-model:value="sortBy"
          :options="sortOptions"
          size="medium"
          style="width: 140px"
          @update:value="loadWorlds"
        />
      </div>
    </div>

    <div class="category-filter" v-if="allCategories.length > 0">
      <n-tag
        :type="selectedCategory === null ? 'primary' : 'default'"
        :checkable="true"
        :checked="selectedCategory === null"
        class="category-tag"
        @click="selectCategory(null)"
      >
        全部分类
      </n-tag>
      <n-tag
        v-for="cat in allCategories"
        :key="cat"
        :type="selectedCategory === cat ? 'primary' : 'default'"
        :checkable="true"
        :checked="selectedCategory === cat"
        class="category-tag"
        @click="selectCategory(cat)"
      >
        {{ cat }}
      </n-tag>
    </div>

    <div v-if="total > 0" class="result-info">
      共找到 <span class="highlight">{{ total }}</span> 个世界设定
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
            <h3 class="world-name" :title="world.name">{{ world.name }}</h3>
            <p class="world-desc" :title="world.description">{{ world.description }}</p>
            <div class="world-categories" v-if="world.entries && world.entries.length > 0">
              <n-tag
                v-for="cat in getWorldCategories(world.entries).slice(0, 3)"
                :key="cat"
                size="small"
                type="info"
                class="cat-tag"
              >
                {{ cat }}
              </n-tag>
              <n-tag
                v-if="getWorldCategories(world.entries).length > 3"
                size="small"
                type="default"
                class="cat-tag"
              >
                +{{ getWorldCategories(world.entries).length - 3 }}
              </n-tag>
            </div>
            <div class="world-stats">
              <span class="stat-item">
                <span class="stat-icon">📝</span>
                {{ world.entries?.length || 0 }} 条目
              </span>
              <span class="stat-item">
                <span class="stat-icon">❤️</span>
                {{ world.likes }}
              </span>
              <span class="stat-item">
                <span class="stat-icon">📅</span>
                {{ world.createdAt }}
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
      <div class="empty-icon">{{ keyword || selectedCategory ? '🔍' : '🌍' }}</div>
      <p>{{ keyword || selectedCategory ? '没有找到匹配的世界设定' : '还没有世界设定' }}</p>
      <p class="hint">
        {{ keyword || selectedCategory ? '试试换个搜索词或分类' : '创建第一个世界观，开启你的幻想之旅吧！' }}
      </p>
      <n-space justify="center">
        <n-button v-if="keyword || selectedCategory" @click="resetFilters">
          重置筛选
        </n-button>
        <n-button type="primary" @click="goToEditor">
          <template #icon>✨</template>
          {{ keyword || selectedCategory ? '去创建' : '开始创建' }}
        </n-button>
      </n-space>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { NButton, NCard, NSpin, NInput, NSelect, NTag, NSpace } from 'naive-ui'
import { worldApi } from '../api'

const router = useRouter()

const worlds = ref([])
const total = ref(0)
const loading = ref(false)
const sortBy = ref('popular')
const keyword = ref('')
const selectedCategory = ref(null)
const allCategories = ref([])

let searchTimer = null

const sortOptions = [
  { label: '🔥 最热门', value: 'popular' },
  { label: '🕐 最新创建', value: 'newest' },
  { label: '📚 条目最多', value: 'entries' },
  { label: '🔤 名称排序', value: 'name' }
]

const onKeywordChange = () => {
  if (searchTimer) clearTimeout(searchTimer)
  searchTimer = setTimeout(() => {
    loadWorlds()
  }, 300)
}

const selectCategory = (cat) => {
  selectedCategory.value = cat
  loadWorlds()
}

const getWorldCategories = (entries) => {
  return [...new Set(entries.map(e => e.category))]
}

const loadCategories = async () => {
  try {
    const res = await worldApi.getWorldCategories()
    allCategories.value = res.data.categories
  } catch (err) {
    console.error('加载分类失败:', err)
  }
}

const loadWorlds = async () => {
  loading.value = true
  try {
    const params = { sort: sortBy.value }
    if (keyword.value) params.keyword = keyword.value
    if (selectedCategory.value) params.category = selectedCategory.value
    const res = await worldApi.getWorlds(params)
    worlds.value = res.data.worlds
    total.value = res.data.total
  } catch (err) {
    console.error('加载世界设定失败:', err)
  } finally {
    loading.value = false
  }
}

const resetFilters = () => {
  keyword.value = ''
  selectedCategory.value = null
  loadWorlds()
}

const openWorld = (id) => {
  router.push(`/world/${id}`)
}

const goToEditor = () => {
  router.push('/world-editor')
}

onMounted(() => {
  loadCategories()
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

.filter-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  margin-bottom: 16px;
  flex-wrap: wrap;
}

.filter-left {
  flex: 1;
  min-width: 280px;
}

.search-input {
  max-width: 500px;
}

.filter-right {
  flex-shrink: 0;
}

.category-filter {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 16px;
  padding: 12px 16px;
  background: #fafafa;
  border-radius: 12px;
}

.category-tag {
  cursor: pointer;
  transition: all 0.2s;
}

.category-tag:hover {
  opacity: 0.85;
}

.result-info {
  margin-bottom: 16px;
  font-size: 14px;
  color: #666;
}

.result-info .highlight {
  color: #9d4edd;
  font-weight: 600;
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
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
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

.world-categories {
  margin-bottom: 12px;
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.cat-tag {
  cursor: default;
}

.world-stats {
  display: flex;
  gap: 12px;
  margin-bottom: 12px;
  font-size: 12px;
  color: #999;
  flex-wrap: wrap;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 4px;
}

.stat-icon {
  font-size: 13px;
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
