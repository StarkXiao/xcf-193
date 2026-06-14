<template>
  <div class="user-favorites">
    <div class="page-header">
      <h1 class="page-title">⭐ 我的收藏</h1>
      <p class="page-desc">你收藏的故事和世界设定</p>
    </div>

    <n-tabs v-model:value="activeTab" type="line" size="large" class="favorite-tabs">
      <n-tab-pane name="all" tab="📚 全部收藏">
        <div class="tab-content">
          <div v-if="favoriteStories.length > 0 || favoriteWorlds.length > 0">
            <div v-if="favoriteStories.length > 0" class="section-block">
              <h3 class="sub-title">📖 收藏的故事</h3>
              <div class="items-grid">
                <n-card 
                  v-for="story in favoriteStories" 
                  :key="story.id"
                  hoverable
                  class="favorite-card"
                >
                  <div class="card-cover">{{ story.cover }}</div>
                  <div class="card-content">
                    <h4 class="card-title" @click="openStory(story.id)">{{ story.title }}</h4>
                    <p class="card-summary">{{ story.summary }}</p>
                    <div class="card-tags">
                      <n-tag 
                        v-for="tag in story.tags" 
                        :key="tag" 
                        size="small" 
                        type="primary"
                        style="margin-right: 4px;"
                      >
                        {{ tag }}
                      </n-tag>
                    </div>
                    <div class="card-meta">
                      <span>👤 {{ story.authorName }}</span>
                      <span>❤️ {{ story.likes }}</span>
                      <span>👁️ {{ story.views }}</span>
                    </div>
                  </div>
                  <div class="card-actions">
                    <n-button size="small" type="primary" @click="openStory(story.id)">
                      <template #icon>📖</template>
                      阅读
                    </n-button>
                    <n-button size="small" type="error" quaternary @click="removeFavorite(story.id, 'story', story.title)">
                      <template #icon>💔</template>
                      取消收藏
                    </n-button>
                  </div>
                </n-card>
              </div>
            </div>

            <div v-if="favoriteWorlds.length > 0" class="section-block">
              <h3 class="sub-title">🌍 收藏的世界设定</h3>
              <div class="items-grid">
                <n-card 
                  v-for="world in favoriteWorlds" 
                  :key="world.id"
                  hoverable
                  class="favorite-card"
                >
                  <div class="card-cover world-cover">{{ world.cover }}</div>
                  <div class="card-content">
                    <h4 class="card-title" @click="openWorld(world.id)">{{ world.name }}</h4>
                    <p class="card-summary">{{ world.description }}</p>
                    <div class="card-meta">
                      <span>👤 {{ world.authorName }}</span>
                      <span>📝 {{ world.entries?.length || 0 }} 条目</span>
                      <span>❤️ {{ world.likes }}</span>
                    </div>
                  </div>
                  <div class="card-actions">
                    <n-button size="small" type="primary" @click="openWorld(world.id)">
                      <template #icon>🌍</template>
                      查看
                    </n-button>
                    <n-button size="small" type="error" quaternary @click="removeFavorite(world.id, 'world', world.name)">
                      <template #icon>💔</template>
                      取消收藏
                    </n-button>
                  </div>
                </n-card>
              </div>
            </div>
          </div>
          <div v-else class="empty-state">
            <div class="empty-icon">⭐</div>
            <p>还没有收藏任何内容</p>
            <p class="empty-sub">快去发现喜欢的故事和世界设定吧！</p>
            <n-button type="primary" @click="goHome">
              <template #icon>🏠</template>
              回到首页
            </n-button>
          </div>
        </div>
      </n-tab-pane>

      <n-tab-pane name="stories" tab="📖 收藏故事">
        <div class="tab-content">
          <n-spin :show="loading">
            <div v-if="favoriteStories.length > 0" class="items-grid">
              <n-card 
                v-for="story in favoriteStories" 
                :key="story.id"
                hoverable
                class="favorite-card"
              >
                <div class="card-cover">{{ story.cover }}</div>
                <div class="card-content">
                  <h4 class="card-title" @click="openStory(story.id)">{{ story.title }}</h4>
                  <p class="card-summary">{{ story.summary }}</p>
                  <div class="card-tags">
                    <n-tag 
                      v-for="tag in story.tags" 
                      :key="tag" 
                      size="small" 
                      type="primary"
                      style="margin-right: 4px;"
                    >
                      {{ tag }}
                    </n-tag>
                  </div>
                  <div class="card-meta">
                    <span>👤 {{ story.authorName }}</span>
                    <span>❤️ {{ story.likes }}</span>
                    <span>👁️ {{ story.views }}</span>
                  </div>
                </div>
                <div class="card-actions">
                  <n-button size="small" type="primary" @click="openStory(story.id)">
                    <template #icon>📖</template>
                    阅读
                  </n-button>
                  <n-button size="small" type="error" quaternary @click="removeFavorite(story.id, 'story', story.title)">
                    <template #icon>💔</template>
                    取消收藏
                  </n-button>
                </div>
              </n-card>
            </div>
            <div v-else class="empty-state">
              <div class="empty-icon">📖</div>
              <p>还没有收藏故事</p>
              <p class="empty-sub">去故事广场发现精彩故事吧！</p>
              <n-button type="primary" @click="goHome">
                <template #icon>🏠</template>
                回到首页
              </n-button>
            </div>
          </n-spin>
        </div>
      </n-tab-pane>

      <n-tab-pane name="worlds" tab="🌍 收藏世界">
        <div class="tab-content">
          <n-spin :show="loading">
            <div v-if="favoriteWorlds.length > 0" class="items-grid">
              <n-card 
                v-for="world in favoriteWorlds" 
                :key="world.id"
                hoverable
                class="favorite-card"
              >
                <div class="card-cover world-cover">{{ world.cover }}</div>
                <div class="card-content">
                  <h4 class="card-title" @click="openWorld(world.id)">{{ world.name }}</h4>
                  <p class="card-summary">{{ world.description }}</p>
                  <div class="card-meta">
                    <span>👤 {{ world.authorName }}</span>
                    <span>📝 {{ world.entries?.length || 0 }} 条目</span>
                    <span>❤️ {{ world.likes }}</span>
                  </div>
                </div>
                <div class="card-actions">
                  <n-button size="small" type="primary" @click="openWorld(world.id)">
                    <template #icon>🌍</template>
                    查看
                  </n-button>
                  <n-button size="small" type="error" quaternary @click="removeFavorite(world.id, 'world', world.name)">
                    <template #icon>💔</template>
                    取消收藏
                  </n-button>
                </div>
              </n-card>
            </div>
            <div v-else class="empty-state">
              <div class="empty-icon">🌍</div>
              <p>还没有收藏世界设定</p>
              <p class="empty-sub">去世界设定库探索精彩世界观吧！</p>
              <n-button type="primary" @click="goToWorlds">
                <template #icon>🌍</template>
                世界设定库
              </n-button>
            </div>
          </n-spin>
        </div>
      </n-tab-pane>
    </n-tabs>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { NButton, NCard, NTag, NTabs, NTabPane, NSpin, useMessage, useDialog } from 'naive-ui'
