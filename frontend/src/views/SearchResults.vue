<template>
  <div class="search-page">
    <div class="search-header">
      <div class="search-box-wrapper">
        <SearchBox
          v-model="searchKeyword"
          placeholder="搜索故事、世界设定、评论..."
          size="large"
          :auto-route="false"
          @search="handleSearch"
          @tag-select="handleTagSelect"
          @clear="handleClear"
        />
      </div>
    </div>

    <div class="search-content">
      <div class="search-main">
        <div class="search-tabs">
          <n-tabs v-model:value="activeTab" type="line" @update:value="handleTabChange">
            <n-tab-pane name="all" :tab="`全部 (${counts.stories + counts.worlds + counts.comments})`" />
            <n-tab-pane name="stories" :tab="`故事 (${counts.stories})`" />
            <n-tab-pane name="worlds" :tab="`世界设定 (${counts.worlds})`" />
            <n-tab-pane name="comments" :tab="`评论 (${counts.comments})`" />
          </n-tabs>
        </div>

        <div v-if="selectedTag" class="selected-tag-bar">
          <span class="tag-label">标签筛选：</span>
          <n-tag type="primary" closable @close="clearTagFilter">
            {{ selectedTag }}
          </n-tag>
        </div>

        <n-spin :show="loading" size="large">
          <div v-if="results.length > 0" class="search-results">
            <div 
              v-for="item in results" 
              :key="item.type + item.id"
              class="result-item"
              @click="openResult(item)"
            >
              <template v-if="item.resultType === 'story' || item.type === 'story'">
                <div class="result-icon story-icon">📖</div>
                <div class="result-content">
                  <div class="result-type-badge story-badge">故事</div>
                  <h3 class="result-title" v-html="item.highlightedTitle || item.title"></h3>
                  <p class="result-desc" v-html="item.highlightedSummary || item.summary"></p>
                  <div class="result-tags">
                    <n-tag 
                      v-for="tag in item.tags" 
                      :key="tag" 
                      size="small" 
                      type="primary"
                      class="result-tag"
                      @click.stop="filterByTag(tag)"
                    >
                      {{ tag }}
                    </n-tag>
                  </div>
                  <div class="result-meta">
                    <span>👤 {{ item.authorName }}</span>
                    <span>❤️ {{ item.likes }}</span>
                    <span>👁️ {{ item.views }}</span>
                  </div>
                </div>
              </template>

              <template v-else-if="item.resultType === 'world' || item.type === 'world'">
                <div class="result-icon world-icon">🌍</div>
                <div class="result-content">
                  <div class="result-type-badge world-badge">世界设定</div>
                  <h3 class="result-title" v-html="item.highlightedName || item.name"></h3>
                  <p class="result-desc" v-html="item.highlightedDescription || item.description"></p>
                  <div v-if="item.matchedEntries && item.matchedEntries.length > 0" class="matched-entries">
                    <div class="entries-label">相关条目：</div>
                    <div 
                      v-for="entry in item.matchedEntries.slice(0, 2)" 
                      :key="entry.id"
                      class="entry-item"
                    >
                      <span class="entry-title" v-html="entry.highlightedTitle || entry.title"></span>
                      <span class="entry-desc" v-html="entry.highlightedContent || entry.content"></span>
                    </div>
                  </div>
                  <div class="result-meta">
                    <span>👤 {{ item.authorName }}</span>
                    <span>📝 {{ item.entries?.length || 0 }} 条目</span>
                    <span>❤️ {{ item.likes }}</span>
                  </div>
                </div>
              </template>

              <template v-else-if="item.resultType === 'comment' || item.type === 'comment'">
                <div class="result-icon comment-icon">💬</div>
                <div class="result-content">
                  <div class="result-type-badge comment-badge">评论</div>
                  <div class="comment-header">
                    <span class="comment-avatar">{{ item.avatar }}</span>
                    <span class="comment-username" v-html="item.highlightedUsername || item.username"></span>
                    <span class="comment-time">{{ item.createdAt }}</span>
                  </div>
                  <p class="comment-content" v-html="item.highlightedContent || item.content"></p>
                  <div class="comment-source">
                    来自：《{{ item.storyTitle }}》- {{ item.nodeTitle }}
                  </div>
                  <div class="result-meta">
                    <span>❤️ {{ item.likes }}</span>
                  </div>
                </div>
              </template>
            </div>
          </div>

          <div v-if="results.length === 0 && !loading && hasSearched" class="empty-state">
            <div class="empty-icon">🔍</div>
            <h3>没有找到相关结果</h3>
            <p>试试其他关键词，或者看看热门搜索</p>
          </div>

          <div v-if="!hasSearched && !loading" class="empty-state">
            <div class="empty-icon">✨</div>
            <h3>开始探索</h3>
            <p>输入关键词搜索故事、世界设定和评论</p>
          </div>
        </n-spin>

        <div v-if="results.length > 0 && total > limit" class="pagination">
          <n-pagination
            v-model:page="currentPage"
            :page-count="Math.ceil(total / limit)"
            :page-sizes="[10, 20, 50]"
            :page-size="limit"
            show-size-picker
            @update:page="handlePageChange"
            @update:page-size="handlePageSizeChange"
          />
        </div>
      </div>

      <div class="search-sidebar">
        <div class="sidebar-section">
          <h3 class="sidebar-title">🔥 热门搜索</h3>
          <div class="hot-keywords">
            <div 
              v-for="(item, index) in hotKeywords" 
              :key="item.keyword"
              class="hot-keyword-item"
              @click="handleSearch(item.keyword)"
            >
              <span class="rank" :class="{ top: index < 3 }">{{ index + 1 }}</span>
              <span class="keyword">{{ item.keyword }}</span>
              <span class="trend" :class="item.trend">
                {{ item.trend === 'up' ? '↑' : item.trend === 'down' ? '↓' : '—' }}
              </span>
            </div>
          </div>
        </div>

        <div class="sidebar-section">
          <h3 class="sidebar-title">🏷️ 热门标签</h3>
          <div class="popular-tags">
            <n-tag 
              v-for="tagItem in popularTags" 
              :key="tagItem.tag"
              type="primary"
              size="medium"
              class="popular-tag"
              @click="filterByTag(tagItem.tag)"
            >
              {{ tagItem.tag }}
              <span class="tag-count">{{ tagItem.storyCount }}</span>
            </n-tag>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { 
  NTabs, NTabPane, NSpin, 
  NTag, NPagination 
} from 'naive-ui'
import { searchApi } from '../api'
import SearchBox from '../components/SearchBox.vue'

