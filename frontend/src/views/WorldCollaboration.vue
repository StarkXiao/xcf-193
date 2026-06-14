<template>
  <div class="world-collaboration">
    <div class="collab-header">
      <div class="header-left">
        <n-button text @click="goBack">
          <template #icon>←</template>
          返回世界详情
        </n-button>
        <h1 class="page-title">🤝 多人共创管理</h1>
        <n-tag v-if="world" type="primary" size="small">{{ world.name }}</n-tag>
      </div>
    </div>

    <n-spin :show="loading" size="large">
      <div v-if="world" class="collab-content">
        <n-tabs v-model:value="activeTab" type="card" animated>
          <n-tab-pane name="members" tab="👥 成员管理">
            <div class="tab-content">
              <div class="section-toolbar">
                <h3 class="section-subtitle">协作者列表</h3>
                <n-button v-if="isOwner" type="primary" @click="showInviteModal = true">
                  <template #icon>✉️</template>
                  邀请协作者
                </n-button>
              </div>

              <div class="members-list">
                <n-card v-for="member in members" :key="member.id" class="member-card">
                  <div class="member-info">
                    <n-avatar round size="large">{{ member.avatar }}</n-avatar>
                    <div class="member-detail">
                      <div class="member-name">
                        {{ member.username }}
                        <n-tag :type="getRoleTagType(member.role)" size="small" class="role-tag">
                          {{ getRoleLabel(member.role) }}
                        </n-tag>
                      </div>
                      <div class="member-permissions">
                        <n-tag v-for="perm in member.permissions" :key="perm" size="tiny" class="perm-tag">
                          {{ getPermLabel(perm) }}
                        </n-tag>
                        <span v-if="member.categories.length > 0" class="member-categories">
                          负责分类：{{ member.categories.join('、') }}
                        </span>
                      </div>
                      <div class="member-joined">加入时间：{{ member.joinedAt }}</div>
                    </div>
                  </div>
                  <div v-if="isOwner && member.role !== 'owner'" class="member-actions">
                    <n-button text size="small" @click="openEditMember(member)">
                      <template #icon>✏️</template>
                      编辑
                    </n-button>
                    <n-button text size="small" type="error" @click="handleRemoveMember(member)">
                      <template #icon>🗑️</template>
                      移除
                    </n-button>
                  </div>
                </n-card>
              </div>

              <div v-if="isOwner" class="invitations-section">
                <h3 class="section-subtitle">待处理邀请</h3>
                <div class="invitations-list">
                  <n-card v-for="inv in pendingInvitations" :key="inv.id" class="invite-card">
                    <div class="invite-info">
                      <span class="invite-target">{{ inv.inviteeName }}</span>
                      <n-tag size="small">{{ getRoleLabel(inv.role) }}</n-tag>
                      <span v-if="inv.categories.length > 0" class="invite-categories">
                        负责分类：{{ inv.categories.join('、') }}
                      </span>
                      <span class="invite-time">{{ inv.createdAt }}</span>
                    </div>
                    <n-tag type="warning" size="small">等待回复</n-tag>
                  </n-card>
                  <div v-if="pendingInvitations.length === 0" class="empty-hint">
                    暂无待处理邀请
                  </div>
                </div>
              </div>
            </div>
          </n-tab-pane>

          <n-tab-pane name="changes" tab="📋 变更审核">
            <div class="tab-content">
              <div class="section-toolbar">
                <div class="change-filters">
                  <n-tag
                    v-for="filter in changeFilters"
                    :key="filter.value"
                    :type="changeStatusFilter === filter.value ? 'primary' : 'default'"
                    :checkable="true"
                    :checked="changeStatusFilter === filter.value"
                    @click="changeStatusFilter = filter.value"
                    style="margin-right: 8px; cursor: pointer;"
                  >
                    {{ filter.label }} ({{ getChangeCount(filter.value) }})
                  </n-tag>
                </div>
              </div>

              <div class="changes-list">
                <n-card v-for="change in filteredChanges" :key="change.id" class="change-card">
                  <div class="change-header">
                    <div class="change-meta">
                      <n-avatar round size="small">{{ change.requesterAvatar }}</n-avatar>
                      <span class="change-author">{{ change.requesterName }}</span>
                      <n-tag :type="getChangeTypeTagType(change.type)" size="small">
                        {{ getChangeTypeLabel(change.type) }}
                      </n-tag>
                      <n-tag :type="getStatusTagType(change.status)" size="small">
                        {{ getStatusLabel(change.status) }}
                      </n-tag>
                    </div>
                    <span class="change-time">{{ change.createdAt }}</span>
                  </div>

                  <div class="change-summary">{{ change.summary }}</div>

                  <div v-if="change.entryTitle" class="change-entry">
                    目标条目：<strong>{{ change.entryTitle }}</strong>
                  </div>

                  <div v-if="change.oldValue || change.newValue" class="change-diff">
                    <div v-if="change.oldValue && change.type === 'update'" class="diff-old">
                      <div class="diff-label">📝 原内容</div>
                      <div class="diff-content old-content">
                        <p v-if="change.oldValue.title"><strong>标题：</strong>{{ change.oldValue.title }}</p>
                        <p v-if="change.oldValue.category"><strong>分类：</strong>{{ change.oldValue.category }}</p>
                        <p v-if="change.oldValue.content"><strong>内容：</strong>{{ change.oldValue.content }}</p>
                      </div>
                    </div>
                    <div v-if="change.newValue" class="diff-new">
                      <div class="diff-label">✨ 新内容</div>
                      <div class="diff-content new-content">
                        <p v-if="change.newValue.title"><strong>标题：</strong>{{ change.newValue.title }}</p>
                        <p v-if="change.newValue.category"><strong>分类：</strong>{{ change.newValue.category }}</p>
                        <p v-if="change.newValue.content"><strong>内容：</strong>{{ change.newValue.content }}</p>
                      </div>
                    </div>
                  </div>

                  <div v-if="change.reviewComment" class="change-review-comment">
                    <span class="review-label">💬 审核意见：</span>
                    {{ change.reviewComment }}
                    <span class="review-meta">—— {{ change.reviewerName }} {{ change.reviewedAt }}</span>
                  </div>

                  <div v-if="canReview && change.status === 'pending'" class="change-actions">
                    <n-input
                      v-model:value="reviewComment"
                      type="textarea"
                      :rows="2"
                      placeholder="审核意见（可选）"
                      class="review-input"
                    />
                    <div class="review-buttons">
                      <n-button type="success" @click="handleReview(change.id, true)">
                        <template #icon>✅</template>
                        通过
                      </n-button>
                      <n-button type="error" @click="handleReview(change.id, false)">
                        <template #icon>❌</template>
                        驳回
                      </n-button>
                    </div>
                  </div>
                </n-card>

                <div v-if="filteredChanges.length === 0" class="empty-hint">
                  暂无相关变更请求
                </div>
              </div>
            </div>
          </n-tab-pane>

          <n-tab-pane name="versions" tab="📜 版本历史">
            <div class="tab-content">
              <div class="section-toolbar">
                <h3 class="section-subtitle">版本记录</h3>
              </div>

              <div class="version-timeline">
                <div v-for="version in versions" :key="version.id" class="version-item">
                  <div class="version-dot-wrap">
                    <div class="version-dot" :class="getVersionDotClass(version.changeType)"></div>
                  </div>
                  <n-card class="version-card" hoverable @click="openVersionDetail(version)">
                    <div class="version-header">
                      <div class="version-badge">
                        <n-tag :type="getVersionTagType(version.changeType)" size="small">
                          v{{ version.version }}
                        </n-tag>
                        <n-tag :type="getVersionTagType(version.changeType)" size="small" class="version-type-tag">
                          {{ getVersionTypeLabel(version.changeType) }}
                        </n-tag>
                      </div>
                      <span class="version-time">{{ version.createdAt }}</span>
                    </div>
                    <div class="version-summary">{{ version.changeSummary }}</div>
                    <div class="version-author">
                      <n-avatar round size="tiny">{{ version.changerAvatar }}</n-avatar>
                      {{ version.changerName }}
                    </div>
                  </n-card>
                </div>

                <div v-if="versions.length === 0" class="empty-hint">
                  暂无版本记录
                </div>
              </div>
            </div>
          </n-tab-pane>
        </n-tabs>
      </div>
    </n-spin>

    <n-modal
      v-model:show="showInviteModal"
      preset="card"
      title="✉️ 邀请协作者"
      style="width: 500px"
      :mask-closable="false"
    >
      <n-form label-placement="top">
        <n-form-item label="选择用户">
          <n-select
            v-model:value="inviteForm.inviteeId"
            :options="availableUsers"
            placeholder="选择要邀请的用户"
          />
        </n-form-item>
        <n-form-item label="角色">
          <n-select
            v-model:value="inviteForm.role"
            :options="roleOptions"
            placeholder="选择角色"
          />
        </n-form-item>
        <n-form-item label="负责分类（可选）">
          <n-select
            v-model:value="inviteForm.categories"
            :options="categoryOptions"
            multiple
            placeholder="选择协作者负责的分类"
          />
        </n-form-item>
      </n-form>
      <template #footer>
        <div class="modal-footer">
          <n-button @click="showInviteModal = false">取消</n-button>
          <n-button type="primary" @click="handleInvite">发送邀请</n-button>
        </div>
      </template>
    </n-modal>

    <n-modal
      v-model:show="showEditMemberModal"
      preset="card"
      title="✏️ 编辑协作者"
      style="width: 450px"
      :mask-closable="false"
    >
      <n-form v-if="editingMember" label-placement="top">
        <n-form-item label="角色">
          <n-select
            v-model:value="editingMember.role"
            :options="roleOptions.filter(r => r.value !== 'owner')"
          />
        </n-form-item>
        <n-form-item label="负责分类">
          <n-select
            v-model:value="editingMember.categories"
            :options="categoryOptions"
            multiple
            placeholder="选择负责的分类"
          />
        </n-form-item>
      </n-form>
      <template #footer>
        <div class="modal-footer">
          <n-button @click="showEditMemberModal = false">取消</n-button>
          <n-button type="primary" @click="handleUpdateMember">保存</n-button>
        </div>
      </template>
    </n-modal>

    <n-modal
      v-model:show="showVersionModal"
      preset="card"
      :title="versionDetail ? `版本 v${versionDetail.version}` : ''"
      style="width: 600px"
    >
      <div v-if="versionDetail" class="version-detail">
        <div class="version-detail-meta">
          <n-tag :type="getVersionTagType(versionDetail.changeType)">
            {{ getVersionTypeLabel(versionDetail.changeType) }}
          </n-tag>
          <span>{{ versionDetail.changeSummary }}</span>
        </div>
        <div class="version-detail-info">
          <span>👤 {{ versionDetail.changerName }}</span>
          <span>🕐 {{ versionDetail.createdAt }}</span>
        </div>
        <div class="version-detail-entries">
          <h4>条目快照</h4>
          <n-card v-for="entry in versionDetail.entries" :key="entry.id" size="small" class="snapshot-entry">
            <n-tag size="small" type="primary" style="margin-bottom: 8px;">{{ entry.category }}</n-tag>
            <h4>{{ entry.title }}</h4>
            <p>{{ entry.content }}</p>
          </n-card>
        </div>
        <div v-if="isOwner" class="version-detail-actions">
          <n-button type="warning" @click="handleRollback(versionDetail)">
            <template #icon>⏪</template>
            回滚至此版本
          </n-button>
        </div>
      </div>
    </n-modal>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useMessage, useDialog } from 'naive-ui'