import { userApi } from '../api'

const router = useRouter()
const message = useMessage()
const dialog = useDialog()
const userId = 'user-1'

const activeTab = ref('all')
const favoriteStories = ref([])
const favoriteWorlds = ref([])
const loading = ref(false)

const loadFavorites = async () => {
  loading.value = true
  try {
    const res = await userApi.getFavorites(userId)
    favoriteStories.value = res.data.stories
    favoriteWorlds.value = res.data.worlds
  } catch (err) {
    console.error('加载收藏失败:', err)
    message.error('加载收藏失败')
  } finally {
    loading.value = false
  }
}

const removeFavorite = async (targetId, targetType, title) => {
  dialog.warning({
    title: '确认取消收藏',
    content: `确定要取消收藏《${title}》吗？`,
    positiveText: '确定取消',
    negativeText: '再想想',
    onPositiveClick: async () => {
      try {
        await userApi.removeFavorite(userId, { targetId, targetType })
        message.success('已取消收藏')
        await loadFavorites()
      } catch (err) {
        console.error('取消收藏失败:', err)
        message.error('操作失败')
      }
    }
  })
}

const openStory = (id) => {
  router.push(`/story/${id}`)
}

const openWorld = (id) => {
  router.push(`/world/${id}`)
}

const goHome = () => {
  router.push('/')
}

const goToWorlds = () => {
  router.push('/worlds')
}

watch(activeTab, () => {
  loadFavorites()
})

onMounted(() => {
  loadFavorites()
})
</script>

<style scoped>
.user-favorites {
  padding-bottom: 40px;
}

.page-header {
  margin-bottom: 24px;
}

.page-title {
  font-size: 28px;
  margin: 0 0 8px 0;
  color: #333;
}

.page-desc {
  font-size: 14px;
  color: #999;
  margin: 0;
}

.favorite-tabs {
  margin-bottom: 20px;
}

.tab-content {
  padding-top: 20px;
}

.section-block {
  margin-bottom: 40px;
}

.sub-title {
  font-size: 18px;
  margin: 0 0 16px 0;
  color: #333;
}

.items-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}

.favorite-card {
  transition: transform 0.3s, box-shadow 0.3s;
}

.favorite-card:hover {
  transform: translateY(-4px);
}

.card-cover {
  font-size: 48px;
  text-align: center;
  padding: 24px 0;
  background: linear-gradient(135deg, #f0e6ff 0%, #e0ccff 100%);
  border-radius: 8px;
  margin-bottom: 12px;
}

.world-cover {
  background: linear-gradient(135deg, #e6f7ff 0%, #bae7ff 100%);
}

.card-content {
  margin-bottom: 12px;
}

.card-title {
  font-size: 16px;
  margin: 0 0 8px 0;
  color: #333;
  cursor: pointer;
  transition: color 0.2s;
}

.card-title:hover {
  color: #9d4edd;
}

.card-summary {
  font-size: 13px;
  color: #666;
  line-height: 1.6;
  margin: 0 0 10px 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.card-tags {
  margin-bottom: 10px;
}

.card-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  font-size: 12px;
  color: #999;
}

.card-actions {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.empty-state {
  text-align: center;
  padding: 80px 20px;
}

.empty-icon {
  font-size: 64px;
  margin-bottom: 16px;
}

.empty-state p {
  color: #666;
  margin: 0 0 8px 0;
  font-size: 16px;
}

.empty-sub {
  color: #999 !important;
  font-size: 13px !important;
  margin-bottom: 20px !important;
}
</style>