const route = useRoute()
const router = useRouter()

const searchKeyword = ref('')
const activeTab = ref('all')
const results = ref([])
const counts = ref({ stories: 0, worlds: 0, comments: 0 })
const loading = ref(false)
const hasSearched = ref(false)
const currentPage = ref(1)
const limit = ref(10)
const total = ref(0)
const selectedTag = ref('')
const hotKeywords = ref([])
const popularTags = ref([])

const resetResults = () => {
  results.value = []
  counts.value = { stories: 0, worlds: 0, comments: 0 }
  total.value = 0
  currentPage.value = 1
}

const handleSearch = (keyword) => {
  if (keyword !== undefined) {
    searchKeyword.value = keyword
  }
  selectedTag.value = ''
  resetResults()
  loadResults()
}

const handleTagSelect = (tag) => {
  searchKeyword.value = ''
  selectedTag.value = tag
  resetResults()
  loadResults()
}

const handleClear = () => {
  searchKeyword.value = ''
  selectedTag.value = ''
  resetResults()
  hasSearched.value = false
}

const handleTabChange = () => {
  resetResults()
  loadResults()
}

const handlePageChange = (page) => {
  currentPage.value = page
  loadResults()
}

const handlePageSizeChange = (size) => {
  limit.value = size
  currentPage.value = 1
  loadResults()
}

