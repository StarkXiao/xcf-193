<template>
  <div class="story-editor">
    <div class="editor-header">
      <div class="header-left">
        <n-button text @click="goBack">
          <template #icon>←</template>
          返回
        </n-button>
        <h1 class="editor-title">{{ isEditing ? '编辑故事' : '创建新故事' }}</h1>
      </div>
      <div class="header-actions">
        <n-button @click="previewStory" :disabled="!story.id">
          <template #icon>👁️</template>
          预览
        </n-button>
        <n-button type="primary" @click="saveStory">
          <template #icon>💾</template>
          保存
        </n-button>
      </div>
    </div>

    <div class="editor-container">
      <div class="sidebar">
        <n-card title="故事信息" class="info-card">
          <n-form label-placement="top">
            <n-form-item label="故事标题">
              <n-input v-model:value="story.title" placeholder="请输入故事标题" />
            </n-form-item>
            <n-form-item label="封面图标">
              <div class="cover-selector">
                <div 
                  v-for="icon in coverIcons" 
                  :key="icon"
                  class="cover-option"
                  :class="{ active: story.cover === icon }"
                  @click="story.cover = icon"
                >
                  {{ icon }}
                </div>
              </div>
            </n-form-item>
            <n-form-item label="故事简介">
              <n-input
                v-model:value="story.summary"
                type="textarea"
                :rows="3"
                placeholder="请输入故事简介"
              />
            </n-form-item>
            <n-form-item label="标签">
              <n-input
                v-model:value="tagsInput"
                placeholder="多个标签用逗号分隔"
                @blur="parseTags"
              />
              <div class="tags-preview">
                <n-tag 
                  v-for="tag in story.tags" 
                  :key="tag" 
                  size="small"
                  closable
                  @close="removeTag(tag)"
                  style="margin-right: 4px; margin-top: 4px;"
                >
                  {{ tag }}
                </n-tag>
              </div>
            </n-form-item>
          </n-form>
        </n-card>

        <n-card title="章节节点" class="nodes-card">
          <template #header-extra>
            <n-button size="small" type="primary" @click="addNode">
              <template #icon>+</template>
              新增
            </n-button>
          </template>
          <div class="nodes-list">
            <div v-if="nodes.length === 0" class="empty-nodes">
              <p>还没有章节节点</p>
              <p class="hint">点击"新增"开始创作</p>
            </div>
            <div 
              v-for="node in nodes" 
              :key="node.id"
              class="node-item"
              :class="{ 
                active: selectedNode?.id === node.id,
                ending: node.isEnding 
              }"
              @click="selectNode(node)"
            >
              <span class="node-icon">{{ node.isEnding ? '🏁' : '📄' }}</span>
              <span class="node-title">{{ node.title || '未命名章节' }}</span>
              <n-button 
                text 
                size="tiny" 
                class="delete-btn"
                @click.stop="deleteNode(node)"
              >
                <template #icon>🗑️</template>
              </n-button>
            </div>
          </div>
        </n-card>
      </div>

      <div class="main-editor">
        <n-spin :show="loadingNode" size="large">
          <div v-if="selectedNode" class="node-editor">
            <div class="node-editor-header">
              <n-input 
                v-model:value="selectedNode.title" 
                placeholder="章节标题"
                class="node-title-input"
              />
              <n-switch 
                v-model:value="selectedNode.isEnding" 
                @update:value="toggleEnding"
              />
              <span class="switch-label">{{ selectedNode.isEnding ? '结局章节' : '普通章节' }}</span>
            </div>

            <div v-if="selectedNode.isEnding" class="ending-type-selector">
              <span class="ending-label">结局类型：</span>
              <n-radio-group v-model:value="selectedNode.endingType" size="small">
                <n-radio-button value="good">
                  ✨ 完美结局
                </n-radio-button>
                <n-radio-button value="normal">
                  🌟 普通结局
                </n-radio-button>
                <n-radio-button value="bad">
                  💔 遗憾结局
                </n-radio-button>
              </n-radio-group>
            </div>

            <div class="content-editor">
              <div class="editor-label">章节内容</div>
              <n-input
                v-model:value="selectedNode.content"
                type="textarea"
                :rows="12"
                placeholder="在这里写下你的故事..."
                class="content-textarea"
              />
            </div>

            <div v-if="!selectedNode.isEnding" class="choices-editor">
              <div class="choices-header">
                <span class="editor-label">分支选项</span>
                <n-button size="small" type="primary" @click="addChoice">
                  <template #icon>+</template>
                  添加选项
                </n-button>
              </div>
              <div class="choices-list">
                <div 
                  v-for="(choice, index) in selectedNode.choices" 
                  :key="choice.id"
                  class="choice-item"
                >
                  <span class="choice-index">{{ index + 1 }}.</span>
                  <n-input 
                    v-model:value="choice.text" 
                    placeholder="选项文字"
                    class="choice-text-input"
                  />
                  <n-select
                    v-model:value="choice.nextNodeId"
                    placeholder="链接到..."
                    :options="nodeOptions"
                    class="choice-select"
                  />
                  <n-button 
                    text 
                    size="tiny"
                    @click="removeChoice(index)"
                  >
                    <template #icon>✕</template>
                  </n-button>
                </div>
                <div v-if="selectedNode.choices?.length === 0" class="empty-choices">
                  还没有分支选项，点击上方按钮添加
                </div>
              </div>
            </div>
          </div>

          <div v-else class="no-node-selected">
            <div class="no-node-icon">✏️</div>
            <p>选择一个章节开始编辑</p>
            <p class="hint">或者创建一个新章节</p>
          </div>
        </n-spin>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  NButton,
  NCard,
  NForm,
  NFormItem,
  NInput,
  NSwitch,
  NSelect,
  NTag,
  NRadioGroup,
  NRadioButton,
  NSpin,
  useMessage
} from 'naive-ui'
import { storyApi } from '../api'

