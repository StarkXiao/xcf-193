<template>
  <div class="theme-hall">
    <div class="hall-hero">
      <div class="hero-content">
        <div class="hero-icon">🏛️</div>
        <div>
          <h1 class="hero-title">专题世界馆</h1>
          <p class="hero-subtitle">踏入沉浸式宇宙，探索角色、阵营、时间线与传奇故事交织的奇幻世界</p>
        </div>
      </div>
    </div>

    <div class="filter-section">
      <div class="filter-tags">
        <n-tag
          v-for="tag in filterTags"
          :key="tag.key"
          :type="activeFilter === tag.key ? 'primary' : 'default'"
          :checkable="true"
          :checked="activeFilter === tag.key"
          class="filter-tag"
          @click="activeFilter = tag.key"
        >
          {{ tag.label }}
        </n-tag>
      </div>
      <n-radio-group v-model:value="sortBy" size="medium">
        <n-radio-button value="popular">最受欢迎</n-radio-button>
        <n-radio-button value="newest">最新上架</n-radio-button>
        <n-radio-button value="stories">故事最多</n-radio-button>
      </n-radio-group>
    </div>

    <div v-if="featuredHalls.length > 0" class="featured-section">
      <h2 class="section-title">🌟 精选专题</h2>
      <div class="featured-grid">
        <n-card
          v-for="hall in featuredHalls"
          :key="hall.id"
          hoverable
          class="featured-card"
          @click="openHall(hall.id)"
        >
          <div class="featured-cover" :style="{ background: hall.gradient }">
            <span class="featured-emoji">{{ hall.cover }}</span>
            <n-tag class="featured-badge" type="warning" size="small">精选</n-tag>
          </div>
          <div class="featured-info">
            <h3 class="featured-name">{{ hall.name }}</h3>
            <p class="featured-tagline">{{ hall.tagline }}</p>
            <div class="featured-stats">
              <div class="stat-block">
                <span class="stat-num">{{ hall.characterCount }}</span>
                <span class="stat-label">角色</span>
              </div>
              <div class="stat-divider"></div>
              <div class="stat-block">
                <span class="stat-num">{{ hall.factionCount }}</span>
                <span class="stat-label">阵营</span>
              </div>
              <div class="stat-divider"></div>
              <div class="stat-block">
                <span class="stat-num">{{ hall.storyCount }}</span>
                <span class="stat-label">故事</span>
              </div>
            </div>
          </div>
        </n-card>
      </div>
    </div>

    <n-spin :show="loading" size="large">
      <div class="halls-grid">
        <n-card
          v-for="hall in halls"
          :key="hall.id"
          hoverable
          class="hall-card"
          @click="openHall(hall.id)"
        >
          <div class="hall-cover" :style="{ background: hall.gradient }">
            <span class="hall-emoji">{{ hall.cover }}</span>
          </div>
          <div class="hall-body">
            <h3 class="hall-name">{{ hall.name }}</h3>
            <p class="hall-desc">{{ hall.description }}</p>
            <div class="hall-meta">
              <n-tag size="small" type="primary" :bordered="false">{{ hall.genre }}</n-tag>
              <span class="hall-views">
                <span class="meta-icon">❤️</span>
                {{ hall.likes }}
              </span>
            </div>
            <div class="hall-preview">
              <div class="preview-row" v-if="hall.featuredCharacters?.length">
                <span class="preview-label">主角团</span>
                <div class="preview-chars">
                  <span v-for="(char, idx) in hall.featuredCharacters" :key="idx" class="char-chip">
                    {{ char.avatar }} {{ char.name }}
                  </span>
                </div>
              </div>
              <div class="preview-row" v-if="hall.featuredFactions?.length">
                <span class="preview-label">阵营</span>
                <div class="preview-factions">
                  <n-tag v-for="(f, idx) in hall.featuredFactions" :key="idx" size="small" :type="f.colorType">
                    {{ f.name }}
                  </n-tag>
                </div>
              </div>
            </div>
          </div>
        </n-card>
      </div>
    </n-spin>

    <div v-if="halls.length === 0 && !loading" class="empty-state">
      <div class="empty-icon">🏛️</div>
      <p class="empty-title">专题世界馆正在筹备中</p>
      <p class="empty-hint">精彩的宇宙即将开放，敬请期待！</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { NCard, NTag, NSpin, NRadioGroup, NRadioButton } from 'naive-ui'