const loadResults = async () => {
  if (!searchKeyword.value && !selectedTag.value) {
    return
  }

  loading.value = true
  hasSearched.value = true
  try {
    const params = {
      keyword: searchKeyword.value,
      type: activeTab.value,
      page: currentPage.value,
      limit: limit.value
    }
    if (selectedTag.value) {
      params.tag = selectedTag.value
    }

    const res = await searchApi.search(params)
    const data = res.data
    
    results.value = data.results || []
    counts.value = data.counts || { stories: 0, worlds: 0, comments: 0 }
    total.value = data.total || 0
  } catch (err) {
    console.error('搜索失败:', err)
  } finally {
    loading.value = false
  }
}

const loadHotKeywords = async () => {
  try {
    const res = await searchApi.getHotKeywords()
    hotKeywords.value = res.data.keywords || []
  } catch (err) {
    console.error('加载热门搜索失败:', err)
  }
}

const loadPopularTags = async () => {
  try {
    const res = await searchApi.getPopularTags(15)
    popularTags.value = res.data.tags || []
  } catch (err) {
    console.error('加载热门标签失败:', err)
  }
}

const filterByTag = (tag) => {
  searchKeyword.value = ''
  selectedTag.value = tag
  resetResults()
  loadResults()
}

const clearTagFilter = () => {
  selectedTag.value = ''
  if (!searchKeyword.value) {
    resetResults()
    hasSearched.value = false
  } else {
    resetResults()
    loadResults()
  }
}

const openResult = (item) => {
  const type = item.resultType || item.type
  if (type === 'story') {
    router.push(`/story/${item.id}`)
  } else if (type === 'world') {
    router.push(`/world/${item.id}`)
  } else if (type === 'comment') {
    router.push({
      path: `/story/${item.storyId}`,
      query: {
        nodeId: item.nodeId,
        commentId: item.id
      }
    })
  }
}

onMounted(() => {
  const keyword = route.query.q || ''
  const tag = route.query.tag || ''
  if (keyword) {
    searchKeyword.value = keyword
    handleSearch()
  } else if (tag) {
    filterByTag(tag)
  }
  loadHotKeywords()
  loadPopularTags()
})

watch(() => route.query, (query) => {
  if (query.q !== undefined && query.q !== searchKeyword.value) {
    searchKeyword.value = query.q || ''
    handleSearch()
  } else if (query.tag !== undefined && query.tag !== selectedTag.value) {
    handleTagSelect(query.tag)
  }
})
</script>

<style scoped>
.search-page {
  min-height: 100vh;
}

.search-header {
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
  padding: 40px 24px;
  margin: -24px -24px 24px -24px;
}

.search-box-wrapper {
  max-width: 600px;
  margin: 0 auto;
}

.search-content {
  display: flex;
  gap: 24px;
  align-items: flex-start;
}

.search-main {
  flex: 1;
  min-width: 0;
}

.search-tabs {
  margin-bottom: 16px;
}

.selected-tag-bar {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  background: rgba(157, 78, 221, 0.1);
  border-radius: 8px;
  margin-bottom: 16px;
}

.tag-label {
  font-size: 14px;
  color: #c77dff;
}

