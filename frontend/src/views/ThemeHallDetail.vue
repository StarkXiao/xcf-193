<template>
  <div class="theme-hall-detail">
    <div class="back-bar">
      <n-button text @click="goBack">
        <template #icon>←</template>
        返回专题馆
      </n-button>
    </div>

    <n-spin :show="loading" size="large">
      <div v-if="hall" class="detail-container">
        <div class="hall-header" :style="{ background: hall.gradient }">
          <div class="header-overlay"></div>
          <div class="header-content">
            <div class="hall-big-icon">{{ hall.cover }}</div>
            <div class="hall-intro">
              <div class="genre-tag">{{ hall.genre }}</div>
              <h1 class="hall-title">{{ hall.name }}</h1>
              <p class="hall-tagline">"{{ hall.tagline }}"</p>
              <p class="hall-description">{{ hall.description }}</p>
              <div class="hall-stats-row">
                <div class="big-stat">
                  <span class="big-stat-num">{{ hall.characterCount }}</span>
                  <span class="big-stat-label">👤 角色</span>
                </div>
                <div class="big-stat">
                  <span class="big-stat-num">{{ hall.factionCount }}</span>
                  <span class="big-stat-label">🏰 阵营</span>
                </div>
                <div class="big-stat">
                  <span class="big-stat-num">{{ hall.timelineCount }}</span>
                  <span class="big-stat-label">📜 纪元</span>
                </div>
                <div class="big-stat">
                  <span class="big-stat-num">{{ hall.storyCount }}</span>
                  <span class="big-stat-label">📖 故事</span>
                </div>
              </div>
              <div class="header-actions">
                <n-button :type="isLiked ? 'error' : 'default'" size="large" @click="handleLike">
                  <template #icon>{{ isLiked ? '❤️' : '🤍' }}</template>
                  {{ isLiked ? '已心动' : '心动一下' }}
                </n-button>
                <n-button size="large" @click="handleEnter">
                  <template #icon>✨</template>
                  进入创作
                </n-button>
              </div>
            </div>
          </div>
        </div>

        <n-tabs v-model:value="activeTab" type="line" animated class="main-tabs" size="large">
          <n-tab-pane name="overview" tab="🌍 世界概览">
            <div class="tab-content">
              <div class="world-summary-card">
              <h3 class="card-title">📖 世界介绍</h3>
              <div class="long-desc">
                {{ hall.fullDescription }}
              </div>
            </div>

            <div class="quick-grid">
              <div class="quick-card">
                <h4 class="quick-title">🗺️ 地理格局</h4>
                <div class="quick-tags">
                  <n-tag v-for="r in hall.regions" :key="r" size="medium" type="info" :bordered="false">
                    {{ r }}
                  </n-tag>
                </div>
              </div>
              <div class="quick-card">
                <h4 class="quick-title">⚡ 力量体系</h4>
                <div class="quick-tags">
                  <n-tag v-for="p in hall.powerSystems" :key="p" size="medium" type="warning" :bordered="false">
                    {{ p }}
                  </n-tag>
                </div>
              </div>
              <div class="quick-card">
                <h4 class="quick-title">🎯 核心矛盾</h4>
                <div class="conflict-list">
                  <div v-for="c in hall.coreConflicts" :key="c" class="conflict-item">
                    <span class="conflict-dot">●</span>
                    {{ c }}
                  </div>
                </div>
              </div>
            </div>
            </div>
          </n-tab-pane>

          <n-tab-pane name="characters" :tab="`👤 角色图鉴 (${characters.length})`">
            <div class="tab-content">
              <div class="section-header-bar">
                <div class="filter-chips">
                  <n-tag
                  v-for="role in characterRoles"
                  :key="role.key"
                  :type="activeRoleFilter === role.key ? 'primary' : 'default'"
                  :checkable="true"
                  :checked="activeRoleFilter === role.key"
                  class="chip"
                  @click="activeRoleFilter = role.key"
                >
                  {{ role.label }}
                </n-tag>
              </div>
            </div>
            <div class="character-grid">
              <n-card
                v-for="char in filteredCharacters"
                :key="char.id"
                hoverable
                class="character-card"
                @click="selectedCharacter = char"
              >
                <div class="char-portrait" :style="{ background: char.gradient }">
                  <span class="char-avatar">{{ char.avatar }}</span>
                  <n-tag class="char-role-tag" :type="char.roleType" size="small">{{ char.role }}</n-tag>
                </div>
                <div class="char-info">
                  <h4 class="char-name">{{ char.name }}</h4>
                  <p class="char-title">{{ char.title }}</p>
                  <div class="char-traits">
                    <span v-for="t in char.traits.slice(0, 2)" :key="t" class="trait-tag">{{ t }}</span>
                  </div>
                  <div class="char-relations" v-if="char.relations?.length">
                    <span class="relation-label">关系：</span>
                    <span v-for="r in char.relations.slice(0, 2)" :key="r.name" class="relation-chip">
                      {{ r.icon }} {{ r.name }}
                    </span>
                  </div>
                </div>
              </n-card>
            </div>
            </div>
          </n-tab-pane>

          <n-tab-pane name="factions" :tab="`🏰 阵营势力 (${factions.length})`">
            <div class="tab-content">
              <div class="faction-grid">
                <n-card v-for="faction in factions" :key="faction.id" class="faction-card">
                  <div class="faction-header" :style="{ background: faction.gradient }">
                    <span class="faction-logo">{{ faction.logo }}</span>
                  </div>
                  <div class="faction-body">
                    <div class="faction-name-row">
                      <h4 class="faction-name">{{ faction.name }}</h4>
                      <n-tag size="small" :type="faction.alignmentType">{{ faction.alignment }}</n-tag>
                    </div>
                    <p class="faction-desc">{{ faction.description }}</p>
                    <div class="faction-meta">
                      <div class="faction-meta-item">
                        <span class="meta-label">势力范围</span>
                        <span class="meta-value">{{ faction.territory }}</span>
                      </div>
                      <div class="faction-meta-item">
                        <span class="meta-label">领袖</span>
                        <span class="meta-value">{{ faction.leader }}</span>
                      </div>
                      <div class="faction-meta-item">
                        <span class="meta-label">成员</span>
                        <span class="meta-value">{{ faction.memberCount }}人</span>
                      </div>
                    </div>
                    <div class="faction-members" v-if="faction.keyMembers?.length">
                      <span class="members-label">核心成员：</span>
                      <div class="members-list">
                        <span v-for="m in faction.keyMembers" :key="m.name" class="member-chip">
                          {{ m.avatar }} {{ m.name }}
                        </span>
                      </div>
                    </div>
                  </div>
                </n-card>
              </div>
            </div>
          </n-tab-pane>

          <n-tab-pane name="timeline" tab="📜 时间线">
            <div class="tab-content">
              <div class="timeline-container">
                <n-timeline>
                  <n-timeline-item
                    v-for="(event, idx) in timeline"
                    :key="event.id"
                    :type="event.type || 'default'"
                  >
                    <template #dot>
                      <div class="timeline-dot" :style="{ background: event.dotColor }">{{ event.icon }}</div>
                    </template>
                    <div class="timeline-content">
                      <div class="timeline-era">{{ event.era }}</div>
                      <h4 class="timeline-title">{{ event.title }}</h4>
                      <p class="timeline-desc">{{ event.description }}</p>
                      <div class="timeline-impact" v-if="event.impacts?.length">
                        <span v-for="impact in event.impacts" :key="impact" class="impact-tag">
                          {{ impact }}
                        </span>
                      </div>
                    </div>
                  </n-timeline-item>
                </n-timeline>
              </div>
            </div>
          </n-tab-pane>

          <n-tab-pane name="stories" :tab="`📖 关联故事 (${stories.length})`">
            <div class="tab-content">
              <div class="stories-list">
                <n-card
                  v-for="story in stories"
                  :key="story.id"
                  hoverable
                  class="story-card"
                  @click="openStory(story.id)"
                >
                  <div class="story-cover" :style="{ background: story.gradient }">
                    <span class="story-emoji">{{ story.cover }}</span>
                  </div>
                  <div class="story-body">
                    <div class="story-header">
                      <h4 class="story-title">{{ story.title }}</h4>
                      <n-tag size="small" type="primary" :bordered="false">{{ story.type }}</n-tag>
                    </div>
                    <p class="story-summary">{{ story.summary }}</p>
                    <div class="story-meta">
                      <span>作者：{{ story.author }}</span>
                      <span>·</span>
                      <span>{{ story.wordCount }}字</span>
                      <span>·</span>
                      <span>❤️ {{ story.likes }}</span>
                    </div>
                    <div class="story-protagonists" v-if="story.protagonists?.length">
                      <span class="protag-label">主角：</span>
                      <span v-for="p in story.protagonists" :key="p.name" class="protag-chip">
                        {{ p.avatar }} {{ p.name }}
                      </span>
                    </div>
                  </div>
                </n-card>
              </div>
            </div>
          </n-tab-pane>
        </n-tabs>
      </div>
    </n-spin>

    <n-modal
      v-model:show="showCharacterModal"
      preset="card"
      :title="selectedCharacter?.name || ''"
      style="width: 560px"
    >
      <div v-if="selectedCharacter" class="char-modal">
        <div class="modal-char-header">
          <div class="modal-portrait" :style="{ background: selectedCharacter.gradient }">
            <span class="modal-avatar">{{ selectedCharacter.avatar }}</span>
          </div>
          <div class="modal-char-meta">
            <h3 class="modal-char-name">{{ selectedCharacter.name }}</h3>
            <n-tag :type="selectedCharacter.roleType">{{ selectedCharacter.role }}</n-tag>
            <p class="modal-char-title">{{ selectedCharacter.title }}</p>
          </div>
        </div>
        <div class="modal-section">
          <h5 class="modal-section-title">人物小传</h5>
          <p class="modal-bio">{{ selectedCharacter.bio }}</p>
        </div>
        <div class="modal-section">
          <h5 class="modal-section-title">性格特质</h5>
          <div class="modal-traits">
            <n-tag v-for="t in selectedCharacter.traits" :key="t" size="medium">
              {{ t }}
            </n-tag>
          </div>
        </div>
        <div class="modal-section" v-if="selectedCharacter.relations?.length">
          <h5 class="modal-section-title">人际关系</h5>
          <div class="modal-relations">
            <div v-for="r in selectedCharacter.relations" :key="r.name" class="relation-row">
              <span class="rel-name">{{ r.icon }} {{ r.name }}</span>
              <n-tag size="small" type="info">{{ r.relation }}</n-tag>
            </div>
          </div>
        </div>
      </div>
    </n-modal>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  NButton, NSpin, NTabs, NTabPane, NCard, NTag, NTimeline, NTimelineItem, NModal,
  useMessage
} from 'naive-ui'
import { themeHallApi } from '../api'

