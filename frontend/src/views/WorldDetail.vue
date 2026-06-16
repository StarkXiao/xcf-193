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
            <div class="world-title-row">
              <h1 class="world-title">{{ world.name }}</h1>
              <n-tag v-if="world.auditStatus === 'approved'" type="success" size="small">已审核</n-tag>
              <n-tag v-else-if="world.auditStatus === 'pending'" type="warning" size="small">审核中</n-tag>
              <n-tag v-else type="default" size="small">未审核</n-tag>
            </div>
            <p class="world-desc">{{ world.description }}</p>
            
            <div class="world-categories-preview" v-if="worldCategories.length > 0">
              <span class="cat-label">包含分类：</span>
              <n-tag
                v-for="cat in worldCategories.slice(0, 6)"
                :key="cat"
                size="small"
                type="info"
                style="margin-right: 6px; margin-bottom: 4px;"
              >
                {{ cat }}
              </n-tag>
              <n-tag
                v-if="worldCategories.length > 6"
                size="small"
                type="default"
              >
                +{{ worldCategories.length - 6 }}
              </n-tag>
            </div>

            <div class="world-meta">
              <span class="meta-item" title="作者">
                <span class="meta-icon">👤</span>
                {{ world.authorName }}
              </span>
              <span class="meta-item" title="创建时间">
                <span class="meta-icon">📅</span>
                {{ world.createdAt }}
              </span>
              <span class="meta-item" title="条目数">
                <span class="meta-icon">📝</span>
                {{ totalEntries }} 条目
              </span>
              <span class="meta-item" title="分类数">
                <span class="meta-icon">🏷️</span>
                {{ worldCategories.length }} 分类
              </span>
              <span class="meta-item" title="被引用次数">
                <span class="meta-icon">🔗</span>
                {{ totalReferences }} 引用
              </span>
              <span class="meta-item" title="喜欢数">
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
              <n-button @click="showEntryReportDialog">
                <template #icon>🚨</template>
                举报
              </n-button>
            </div>
          </div>
        </div>

        <div class="entries-section">
          <div class="section-header">
            <h2 class="section-title">📚 设定条目</h2>
          </div>

          <div class="entries-toolbar">
            <div class="toolbar-left">
              <n-input
                v-model:value="entryKeyword"
                placeholder="搜索条目标题或内容..."
                clearable
                size="small"
                class="entry-search"
                @keyup.enter="loadEntries"
                @update:value="onEntryKeywordChange"
              >
                <template #prefix>🔍</template>
              </n-input>
              <n-select
                v-model:value="entrySort"
                :options="entrySortOptions"
                size="small"
                style="width: 140px"
                @update:value="loadEntries"
              />
            </div>
            <div class="result-count" v-if="totalEntries > 0">
              显示 <span class="highlight">{{ filteredEntries.length }}</span> / {{ totalEntries }} 条
            </div>
          </div>

          <div class="category-filter">
            <n-tag 
              v-for="cat in categories" 
              :key="cat"
              :type="selectedCategory === cat ? 'primary' : 'default'"
              :checkable="true"
              :checked="selectedCategory === cat"
              class="cat-tag"
              @click="toggleCategory(cat)"
            >
              {{ cat }}
              <span v-if="cat !== '全部'" class="cat-count">({{ getCategoryCount(cat) }})</span>
            </n-tag>
          </div>

          <div class="entries-grid">
            <n-card 
              v-for="entry in filteredEntries" 
              :key="entry.id"
              hoverable
              class="entry-card"
              @click="selectedEntry = entry"
            >
              <div class="entry-card-header">
                <div class="entry-card-header-left">
                  <n-tag size="small" type="primary" class="entry-category">
                    {{ entry.category }}
                  </n-tag>
                  <n-tag v-if="entry.referencedStories?.length > 0" size="small" type="info" class="entry-ref-count">
                    🔗 {{ entry.referencedStories.length }}
                  </n-tag>
                </div>
                <n-button text size="tiny" @click.stop="showSingleEntryReportDialog(entry)" class="entry-report-btn">
                  🚨
                </n-button>
              </div>
              <h3 class="entry-title" :title="entry.title">{{ entry.title }}</h3>
              <p class="entry-content-preview">{{ entry.content }}</p>
            </n-card>
          </div>

          <div v-if="filteredEntries.length === 0" class="empty-entries">
            <div class="empty-icon">{{ entryKeyword ? '🔍' : '📝' }}</div>
            <p>{{ entryKeyword ? '没有找到匹配的条目' : '暂无相关条目' }}</p>
            <p class="empty-hint" v-if="entryKeyword || selectedCategory !== '全部'">
              试试其他关键词或分类
            </p>
            <n-button v-if="entryKeyword || selectedCategory !== '全部'" size="small" @click="resetEntryFilters">
              重置筛选
            </n-button>
          </div>
        </div>
      </div>
    </n-spin>

    <n-modal 
      v-model:show="showEntryModal" 
      preset="card"
      style="width: 650px"
    >
      <template #header>
        <div class="modal-header">
          <span>{{ selectedEntry?.title || '' }}</span>
          <n-tag v-if="selectedEntry" type="primary" size="small">
            {{ selectedEntry.category }}
          </n-tag>
        </div>
      </template>
      <div v-if="selectedEntry" class="entry-detail">
        <div class="entry-detail-meta">
          <span class="meta-item" v-if="selectedEntry.referencedStories?.length > 0">
            <span class="meta-icon">🔗</span>
            被引用 {{ selectedEntry.referencedStories.length }} 次
          </span>
        </div>

        <n-divider style="margin: 16px 0;">
          <span style="font-size: 13px; color: #888;">设定内容</span>
        </n-divider>

        <div class="entry-detail-content">{{ selectedEntry.content }}</div>
        
        <n-divider v-if="selectedEntry.referencedStories?.length > 0" style="margin: 24px 0 16px 0;">
          <span style="font-size: 14px; color: #666;">📖 引用此设定的故事</span>
        </n-divider>
        
        <div v-if="selectedEntry.referencedStories?.length > 0" class="referenced-stories">
          <div 
            v-for="ref in selectedEntry.referencedStories" 
            :key="`${ref.storyId}-${ref.nodeId}`"
            class="ref-story-card"
            @click="goToStory(ref)"
          >
            <div class="ref-story-icon">📖</div>
            <div class="ref-story-info">
              <div class="ref-story-title">{{ ref.storyTitle }}</div>
              <div class="ref-story-node">章节：{{ ref.nodeTitle }}</div>
            </div>
            <div class="ref-story-arrow">→</div>
          </div>
        </div>
        
        <div v-else class="no-ref-stories" style="margin-top: 16px;">
          <n-alert type="info" :show-icon="true">
            暂无故事引用此设定
          </n-alert>
        </div>
      </div>
    </n-modal>

    <n-modal 
      v-model:show="entryReportVisible" 
      preset="dialog"
      :title="'🚨 举报：' + entryReportTargetTitle"
      :positive-text="'提交举报'"
      :negative-text="'取消'"
      @positive-click="submitEntryReport"
    >
      <div style="padding: 8px 0;">
        <p style="color: #888; font-size: 14px; margin: 0 0 12px 0;">请选择举报原因，我们将尽快审核处理</p>
        <n-select
          v-model:value="selectedEntryReportReason"
          :options="entryReportReasons.map(r => ({ label: r.label, value: r.value }))"
          placeholder="选择举报原因"
          style="margin-bottom: 12px;"
        />
        <n-input
          v-model:value="entryReportDescription"
          type="textarea"
          placeholder="补充说明（可选）..."
          :rows="3"
        />
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
  NDivider,
  NAlert,
  NInput,
  NSelect,
  useMessage
} from 'naive-ui'
import { worldApi, userApi, reportApi } from '../api'

