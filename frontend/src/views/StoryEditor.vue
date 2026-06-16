<template>
  <div class="story-editor" :class="{ 'is-mobile': isMobile }">
    <div class="editor-header" :class="{ 'mobile-header': isMobile }">
      <div class="header-left">
        <n-button text @click="goBack">
          <template #icon>←</template>
          <span v-if="!isMobile">返回</span>
        </n-button>
        <h1 class="editor-title" :class="{ 'mobile-title': isMobile }">
          {{ isEditing ? '编辑故事' : '创建新故事' }}
        </h1>
      </div>
      <div class="header-actions" :class="{ 'mobile-actions': isMobile }">
        <span v-if="autoSaveStatus === 'saving'" class="save-status auto-saving">
          自动保存中...
        </span>
        <span v-else-if="autoSaveStatus === 'saved'" class="save-status auto-saved">
          已自动保存 {{ lastAutoSaveTime }}
        </span>
        <span v-else-if="lastSavedTime" class="save-status">
          {{ lastSavedTime }}
        </span>
        <n-button :size="isMobile ? 'small' : 'default'" @click="saveCurrentAsDraft">
          <template #icon>📝</template>
          <span v-if="!isMobile">存草稿</span>
        </n-button>
        <n-button :size="isMobile ? 'small' : 'default'" @click="showVersionPanel = !showVersionPanel" :disabled="!story.id">
          <template #icon>📜</template>
          <span v-if="!isMobile">版本历史</span>
        </n-button>
        <n-button :size="isMobile ? 'small' : 'default'" @click="previewStory" :disabled="!story.id">
          <template #icon>👁️</template>
          <span v-if="!isMobile">预览</span>
        </n-button>
        <n-button type="primary" :size="isMobile ? 'small' : 'default'" @click="saveStory" :loading="saving">
          <template #icon>💾</template>
          <span v-if="!isMobile">保存</span>
        </n-button>
      </div>
    </div>

    <div v-if="isMobile" class="mobile-tabbar">
      <div 
        v-for="tab in mobileTabs" 
        :key="tab.key"
        class="mobile-tab"
        :class="{ active: activeMobileTab === tab.key }"
        @click="activeMobileTab = tab.key"
      >
        <span class="mobile-tab-icon">{{ tab.icon }}</span>
        <span class="mobile-tab-label">{{ tab.label }}</span>
      </div>
    </div>

    <div class="editor-container" :class="{ 'mobile-editor-container': isMobile }">
      <div v-if="!isMobile" class="sidebar">
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

        <n-card title="📝 草稿箱" class="drafts-card">
          <template #header-extra>
            <n-button size="small" text @click="loadDrafts">
              刷新
            </n-button>
          </template>
          <div class="drafts-list">
            <n-spin :show="loadingDrafts" size="small">
              <div v-if="drafts.length === 0" class="empty-drafts">
                <p>暂无草稿</p>
                <p class="hint">自动保存的内容会在这里</p>
              </div>
              <div 
                v-for="draft in drafts" 
                :key="draft.id"
                class="draft-item"
                :class="{ active: currentDraftId === draft.id, 'has-story-link': draft.storyId }"
                @click="openDraft(draft)"
              >
                <div class="draft-icon">📝</div>
                <div class="draft-info">
                  <div class="draft-title">
                    {{ draft.title || '未命名草稿' }}
                    <span v-if="draft.storyId" class="story-link-tag" title="关联已有故事">🔗 已关联</span>
                  </div>
                  <div class="draft-meta">
                    <span v-if="draft.autoSaved" class="auto-tag">自动保存</span>
                    <span class="draft-time">{{ draft.lastSavedAt }}</span>
                  </div>
                  <div v-if="draft.nodes?.length > 0" class="draft-nodes">
                    {{ draft.nodes.length }} 个章节
                  </div>
                </div>
                <div class="draft-actions">
                  <n-button 
                    v-if="draft.storyId"
                    text 
                    size="tiny" 
                    type="success"
                    @click.stop="saveToOriginalStory(draft)"
                  >
                    保存到原故事
                  </n-button>
                  <n-button 
                    text 
                    size="tiny" 
                    type="primary"
                    @click.stop="publishDraft(draft)"
                  >
                    {{ draft.storyId ? '更新原故事' : '发布' }}
                  </n-button>
                  <n-popconfirm @positive-click="deleteDraft(draft)">
                    <template #trigger>
                      <n-button text size="tiny" type="error">
                        <template #icon>🗑️</template>
                      </n-button>
                    </template>
                    确定删除这个草稿吗？
                  </n-popconfirm>
                </div>
              </div>
            </n-spin>
          </div>
        </n-card>

        <n-card title="📜 版本历史" class="versions-card" v-if="story.id">
          <template #header-extra>
            <n-button size="small" type="primary" @click="saveVersion" :loading="savingVersion">
              <template #icon>💾</template>
              保存版本
            </n-button>
          </template>
          <div class="versions-list">
            <n-spin :show="loadingVersions" size="small">
              <div v-if="versions.length === 0" class="empty-versions">
                <p>暂无版本记录</p>
                <p class="hint">点击"保存版本"记录当前状态</p>
              </div>
              <div 
                v-for="version in versions" 
                :key="version.id"
                class="version-item"
              >
                <div class="version-info">
                  <div class="version-title">v{{ version.version }}</div>
                  <div class="version-desc">{{ version.changeSummary }}</div>
                  <div class="version-meta">
                    <span class="version-time">{{ version.createdAt }}</span>
                    <span class="version-author">{{ version.savedByName }}</span>
                  </div>
                </div>
                <div class="version-actions">
                  <n-button 
                    text 
                    size="tiny" 
                    type="primary"
                    @click="restoreVersion(version)"
                  >
                    恢复
                  </n-button>
                  <n-popconfirm @positive-click="deleteVersion(version)">
                    <template #trigger>
                      <n-button text size="tiny" type="error">
                        <template #icon>🗑️</template>
                      </n-button>
                    </template>
                    确定删除这个版本吗？
                  </n-popconfirm>
                </div>
              </div>
            </n-spin>
          </div>
        </n-card>
      </div>

      <div v-else-if="activeMobileTab === 'info'" class="mobile-panel">
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
      </div>

      <div v-else-if="activeMobileTab === 'nodes'" class="mobile-panel">
        <div class="mobile-panel-header">
          <span class="mobile-panel-title">章节节点</span>
          <n-button size="small" type="primary" @click="addNode">
            <template #icon>+</template>
            新增
          </n-button>
        </div>
        <div class="nodes-list">
          <div v-if="nodes.length === 0" class="empty-nodes">
            <p>还没有章节节点</p>
            <p class="hint">点击"新增"开始创作</p>
          </div>
          <div 
            v-for="(node, index) in nodes" 
            :key="node.id"
            class="node-item"
            :class="{ 
              active: selectedNode?.id === node.id,
              ending: node.isEnding 
            }"
            @click="selectNode(node); activeMobileTab = 'edit'"
          >
            <div class="node-index">{{ index + 1 }}</div>
            <div class="node-content-wrap">
              <div class="node-row">
                <span class="node-icon">{{ node.isEnding ? '🏁' : '📄' }}</span>
                <span class="node-title">{{ node.title || '未命名章节' }}</span>
              </div>
              <div v-if="node.content" class="node-preview">{{ node.content.slice(0, 30) }}...</div>
            </div>
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
      </div>

      <div v-else-if="activeMobileTab === 'drafts'" class="mobile-panel">
        <div class="mobile-panel-header">
          <span class="mobile-panel-title">📝 草稿箱</span>
          <n-button size="small" text @click="loadDrafts">
            刷新
          </n-button>
        </div>
        <n-spin :show="loadingDrafts">
          <div v-if="drafts.length === 0" class="empty-drafts">
            <p>暂无草稿</p>
            <p class="hint">自动保存的内容会在这里</p>
          </div>
          <div v-else class="drafts-list">
            <div 
              v-for="draft in drafts" 
              :key="draft.id"
              class="draft-item mobile-draft-item"
              :class="{ active: currentDraftId === draft.id, 'has-story-link': draft.storyId }"
              @click="openDraft(draft)"
            >
              <div class="draft-icon">📝</div>
              <div class="draft-info">
                <div class="draft-title">
                  {{ draft.title || '未命名草稿' }}
                  <span v-if="draft.storyId" class="story-link-tag">🔗 已关联</span>
                </div>
                <div class="draft-meta">
                  <span v-if="draft.autoSaved" class="auto-tag">自动保存</span>
                  <span class="draft-time">{{ draft.lastSavedAt }}</span>
                </div>
                <div v-if="draft.nodes?.length > 0" class="draft-nodes">
                  {{ draft.nodes.length }} 个章节
                </div>
              </div>
            </div>
            <div v-for="draft in drafts" :key="'actions-' + draft.id" class="draft-actions-row">
              <n-button 
                v-if="draft.storyId"
                size="small" 
                type="success"
                @click="saveToOriginalStory(draft)"
                block
              >
                保存到原故事
              </n-button>
              <n-button 
                size="small" 
                type="primary"
                @click="publishDraft(draft)"
                block
              >
                {{ draft.storyId ? '更新原故事' : '发布草稿' }}
              </n-button>
              <n-popconfirm @positive-click="deleteDraft(draft)">
                <template #trigger>
                  <n-button size="small" type="error" ghost>
                    删除
                  </n-button>
                </template>
                确定删除这个草稿吗？
              </n-popconfirm>
            </div>
          </div>
        </n-spin>
      </div>

      <div v-else-if="activeMobileTab === 'versions'" class="mobile-panel">
        <div class="mobile-panel-header">
          <span class="mobile-panel-title">📜 版本历史</span>
          <n-button 
            size="small" 
            type="primary" 
            @click="saveVersion" 
            :loading="savingVersion"
            :disabled="!story.id"
          >
            <template #icon>💾</template>
            保存版本
          </n-button>
        </div>
        <n-spin :show="loadingVersions">
          <div v-if="!story.id" class="empty-versions">
            <p>请先保存故事</p>
            <p class="hint">保存后才能使用版本历史功能</p>
          </div>
          <div v-else-if="versions.length === 0" class="empty-versions">
            <p>暂无版本记录</p>
            <p class="hint">点击"保存版本"记录当前状态</p>
          </div>
          <div v-else class="versions-list">
            <div 
              v-for="version in versions" 
              :key="version.id"
              class="version-item mobile-version-item"
            >
              <div class="version-info">
                <div class="version-title">v{{ version.version }}</div>
                <div class="version-desc">{{ version.changeSummary }}</div>
                <div class="version-meta">
                  <span class="version-time">{{ version.createdAt }}</span>
                  <span class="version-author">{{ version.savedByName }}</span>
                </div>
              </div>
            </div>
            <div v-for="version in versions" :key="'v-actions-' + version.id" class="version-actions-row">
              <n-button 
                size="small" 
                type="primary"
                @click="restoreVersion(version)"
                block
              >
                恢复此版本
              </n-button>
              <n-popconfirm @positive-click="deleteVersion(version)">
                <template #trigger>
                  <n-button size="small" type="error" ghost>
                    删除
                  </n-button>
                </template>
                确定删除这个版本吗？
              </n-popconfirm>
            </div>
          </div>
        </n-spin>
      </div>

      <div class="main-editor" :class="{ 'mobile-main-editor': isMobile, 'mobile-panel': isMobile && activeMobileTab === 'edit' }">
        <n-spin :show="loadingNode" size="large">
          <div v-if="selectedNode" class="node-editor">
            <div class="node-editor-header" :class="{ 'mobile-node-editor-header': isMobile }">
              <n-input 
                v-model:value="selectedNode.title" 
                placeholder="章节标题"
                class="node-title-input"
                :class="{ 'mobile-node-title-input': isMobile }"
              />
              <div class="ending-switch-wrap">
                <n-switch 
                  v-model:value="selectedNode.isEnding" 
                  @update:value="toggleEnding"
                />
                <span class="switch-label">{{ selectedNode.isEnding ? '结局' : '普通' }}</span>
              </div>
            </div>

            <div v-if="selectedNode.isEnding" class="ending-type-selector">
              <span class="ending-label">结局类型：</span>
              <n-radio-group v-model:value="selectedNode.endingType" :size="isMobile ? 'small' : 'small'">
                <n-radio-button value="good">
                  ✨ 完美
                </n-radio-button>
                <n-radio-button value="normal">
                  🌟 普通
                </n-radio-button>
                <n-radio-button value="bad">
                  💔 遗憾
                </n-radio-button>
              </n-radio-group>
            </div>

            <div class="content-editor">
              <div class="editor-label">章节内容</div>
              <n-input
                v-model:value="selectedNode.content"
                type="textarea"
                :rows="isMobile ? 10 : 12"
                placeholder="在这里写下你的故事..."
                class="content-textarea"
                :class="{ 'mobile-content-textarea': isMobile }"
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
              <div class="choices-list" :class="{ 'mobile-choices-list': isMobile }">
                <div 
                  v-for="(choice, index) in selectedNode.choices" 
                  :key="choice.id"
                  class="choice-item"
                  :class="{ 'mobile-choice-item': isMobile }"
                >
                  <span class="choice-index">{{ index + 1 }}.</span>
                  <div v-if="isMobile" class="mobile-choice-col">
                    <n-input 
                      v-model:value="choice.text" 
                      placeholder="选项文字"
                      class="choice-text-input"
                    />
                    <n-select
                      v-model:value="choice.nextNodeId"
                      placeholder="链接到..."
                      :options="nodeOptions"
                      class="choice-select mobile-choice-select"
                      size="small"
                    />
                  </div>
                  <template v-else>
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
                  </template>
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

            <div class="references-editor">
              <div class="references-header">
                <span class="editor-label">🌍 关联设定条目</span>
                <n-button size="small" type="primary" @click="openWorldPicker">
                  <template #icon>+</template>
                  关联设定
                </n-button>
              </div>
              <div v-if="selectedNode.referencedEntries?.length > 0" class="references-list">
                <div 
                  v-for="ref in selectedNode.referencedEntries" 
                  :key="ref.entryId"
                  class="reference-card"
                >
                  <div class="ref-icon">📚</div>
                  <div class="ref-info">
                    <div class="ref-world" :title="ref.worldName">
                      {{ ref.worldName }}
                    </div>
                    <div class="ref-entry">
                      <n-tag size="small" type="primary" style="margin-right: 6px;">
                        {{ ref.entryCategory }}
                      </n-tag>
                      {{ ref.entryTitle }}
                    </div>
                  </div>
                  <n-button 
                    text 
                    size="tiny" 
                    type="error"
                    @click="removeReference(ref)"
                  >
                    <template #icon>✕</template>
                  </n-button>
                </div>
              </div>
              <div v-else class="empty-references">
                <n-alert type="info" :show-icon="true">
                  暂无关联设定，点击"关联设定"添加
                </n-alert>
              </div>
            </div>
          </div>

          <div v-else class="no-node-selected">
            <div class="no-node-icon">✏️</div>
            <p>选择一个章节开始编辑</p>
            <p class="hint">或者创建一个新章节</p>
            <n-button 
              v-if="isMobile" 
              type="primary" 
              size="medium"
              @click="addNode"
              style="margin-top: 16px;"
            >
              <template #icon>+</template>
              创建章节
            </n-button>
          </div>
        </n-spin>
      </div>
    </div>

    <n-modal
      v-model:show="showWorldPicker"
      preset="card"
      title="选择世界设定"
      style="width: min(640px, 90vw);"
      :mask-closable="true"
    >
      <div class="world-picker-content">
        <n-select
          v-model:value="pickerWorldId"
          placeholder="选择世界观..."
          :options="worldOptions"
          style="margin-bottom: 16px;"
          @update:value="loadWorldEntries"
        />
        
        <div v-if="loadingWorlds" class="picker-loading">
          加载中...
        </div>
        
        <div v-else-if="pickerWorldId && pickerWorld" class="picker-entry-list">
          <div class="picker-entries">
            <div
              v-for="entry in pickerWorld.entries || []"
              :key="entry.id"
              class="picker-entry-item"
              :class="{ selected: isEntrySelected(entry.id) }"
              @click="toggleEntrySelection(entry)"
            >
              <div class="picker-entry-check">
                <span v-if="isEntrySelected(entry.id)">✓</span>
              </div>
              <div class="picker-entry-info">
                <n-tag size="small" type="primary" style="margin-right: 6px;">
                  {{ entry.category }}
                </n-tag>
                <span class="picker-entry-title">{{ entry.title }}</span>
              </div>
              <div class="picker-entry-preview" :title="entry.content">
                {{ entry.content?.slice(0, 40) || '' }}{{ entry.content?.length > 40 ? '...' : '' }}
              </div>
            </div>
          </div>
          <div v-if="pickerWorld.entries?.length === 0" class="picker-empty">
            该世界观暂无设定条目
          </div>
        </div>
        <div v-else-if="!pickerWorldId" class="picker-hint">
          请先选择世界观
        </div>
      </div>

      <template #footer>
        <div style="display: flex; justify-content: flex-end; gap: 8px;">
          <n-button @click="showWorldPicker = false">取消</n-button>
          <n-button type="primary" @click="confirmReferences" :disabled="pickerSelectedEntries.length === 0">
            确定关联 ({{ pickerSelectedEntries.length }})
          </n-button>
        </div>
      </template>
    </n-modal>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
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
  NModal,
  NAlert,
  NEmpty,
  NPopconfirm,
  NDivider,
  useMessage,
  useDialog
} from 'naive-ui'
import { storyApi, worldApi } from '../api'
import { useResponsive } from '../composables/useResponsive'

