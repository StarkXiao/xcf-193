<template>
  <div class="search-box-container">
    <div class="search-input-wrapper">
      <n-auto-complete
        v-model:value="searchText"
        :options="suggestOptions"
        :placeholder="placeholder"
        :size="size"
        clearable
        @keyup.enter="handleSearch"
        @select="handleSelect"
        @search="handleInput"
        @update:value="handleValueChange"
      >
        <template #prefix>
          <n-icon size="16">🔍</n-icon>
        </template>
        <template #default="{ option }">
          <div class="suggestion-item">
            <span class="suggestion-icon">{{ option.type === 'tag' ? '🏷️' : '🕐' }}</span>
            <span class="suggestion-text">{{ option.label }}</span>
            <span v-if="option.type === 'tag'" class="suggestion-count">
              {{ option.storyCount }} 作品
            </span>
          </div>
        </template>
      </n-auto-complete>
      <n-button 
        type="primary" 
        :size="size" 
        class="search-btn"
        @click="handleSearch"
      >
        搜索
      </n-button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { NAutoComplete, NButton, NIcon } from 'naive-ui'
import { searchApi } from '../api'

const props = defineProps({
  placeholder: {
    type: String,
    default: '搜索故事、世界设定、评论...'
  },
  size: {
    type: String,
    default: 'medium'
  },
  modelValue: {
    type: String,
    default: ''
  },
  autoRoute: {
    type: Boolean,
    default: true
  }
})

const emit = defineEmits(['update:modelValue', 'search', 'clear'])

const router = useRouter()
const searchText = ref('')
const tagSuggestions = ref([])
const loading = ref(false)
const searchHistory = ref([])

const suggestOptions = computed(() => {
  const options = []
  
  if (tagSuggestions.value.length > 0) {
    tagSuggestions.value.forEach(item => {
      options.push({
        label: item.tag,
        value: `tag:${item.tag}`,
        type: 'tag',
        tag: item.tag,
        storyCount: item.storyCount
      })
    })
  }
  
  if (searchHistory.value.length > 0 && !searchText.value) {
    searchHistory.value.slice(0, 5).forEach((keyword) => {
      options.push({
        label: keyword,
        value: `history:${keyword}`,
        type: 'history',
        keyword
      })
    })
  }
  
  return options
})

let debounceTimer = null

const handleInput = (value) => {
  if (debounceTimer) {
    clearTimeout(debounceTimer)
  }
  
  if (!value || value.trim() === '') {
    tagSuggestions.value = []
    return
  }
  
  debounceTimer = setTimeout(async () => {
    try {
      const res = await searchApi.suggestTags(value, 8)
      tagSuggestions.value = res.data.tags || []
    } catch (err) {
      console.error('获取标签建议失败:', err)
    }
  }, 300)
}

const handleValueChange = (value) => {
  if (!value || value.trim() === '') {
    tagSuggestions.value = []
    emit('clear')
  }
}

const handleSelect = (value, option) => {
  if (option.type === 'tag') {
    if (props.autoRoute) {
      router.push({ path: '/search', query: { tag: option.tag } })
    } else {
      searchText.value = option.tag
      emit('search', option.tag)
    }
  } else if (option.type === 'history') {
    searchText.value = option.keyword
    handleSearch()
  }
}

const handleSearch = () => {
  const keyword = searchText.value.trim()
  if (!keyword) return
  
  addToHistory(keyword)
  emit('search', keyword)
  if (props.autoRoute) {
    router.push({ path: '/search', query: { q: keyword } })
  }
}

const addToHistory = (keyword) => {
  const history = searchHistory.value.filter(k => k !== keyword)
  history.unshift(keyword)
  searchHistory.value = history.slice(0, 10)
  try {
    localStorage.setItem('searchHistory', JSON.stringify(searchHistory.value))
  } catch (e) {}
}

const loadHistory = () => {
  try {
    const history = localStorage.getItem('searchHistory')
    if (history) {
      searchHistory.value = JSON.parse(history)
    }
  } catch (e) {}
}

watch(() => props.modelValue, (val) => {
  if (val !== searchText.value) {
    searchText.value = val
  }
})

watch(searchText, (val) => {
  emit('update:modelValue', val)
})

loadHistory()
</script>

<style scoped>
.search-box-container {
  position: relative;
}

.search-input-wrapper {
  display: flex;
  align-items: center;
  gap: 8px;
}

.search-btn {
  flex-shrink: 0;
}

.suggestion-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 4px 0;
}

.suggestion-icon {
  font-size: 14px;
  width: 20px;
  text-align: center;
}

.suggestion-text {
  flex: 1;
  font-size: 14px;
}

.suggestion-count {
  font-size: 12px;
  color: #808090;
}

:deep(.n-auto-complete) {
  flex: 1;
}

:deep(.n-base-selection) {
  background: rgba(255, 255, 255, 0.1) !important;
  border-color: rgba(199, 125, 255, 0.3) !important;
}

:deep(.n-base-selection:hover) {
  border-color: rgba(199, 125, 255, 0.5) !important;
}

:deep(.n-base-selection .n-base-selection-input) {
  color: #e0e0f0 !important;
}

:deep(.n-base-selection .n-base-selection-placeholder) {
  color: rgba(199, 125, 255, 0.5) !important;
}
</style>