import { themeHallApi } from '../api'

const router = useRouter()

const halls = ref([])
const featuredHalls = ref([])
const loading = ref(false)
const sortBy = ref('popular')
const activeFilter = ref('all')

const filterTags = [
  { key: 'all', label: '全部宇宙' },
  { key: '仙侠', label: '🛡️ 仙侠修真' },
  { key: '西幻', label: '⚔️ 西方奇幻' },
  { key: '赛博朋克', label: '🌆 赛博朋克' },
  { key: '古风', label: '🏯 古代言情' },
  { key: '校园', label: '🎓 青春校园' },
  { key: '末世', label: '☄️ 末世废土' }
]

const mockHalls = [
  {
    id: 'hall-1',
    name: '九霄云天录',
    cover: '🏔️',
    gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    description: '一个修仙问道的宏大世界，万族林立，宗门万千，少年踏歌而行，逆天改命。',
    tagline: '一念仙魔，万载春秋',
    genre: '仙侠',
    likes: 12580,
    characterCount: 86,
    factionCount: 12,
    storyCount: 34,
    featuredCharacters: [
      { name: '云凌霄', avatar: '⚔️' },
      { name: '慕清寒', avatar: '🌸' },
      { name: '炎无极', avatar: '🔥' }
    ],
    featuredFactions: [
      { name: '青云宗', colorType: 'primary' },
      { name: '天魔殿', colorType: 'error' },
      { name: '万剑阁', colorType: 'info' }
    ]
  },
  {
    id: 'hall-2',
    name: '奥斯特瑞亚大陆',
    cover: '🐉',
    gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    description: '龙与骑士的史诗大陆，人类、精灵、矮人、兽人在诸神见证下谱写传奇。',
    tagline: '龙族之誓，不灭的荣耀',
    genre: '西幻',
    likes: 9876,
    characterCount: 72,
    factionCount: 8,
    storyCount: 28,
    featuredCharacters: [
      { name: '阿尔萨斯', avatar: '🗡️' },
      { name: '艾蕾娜', avatar: '💎' },
      { name: '索林', avatar: '🔨' }
    ],
    featuredFactions: [
      { name: '圣光骑士团', colorType: 'warning' },
      { name: '银月议会', colorType: 'info' },
      { name: '龙鳞守护', colorType: 'success' }
    ]
  },
  {
    id: 'hall-3',
    name: '霓虹纪元2099',
    cover: '🌃',
    gradient: 'linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)',
    description: '霓虹闪烁的未来都市，义体改造、黑客入侵、企业霸权，霓虹灯下谁主沉浮？',
    tagline: '义体不朽，数据永生',
    genre: '赛博朋克',
    likes: 8432,
    characterCount: 54,
    factionCount: 10,
    storyCount: 22,
    featuredCharacters: [
      { name: 'V', avatar: '🕶️' },
      { name: '银翼', avatar: '🦾' },
      { name: '幽灵', avatar: '💀' }
    ],
    featuredFactions: [
      { name: '荒坂集团', colorType: 'error' },
      { name: '夜之城佣兵', colorType: 'warning' },
      { name: '网络黑客', colorType: 'info' }
    ]
  },
  {
    id: 'hall-4',
    name: '锦绣京华',
    cover: '🏯',
    gradient: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
    description: '大明风华，皇城巍巍，权谋交织，儿女情长，一卷盛世丹青。',
    tagline: '朱墙之内，风月无边',
    genre: '古风',
    likes: 15230,
    characterCount: 98,
    factionCount: 14,
    storyCount: 45,
    featuredCharacters: [
      { name: '萧景琰', avatar: '👑' },
      { name: '苏云裳', avatar: '🎐' },
      { name: '卫无忌', avatar: '🏮' }
    ],
    featuredFactions: [
      { name: '东宫太子党', colorType: 'primary' },
      { name: '世家联盟', colorType: 'success' },
      { name: '锦衣卫', colorType: 'error' }
    ]
  },
  {
    id: 'hall-5',
    name: '星穹学院',
    cover: '🎓',
    gradient: 'linear-gradient(135deg, #89f7fe 0%, #66a6ff 100%)',
    description: '漂浮于云海之上的魔法学院，来自五湖四海的少年们在此开启青春冒险。',
    tagline: '星辰指路，青春无悔',
    genre: '校园',
    likes: 11050,
    characterCount: 67,
    factionCount: 6,
    storyCount: 31,
    featuredCharacters: [
      { name: '夜星尘', avatar: '⭐' },
      { name: '林晓月', avatar: '🌙' },
      { name: '风间澈', avatar: '🍃' }
    ],
    featuredFactions: [
      { name: '星辰社', colorType: 'primary' },
      { name: '月华会', colorType: 'info' },
      { name: '拂晓骑士团', colorType: 'warning' }
    ]
  },
  {
    id: 'hall-6',
    name: '灰烬纪元',
    cover: '☄️',
    gradient: 'linear-gradient(135deg, #232526 0%, #414345 100%)',
    description: '大灾变后的废土世界，幸存者们在辐射与变异中寻找文明的火种。',
    tagline: '灰烬之中，希望不灭',
    genre: '末世',
    likes: 7820,
    characterCount: 45,
    factionCount: 9,
    storyCount: 19,
    featuredCharacters: [
      { name: '雷烬', avatar: '⚡' },
      { name: '寒霜', avatar: '❄️' },
      { name: '铁皮', avatar: '🦾' }
    ],
    featuredFactions: [
      { name: '钢铁兄弟会', colorType: 'default' },
      { name: '新纪元军', colorType: 'warning' },
      { name: '流浪商队', colorType: 'success' }
    ]
  }
]