const route = useRoute()
const router = useRouter()
const message = useMessage()

const coverIcons = ['📖', '🏰', '🦊', '🚀', '🌙', '⭐', '🌸', '💫', '🎭', '🌹']

const story = ref({
  id: null,
  title: '',
  summary: '',
  cover: '📖',
  tags: [],
  authorId: 'user-1',
  authorName: '月下独酌'
})

const tagsInput = ref('')
const nodes = ref([])
const selectedNode = ref(null)
const loadingNode = ref(false)
const isEditing = computed(() => !!route.params.id)

const nodeOptions = computed(() => {
  return nodes.value
    .filter(n => n.id !== selectedNode.value?.id)
    .map(n => ({
      label: n.title || '未命名章节',
      value: n.id
    }))
})

const loadStory = async () => {
  if (!route.params.id) return
  
  try {
    const [storyRes, nodesRes] = await Promise.all([
      storyApi.getStory(route.params.id),
      storyApi.getStoryNodes(route.params.id)
    ])
    story.value = storyRes.data
    tagsInput.value = story.value.tags?.join(', ') || ''
    nodes.value = nodesRes.data
    if (nodes.value.length > 0) {
      selectedNode.value = nodes.value[0]
    }
  } catch (err) {
    console.error('加载故事失败:', err)
    message.error('加载故事失败')
  }
}

const saveStory = async () => {
  if (!story.value.title) {
    message.warning('请输入故事标题')
    return
  }

  try {
    if (story.value.id) {
      message.success('故事已保存')
    } else {
      const res = await storyApi.createStory(story.value)
      story.value.id = res.data.id
      message.success('故事创建成功')
    }
  } catch (err) {
    console.error('保存故事失败:', err)
    message.error('保存失败')
  }
}

const addNode = async () => {
  if (!story.value.id) {
    await saveStory()
  }

  try {
    const res = await storyApi.createNode(story.value.id, {
      title: `第${nodes.value.length + 1}章`,
      content: '',
      choices: [],
      isEnding: false
    })
    nodes.value.push(res.data)
    selectedNode.value = res.data
    message.success('章节已创建')
  } catch (err) {
    console.error('创建章节失败:', err)
    message.error('创建章节失败')
  }
}

const selectNode = (node) => {
  saveCurrentNode()
  selectedNode.value = node
}

const saveCurrentNode = async () => {
  if (!selectedNode.value || !story.value.id) return
  
  try {
    await storyApi.updateNode(story.value.id, selectedNode.value.id, {
      title: selectedNode.value.title,
      content: selectedNode.value.content,
      choices: selectedNode.value.choices,
      isEnding: selectedNode.value.isEnding,
      endingType: selectedNode.value.endingType
    })
  } catch (err) {
    console.error('保存章节失败:', err)
  }
}