.search-results {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.result-item {
  display: flex;
  gap: 16px;
  padding: 20px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(199, 125, 255, 0.2);
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s;
}

.result-item:hover {
  background: rgba(199, 125, 255, 0.1);
  border-color: rgba(199, 125, 255, 0.4);
  transform: translateX(4px);
}

.result-icon {
  width: 48px;
  height: 48px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  flex-shrink: 0;
}

.story-icon {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.world-icon {
  background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
}

.comment-icon {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
}

.result-content {
  flex: 1;
  min-width: 0;
}

.result-type-badge {
  display: inline-block;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 12px;
  margin-bottom: 8px;
}

.story-badge {
  background: rgba(102, 126, 234, 0.2);
  color: #667eea;
}

.world-badge {
  background: rgba(17, 153, 142, 0.2);
  color: #11998e;
}

.comment-badge {
  background: rgba(240, 147, 251, 0.2);
  color: #f093fb;
}

.result-title {
  font-size: 18px;
  font-weight: 600;
  color: #ffffff;
  margin: 0 0 8px 0;
  line-height: 1.4;
}

.result-desc {
  font-size: 14px;
  color: #a0a0b0;
  margin: 0 0 12px 0;
  line-height: 1.6;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.result-tags {
  margin-bottom: 12px;
}

.result-tag {
  cursor: pointer;
  margin-right: 6px;
  margin-bottom: 6px;
}

.result-tag:hover {
  opacity: 0.8;
}

.matched-entries {
  background: rgba(255, 255, 255, 0.03);
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 12px;
}

.entries-label {
  font-size: 12px;
  color: #c77dff;
  margin-bottom: 8px;
}

.entry-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 8px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.entry-item:last-child {
  border-bottom: none;
}

.entry-title {
  font-size: 14px;
  color: #e0aaff;
  font-weight: 500;
}

.entry-desc {
  font-size: 12px;
  color: #a0a0b0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.comment-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.comment-avatar {
  font-size: 20px;
}

.comment-username {
  font-weight: 500;
  color: #e0aaff;
}

.comment-time {
  font-size: 12px;
  color: #808090;
  margin-left: auto;
}

.comment-content {
  font-size: 14px;
  color: #d0d0e0;
  line-height: 1.6;
  margin: 0 0 8px 0;
}

.comment-source {
  font-size: 12px;
  color: #808090;
  margin-bottom: 8px;
}

.result-meta {
  display: flex;
  gap: 16px;
  font-size: 12px;
  color: #808090;
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
}

.empty-icon {
  font-size: 64px;
  margin-bottom: 16px;
}

.empty-state h3 {
  font-size: 20px;
  color: #ffffff;
  margin: 0 0 8px 0;
}

.empty-state p {
  font-size: 14px;
  color: #a0a0b0;
  margin: 0;
}

.pagination {
  display: flex;
  justify-content: center;
  margin-top: 24px;
}

.search-sidebar {
  width: 280px;
  flex-shrink: 0;
}

.sidebar-section {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(199, 125, 255, 0.15);
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 16px;
}

.sidebar-title {
  font-size: 16px;
  font-weight: 600;
  color: #ffffff;
  margin: 0 0 16px 0;
}

.hot-keywords {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.hot-keyword-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 12px;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.2s;
}

.hot-keyword-item:hover {
  background: rgba(199, 125, 255, 0.1);
}

.rank {
  width: 20px;
  height: 20px;
  border-radius: 4px;
  background: rgba(255, 255, 255, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 600;
  color: #a0a0b0;
}

.rank.top {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  color: white;
}

.keyword {
  flex: 1;
  font-size: 14px;
  color: #d0d0e0;
}

.trend {
  font-size: 12px;
  font-weight: 600;
}

.trend.up {
  color: #ef4444;
}

.trend.down {
  color: #22c55e;
}

.trend.stable {
  color: #808090;
}

.popular-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.popular-tag {
  cursor: pointer;
  transition: transform 0.2s;
}

.popular-tag:hover {
  transform: scale(1.05);
}

.tag-count {
  margin-left: 4px;
  opacity: 0.7;
  font-size: 11px;
}

:deep(mark) {
  background: rgba(240, 147, 251, 0.3);
  color: #f093fb;
  padding: 0 2px;
  border-radius: 2px;
}

@media (max-width: 768px) {
  .search-content {
    flex-direction: column;
  }
  
  .search-sidebar {
    width: 100%;
  }
}
</style>