const loadFeaturedHalls = async () => {
  loading.value = true
  try {
    const res = await themeHallApi.getFeaturedThemeHalls()
    featuredHalls.value = res.data.halls
  } catch (err) {
    console.error('加载精选专题失败:', err)
    featuredHalls.value = mockHalls.slice(0, 2)
  } finally {
    loading.value = false
  }
}

const loadHalls = async () => {
  try {
    const res = await themeHallApi.getThemeHalls({
      sort: sortBy.value,
      filter: activeFilter.value
    })
    halls.value = res.data.halls
  } catch (err) {
    console.error('加载专题馆列表失败:', err)
    halls.value = activeFilter.value === 'all'
      ? mockHalls.slice(2)
      : mockHalls.filter(h => h.genre === activeFilter.value)
  }
}

const openHall = (id) => {
  router.push(`/theme-hall/${id}`)
}

onMounted(() => {
  loadFeaturedHalls()
  loadHalls()
})
</script>

<style scoped>
.theme-hall {
  padding-bottom: 60px;
}

.hall-hero {
  padding: 40px 30px;
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
  border-radius: 20px;
  margin-bottom: 28px;
  position: relative;
  overflow: hidden;
}

.hall-hero::before {
  content: '';
  position: absolute;
  top: -50%;
  right: -10%;
  width: 400px;
  height: 400px;
  background: radial-gradient(circle, rgba(157, 78, 221, 0.15) 0%, transparent 70%);
  border-radius: 50%;
}

.hero-content {
  display: flex;
  align-items: center;
  gap: 24px;
  position: relative;
  z-index: 1;
}