const route = useRoute()
const router = useRouter()
const message = useMessage()
const userId = 'user-1'

const world = ref(null)
const loading = ref(false)
const loadingEntries = ref(false)
const isLiked = ref(false)
const isFavorited = ref(false)
const selectedCategory = ref('全部')
const selectedEntry = ref(null)
const entryKeyword = ref('')
const entrySort = ref('default')
const entries = ref([])
const categories = ref(['全部'])
const totalEntries = ref(0)

let entrySearchTimer = null

const entrySortOptions = [
  { label: '默认顺序', value: 'default' },
  { label: '按名称排序', value: 'title' },
  { label: '按分类排序', value: 'category' },
  { label: '引用最多', value: 'references' }
]

const showEntryModal = computed({
  get: () => !!selectedEntry.value,
  set: (val) => { if (!val) selectedEntry.value = null }
})

const worldCategories = computed(() => {
  if (!world.value?.entries) return []
  return [...new Set(world.value.entries.map(e => e.category))]
})

const totalReferences = computed(() => {
  if (!world.value?.entries) return 0
  return world.value.entries.reduce((sum, e) => sum + (e.referencedStories?.length || 0), 0)
})

const filteredEntries = computed(() => {
  return entries.value
})

const getCategoryCount = (cat) => {
  if (!world.value?.entries) return 0
  return world.value.entries.filter(e => e.category === cat).length
}