const route = useRoute()
const router = useRouter()
const message = useMessage()

const loading = ref(false)
const activeTab = ref('overview')
const isLiked = ref(false)
const activeRoleFilter = ref('all')
const selectedCharacter = ref(null)

const characterRoles = [
  { key: 'all', label: '全部' },
  { key: '主角', label: '🎭 主角团' },
  { key: '反派', label: '💀 反派' },
  { key: '配角', label: '🌟 重要配角' },
  { key: '中立', label: '⚖️ 中立角色' }
]

const showCharacterModal = computed({
  get: () => !!selectedCharacter.value,
  set: (val) => { if (!val) selectedCharacter.value = null }
})

const mockHallDetail = {
  id: 'hall-1',
  name: '九霄云天录',
  cover: '🏔️',
  gradient: 'linear-gradient(135deg, #1a1a2e 0%, #764ba2 50%, #c77dff 100%)',
  tagline: '一念仙魔，万载春秋',
  description: '一个修仙问道的宏大世界，万族林立，宗门万千，少年踏歌而行，逆天改命。',
  fullDescription: '九霄云天，九天之上，云海翻涌，万族共生于此界。上古一战，仙魔争锋，天道崩碎，留万载纷争。三千年后，仙门鼎盛，魔道蛰伏，妖族盘踞西荒，人族居中土。青云宗少年云凌霄，身怀上古剑冢传承，誓要踏破九天，问道长生。一路红颜相伴，兄弟同袍，问剑天涯。然天道苍茫，正邪难辨，宿命之局早已铺开，少年执剑，直指九霄！',
  genre: '🛡️ 仙侠修真',
  characterCount: 86,
  factionCount: 12,
  timelineCount: 9,
  storyCount: 34,
  regions: ['中土神州', '西荒魔域', '北海冰原', '南疆十万大山', '东海外域'],
  powerSystems: ['炼气筑基', '金丹元婴', '化神渡劫', '大乘飞升'],
  coreConflicts: ['仙魔之争，正邪不两立', '宗门利益纠葛', '上古秘辛复苏', '天道轮回宿命']
}