import {
  NButton,
  NCard,
  NTag,
  NTabs,
  NTabPane,
  NAvatar,
  NSpin,
  NModal,
  NForm,
  NFormItem,
  NInput,
  NSelect
} from 'naive-ui'
import { worldApi, collaborationApi } from '../api'

const route = useRoute()
const router = useRouter()
const message = useMessage()
const dialog = useDialog()

const currentUserId = 'user-1'
const world = ref(null)
const loading = ref(false)
const activeTab = ref('members')
const members = ref([])
const invitations = ref([])
const changeRequests = ref([])
const versions = ref([])
const reviewComment = ref('')

const showInviteModal = ref(false)
const showEditMemberModal = ref(false)
const showVersionModal = ref(false)
const editingMember = ref(null)
const versionDetail = ref(null)
const changeStatusFilter = ref('all')

const inviteForm = ref({
  inviteeId: null,
  role: 'editor',
  categories: []
})

const isOwner = computed(() => {
  return members.value.some(m => m.userId === currentUserId && m.role === 'owner')
})

const canReview = computed(() => {
  return members.value.some(m => m.userId === currentUserId && (m.role === 'owner' || m.permissions.includes('review')))
})

const pendingInvitations = computed(() => {
  return invitations.value.filter(inv => inv.status === 'pending')
})