.hero-icon {
  font-size: 64px;
  filter: drop-shadow(0 4px 12px rgba(157, 78, 221, 0.4));
}

.hero-title {
  font-size: 32px;
  margin: 0 0 8px 0;
  color: #ffffff;
  font-weight: 700;
  background: linear-gradient(135deg, #e0aaff 0%, #c77dff 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.hero-subtitle {
  margin: 0;
  color: rgba(255, 255, 255, 0.7);
  font-size: 15px;
}

.filter-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  flex-wrap: wrap;
  gap: 16px;
}

.filter-tags {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.filter-tag {
  cursor: pointer;
}

.featured-section {
  margin-bottom: 36px;
}

.section-title {
  font-size: 22px;
  margin: 0 0 16px 0;
  color: #333;
}

.featured-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(340px, 1fr));
  gap: 20px;
}

.featured-card {
  cursor: pointer;
  transition: transform 0.3s, box-shadow 0.3s;
  padding: 0;
  overflow: hidden;
}

.featured-card:hover {
  transform: translateY(-6px);
}

.featured-cover {
  height: 160px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.featured-emoji {
  font-size: 72px;
  filter: drop-shadow(0 4px 12px rgba(0, 0, 0, 0.2));
}

.featured-badge {
  position: absolute;
  top: 16px;
  right: 16px;
}

.featured-info {
  padding: 20px;
}

.featured-name {
  font-size: 20px;
  margin: 0 0 6px 0;
  color: #333;
}

.featured-tagline {
  margin: 0 0 16px 0;
  color: #9d4edd;
  font-size: 14px;
  font-style: italic;
}

.featured-stats {
  display: flex;
  align-items: center;
  justify-content: space-around;
  padding-top: 16px;
  border-top: 1px solid #f0f0f0;
}

.stat-block {
  text-align: center;
}

.stat-num {
  display: block;
  font-size: 22px;
  font-weight: 700;
  color: #9d4edd;
}

.stat-label {
  font-size: 12px;
  color: #999;
}

.stat-divider {
  width: 1px;
  height: 30px;
  background: #eee;
}

.halls-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 20px;
}

.hall-card {
  cursor: pointer;
  transition: transform 0.3s, box-shadow 0.3s;
  padding: 0;
  overflow: hidden;
}

.hall-card:hover {
  transform: translateY(-4px);
}

.hall-cover {
  height: 120px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.hall-emoji {
  font-size: 56px;
  filter: drop-shadow(0 4px 12px rgba(0, 0, 0, 0.15));
}

.hall-body {
  padding: 18px;
}

.hall-name {
  font-size: 18px;
  margin: 0 0 8px 0;
  color: #333;
  font-weight: 600;
}

.hall-desc {
  font-size: 13px;
  color: #666;
  line-height: 1.6;
  margin: 0 0 12px 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.hall-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 14px;
}

.hall-views {
  font-size: 13px;
  color: #999;
  display: flex;
  align-items: center;
  gap: 4px;
}

.meta-icon {
  font-size: 14px;
}

.hall-preview {
  padding-top: 14px;
  border-top: 1px solid #f5f5f5;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.preview-row {
  display: flex;
  align-items: flex-start;
  gap: 10px;
}

.preview-label {
  font-size: 12px;
  color: #bbb;
  min-width: 36px;
  padding-top: 2px;
}

.preview-chars {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.char-chip {
  font-size: 12px;
  padding: 3px 10px;
  background: linear-gradient(135deg, #f5f3ff 0%, #ede9fe 100%);
  color: #7c3aed;
  border-radius: 20px;
}

.preview-factions {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.empty-state {
  text-align: center;
  padding: 100px 20px;
}

.empty-icon {
  font-size: 88px;
  margin-bottom: 20px;
  opacity: 0.6;
}

.empty-title {
  font-size: 20px;
  color: #666;
  margin: 0 0 8px 0;
}

.empty-hint {
  font-size: 14px;
  color: #999;
  margin: 0;
}
</style>