const mockCharacters = [
  {
    id: 'char-1', name: '云凌霄', avatar: '⚔️', gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    role: '主角', roleType: 'primary', title: '青云宗首席弟子 · 剑冢传人',
    traits: ['重情重义', '坚韧不拔', '剑心通明'],
    bio: '青云宗外门弟子，身怀上古剑冢传承，以一柄青霜剑踏遍九州。年少时惨遭灭门，被青云宗宗主收养，立志踏破天道，寻回家人真相。',
    relations: [
      { name: '慕清寒', icon: '🌸', relation: '道侣' },
      { name: '炎无极', icon: '🔥', relation: '结义兄弟' },
      { name: '墨千秋', icon: '🗡️', relation: '亦师亦父' }
    ]
  },
  {
    id: 'char-2', name: '慕清寒', avatar: '🌸', gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    role: '主角', roleType: 'primary', title: '冰心谷圣女 · 上古丹道天才',
    traits: ['外冷内热', '医术通神', '痴情不悔'],
    bio: '冰心谷百年一遇的丹道天才，身具先天道体。初遇云凌霄便芳心暗许，从此相伴天涯，生死与共。',
    relations: [
      { name: '云凌霄', icon: '⚔️', relation: '道侣' },
      { name: '苏灵儿', icon: '🦋', relation: '师姐' }
    ]
  },
  {
    id: 'char-3', name: '炎无极', avatar: '🔥', gradient: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
    role: '主角', roleType: 'warning', title: '焚天阁少主 · 赤炎之体',
    traits: ['豪迈不羁', '热血赤胆', '至情至性'],
    bio: '焚天阁少主，身具赤炎之体，性格豪迈，与云凌霄一见如故，结为异姓兄弟。为兄弟两肋插刀，在所不辞。',
    relations: [
      { name: '云凌霄', icon: '⚔️', relation: '结义兄弟' },
      { name: '铁山', icon: '🔨', relation: '师父' }
    ]
  },
  {
    id: 'char-4', name: '血无痕', avatar: '💀', gradient: 'linear-gradient(135deg, #434343 0%, #000000 100%)',
    role: '反派', roleType: 'error', title: '天魔殿殿主 · 魔道至尊',
    traits: ['冷酷无情', '城府极深', '杀伐果断'],
    bio: '天魔殿之主，上古魔功盖世，欲一统九界，建立魔道秩序。与青云宗有血海深仇，云凌霄最大的对手。',
    relations: [
      { name: '云凌霄', icon: '⚔️', relation: '宿敌' }
    ]
  },
  {
    id: 'char-5', name: '墨千秋', avatar: '🗡️', gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    role: '配角', roleType: 'info', title: '青云宗宗主 · 剑道泰斗',
    traits: ['正气凛然', '慧眼识才', '深藏不露'],
    bio: '青云宗宗主，剑道第一人。收养云凌霄，传其衣钵，实为上古剑仙转世，默默守护九霄。',
    relations: [
      { name: '云凌霄', icon: '⚔️', relation: '师徒' }
    ]
  },
  {
    id: 'char-6', name: '白无恨', avatar: '🦊', gradient: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
    role: '中立', roleType: 'success', title: '九尾天狐 · 妖族公主',
    traits: ['聪慧狡黠', '亦正亦邪', '游戏人间'],
    bio: '妖族公主，化形入世游戏红尘。与云凌霄亦敌亦友，时常相助，背后似乎藏着妖族的古老秘密。',
    relations: [
      { name: '云凌霄', icon: '⚔️', relation: '亦敌亦友' }
    ]
  }
]

