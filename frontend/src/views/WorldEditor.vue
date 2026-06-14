<template>
  <div class="world-editor">
    <div class="editor-header">
      <div class="header-left">
        <n-button text @click="goBack">
          <template #icon>←</template>
          返回
        </n-button>
        <h1 class="editor-title">{{ isEditing ? '编辑世界设定' : '创建新世界' }}</h1>
      </div>
      <div class="header-actions">
        <n-button @click="previewWorld" :disabled="!world.id">
          <template #icon>👁️</template>
          预览
        </n-button>
        <n-button type="primary" @click="saveWorld">
          <template #icon>💾</template>
          保存
        </n-button>
      </div>
    </div>

    <div class="editor-container">
      <div class="sidebar">
        <n-card title="基本信息" class="info-card">
          <n-form label-placement="top">
            <n-form-item label="世界名称">
              <n-input v-model:value="world.name" placeholder="请输入世界名称" />
            </n-form-item>
            <n-form-item label="封面图标">
              <div class="cover-selector">
                <div 
                  v-for="icon in coverIcons" 
                  :key="icon"
                  class="cover-option"
                  :class="{ active: world.cover === icon }"
                  @click="world.cover = icon"
                >
                  {{ icon }}
                </div>
              </div>
            </n-form-item>
            <n-form-item label="世界描述">
              <n-input
                v-model:value="world.description"
                type="textarea"
                :rows="3"
                placeholder="简短描述这个世界观..."
              />
            </n-form-item>
          </n-form>
        </n-card>

        <n-card title="条目分类" class="categories-card">
          <div class="category-list">
            <div 
              v-for="cat in categories" 
              :key="cat"
              class="category-item"
              :class="{ active: selectedCategory === cat }"
              @click="selectedCategory = cat"
            >
              <span class="cat-icon">{{ getCategoryIcon(cat) }}</span>
              <span class="cat-name">{{ cat }}</span>
              <span class="cat-count">{{ getCategoryCount(cat) }}</span>
            </div>
          </div>
        </n-card>
      </div>

      <div class="main-editor">
        <div class="entries-header">
          <h2 class="section-title">
            {{ selectedCategory === '全部' ? '所有条目' : selectedCategory }}
          </h2>
          <n-button type="primary" @click="addEntry">
            <template #icon>+</template>
            新增条目
          </n-button>
        </div>

        <n-spin :show="loading" size="small">
          <div class="entries-list">
            <div v-if="filteredEntries.length === 0" class="empty-entries">
              <div class="empty-icon">📝</div>
              <p>还没有条目</p>
              <p class="hint">点击"新增条目"开始创建</p>
            </div>

            <n-card 
              v-for="entry in filteredEntries" 
              :key="entry.id"
              hoverable
              class="entry-card"
            >
              <div class="entry-card-header">
                <div>
                  <n-tag size="small" type="primary">
                    {{ entry.category }}
                  </n-tag>
                  <h3 class="entry-title">{{ entry.title }}</h3>
                </div>
                <div class="entry-actions">
                  <n-button text size="small" @click="editEntry(entry)">
                    <template #icon>✏️</template>
                    编辑
                  </n-button>
                  <n-button text size="small" @click="deleteEntry(entry)">
                    <template #icon>🗑️</template>
                    删除
                  </n-button>
                </div>
              </div>
              <p class="entry-content-preview">{{ entry.content }}</p>
            </n-card>
          </div>
        </n-spin>
      </div>
    </div>

    <n-modal 
      v-model:show="showEntryModal" 
      preset="card"
      :title="editingEntry?.id ? '编辑条目' : '新增条目'"
      style="width: 500px"
      :mask-closable="false"
    >
      <div v-if="editingEntry" class="entry-form">
        <n-form label-placement="top">
          <n-form-item label="条目标题">
            <n-input v-model:value="editingEntry.title" placeholder="请输入标题" />
          </n-form-item>
          <n-form-item label="分类">
            <n-select 
              v-model:value="editingEntry.category" 
              :options="categoryOptions"
              allow-create
              placeholder="选择或创建分类"
            />
          </n-form-item>
          <n-form-item label="条目内容">
            <n-input
              v-model:value="editingEntry.content"
              type="textarea"
              :rows="6"
              placeholder="详细描述这个设定..."
            />
          </n-form-item>
        </n-form>
      </div>
      <template #footer>
        <div class="modal-footer">
          <n-button @click="showEntryModal = false">取消</n-button>
          <n-button type="primary" @click="saveEntry">保存</n-button>
        </div>
      </template>
    </n-modal>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useMessage } from 'naive-ui'
import {
  NButton,
  NCard,
  NForm,
  NFormItem,
  NInput,
  NSelect,
  NTag,
  NSpin,
  NModal
} from 'naive-ui'
import { worldApi } from '../api'

const route = useRoute()
const router = useRouter()
const message = useMessage()

const coverIcons = ['🌍', '🏰', '🌙', '⭐', '🦊', '🚀', '🌸', '💫', '🏯', '🐉']

const world = ref({
  id: null,
  name: '',
  description: '',
  cover: '🌍',
  authorId: 'user-1',
  authorName: '月下独酌',
  entries: []
})

const selectedCategory = ref('全部')
const loading = ref(false)
const showEntryModal = ref(false)
const editingEntry = ref(null)

const isEditing = computed(() => !!route.params.id)

const categories = computed(() => {
  if (!world.value.entries?.length) return ['全部']
  const cats = [...new Set(world.value.entries.map(e => e.category))]
  return ['全部', ...cats]
})

const filteredEntries = computed(() => {
  if (!world.value.entries) return []
  if (selectedCategory.value === '全部') return world.value.entries
  return world.value.entries.filter(e => e.category === selectedCategory.value)
})