const deleteNode = async (node) => {
  if (!story.value.id) return
  
  try {
    await storyApi.deleteNode(story.value.id, node.id)
    const index = nodes.value.findIndex(n => n.id === node.id)
    if (index !== -1) {
      nodes.value.splice(index, 1)
    }
    if (selectedNode.value?.id === node.id) {
      selectedNode.value = nodes.value[0] || null
    }
    message.success('章节已删除')
  } catch (err) {
    console.error('删除章节失败:', err)
    message.error('删除失败')
  }
}

const toggleEnding = () => {
  if (selectedNode.value.isEnding) {
    selectedNode.value.endingType = 'normal'
    selectedNode.value.choices = []
  }
}

const addChoice = () => {
  if (!selectedNode.value.choices) {
    selectedNode.value.choices = []
  }
  selectedNode.value.choices.push({
    id: `choice-${Date.now()}`,
    text: '',
    nextNodeId: null
  })
}

const removeChoice = (index) => {
  selectedNode.value.choices.splice(index, 1)
}

const parseTags = () => {
  if (tagsInput.value) {
    story.value.tags = tagsInput.value
      .split(/[,，]/)
      .map(t => t.trim())
      .filter(t => t)
  }
}

const removeTag = (tag) => {
  const index = story.value.tags.indexOf(tag)
  if (index !== -1) {
    story.value.tags.splice(index, 1)
    tagsInput.value = story.value.tags.join(', ')
  }
}

const goBack = () => {
  router.push('/')
}

const previewStory = () => {
  if (story.value.id) {
    router.push(`/story/${story.value.id}`)
  }
}

onMounted(() => {
  loadStory()
})
</script>

<style scoped>
.story-editor {
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
  grid-template-columns: 320px 1fr;
  gap: 24px;
}

.sidebar {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.info-card, .nodes-card {
  border-radius: 12px;
}

.cover-selector {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.cover-option {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
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

.tags-preview {
  margin-top: 8px;
}

.nodes-list {
  max-height: 400px;
  overflow-y: auto;
}

.empty-nodes {
  text-align: center;
  padding: 30px 10px;
  color: #999;
}

.empty-nodes p {
  margin: 4px 0;
}

.empty-nodes .hint {
  font-size: 12px;
  color: #bbb;
}

.node-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 12px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  margin-bottom: 6px;
}

.node-item:hover {
  background: #f5f5f5;
}

.node-item.active {
  background: linear-gradient(135deg, #f0e6ff 0%, #e0ccff 100%);
}

.node-item.ending {
  border-left: 3px solid #faad14;
}

.node-icon {
  font-size: 16px;
}

.node-title {
  flex: 1;
  font-size: 14px;
  color: #333;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.delete-btn {
  opacity: 0;
  transition: opacity 0.2s;
}

.node-item:hover .delete-btn {
  opacity: 1;
}

.main-editor {
  background: white;
  border-radius: 12px;
  padding: 24px;
  min-height: 600px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.node-editor-header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 1px solid #f0f0f0;
}

.node-title-input {
  flex: 1;
  font-size: 18px;
}

.switch-label {
  font-size: 14px;
  color: #666;
}

.ending-type-selector {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
  padding: 12px 16px;
  background: #fffbe6;
  border-radius: 8px;
}

.ending-label {
  font-size: 14px;
  color: #666;
}

.editor-label {
  font-size: 14px;
  font-weight: 500;
  color: #333;
  margin-bottom: 10px;
  display: block;
}

.content-editor {
  margin-bottom: 30px;
}

.content-textarea {
  font-size: 15px;
  line-height: 1.8;
}

.choices-editor {
  border-top: 1px solid #f0f0f0;
  padding-top: 20px;
}

.choices-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.choice-item {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 12px;
  padding: 12px;
  background: #fafafa;
  border-radius: 8px;
}

.choice-index {
  font-weight: bold;
  color: #9d4edd;
  width: 20px;
}

.choice-text-input {
  flex: 1;
}

.choice-select {
  width: 180px;
}

.empty-choices {
  text-align: center;
  padding: 30px;
  color: #999;
  font-size: 14px;
}

.no-node-selected {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 400px;
  color: #999;
}

.no-node-icon {
  font-size: 64px;
  margin-bottom: 16px;
}

.no-node-selected p {
  margin: 4px 0;
}

.no-node-selected .hint {
  font-size: 13px;
  color: #bbb;
}
</style>