const mockFactions = [
  {
    id: 'fact-1', name: '青云宗', logo: '🗡️',
    gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    alignment: '正道领袖', alignmentType: 'success',
    description: '正道第一大宗门，位于青云山脉之上，剑道传承千年，弟子遍布天下。以除魔卫道为己任。',
    territory: '青云山脉', leader: '墨千秋', memberCount: 3280,
    keyMembers: [
      { name: '墨千秋', avatar: '🗡️' },
      { name: '云凌霄', avatar: '⚔️' },
      { name: '李长风', avatar: '📜' }
    ]
  },
  {
    id: 'fact-2', name: '天魔殿', logo: '💀',
    gradient: 'linear-gradient(135deg, #434343 0%, #000000 100%)',
    alignment: '魔道至尊', alignmentType: 'error',
    description: '魔道第一势力，盘踞西荒魔域。殿主血无痕魔功盖世，欲一统九霄建立魔道秩序。',
    territory: '西荒魔域', leader: '血无痕', memberCount: 5600,
    keyMembers: [
      { name: '血无痕', avatar: '💀' },
      { name: '暗影', avatar: '🌑' }
    ]
  },
  {
    id: 'fact-3', name: '冰心谷', logo: '🌸',
    gradient: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
    alignment: '正道', alignmentType: 'info',
    description: '女子宗门，以炼丹医术冠绝天下。谷中弟子皆为女子，医术通神，丹道无双。',
    territory: '冰心谷', leader: '苏灵儿', memberCount: 1200,
    keyMembers: [
      { name: '苏灵儿', avatar: '🦋' },
      { name: '慕清寒', avatar: '🌸' }
    ]
  },
  {
    id: 'fact-4', name: '焚天阁', logo: '🔥',
    gradient: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
    alignment: '正道盟友', alignmentType: 'warning',
    description: '火系功法天下闻名，少主炎无极身具赤炎之体。与青云宗世代交好。',
    territory: '赤炎山脉', leader: '炎霸天', memberCount: 2100,
    keyMembers: [
      { name: '炎霸天', avatar: '🔥' },
      { name: '炎无极', avatar: '🔥' }
    ]
  }
]