const route = useRoute()
const router = useRouter()
const message = useMessage()
const dialog = useDialog()
const { isMobile } = useResponsive()

const userId = 'user-1'
const userName = '月下独酌'
const userAvatar = '🌸'

const coverIcons = ['📖', '🏰', '🦊', '🚀', '🌙', '⭐', '🌸', '💫', '🎭', '🌹']

const mobileTabs = [
  { key: 'info', label: '信息', icon: '📋' },
  { key: 'nodes', label: '章节', icon: '📚' },
  { key: 'edit', label: '编辑', icon: '✏️' },
  { key: 'drafts', label: '草稿', icon: '📝' },
  { key: 'versions', label: '版本', icon: '📜' }
]

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
const saving = ref(false)
const isEditing = computed(() => !!route.params.id)
const lastSavedTime = ref('')
const activeMobileTab = ref('info')

const autoSaveEnabled = ref(true)
const autoSaveInterval = ref(null)
const autoSaveStatus = ref('')
const lastAutoSaveTime = ref('')
const currentDraftId = ref(null)
const isDraftMode = computed(() => !!currentDraftId.value && !story.value.id)

const drafts = ref([])
const loadingDrafts = ref(false)

const versions = ref([])
const loadingVersions = ref(false)
const savingVersion = ref(false)
const showVersionPanel = ref(false)
const selectedVersion = ref(null)