const availableUsers = computed(() => {
  const memberIds = members.value.map(m => m.userId)
  return [
    { label: '星河漫步者 ⭐', value: 'user-2' },
    { label: '梦境织者 🌙', value: 'user-3' }
  ].filter(u => !memberIds.includes(u.value))
})

const roleOptions = [
  { label: '👑 主理人', value: 'owner' },
  { label: '✍️ 编辑者', value: 'editor' },
  { label: '👀 审核者', value: 'reviewer' }
]

const categoryOptions = computed(() => {
  if (!world.value?.entries) return []
  const cats = [...new Set(world.value.entries.map(e => e.category))]
  return cats.map(c => ({ label: c, value: c }))
})

const changeFilters = [
  { label: '全部', value: 'all' },
  { label: '待审核', value: 'pending' },
  { label: '已通过', value: 'approved' },
  { label: '已驳回', value: 'rejected' }
]

const filteredChanges = computed(() => {
  if (changeStatusFilter.value === 'all') return changeRequests.value
  return changeRequests.value.filter(c => c.status === changeStatusFilter.value)
})

const getChangeCount = (status) => {
  if (status === 'all') return changeRequests.value.length
  return changeRequests.value.filter(c => c.status === status).length
}

const getRoleLabel = (role) => {
  const map = { owner: '主理人', editor: '编辑者', reviewer: '审核者' }
  return map[role] || role
}