const mockTimeline = [
  {
    id: 'tl-1', era: '上古纪元', icon: '⭐', dotColor: '#ff6b6b',
    title: '仙魔大战', type: 'error',
    description: '上古仙人与魔族展开惊世大战，九天崩碎，无数强者陨落。天道残缺，留下无数秘辛。',
    impacts: ['天道残缺', '仙魔永世对立', '剑冢封印']
  },
  {
    id: 'tl-2', era: '太古纪元', icon: '🏔️', dotColor: '#4ecdc4',
    title: '青云宗立派', type: 'success',
    description: '墨剑仙开宗立派，创青云剑道，护佑人族。传承千年，成为正道领袖。',
    impacts: ['正道崛起', '剑道传承']
  },
  {
    id: 'tl-3', era: '近古纪元', icon: '💥', dotColor: '#ffe66d',
    title: '天魔殿复兴', type: 'warning',
    description: '血无痕一统魔道，建立天魔殿，西荒魔域成为魔道据点。',
    impacts: ['魔道统一', '正邪对立加剧']
  },
  {
    id: 'tl-4', era: '当代 · 三年前', icon: '🔥', dotColor: '#ff9ff3',
    title: '云家灭门', type: 'error',
    description: '云家满门被灭，年幼的云凌霄被墨千秋所救，带入青云宗。',
    impacts: ['云凌霄入青云', '埋下复仇种子']
  },
  {
    id: 'tl-5', era: '当代 · 今朝', icon: '⚔️', dotColor: '#9d4edd',
    title: '剑冢开启', type: 'success',
    description: '云凌霄获得上古剑冢传承，踏上修行之路。与慕清寒、炎无极相识。',
    impacts: ['主角团聚首', '上古秘辛初现']
  }
]

