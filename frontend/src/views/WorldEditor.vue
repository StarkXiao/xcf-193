<template>
  <div class="world-editor">
    <div class="editor-header">
      <div class="header-left">
        <n-button text @click="goBack">
          <template #icon>←</template>
          返回
        </n-button>
        <h1 class="editor-title">{{ isEditing ? '编辑世界设定' : '创建新世界' }}</h1>
        <n-tag v-if="collabRole && collabRole !== 'owner' && collabRole !== 'none'" size="small" type="info">
          {{ getRoleLabel(collabRole) }}模式
        </n-tag>
      </div>
      <div class="header-actions">
        <n-button @click="previewWorld" :disabled="!world.id">
          <template #icon>👁️</template>
          预览
        </n-button>
        <n-button v-if="collabRole === 'owner' || !isEditing" type="primary" @click="saveWorld">
          <template #icon>💾</template>
          保存
        </n-button>
        <n-button v-if="collabRole && collabRole !== 'owner' && collabRole !== 'none'" @click="goToCollaboration">
          <template #icon>📋</template>
          变更审核
        </n-button>
      </div>
    </div>

    <div v-if="collabRole && collabRole !== 'owner' && collabRole !== 'none'" class="collab-tip">
      <n-alert type="info" :show-icon="true">
        你是以 <strong>{{ getRoleLabel(collabRole) }}</strong> 身份参与此世界设定的协作。
        <template v-if="assignedCategories.length > 0">
          你负责的分类：<n-tag v-for="cat in assignedCategories" :key="cat" size="small" type="warning" style="margin: 0 4px;">{{ cat }}</n-tag>
        </template>
        你的修改将以变更请求形式提交，需主理人审核通过后生效。
      </n-alert>
    </div>

    <div class="editor-container">
      <div class="sidebar">
        <n-card title="基本信息" class="info-card">
          <n-form label-placement="top">
            <n-form-item label="世界名称">
              <n-input 
                v-model:value="world.name" 
                placeholder="请输入世界名称" 
                :disabled="collabRole && collabRole !== 'owner' && collabRole !== 'none'"
              />
            </n-form-item>
            <n-form-item label="封面图标">
              <div class="cover-selector">
                <div 
                  v-for="icon in coverIcons" 
                  :key="icon"
                  class="cover-option"
                  :class="{ active: world.cover === icon, disabled: collabRole && collabRole !== 'owner' && collabRole !== 'none' }"
                  @click="handleCoverSelect(icon)"
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
                :disabled="collabRole && collabRole !== 'owner' && collabRole !== 'none'"
              />
            </n-form-item>
          </n-form>
        </n-card>

        <n-card title="条目分类" class="categories-card">
          <div class="category-list">
            <div 
              v-for="cat in displayCategories" 
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
          <n-button 
            type="primary" 
            @click="addEntry"
            :disabled="!canAddEntry"
          >
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
              :class="{ 'readonly-entry': !canEditEntry(entry) }"
            >
              <div class="entry-card-header">
                <div>
                  <n-tag size="small" type="primary">
                    {{ entry.category }}
                  </n-tag>
                  <h3 class="entry-title">{{ entry.title }}</h3>
                </div>
                <div class="entry-actions">
                  <n-button 
                    v-if="canEditEntry(entry)" 
                    text size="small" 
                    @click="editEntry(entry)"
                  >
                    <template #icon>✏️</template>
                    编辑
                  </n-button>
                  <n-button 
                    v-else 
                    text size="small" 
                    disabled
                  >
                    <template #icon>🔒</template>
                    只读
                  </n-button>
                  <n-button 
                    v-if="collabRole === 'owner'" 
                    text size="small" 
                    type="error" 
                    @click="deleteEntry(entry)"
                  >
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
      :title="editingEntry?.id ? (collabRole === 'owner' ? '编辑条目' : '提交变更请求') : '新增条目（提交变更）'"
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
              :options="editableCategoryOptions"
              allow-create
              placeholder="选择或创建分类"
              :disabled="!canChangeCategory"
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
          <n-form-item v-if="collabRole && collabRole !== 'owner' && collabRole !== 'none'" label="变更说明">
            <n-input
              v-model:value="changeSummary"
              type="textarea"
              :rows="2"
              placeholder="简要描述本次变更的内容和原因..."
            />
          </n-form-item>
        </n-form>
      </div>
      <template #footer>
        <div class="modal-footer">
          <n-button @click="showEntryModal = false">取消</n-button>
          <n-button type="primary" @click="saveEntry">
            {{ collabRole === 'owner' || !isEditing ? '保存' : '提交变更' }}
          </n-button>
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
  NModal,
  NAlert
} from 'naive-ui'
import { worldApi, collaborationApi } from '../api'

const route = useRoute()
const router = useRouter()
const message = useMessage()

const userId = 'user-1'
const userName = '月下独酌'
const userAvatar = '🌸'

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
const changeSummary = ref('')
const collabRole = ref(null)
const assignedCategories = ref([])
const originalEntry = ref(null)

const isEditing = computed(() => !!route.params.id)