const showWorldPicker = ref(false)
const pickerWorldId = ref(null)
const pickerWorld = ref(null)
const allWorlds = ref([])
const loadingWorlds = ref(false)
const pickerSelectedEntries = ref([])

const worldOptions = computed(() => {
  return allWorlds.value.map(w => ({
    label: `${w.cover || '🌍'} ${w.name}`,
    value: w.id
  }))
})

const nodeOptions = computed(() => {
  return nodes.value
    .filter(n => n.id !== selectedNode.value?.id)
    .map(n => ({
      label: n.title || '未命名章节',
      value: n.id
    }))
})

const updateLastSavedTime = () => {
  const now = new Date()
  const h = String(now.getHours()).padStart(2, '0')
  const m = String(now.getMinutes()).padStart(2, '0')
  lastSavedTime.value = `已保存 ${h}:${m}`
}

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
      if (isMobile.value) {
        activeMobileTab.value = 'edit'
      }
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

  parseTags()

  saving.value = true
  try {
    if (story.value.id) {
      await storyApi.updateStory(story.value.id, {
        title: story.value.title,
        summary: story.value.summary,
        cover: story.value.cover,
        tags: story.value.tags
      })
      message.success('故事已保存')
    } else {
      const res = await storyApi.createStory(story.value)
      story.value.id = res.data.id
      message.success('故事创建成功')
    }
    await saveCurrentNode()
    updateLastSavedTime()
  } catch (err) {
    console.error('保存故事失败:', err)
    message.error('保存失败')
  } finally {
    saving.value = false
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
    if (isMobile.value) {
      activeMobileTab.value = 'edit'
    }
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

const loadAllWorlds = async () => {
  loadingWorlds.value = true
  try {
    const res = await worldApi.getWorlds()
    allWorlds.value = res.data || []
  } catch (e) {
    console.error('加载世界观列表失败:', e)
    message.error('加载世界观列表失败')
  } finally {
    loadingWorlds.value = false
  }
}

const loadWorldEntries = async (worldId) => {
  if (!worldId) {
    pickerWorld.value = null
    return
  }
  loadingWorlds.value = true
  try {
    const res = await worldApi.getWorld(worldId)
    pickerWorld.value = res.data
  } catch (e) {
    console.error('加载世界观条目失败:', e)
    message.error('加载世界观条目失败')
  } finally {
    loadingWorlds.value = false
  }
}

const openWorldPicker = async () => {
  if (!selectedNode.value) {
    message.warning('请先选择一个章节')
    return
  }
  if (allWorlds.value.length === 0) {
    await loadAllWorlds()
  }
  pickerWorldId.value = null
  pickerWorld.value = null
  pickerSelectedEntries.value = []
  showWorldPicker.value = true
}

const isEntrySelected = (entryId) => {
  return pickerSelectedEntries.value.some(e => e.id === entryId)
}

const toggleEntrySelection = (entry) => {
  const idx = pickerSelectedEntries.value.findIndex(e => e.id === entry.id)
  if (idx >= 0) {
    pickerSelectedEntries.value.splice(idx, 1)
  } else {
    pickerSelectedEntries.value.push(entry)
  }
}

const confirmReferences = async () => {
  if (!selectedNode.value || !pickerWorld.value || pickerSelectedEntries.value.length === 0) {
    return
  }
  
  try {
    if (!selectedNode.value.referencedEntries) {
      selectedNode.value.referencedEntries = []
    }
    
    const existingIds = new Set(selectedNode.value.referencedEntries.map(r => r.entryId))
    
    for (const entry of pickerSelectedEntries.value) {
      if (existingIds.has(entry.id)) continue
      
      const refData = {
        entryId: entry.id,
        entryTitle: entry.title,
        entryCategory: entry.category,
        worldId: pickerWorld.value.id,
        worldName: pickerWorld.value.name
      }
      
      try {
        await storyApi.addNodeReference(story.value.id, selectedNode.value.id, refData)
        selectedNode.value.referencedEntries.push(refData)
      } catch (e) {
        console.error('添加关联失败:', e)
      }
    }
    
    message.success(`已关联 ${pickerSelectedEntries.value.length} 个设定条目`)
    showWorldPicker.value = false
  } catch (e) {
    console.error('确认关联失败:', e)
    message.error('关联设定失败')
  }
}

const removeReference = async (ref) => {
  if (!selectedNode.value) return
  
  try {
    await storyApi.removeNodeReference(story.value.id, selectedNode.value.id, {
      entryId: ref.entryId
    })
    
    const idx = selectedNode.value.referencedEntries.findIndex(r => r.entryId === ref.entryId)
    if (idx >= 0) {
      selectedNode.value.referencedEntries.splice(idx, 1)
    }
    message.success('已取消关联')
  } catch (e) {
    console.error('取消关联失败:', e)
    message.error('取消关联失败')
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

const startAutoSave = () => {
  if (autoSaveInterval.value) {
    clearInterval(autoSaveInterval.value)
  }
  if (autoSaveEnabled.value) {
    autoSaveInterval.value = setInterval(() => {
      autoSaveDraft()
    }, 30000)
  }
}

const stopAutoSave = () => {
  if (autoSaveInterval.value) {
    clearInterval(autoSaveInterval.value)
    autoSaveInterval.value = null
  }
}

const autoSaveDraft = async () => {
  if (!autoSaveEnabled.value) return
  
  try {
    autoSaveStatus.value = 'saving'
    
    const draftData = {
      userId,
      storyId: story.value.id || null,
      title: story.value.title || '未命名草稿',
      summary: story.value.summary || '',
      cover: story.value.cover || '📖',
      tags: story.value.tags || [],
      nodes: nodes.value || [],
      autoSaved: true
    }
    
    if (currentDraftId.value) {
      await storyApi.updateDraft(currentDraftId.value, draftData)
    } else {
      const res = await storyApi.createDraft(draftData)
      currentDraftId.value = res.data.id
    }
    
    const now = new Date()
    const h = String(now.getHours()).padStart(2, '0')
    const m = String(now.getMinutes()).padStart(2, '0')
    lastAutoSaveTime.value = `${h}:${m}`
    autoSaveStatus.value = 'saved'
    
    setTimeout(() => {
      if (autoSaveStatus.value === 'saved') {
        autoSaveStatus.value = ''
      }
    }, 2000)
  } catch (err) {
    console.error('自动保存失败:', err)
    autoSaveStatus.value = 'error'
  }
}

const loadDrafts = async () => {
  loadingDrafts.value = true
  try {
    const res = await storyApi.getDrafts(userId)
    drafts.value = res.data.drafts || []
  } catch (err) {
    console.error('加载草稿失败:', err)
    message.error('加载草稿失败')
  } finally {
    loadingDrafts.value = false
  }
}

const openDraft = async (draft) => {
  try {
    const res = await storyApi.getDraft(draft.id)
    const draftData = res.data
    
    if (draftData.storyId) {
      const confirmRes = await storyApi.getStory(draftData.storyId)
      const originalStory = confirmRes.data
      
      story.value = {
        ...originalStory,
        title: draftData.title,
        summary: draftData.summary,
        cover: draftData.cover,
        tags: draftData.tags || []
      }
      tagsInput.value = (draftData.tags || []).join(', ')
      nodes.value = draftData.nodes || []
      currentDraftId.value = draftData.id
      
      message.success('已加载草稿，编辑后可选择保存到原故事')
    } else {
      story.value = {
        id: null,
        title: draftData.title,
        summary: draftData.summary,
        cover: draftData.cover,
        tags: draftData.tags || [],
        authorId: userId,
        authorName: userName
      }
      tagsInput.value = (draftData.tags || []).join(', ')
      nodes.value = draftData.nodes || []
      currentDraftId.value = draftData.id
      
      message.success('已加载草稿')
    }
    
    if (nodes.value.length > 0) {
      selectedNode.value = nodes.value[0]
    } else {
      selectedNode.value = null
    }
    
    if (isMobile.value) {
      activeMobileTab.value = 'edit'
    }
  } catch (err) {
    console.error('加载草稿失败:', err)
    message.error('加载草稿失败')
  }
}

const deleteDraft = async (draft) => {
  try {
    await storyApi.deleteDraft(draft.id)
    const index = drafts.value.findIndex(d => d.id === draft.id)
    if (index !== -1) {
      drafts.value.splice(index, 1)
    }
    if (currentDraftId.value === draft.id) {
      currentDraftId.value = null
    }
    message.success('草稿已删除')
  } catch (err) {
    console.error('删除草稿失败:', err)
    message.error('删除草稿失败')
  }
}

const publishDraft = async (draft) => {
  try {
    const res = await storyApi.publishDraft(draft.id, {
      userId,
      authorName: userName
    })
    
    story.value = res.data.story
    nodes.value = res.data.nodes
    currentDraftId.value = null
    
    if (nodes.value.length > 0) {
      selectedNode.value = nodes.value[0]
    }
    
    const index = drafts.value.findIndex(d => d.id === draft.id)
    if (index !== -1) {
      drafts.value.splice(index, 1)
    }
    
    if (res.data.isUpdate) {
      message.success('已更新原故事')
    } else {
      message.success('草稿已发布')
    }
    
    loadVersions()
    
    if (isMobile.value) {
      activeMobileTab.value = 'edit'
    }
  } catch (err) {
    console.error('发布草稿失败:', err)
    message.error('发布草稿失败')
  }
}

const saveToOriginalStory = async (draft) => {
  try {
    const res = await storyApi.applyDraftToStory(draft.id)
    
    story.value = res.data.story
    nodes.value = res.data.nodes
    
    if (nodes.value.length > 0) {
      selectedNode.value = nodes.value[0]
    }
    
    const draftInList = drafts.value.find(d => d.id === draft.id)
    if (draftInList) {
      draftInList.lastSavedAt = new Date().toISOString().replace('T', ' ').slice(0, 16)
    }
    
    message.success('已将草稿内容保存到原故事')
    loadVersions()
    
    if (isMobile.value) {
      activeMobileTab.value = 'edit'
    }
  } catch (err) {
    console.error('保存到原故事失败:', err)
    message.error('保存到原故事失败')
  }
}

const saveCurrentAsDraft = async () => {
  try {
    const draftData = {
      userId,
      storyId: story.value.id || null,
      title: story.value.title || '未命名草稿',
      summary: story.value.summary || '',
      cover: story.value.cover || '📖',
      tags: story.value.tags || [],
      nodes: nodes.value || [],
      autoSaved: false
    }
    
    if (currentDraftId.value) {
      await storyApi.updateDraft(currentDraftId.value, draftData)
      message.success('草稿已更新')
    } else {
      const res = await storyApi.createDraft(draftData)
      currentDraftId.value = res.data.id
      message.success('已保存到草稿箱')
    }
    
    loadDrafts()
  } catch (err) {
    console.error('保存草稿失败:', err)
    message.error('保存草稿失败')
  }
}

const loadVersions = async () => {
  if (!story.value.id) return
  
  loadingVersions.value = true
  try {
    const res = await storyApi.getStoryVersions(story.value.id)
    versions.value = res.data.versions || []
  } catch (err) {
    console.error('加载版本历史失败:', err)
    message.error('加载版本历史失败')
  } finally {
    loadingVersions.value = false
  }
}

const saveVersion = async () => {
  if (!story.value.id) {
    message.warning('请先保存故事')
    return
  }
  
  savingVersion.value = true
  try {
    await saveCurrentNode()
    
    const res = await storyApi.createStoryVersion(story.value.id, {
      changeSummary: `手动保存版本 - ${new Date().toLocaleString()}`,
      savedBy: userId,
      savedByName: userName,
      savedByAvatar: userAvatar
    })
    
    versions.value.unshift(res.data)
    message.success('版本已保存')
  } catch (err) {
    console.error('保存版本失败:', err)
    message.error('保存版本失败')
  } finally {
    savingVersion.value = false
  }
}

const restoreVersion = async (version) => {
  if (!story.value.id) return
  
  dialog.warning({
    title: '确认恢复版本',
    content: `确定要恢复到版本 v${version.version} 吗？当前未保存的修改将会丢失。`,
    positiveText: '确认恢复',
    negativeText: '取消',
    onPositiveClick: async () => {
      try {
        const res = await storyApi.restoreStoryVersion(story.value.id, version.id)
        
        story.value = res.data.story
        tagsInput.value = (res.data.story.tags || []).join(', ')
        nodes.value = res.data.nodes || []
        
        if (nodes.value.length > 0) {
          selectedNode.value = nodes.value[0]
        } else {
          selectedNode.value = null
        }
        
        message.success('已恢复到该版本')
        loadVersions()
      } catch (err) {
        console.error('恢复版本失败:', err)
        message.error('恢复版本失败')
      }
    }
  })
}

const deleteVersion = async (version) => {
  if (!story.value.id) return
  
  try {
    await storyApi.deleteStoryVersion(story.value.id, version.id)
    const index = versions.value.findIndex(v => v.id === version.id)
    if (index !== -1) {
      versions.value.splice(index, 1)
    }
    message.success('版本已删除')
  } catch (err) {
    console.error('删除版本失败:', err)
    message.error('删除版本失败')
  }
}

onMounted(() => {
  loadStory()
  loadDrafts()
  if (story.value.id) {
    loadVersions()
  }
  startAutoSave()
})

onUnmounted(() => {
  stopAutoSave()
})

watch(() => story.value.id, (newId) => {
  if (newId) {
    loadVersions()
  }
})

watch(activeMobileTab, (tab) => {
  if (tab === 'drafts') {
    loadDrafts()
  } else if (tab === 'versions') {
    loadVersions()
  }
})
</script>

<style scoped>
.story-editor {
  padding-bottom: 40px;
}

.story-editor.is-mobile {
  padding-bottom: 0;
}

.editor-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 0;
  border-bottom: 1px solid #f0f0f0;
  margin-bottom: 24px;
}

.editor-header.mobile-header {
  padding: 12px 0;
  margin-bottom: 12px;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.header-left {
  gap: 8px;
}

.editor-title {
  font-size: 24px;
  margin: 0;
  color: #333;
}

.editor-title.mobile-title {
  font-size: 16px;
}

.header-actions {
  display: flex;
  gap: 12px;
  align-items: center;
}

.header-actions.mobile-actions {
  gap: 6px;
}

.save-status {
  font-size: 12px;
  color: #52c41a;
}

.mobile-tabbar {
  display: flex;
  background: white;
  border-bottom: 1px solid #f0f0f0;
  margin: 0 -12px 12px;
  padding: 0 12px;
}

.mobile-tab {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 10px 0;
  gap: 2px;
  cursor: pointer;
  color: #999;
  border-bottom: 2px solid transparent;
  transition: all 0.2s;
}

.mobile-tab.active {
  color: #9d4edd;
  border-bottom-color: #9d4edd;
}

.mobile-tab-icon {
  font-size: 20px;
}

.mobile-tab-label {
  font-size: 12px;
}

.editor-container {
  display: grid;
  grid-template-columns: 320px 1fr;
  gap: 24px;
}

.editor-container.mobile-editor-container {
  grid-template-columns: 1fr;
  gap: 12px;
}

.mobile-panel {
  background: white;
  border-radius: 12px;
  padding: 16px;
  min-height: 60vh;
}

.mobile-panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.mobile-panel-title {
  font-size: 18px;
  font-weight: 600;
  color: #333;
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

.node-index {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: #9d4edd;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 600;
  flex-shrink: 0;
}

.node-content-wrap {
  flex: 1;
  min-width: 0;
}

.node-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.node-preview {
  font-size: 12px;
  color: #999;
  margin-top: 4px;
  padding-left: 24px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.node-icon {
  font-size: 16px;
  flex-shrink: 0;
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

.node-item .delete-btn {
  opacity: 1;
}

.main-editor {
  background: white;
  border-radius: 12px;
  padding: 24px;
  min-height: 600px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.main-editor.mobile-main-editor {
  padding: 0;
  min-height: auto;
  box-shadow: none;
  background: transparent;
}

.node-editor-header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 1px solid #f0f0f0;
}

.node-editor-header.mobile-node-editor-header {
  gap: 10px;
  margin-bottom: 16px;
  padding-bottom: 12px;
}

.node-title-input {
  flex: 1;
  font-size: 18px;
}

.node-title-input.mobile-node-title-input {
  font-size: 16px;
}

.ending-switch-wrap {
  display: flex;
  align-items: center;
  gap: 8px;
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
  flex-wrap: wrap;
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

.content-textarea.mobile-content-textarea {
  font-size: 16px;
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

.choices-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.choices-list.mobile-choices-list {
  gap: 10px;
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

.choice-item.mobile-choice-item {
  padding: 10px;
  flex-direction: row;
  align-items: flex-start;
}

.mobile-choice-col {
  display: flex;
  flex-direction: column;
  gap: 8px;
  flex: 1;
}

.choice-index {
  font-weight: bold;
  color: #9d4edd;
  width: 20px;
  flex-shrink: 0;
}

.choice-text-input {
  flex: 1;
}

.choice-select {
  width: 180px;
  flex-shrink: 0;
}

.choice-select.mobile-choice-select {
  width: 100%;
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

.references-editor {
  margin-top: 24px;
  padding-top: 24px;
  border-top: 1px solid #f0f0f0;
}

.references-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.references-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.reference-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 14px;
  background: linear-gradient(135deg, #e6f7ff 0%, #e6fffb 100%);
  border-radius: 10px;
  border: 1px solid #b3e5fc;
}

.ref-icon {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: white;
  border-radius: 8px;
  font-size: 18px;
  flex-shrink: 0;
}

.ref-info {
  flex: 1;
  min-width: 0;
}

.ref-world {
  font-size: 12px;
  color: #888;
  margin-bottom: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.ref-entry {
  font-size: 14px;
  color: #333;
  display: flex;
  align-items: center;
}

.empty-references {
  margin-top: 8px;
}

.world-picker-content {
  max-height: 60vh;
  overflow-y: auto;
}

.picker-loading {
  text-align: center;
  padding: 40px;
  color: #999;
}

.picker-entry-list {
  display: flex;
  flex-direction: column;
}

.picker-entries {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.picker-entry-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 14px;
  border-radius: 10px;
  border: 1px solid #e8e8e8;
  cursor: pointer;
  transition: all 0.2s;
  background: white;
}

.picker-entry-item:hover {
  border-color: #1890ff;
  background: #f0f9ff;
}

.picker-entry-item.selected {
  border-color: #1890ff;
  background: linear-gradient(135deg, #e6f7ff 0%, #bae7ff 100%);
}

.picker-entry-check {
  width: 24px;
  height: 24px;
  border-radius: 6px;
  border: 2px solid #ddd;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  font-size: 14px;
  color: white;
  background: white;
  transition: all 0.2s;
}

.picker-entry-item.selected .picker-entry-check {
  background: #1890ff;
  border-color: #1890ff;
}

.picker-entry-info {
  flex: 1;
  display: flex;
  align-items: center;
}

.picker-entry-title {
  font-size: 14px;
  color: #333;
  font-weight: 500;
}

.picker-entry-preview {
  font-size: 12px;
  color: #999;
  max-width: 200px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.picker-empty {
  text-align: center;
  padding: 30px;
  color: #999;
}

.picker-hint {
  text-align: center;
  padding: 40px;
  color: #bbb;
}

.save-status.auto-saving {
  color: #1890ff;
}

.save-status.auto-saved {
  color: #52c41a;
}

.drafts-card, .versions-card {
  border-radius: 12px;
}

.drafts-list, .versions-list {
  max-height: 300px;
  overflow-y: auto;
}

.empty-drafts, .empty-versions {
  text-align: center;
  padding: 24px 10px;
  color: #999;
}

.empty-drafts p, .empty-versions p {
  margin: 4px 0;
}

.empty-drafts .hint, .empty-versions .hint {
  font-size: 12px;
  color: #bbb;
}

.draft-item {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 12px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  margin-bottom: 8px;
  background: #fafafa;
  border: 1px solid transparent;
}

.draft-item:hover {
  background: #f0f5ff;
  border-color: #bae7ff;
}

.draft-item.active {
  background: linear-gradient(135deg, #e6f7ff 0%, #bae7ff 100%);
  border-color: #1890ff;
}

.draft-icon {
  font-size: 24px;
  flex-shrink: 0;
}

.draft-info {
  flex: 1;
  min-width: 0;
}

.draft-title {
  font-size: 14px;
  font-weight: 500;
  color: #333;
  margin-bottom: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.draft-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 4px;
  flex-wrap: wrap;
}

.auto-tag {
  font-size: 10px;
  padding: 1px 6px;
  background: #e6f7ff;
  color: #1890ff;
  border-radius: 4px;
}

.story-link-tag {
  font-size: 10px;
  padding: 1px 6px;
  background: #f6ffed;
  color: #52c41a;
  border-radius: 4px;
  margin-left: 6px;
}

.has-story-link {
  border-left: 3px solid #52c41a;
}

.draft-actions-row {
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
  padding: 0 8px;
}

.draft-actions-row .n-button {
  flex: 1;
}

.draft-time {
  font-size: 11px;
  color: #999;
}

.draft-nodes {
  font-size: 12px;
  color: #666;
}

.draft-actions {
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex-shrink: 0;
}

.mobile-draft-item {
  margin-bottom: 0;
}

.draft-actions-row {
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
  padding: 0 4px;
}

.draft-actions-row .n-button {
  flex: 1;
}

.version-item {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 12px;
  border-radius: 8px;
  margin-bottom: 8px;
  background: #fafafa;
  border: 1px solid #f0f0f0;
}

.version-info {
  flex: 1;
  min-width: 0;
}

.version-title {
  font-size: 14px;
  font-weight: 600;
  color: #9d4edd;
  margin-bottom: 4px;
}

.version-desc {
  font-size: 12px;
  color: #666;
  margin-bottom: 6px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.version-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.version-time, .version-author {
  font-size: 11px;
  color: #999;
}

.version-actions {
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex-shrink: 0;
}

.mobile-version-item {
  margin-bottom: 0;
}

.version-actions-row {
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
  padding: 0 4px;
}

.version-actions-row .n-button {
  flex: 1;
}
</style>