const mockStories = [
  {
    id: 'story-1', title: '九霄剑歌行', cover: '⚔️',
    gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    type: '主线正篇',
    summary: '少年云凌霄踏入仙门，开启逆天修行之路。剑斩九天，问道长生，红颜相伴，兄弟同行。',
    author: '墨剑书生', wordCount: '128万', likes: 8920,
    protagonists: [
      { name: '云凌霄', avatar: '⚔️' },
      { name: '慕清寒', avatar: '🌸' }
    ]
  },
  {
    id: 'story-2', title: '冰心照玉壶', cover: '🌸',
    gradient: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
    type: '女主视角',
    summary: '慕清寒从冰心谷圣女到与云凌霄相识相知的往事。',
    author: '清寒仙子', wordCount: '45万', likes: 5230,
    protagonists: [
      { name: '慕清寒', avatar: '🌸' }
    ]
  },
  {
    id: 'story-3', title: '赤炎焚天录', cover: '🔥',
    gradient: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
    type: '兄弟篇',
    summary: '炎无极的成长故事，从焚天阁少主到独当一面的强者之路。',
    author: '赤炎', wordCount: '68万', likes: 4560,
    protagonists: [
      { name: '炎无极', avatar: '🔥' }
    ]
  },
  {
    id: 'story-4', title: '魔血无痕', cover: '💀',
    gradient: 'linear-gradient(135deg, #434343 0%, #000000 100%)',
    type: '反派番外',
    summary: '血无痕的过往，他为何要一统九霄建立魔道秩序的真正原因。',
    author: '魔道观察者', wordCount: '32万', likes: 3890,
    protagonists: [
      { name: '血无痕', avatar: '💀' }
    ]
  }
]

const hall = ref(null)
const characters = ref([])
const factions = ref([])
const timeline = ref([])
const stories = ref([])

const filteredCharacters = computed(() => {
  if (activeRoleFilter.value === 'all') return characters.value
  return characters.value.filter(c => c.role === activeRoleFilter.value)
})

const loadHallDetail = async () => {
  loading.value = true
  try {
    const id = route.params.id
    const res = await themeHallApi.getThemeHall(id)
    hall.value = res.data || { ...mockHallDetail, id }
    characters.value = res.data?.characters || mockCharacters
    factions.value = res.data?.factions || mockFactions
    timeline.value = res.data?.timeline || mockTimeline
    stories.value = res.data?.stories || mockStories
  } catch (err) {
    hall.value = mockHallDetail
    characters.value = mockCharacters
    factions.value = mockFactions
    timeline.value = mockTimeline
    stories.value = mockStories
  } finally {
    loading.value = false
  }
}

const handleLike = async () => {
  try {
    await themeHallApi.likeThemeHall(route.params.id, { userId: 'user-1' })
    isLiked.value = true
    message.success('已记录你的心动 ♥')
  } catch (err) {
    isLiked.value = true
    message.success('已记录你的心动 ♥')
  }
}

const handleEnter = () => {
  router.push('/editor')
  message.info('即将进入编辑器，选择此宇宙背景创作')
}

const openStory = (id) => {
  router.push(`/story/${id}`)
}

const goBack = () => {
  router.push('/theme-halls')
}

onMounted(() => {
  loadHallDetail()
})
</script>

<style scoped>
.theme-hall-detail {
  padding-bottom: 60px;
}

.back-bar {
  margin-bottom: 16px;
}

.detail-container {
  position: relative;
}

.hall-header {
  border-radius: 20px;
  padding: 40px;
  margin-bottom: 28px;
  position: relative;
  overflow: hidden;
  color: white;
}

.header-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.25);
}

.header-content {
  position: relative;
  z-index: 1;
  display: flex;
  gap: 36px;
  align-items: flex-start;
}