const categoryOptions = computed(() => {
  const cats = categories.value.filter(c => c !== '全部')
  return cats.map(c => ({ label: c, value: c }))
})

const getCategoryIcon = (cat) => {
  const icons = {
    '全部': '📚',
    '地理': '🗺️',
    '政治': '👑',
    '种族': '🧝',
    '传说': '📜',
    '科技': '🔬',
    '地点': '📍',
    '其他': '📌'
  }
  return icons[cat] || '📌'
}

const getCategoryCount = (cat) => {
  if (cat === '全部') return world.value.entries?.length || 0
  return world.value.entries?.filter(e => e.category === cat).length || 0
}

const loadWorld = async () => {
  if (!route.params.id) return
  
  loading.value = true
  try {
    const res = await worldApi.getWorld(route.params.id)
    world.value = res.data
  } catch (err) {
    console.error('加载世界设定失败:', err)
    message.error('加载失败')
  } finally {
    loading.value = false
  }
}

const saveWorld = async () => {
  if (!world.value.name) {
    message.warning('请输入世界名称')
    return
  }

  try {
    if (world.value.id) {
      message.success('已保存')
    } else {
      const res = await worldApi.createWorld(world.value)
      world.value.id = res.data.id
      message.success('创建成功')
    }
  } catch (err) {
    console.error('保存失败:', err)
    message.error('保存失败')
  }
}

const addEntry = () => {
  if (!world.value.id) {
    saveWorld().then(() => {
      openNewEntry()
    })
  } else {
    openNewEntry()
  }
}

const openNewEntry = () => {
  editingEntry.value = {
    title: '',
    category: selectedCategory.value === '全部' ? '其他' : selectedCategory.value,
    content: ''
  }
  showEntryModal.value = true
}

const editEntry = (entry) => {
  editingEntry.value = { ...entry }
  showEntryModal.value = true
}

const saveEntry = async () => {
  if (!editingEntry.value.title) {
    message.warning('请输入标题')
    return
  }
  if (!editingEntry.value.content) {
    message.warning('请输入内容')
    return
  }

  try {
    if (editingEntry.value.id) {
      await worldApi.updateEntry(world.value.id, editingEntry.value.id, {
        title: editingEntry.value.title,
        category: editingEntry.value.category,
        content: editingEntry.value.content
      })
      const index = world.value.entries.findIndex(e => e.id === editingEntry.value.id)
      if (index !== -1) {
        world.value.entries[index] = { ...editingEntry.value }
      }
      message.success('已更新')
    } else {
      const res = await worldApi.addEntry(world.value.id, {
        title: editingEntry.value.title,
        category: editingEntry.value.category,
        content: editingEntry.value.content
      })
      if (!world.value.entries) {
        world.value.entries = []
      }
      world.value.entries.push(res.data)
      message.success('已添加')
    }
    showEntryModal.value = false
  } catch (err) {
    console.error('保存条目失败:', err)
    message.error('保存失败')
  }
}

const deleteEntry = async (entry) => {
  try {
    await worldApi.deleteEntry(world.value.id, entry.id)
    const index = world.value.entries.findIndex(e => e.id === entry.id)
    if (index !== -1) {
      world.value.entries.splice(index, 1)
    }
    message.success('已删除')
  } catch (err) {
    console.error('删除失败:', err)
    message.error('删除失败')
  }
}

const goBack = () => {
  router.push('/worlds')
}

const previewWorld = () => {
  if (world.value.id) {
    router.push(`/world/${world.value.id}`)
  }
}

onMounted(() => {
  loadWorld()
})
</script>

<style scoped>
.world-editor {
  padding-bottom: 40px;
}

.editor-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 0;
  border-bottom: 1px solid #f0f0f0;
  margin-bottom: 24px;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.editor-title {
  font-size: 24px;
  margin: 0;
  color: #333;
}

.header-actions {
  display: flex;
  gap: 12px;
}

.editor-container {
  display: grid;
  grid-template-columns: 280px 1fr;
  gap: 24px;
}

.sidebar {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.cover-selector {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.cover-option {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  border: 2px solid #f0f0f0;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.cover-option:hover {
  border-color: #c77dff;
  transform: scale(1.1);
}

.cover-option.active {
  border-color: #9d4edd;
  background: #f9f0ff;
}

.category-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.category-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.category-item:hover {
  background: #f5f5f5;
}

.category-item.active {
  background: linear-gradient(135deg, #f0e6ff 0%, #e0ccff 100%);
}

.cat-icon {
  font-size: 16px;
}

.cat-name {
  flex: 1;
  font-size: 14px;
  color: #333;
}

.cat-count {
  font-size: 12px;
  color: #999;
  background: #f0f0f0;
  padding: 2px 8px;
  border-radius: 10px;
}

.category-item.active .cat-count {
  background: white;
  color: #9d4edd;
}

.main-editor {
  background: white;
  border-radius: 12px;
  padding: 24px;
  min-height: 600px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.entries-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 1px solid #f0f0f0;
}

.section-title {
  font-size: 18px;
  margin: 0;
  color: #333;
}

.entries-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.entry-card {
  transition: transform 0.2s;
}

.entry-card:hover {
  transform: translateX(4px);
}

.entry-card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 10px;
}

.entry-title {
  font-size: 16px;
  margin: 6px 0 0 0;
  color: #333;
}

.entry-actions {
  display: flex;
  gap: 8px;
}

.entry-content-preview {
  font-size: 14px;
  color: #666;
  line-height: 1.6;
  margin: 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
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

.empty-entries p {
  margin: 4px 0;
}

.empty-entries .hint {
  font-size: 13px;
  color: #bbb;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.entry-form {
  padding: 10px 0;
}
</style>