const onEntryKeywordChange = () => {
  if (entrySearchTimer) clearTimeout(entrySearchTimer)
  entrySearchTimer = setTimeout(() => {
    loadEntries()
  }, 300)
}

const toggleCategory = (cat) => {
  selectedCategory.value = cat
  loadEntries()
}

const resetEntryFilters = () => {
  entryKeyword.value = ''
  selectedCategory.value = '全部'
  loadEntries()
}

const loadWorld = async () => {
  loading.value = true
  try {
    const res = await worldApi.getWorld(route.params.id)
    world.value = res.data
    if (res.data.entries) {
      totalEntries.value = res.data.entries.length
    }
    checkFavorite()
    loadEntries()
    
    const entryId = route.query.entryId
    if (entryId && world.value?.entries) {
      const entry = world.value.entries.find(e => e.id === entryId)
      if (entry) {
        setTimeout(() => {
          selectedEntry.value = entry
        }, 300)
      }
    }
  } catch (err) {
    console.error('加载世界设定失败:', err)
  } finally {
    loading.value = false
  }
}

const loadEntries = async () => {
  if (!world.value) return
  loadingEntries.value = true
  try {
    const params = {}
    if (entryKeyword.value) params.keyword = entryKeyword.value
    if (selectedCategory.value) params.category = selectedCategory.value
    if (entrySort.value && entrySort.value !== 'default') params.sort = entrySort.value
    
    const res = await worldApi.getWorldEntries(route.params.id, params)
    entries.value = res.data.entries
    categories.value = res.data.categories
    totalEntries.value = world.value?.entries?.length || 0
  } catch (err) {
    console.error('加载条目失败:', err)
    if (world.value?.entries) {
      entries.value = world.value.entries
    }
  } finally {
    loadingEntries.value = false
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
        targetType: 'world',
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

const toggleLike = async () => {
  try {
    const res = await worldApi.likeWorld(route.params.id, {
      userId: userId,
      username: '月下独酌',
      avatar: '🌸'
    })
    if (world.value) {
      world.value.likes = res.data.likes
    }
    isLiked.value = true
  } catch (err) {
    console.error('点赞失败:', err)
  }
}

const goBack = () => {
  router.push('/worlds')
}

const entryReportVisible = ref(false)
const entryReportReasons = ref([])
const selectedEntryReportReason = ref('')
const entryReportDescription = ref('')
const entryReportTargetId = ref(null)
const entryReportTargetTitle = ref('')

const showEntryReportDialog = async () => {
  if (!world.value) return
  selectedEntryReportReason.value = ''
  entryReportDescription.value = ''
  entryReportTargetId.value = world.value.id
  entryReportTargetTitle.value = world.value.name
  entryReportVisible.value = true
  try {
    const res = await reportApi.getReasons()
    entryReportReasons.value = res.data.reasons
  } catch (err) {
    console.error('加载举报原因失败:', err)
  }
}

const showSingleEntryReportDialog = async (entry) => {
  selectedEntryReportReason.value = ''
  entryReportDescription.value = ''
  entryReportTargetId.value = entry.id
  entryReportTargetTitle.value = entry.title
  entryReportVisible.value = true
  try {
    const res = await reportApi.getReasons()
    entryReportReasons.value = res.data.reasons
  } catch (err) {
    console.error('加载举报原因失败:', err)
  }
}

const submitEntryReport = async () => {
  if (!selectedEntryReportReason.value) {
    message.warning('请选择举报原因')
    return false
  }
  try {
    await reportApi.submitReport({
      targetType: 'world_entry',
      targetId: entryReportTargetId.value,
      reason: selectedEntryReportReason.value,
      description: entryReportDescription.value,
      reporterId: 'user-1',
      reporterName: '月下独酌',
      reporterAvatar: '🌸'
    })
    message.success('举报已提交，我们会尽快处理')
    entryReportVisible.value = false
    return true
  } catch (err) {
    message.error(err.response?.data?.message || '举报提交失败')
    return false
  }
}

const goToEditor = () => {
  router.push(`/world-editor/${route.params.id}`)
}

const goToCollaboration = () => {
  router.push(`/world/${route.params.id}/collaboration`)
}

const goToStory = (ref) => {
  router.push({
    path: `/story/${ref.storyId}`,
    query: { nodeId: ref.nodeId }
  })
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
  min-width: 0;
}

.world-title-row {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
  flex-wrap: wrap;
}

.world-title {
  font-size: 28px;
  margin: 0;
  color: #333;
}

.world-desc {
  font-size: 15px;
  color: #666;
  line-height: 1.6;
  margin: 0 0 16px 0;
}

.world-categories-preview {
  margin-bottom: 16px;
}

.cat-label {
  font-size: 13px;
  color: #888;
  margin-right: 8px;
}

.world-meta {
  display: flex;
  gap: 16px;
  margin-bottom: 20px;
  font-size: 13px;
  color: #888;
  flex-wrap: wrap;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 4px;
}

.meta-icon {
  font-size: 14px;
}

.world-actions {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.entries-section {
  margin-top: 30px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  flex-wrap: wrap;
  gap: 12px;
}

.section-title {
  font-size: 20px;
  margin: 0;
  color: #333;
}

.entries-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  margin-bottom: 12px;
  flex-wrap: wrap;
}

.toolbar-left {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.entry-search {
  width: 280px;
}

.result-count {
  font-size: 13px;
  color: #666;
}

.result-count .highlight {
  color: #9d4edd;
  font-weight: 600;
}

.category-filter {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 20px;
  padding: 12px 16px;
  background: #fafafa;
  border-radius: 12px;
}

.cat-tag {
  cursor: pointer;
  transition: all 0.2s;
}

.cat-tag:hover {
  opacity: 0.85;
}

.cat-count {
  font-size: 11px;
  opacity: 0.7;
  margin-left: 2px;
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

.entry-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.entry-card-header-left {
  display: flex;
  align-items: center;
  gap: 6px;
}

.entry-report-btn {
  opacity: 0;
  transition: opacity 0.2s;
}

.entry-card:hover .entry-report-btn {
  opacity: 1;
}

.entry-category {
  margin-bottom: 0;
}

.entry-ref-count {
  margin-bottom: 0;
}

.entry-title {
  font-size: 16px;
  margin: 0 0 8px 0;
  color: #333;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
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

.empty-hint {
  font-size: 13px;
  color: #bbb;
  margin: 4px 0 16px !important;
}

.modal-header {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 18px;
  font-weight: 600;
}

.entry-detail-meta {
  margin-bottom: 8px;
}

.entry-detail-meta .meta-item {
  font-size: 13px;
  color: #888;
}

.entry-detail-content {
  font-size: 15px;
  line-height: 1.8;
  color: #444;
  margin: 0;
  white-space: pre-wrap;
  word-break: break-word;
}

.referenced-stories {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.ref-story-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background: linear-gradient(135deg, #f9f0ff 0%, #f0e6ff 100%);
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.2s;
  border: 1px solid transparent;
}

.ref-story-card:hover {
  transform: translateX(4px);
  border-color: #9d4edd;
  box-shadow: 0 2px 8px rgba(157, 78, 221, 0.15);
}

.ref-story-icon {
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

.ref-story-info {
  flex: 1;
  min-width: 0;
}

.ref-story-title {
  font-size: 14px;
  font-weight: 600;
  color: #333;
  margin-bottom: 4px;
}

.ref-story-node {
  font-size: 12px;
  color: #9d4edd;
}

.ref-story-arrow {
  color: #999;
  font-size: 18px;
  flex-shrink: 0;
}

.no-ref-stories {
  margin-top: 16px;
}
</style>