.hall-big-icon {
  width: 140px;
  height: 140px;
  font-size: 96px;
  background: rgba(255, 255, 255, 0.15);
  border-radius: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(10px);
  flex-shrink: 0;
}

.hall-intro {
  flex: 1;
}

.genre-tag {
  display: inline-block;
  padding: 4px 14px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 20px;
  font-size: 13px;
  margin-bottom: 12px;
}

.hall-title {
  font-size: 36px;
  margin: 0 0 8px 0;
  font-weight: 700;
  text-shadow: 0 2px 20px rgba(0, 0, 0, 0.3);
}

.hall-tagline {
  font-size: 16px;
  margin: 0 0 14px 0;
  font-style: italic;
  opacity: 0.9;
}

.hall-description {
  font-size: 15px;
  margin: 0 0 24px 0;
  line-height: 1.8;
  opacity: 0.9;
  max-width: 680px;
}

.hall-stats-row {
  display: flex;
  gap: 32px;
  margin-bottom: 24px;
}

.big-stat {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 14px 22px;
  background: rgba(255, 255, 255, 0.12);
  border-radius: 12px;
  backdrop-filter: blur(10px);
}

.big-stat-num {
  font-size: 28px;
  font-weight: 700;
  line-height: 1;
  margin-bottom: 6px;
}

.big-stat-label {
  font-size: 13px;
  opacity: 0.85;
}

.header-actions {
  display: flex;
  gap: 12px;
}

.main-tabs {
  margin-bottom: 24px;
}

.tab-content {
  padding-top: 8px;
}

.world-summary-card {
  padding: 28px;
  background: linear-gradient(135deg, #faf5ff 0%, #f3e8ff 100%);
  border-radius: 16px;
  margin-bottom: 24px;
}

.card-title {
  font-size: 18px;
  margin: 0 0 14px 0;
  color: #6b21a8;
}

.long-desc {
  font-size: 15px;
  line-height: 2;
  color: #4c1d95;
  margin: 0;
}

.quick-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 16px;
}

.quick-card {
  padding: 20px;
  background: white;
  border-radius: 12px;
  border: 1px solid #f0e7ff;
}

.quick-title {
  font-size: 15px;
  margin: 0 0 12px 0;
  color: #333;
}

.quick-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.conflict-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.conflict-item {
  font-size: 14px;
  color: #555;
  display: flex;
  align-items: center;
  gap: 8px;
}

.conflict-dot {
  color: #9d4edd;
  font-size: 10px;
}

.section-header-bar {
  margin-bottom: 20px;
}

.filter-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.chip {
  cursor: pointer;
}

.character-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 18px;
}

.character-card {
  cursor: pointer;
  padding: 0;
  overflow: hidden;
  transition: transform 0.3s;
}

.character-card:hover {
  transform: translateY(-4px);
}

.char-portrait {
  height: 130px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.char-avatar {
  font-size: 56px;
  filter: drop-shadow(0 4px 12px rgba(0, 0, 0, 0.2));
}

.char-role-tag {
  position: absolute;
  bottom: 10px;
  right: 10px;
}

.char-info {
  padding: 16px;
}

.char-name {
  font-size: 17px;
  margin: 0 0 4px 0;
  color: #333;
}

.char-title {
  font-size: 12px;
  color: #888;
  margin: 0 0 10px 0;
}

.char-traits {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 12px;
}

.trait-tag {
  font-size: 11px;
  padding: 2px 10px;
  background: #f5f3ff;
  color: #7c3aed;
  border-radius: 20px;
}

.char-relations {
  font-size: 12px;
  color: #999;
  padding-top: 10px;
  border-top: 1px solid #f5f5f5;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.relation-label {
  color: #bbb;
}

.relation-chip {
  color: #666;
}

.faction-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 18px;
}

.faction-card {
  padding: 0;
  overflow: hidden;
}