const getRoleTagType = (role) => {
  const map = { owner: 'warning', editor: 'info', reviewer: 'success' }
  return map[role] || 'default'
}

const getPermLabel = (perm) => {
  const map = { read: '读取', write: '编辑', review: '审核', manage: '管理' }
  return map[perm] || perm
}

const getChangeTypeLabel = (type) => {
  const map = { create: '新增', update: '修改', delete: '删除' }
  return map[type] || type
}

const getChangeTypeTagType = (type) => {
  const map = { create: 'success', update: 'info', delete: 'error' }
  return map[type] || 'default'
}

const getStatusLabel = (status) => {
  const map = { pending: '待审核', approved: '已通过', rejected: '已驳回' }
  return map[status] || status
}

const getStatusTagType = (status) => {
  const map = { pending: 'warning', approved: 'success', rejected: 'error' }
  return map[status] || 'default'
}

const getVersionTagType = (type) => {
  const map = { create: 'success', update: 'info', rollback: 'warning', delete: 'error' }
  return map[type] || 'default'
}

const getVersionTypeLabel = (type) => {
  const map = { create: '创建', update: '更新', rollback: '回滚', delete: '删除' }
  return map[type] || type
}

const getVersionDotClass = (type) => {
  const map = { create: 'dot-create', update: 'dot-update', rollback: 'dot-rollback', delete: 'dot-delete' }
  return map[type] || ''
}

const loadWorld = async () => {
  loading.value = true
  try {
    const res = await worldApi.getWorld(route.params.id)
    world.value = res.data
  } catch (err) {
    console.error('加载世界设定失败:', err)
    message.error('加载世界设定失败')
  } finally {
    loading.value = false
  }
}

const loadMembers = async () => {
  try {
    const res = await collaborationApi.getMembers(route.params.id)
    members.value = res.data.members
  } catch (err) {
    console.error('加载成员列表失败:', err)
  }
}

const loadInvitations = async () => {
  try {
    const res = await collaborationApi.getInvitations(route.params.id)
    invitations.value = res.data.invitations
  } catch (err) {
    console.error('加载邀请列表失败:', err)
  }
}

const loadChangeRequests = async () => {
  try {
    const res = await collaborationApi.getChangeRequests(route.params.id)
    changeRequests.value = res.data.changes
  } catch (err) {
    console.error('加载变更请求失败:', err)
  }
}

const loadVersions = async () => {
  try {
    const res = await collaborationApi.getVersionHistory(route.params.id)
    versions.value = res.data.versions
  } catch (err) {
    console.error('加载版本历史失败:', err)
  }
}

const handleInvite = async () => {
  if (!inviteForm.value.inviteeId) {
    message.warning('请选择要邀请的用户')
    return
  }
  try {
    const userOption = availableUsers.value.find(u => u.value === inviteForm.value.inviteeId)
    await collaborationApi.inviteMember(route.params.id, {
      inviteeId: inviteForm.value.inviteeId,
      inviteeName: userOption?.label?.replace(/[^a-zA-Z\u4e00-\u9fa5]/g, '') || '',
      role: inviteForm.value.role,
      categories: inviteForm.value.categories,
      inviterId: currentUserId,
      inviterName: '月下独酌',
      worldName: world.value.name
    })
    message.success('邀请已发送')
    showInviteModal.value = false
    inviteForm.value = { inviteeId: null, role: 'editor', categories: [] }
    loadInvitations()
  } catch (err) {
    message.error(err.response?.data?.message || '邀请失败')
  }
}