const displayCategories = computed(() => {
  if (!world.value.entries?.length) return ['全部']
  let cats = [...new Set(world.value.entries.map(e => e.category))]
  
  if (collabRole.value && collabRole.value !== 'owner' && collabRole.value !== 'none' && assignedCategories.value.length > 0) {
    cats = cats.filter(c => assignedCategories.value.includes(c))
  }
  
  return ['全部', ...cats]
})

const filteredEntries = computed(() => {
  if (!world.value.entries) return []
  
  let entries = world.value.entries
  
  if (collabRole.value && collabRole.value !== 'owner' && collabRole.value !== 'none' && assignedCategories.value.length > 0) {
    entries = entries.filter(e => assignedCategories.value.includes(e.category))
  }
  
  if (selectedCategory.value === '全部') return entries
  return entries.filter(e => e.category === selectedCategory.value)
})

const editableCategoryOptions = computed(() => {
  if (collabRole.value === 'owner' || !collabRole.value || collabRole.value === 'none') {
    if (!world.value.entries) return []
    return [...new Set(world.value.entries.map(e => e.category))].map(c => ({ label: c, value: c }))
  }
  return assignedCategories.value.map(c => ({ label: c, value: c }))
})

const canAddEntry = computed(() => {
  if (!world.value.id) return false
  if (!collabRole.value || collabRole.value === 'owner' || collabRole.value === 'none') return true
  return assignedCategories.value.length > 0
})

const canChangeCategory = computed(() => {
  if (collabRole.value === 'owner' || !collabRole.value || collabRole.value === 'none') return true
  return !editingEntry.value?.id
})

const canEditEntry = (entry) => {
  if (!collabRole.value || collabRole.value === 'owner' || collabRole.value === 'none') return true
  if (collabRole.value === 'reviewer') return false
  if (assignedCategories.value.length === 0) return true
  return assignedCategories.value.includes(entry.category)
}

const getRoleLabel = (role) => {
  const map = { owner: '主理人', editor: '编辑者', reviewer: '审核者' }
  return map[role] || role
}

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
  let entries = world.value.entries || []
  if (collabRole.value && collabRole.value !== 'owner' && collabRole.value !== 'none' && assignedCategories.value.length > 0) {
    entries = entries.filter(e => assignedCategories.value.includes(e.category))
  }
  if (cat === '全部') return entries.length
  return entries.filter(e => e.category === cat).length
}

const handleCoverSelect = (icon) => {
  if (collabRole.value && collabRole.value !== 'owner' && collabRole.value !== 'none') return
  world.value.cover = icon
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

const loadCollabRole = async () => {
  if (!route.params.id) return
  try {
    const res = await collaborationApi.getCollaborationRole(route.params.id, userId)
    collabRole.value = res.data.role
    assignedCategories.value = res.data.categories || []
  } catch (err) {
    console.error('加载协作身份失败:', err)
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
      collabRole.value = 'owner'
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
  let defaultCategory = '其他'
  if (selectedCategory.value !== '全部') {
    defaultCategory = selectedCategory.value
  } else if (assignedCategories.value.length > 0) {
    defaultCategory = assignedCategories.value[0]
  }
  
  editingEntry.value = {
    title: '',
    category: defaultCategory,
    content: ''
  }
  changeSummary.value = ''
  originalEntry.value = null
  showEntryModal.value = true
}

const editEntry = (entry) => {
  originalEntry.value = { ...entry }
  editingEntry.value = { ...entry }
  changeSummary.value = ''
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
    if (collabRole.value === 'owner' || !collabRole.value || collabRole.value === 'none') {
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
    } else {
      if (!changeSummary.value.trim()) {
        message.warning('请填写变更说明')
        return
      }
      
      const changeType = editingEntry.value.id ? 'update' : 'create'
      
      await collaborationApi.submitChangeRequest(world.value.id, {
        entryId: editingEntry.value.id || null,
        entryTitle: editingEntry.value.title,
        type: changeType,
        summary: changeSummary.value,
        oldValue: originalEntry.value,
        newValue: { ...editingEntry.value },
        requestedBy: userId,
        requesterName: userName,
        requesterAvatar: userAvatar
      })
      
      message.success('变更请求已提交，等待主理人审核')
      showEntryModal.value = false
    }
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
  if (world.value.id) {
    router.push(`/world/${world.value.id}`)
  } else {
    router.push('/worlds')
  }
}

const previewWorld = () => {
  if (world.value.id) {
    router.push(`/world/${world.value.id}`)
  }
}

const goToCollaboration = () => {
  if (world.value.id) {
    router.push(`/world/${world.value.id}/collaboration`)
  }
}

onMounted(async () => {
  await loadWorld()
  if (isEditing.value) {
    await loadCollabRole()
  }
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

.collab-tip {
  margin-bottom: 20px;
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

.cover-option:hover:not(.disabled) {
  border-color: #c77dff;
  transform: scale(1.1);
}

.cover-option.active {
  border-color: #9d4edd;
  background: #f9f0ff;
}

.cover-option.disabled {
  opacity: 0.5;
  cursor: not-allowed;
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

.entry-card:hover:not(.readonly-entry) {
  transform: translateX(4px);
}

.entry-card.readonly-entry {
  opacity: 0.75;
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