.faction-header {
  height: 90px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.faction-logo {
  font-size: 48px;
}

.faction-body {
  padding: 18px;
}

.faction-name-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.faction-name {
  font-size: 18px;
  margin: 0;
  color: #333;
}

.faction-desc {
  font-size: 13px;
  color: #666;
  line-height: 1.7;
  margin: 0 0 14px 0;
}

.faction-meta {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-bottom: 14px;
  padding: 12px;
  background: #fafafa;
  border-radius: 8px;
}

.faction-meta-item {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
}

.meta-label {
  color: #999;
}

.meta-value {
  color: #555;
  font-weight: 500;
}

.faction-members {
  padding-top: 12px;
  border-top: 1px solid #f5f5f5;
  font-size: 12px;
}

.members-label {
  color: #999;
  margin-right: 8px;
}

.members-list {
  display: inline-flex;
  flex-wrap: wrap;
  gap: 6px;
}

.member-chip {
  padding: 2px 10px;
  background: #f5f3ff;
  color: #7c3aed;
  border-radius: 20px;
}

.timeline-container {
  padding: 20px 10px 20px 30px;
  background: linear-gradient(180deg, #faf5ff 0%, white 100%);
  border-radius: 16px;
}

.timeline-dot {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  color: white;
  margin-left: -4px;
  margin-top: -4px;
}

.timeline-content {
  padding: 0 0 24px 16px;
}

.timeline-era {
  font-size: 12px;
  color: #9d4edd;
  margin-bottom: 4px;
  font-weight: 600;
}

.timeline-title {
  font-size: 17px;
  margin: 0 0 8px 0;
  color: #333;
}

.timeline-desc {
  font-size: 14px;
  color: #666;
  line-height: 1.7;
  margin: 0 0 10px 0;
}

.timeline-impact {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.impact-tag {
  font-size: 12px;
  padding: 3px 12px;
  background: white;
  color: #9d4edd;
  border: 1px solid #e9d5ff;
  border-radius: 20px;
}

.stories-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 18px;
}

.story-card {
  cursor: pointer;
  padding: 0;
  overflow: hidden;
  display: flex;
  transition: transform 0.3s;
}

.story-card:hover {
  transform: translateY(-3px);
}

.story-cover {
  width: 110px;
  min-height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.story-emoji {
  font-size: 44px;
}

.story-body {
  flex: 1;
  padding: 16px;
  display: flex;
  flex-direction: column;
}

.story-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 8px;
}

.story-title {
  font-size: 16px;
  margin: 0;
  color: #333;
  flex: 1;
}

.story-summary {
  font-size: 13px;
  color: #666;
  line-height: 1.6;
  margin: 0 0 10px 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  flex: 1;
}

.story-meta {
  font-size: 12px;
  color: #999;
  display: flex;
  gap: 6px;
  margin-bottom: 10px;
}

.story-protagonists {
  padding-top: 10px;
  border-top: 1px solid #f5f5f5;
  font-size: 12px;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 6px;
}

.protag-label {
  color: #999;
}

.protag-chip {
  padding: 2px 10px;
  background: #f5f3ff;
  color: #7c3aed;
  border-radius: 20px;
}

.char-modal {
  padding: 4px 0;
}

.modal-char-header {
  display: flex;
  gap: 20px;
  margin-bottom: 24px;
  padding-bottom: 20px;
  border-bottom: 1px solid #f0f0f0;
}

.modal-portrait {
  width: 100px;
  height: 100px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.modal-avatar {
  font-size: 48px;
}

.modal-char-meta {
  flex: 1;
  align-self: center;
}

.modal-char-name {
  font-size: 22px;
  margin: 0 0 8px 0;
  color: #333;
}

.modal-char-title {
  font-size: 13px;
  color: #888;
  margin: 8px 0 0 0;
}

.modal-section {
  margin-bottom: 20px;
}

.modal-section-title {
  font-size: 14px;
  margin: 0 0 10px 0;
  color: #9d4edd;
}

.modal-bio {
  font-size: 14px;
  line-height: 1.9;
  color: #555;
  margin: 0;
}

.modal-traits {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.modal-relations {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.relation-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 14px;
  background: #fafafa;
  border-radius: 8px;
}

.rel-name {
  font-size: 14px;
  color: #333;
  font-weight: 500;
}
</style>