const openEditMember = (member) => {
  editingMember.value = { ...member }
  showEditMemberModal.value = true
}

const handleUpdateMember = async () => {
  if (!editingMember.value) return
  try {
    const rolePermissions = {
      editor: ['read', 'write'],
      reviewer: ['read', 'review']
    }
    await collaborationApi.updateMember(route.params.id, editingMember.value.id, {
      role: editingMember.value.role,
      permissions: rolePermissions[editingMember.value.role] || ['read', 'write'],
      categories: editingMember.value.categories
    })
    message.success('已更新协作者信息')
    showEditMemberModal.value = false
    loadMembers()
  } catch (err) {
    message.error(err.response?.data?.message || '更新失败')
  }
}

const handleRemoveMember = (member) => {
  dialog.warning({
    title: '确认移除',
    content: `确定要移除协作者「${member.username}」吗？`,
    positiveText: '确认移除',
    negativeText: '取消',
    onPositiveClick: async () => {
      try {
        await collaborationApi.removeMember(route.params.id, member.id)
        message.success('已移除协作者')
        loadMembers()
      } catch (err) {
        message.error(err.response?.data?.message || '移除失败')
      }
    }
  })
}

const handleReview = async (changeId, approved) => {
  try {
    await collaborationApi.reviewChangeRequest(route.params.id, changeId, {
      approved,
      reviewComment: reviewComment.value,
      reviewedBy: currentUserId,
      reviewerName: '月下独酌'
    })
    message.success(approved ? '已通过变更请求' : '已驳回变更请求')
    reviewComment.value = ''
    loadChangeRequests()
    loadVersions()
  } catch (err) {
    message.error(err.response?.data?.message || '审核失败')
  }
}

const openVersionDetail = async (version) => {
  try {
    const res = await collaborationApi.getVersionDetail(route.params.id, version.id)
    versionDetail.value = res.data
    showVersionModal.value = true
  } catch (err) {
    message.error('加载版本详情失败')
  }
}

const handleRollback = (version) => {
  dialog.warning({
    title: '确认回滚',
    content: `确定要回滚到版本 v${version.version} 吗？此操作会创建一个新的版本记录。`,
    positiveText: '确认回滚',
    negativeText: '取消',
    onPositiveClick: async () => {
      try {
        await collaborationApi.rollbackToVersion(route.params.id, version.id, {
          rolledBackBy: currentUserId,
          rolledBackName: '月下独酌'
        })
        message.success('已回滚至指定版本')
        showVersionModal.value = false
        loadVersions()
      } catch (err) {
        message.error('回滚失败')
      }
    }
  })
}

const goBack = () => {
  router.push(`/world/${route.params.id}`)
}

onMounted(async () => {
  await loadWorld()
  await Promise.all([
    loadMembers(),
    loadInvitations(),
    loadChangeRequests(),
    loadVersions()
  ])
})
</script>

<style scoped>
.world-collaboration {
  padding-bottom: 40px;
}

.collab-header {
  margin-bottom: 24px;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.page-title {
  font-size: 24px;
  margin: 0;
  color: #333;
}

.tab-content {
  padding: 20px 0;
}

.section-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.section-subtitle {
  font-size: 16px;
  margin: 0;
  color: #444;
}

.members-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 32px;
}

.member-card {
  transition: transform 0.2s;
}

.member-card:hover {
  transform: translateX(4px);
}

.member-card :deep(.n-card__content) {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.member-info {
  display: flex;
  align-items: center;
  gap: 16px;
}

.member-detail {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.member-name {
  font-size: 15px;
  font-weight: 500;
  color: #333;
  display: flex;
  align-items: center;
  gap: 8px;
}

.role-tag {
  margin-left: 4px;
}

.member-permissions {
  display: flex;
  align-items: center;
  gap: 4px;
  flex-wrap: wrap;
}

.perm-tag {
  margin-right: 2px;
}

.member-categories {
  font-size: 12px;
  color: #9d4edd;
  margin-left: 6px;
}

.member-joined {
  font-size: 12px;
  color: #999;
}

.member-actions {
  display: flex;
  gap: 8px;
}

.invitations-section {
  margin-top: 32px;
  padding-top: 24px;
  border-top: 1px solid #f0f0f0;
}

.invitations-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.invite-card :deep(.n-card__content) {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.invite-info {
  display: flex;
  align-items: center;
  gap: 10px;
}

.invite-target {
  font-weight: 500;
  color: #333;
}

.invite-categories {
  font-size: 12px;
  color: #9d4edd;
}

.invite-time {
  font-size: 12px;
  color: #999;
}

.change-filters {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.changes-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.change-card {
  transition: transform 0.2s;
}

.change-card:hover {
  transform: translateY(-2px);
}

.change-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.change-meta {
  display: flex;
  align-items: center;
  gap: 8px;
}

.change-author {
  font-weight: 500;
  color: #333;
}

.change-time {
  font-size: 12px;
  color: #999;
}

.change-summary {
  font-size: 15px;
  color: #444;
  margin-bottom: 10px;
  line-height: 1.6;
}

.change-entry {
  font-size: 13px;
  color: #666;
  margin-bottom: 12px;
}

.change-diff {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin-bottom: 12px;
}

.diff-label {
  font-size: 13px;
  font-weight: 500;
  color: #666;
  margin-bottom: 8px;
}

.diff-content {
  padding: 12px;
  border-radius: 8px;
  font-size: 13px;
  line-height: 1.6;
}

.diff-content p {
  margin: 0 0 6px 0;
}

.old-content {
  background: #fff5f5;
  border: 1px solid #ffd6d6;
  color: #666;
}

.new-content {
  background: #f0fff4;
  border: 1px solid #c3f0cb;
  color: #666;
}

.change-review-comment {
  padding: 12px;
  background: #f9f5ff;
  border-radius: 8px;
  font-size: 13px;
  color: #555;
  margin-bottom: 12px;
  line-height: 1.6;
}

.review-label {
  font-weight: 500;
  color: #9d4edd;
}

.review-meta {
  font-size: 12px;
  color: #999;
  margin-left: 8px;
}

.change-actions {
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid #f0f0f0;
}

.review-input {
  margin-bottom: 12px;
}

.review-buttons {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
}

.version-timeline {
  position: relative;
  padding-left: 32px;
}

.version-item {
  position: relative;
  margin-bottom: 16px;
}

.version-dot-wrap {
  position: absolute;
  left: -32px;
  top: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.version-dot {
  width: 14px;
  height: 14px;
  border-radius: 50%;
  border: 3px solid #c77dff;
  background: white;
}

.version-dot.dot-create {
  border-color: #18a058;
  background: #f0fff4;
}

.version-dot.dot-update {
  border-color: #2080f0;
  background: #f0f5ff;
}

.version-dot.dot-rollback {
  border-color: #f0a020;
  background: #fffbf0;
}

.version-dot.dot-delete {
  border-color: #d03050;
  background: #fff5f5;
}

.version-timeline::before {
  content: '';
  position: absolute;
  left: 6px;
  top: 0;
  bottom: 0;
  width: 2px;
  background: #e0e0e0;
}

.version-card {
  cursor: pointer;
  transition: transform 0.2s;
}

.version-card:hover {
  transform: translateX(4px);
}

.version-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.version-badge {
  display: flex;
  gap: 6px;
}

.version-type-tag {
  margin-left: 4px;
}

.version-time {
  font-size: 12px;
  color: #999;
}

.version-summary {
  font-size: 14px;
  color: #444;
  line-height: 1.5;
  margin-bottom: 8px;
}

.version-author {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: #666;
}

.version-detail-meta {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}

.version-detail-info {
  display: flex;
  gap: 20px;
  font-size: 13px;
  color: #666;
  margin-bottom: 20px;
}

.version-detail-entries h4 {
  font-size: 14px;
  color: #444;
  margin: 0 0 12px 0;
}

.snapshot-entry {
  margin-bottom: 10px;
}

.snapshot-entry h4 {
  margin: 0 0 6px 0;
  font-size: 14px;
  color: #333;
}

.snapshot-entry p {
  margin: 0;
  font-size: 13px;
  color: #666;
  line-height: 1.6;
}

.version-detail-actions {
  margin-top: 20px;
  padding-top: 16px;
  border-top: 1px solid #f0f0f0;
  display: flex;
  justify-content: flex-end;
}

.empty-hint {
  text-align: center;
  padding: 40px 20px;
  color: #999;
  font-size: 14px;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}
</style>
