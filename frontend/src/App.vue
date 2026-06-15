<template>
  <n-config-provider :theme="theme" :theme-overrides="themeOverrides">
    <div class="app-root" :class="{ 'is-mobile': isMobile, 'menu-open': mobileMenuOpen }">
      <transition name="slide-left">
        <div v-if="isMobile && mobileMenuOpen" class="mobile-menu-backdrop" @click="mobileMenuOpen = false"></div>
      </transition>

      <transition name="slide-left">
        <div v-if="isMobile && mobileMenuOpen" class="mobile-menu-drawer" @click.stop>
          <div class="drawer-header">
            <div class="drawer-user">
              <n-avatar round size="large">{{ currentUser.avatar }}</n-avatar>
              <div class="drawer-user-info">
                <div class="drawer-username">{{ currentUser.username }}</div>
                <div class="drawer-user-sub">幻想之城的旅人</div>
              </div>
            </div>
            <n-button text @click="mobileMenuOpen = false" class="drawer-close">
              <template #icon>✕</template>
            </n-button>
          </div>
          <div class="drawer-menu">
            <div 
              v-for="item in menuItems" 
              :key="item.key"
              class="drawer-item"
              :class="{ active: activeMenu === item.key }"
              @click="handleDrawerMenuClick(item.key)"
            >
              <span class="drawer-item-icon">{{ item.icon }}</span>
              <span class="drawer-item-label">{{ item.label }}</span>
              <span class="drawer-item-arrow">›</span>
            </div>
          </div>
          <div class="drawer-divider"></div>
          <div class="drawer-menu">
            <div 
              v-for="item in userMenuItems" 
              :key="item.key"
              class="drawer-item"
              @click="handleDrawerMenuClick(item.key)"
            >
              <span class="drawer-item-icon">{{ item.icon }}</span>
              <span class="drawer-item-label">{{ item.label }}</span>
            </div>
          </div>
        </div>
      </transition>

      <n-layout class="layout-wrapper" style="min-height: 100vh">
        <n-layout-header bordered class="header" :class="{ 'mobile-header': isMobile }">
          <div class="header-content">
            <div class="header-left">
              <n-button 
                v-if="isMobile" 
                text 
                class="hamburger-btn"
                @click="mobileMenuOpen = !mobileMenuOpen"
              >
                <template #icon>☰</template>
              </n-button>
              <div class="logo" @click="goHome">
                <span class="logo-icon">🏰</span>
                <span v-if="!isMobile" class="logo-text">浮城回声</span>
              </div>
            </div>
            
            <div v-if="!isMobile" class="nav-menu">
              <div 
                v-for="item in menuItems" 
                :key="item.key"
                class="nav-item"
                :class="{ active: activeMenu === item.key }"
                @click="handleMenuClick(item.key)"
              >
                <span class="nav-icon">{{ item.icon }}</span>
                <span class="nav-text">{{ item.label }}</span>
              </div>
            </div>
            
            <div v-if="!isMobile" class="header-search">
              <SearchBox size="small" placeholder="搜索..." />
            </div>
            
            <div class="header-right">
              <div v-if="isMobile" class="mobile-search-icon" @click="router.push('/search')">
                🔍
              </div>
              <div class="user-area">
                <n-dropdown 
                  :options="userMenuOptions" 
                  @select="handleUserMenuSelect"
                  trigger="click"
                >
                  <div class="user-dropdown-trigger">
                    <n-badge :value="unreadCount" :max="99" :show="unreadCount > 0 && !isMobile" type="error">
                      <n-avatar round :size="isMobile ? 'small' : 'medium'">
                        {{ currentUser.avatar }}
                      </n-avatar>
                    </n-badge>
                    <span v-if="!isMobile" class="username">{{ currentUser.username }}</span>
                    <span v-if="!isMobile" class="dropdown-arrow">▼</span>
                  </div>
                </n-dropdown>
              </div>
            </div>
          </div>
        </n-layout-header>
        
        <n-layout-content 
          class="main-content" 
          :class="{ 
            'mobile-content': isMobile,
            'has-tabbar': isMobile 
          }"
        >
          <n-message-provider>
            <router-view v-slot="{ Component }">
              <transition name="fade" mode="out-in">
                <component :is="Component" />
              </transition>
            </router-view>
          </n-message-provider>
        </n-layout-content>
        
        <n-layout-footer v-if="!isMobile" class="footer">
          <div class="footer-content">
            <p>浮城回声 © 2024 | 幻想恋爱叙事社区</p>
            <p class="footer-sub">用文字编织梦境，让故事超越结局</p>
          </div>
        </n-layout-footer>

        <div v-if="isMobile" class="mobile-tabbar">
          <div 
            v-for="item in tabBarItems" 
            :key="item.key"
            class="tabbar-item"
            :class="{ active: activeMenu === item.key }"
            @click="handleMenuClick(item.key)"
          >
            <span class="tabbar-icon">{{ item.icon }}</span>
            <span class="tabbar-label">{{ item.label }}</span>
            <n-badge 
              v-if="item.key === 'messages' && unreadCount > 0" 
              :value="unreadCount" 
              :max="99" 
              type="error"
              class="tabbar-badge"
            />
          </div>
        </div>
      </n-layout>
    </div>
  </n-config-provider>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { 
  NConfigProvider, NLayout, NLayoutHeader, NLayoutContent, NLayoutFooter, 
  NAvatar, NDropdown, NBadge, NMessageProvider, NButton 
} from 'naive-ui'
import { notificationApi } from './api'
import SearchBox from './components/SearchBox.vue'
import { useResponsive } from './composables/useResponsive'

const route = useRoute()
const router = useRouter()
const { isMobile } = useResponsive()

const theme = ref(null)
const mobileMenuOpen = ref(false)

const themeOverrides = {
  common: {
    primaryColor: '#9d4edd',
    primaryColorHover: '#c77dff',
    primaryColorPressed: '#7b2cbf',
    primaryColorSuppl: '#e0aaff',
    borderRadius: '12px'
  }
}

const currentUser = ref({
  id: 'user-1',
  username: '月下独酌',
  avatar: '🌸'
})

const unreadCount = ref(0)

const loadUnreadCount = async () => {
  try {
    const res = await notificationApi.getUnreadCount(currentUser.value.id)
    unreadCount.value = res.data.unreadCount
  } catch (err) {
    console.error('加载未读消息数失败:', err)
  }
}

const menuItems = [
  { key: 'home', label: '首页', icon: '🏠' },
  { key: 'creation-tasks', label: '创作任务', icon: '📋' },
  { key: 'activities', label: '活动中心', icon: '🎯' },
  { key: 'worlds', label: '世界设定', icon: '🌍' },
  { key: 'theme-halls', label: '专题世界馆', icon: '🏛️' },
  { key: 'editor', label: '创作', icon: '✏️' }
]

const tabBarItems = [
  { key: 'home', label: '首页', icon: '🏠' },
  { key: 'worlds', label: '世界', icon: '🌍' },
  { key: 'editor', label: '创作', icon: '✏️' },
  { key: 'messages', label: '消息', icon: '💬' },
  { key: 'profile', label: '我的', icon: '👤' }
]

const userMenuItems = [
  { key: 'profile', label: '个人主页', icon: '👤' },
  { key: 'creations', label: '创作记录', icon: '✏️' },
  { key: 'messages', label: unreadCount.value > 0 ? `互动消息 (${unreadCount.value})` : '互动消息', icon: '💬' },
  { key: 'favorites', label: '收藏管理', icon: '⭐' },
  { key: 'dashboard', label: '数据看板', icon: '📊' }
]

const userMenuOptions = [
  {
    label: '个人主页',
    key: 'profile',
    icon: () => '👤'
  },
  {
    label: '创作记录',
    key: 'creations',
    icon: () => '✏️'
  },
  {
    label: () => unreadCount.value > 0 ? `互动消息 (${unreadCount.value})` : '互动消息',
    key: 'messages',
    icon: () => '💬'
  },
  {
    label: '收藏管理',
    key: 'favorites',
    icon: () => '⭐'
  },
  {
    label: '数据看板',
    key: 'dashboard',
    icon: () => '📊'
  },
  {
    label: '内容审核',
    key: 'audit',
    icon: () => '🛡️'
  },
  {
    type: 'divider',
    key: 'd1'
  },
  {
    label: '创作新故事',
    key: 'editor',
    icon: () => '📝'
  },
  {
    label: '新建世界设定',
    key: 'world-editor',
    icon: () => '🌍'
  }
]

const activeMenu = computed(() => {
  const path = route.path
  if (path.startsWith('/story')) return 'home'
  if (path.startsWith('/creation-task')) return 'creation-tasks'
  if (path.startsWith('/creation-tasks')) return 'creation-tasks'
  if (path.startsWith('/activity')) return 'activities'
  if (path.startsWith('/world')) return 'worlds'
  if (path.startsWith('/theme-hall')) return 'theme-halls'
  if (path.startsWith('/editor') || path.startsWith('/world-editor')) return 'editor'
  if (path.startsWith('/activities')) return 'activities'
  if (path.startsWith('/user/dashboard')) return 'editor'
  if (path.startsWith('/user/profile')) return 'profile'
  if (path.startsWith('/user/creations')) return 'profile'
  if (path.startsWith('/user/messages')) return 'messages'
  if (path.startsWith('/user/favorites')) return 'profile'
  return 'home'
})

const handleMenuClick = (key) => {
  mobileMenuOpen.value = false
  switch (key) {
    case 'home':
      router.push('/')
      break
    case 'creation-tasks':
      router.push('/creation-tasks')
      break
    case 'activities':
      router.push('/activities')
      break
    case 'worlds':
      router.push('/worlds')
      break
    case 'theme-halls':
      router.push('/theme-halls')
      break
    case 'editor':
      router.push('/editor')
      break
    case 'messages':
      router.push('/user/messages')
      break
    case 'profile':
      router.push('/user/profile')
      break
  }
}

const handleDrawerMenuClick = (key) => {
  mobileMenuOpen.value = false
  handleMenuClick(key)
}

const handleUserMenuSelect = (key) => {
  switch (key) {
    case 'profile':
      router.push('/user/profile')
      break
    case 'creations':
      router.push('/user/creations')
      break
    case 'messages':
      router.push('/user/messages')
      break
    case 'favorites':
      router.push('/user/favorites')
      break
    case 'dashboard':
      router.push('/user/dashboard')
      break
    case 'audit':
      router.push('/admin/audit')
      break
    case 'editor':
      router.push('/editor')
      break
    case 'world-editor':
      router.push('/world-editor')
      break
  }
}

const goHome = () => {
  router.push('/')
}

onMounted(() => {
  loadUnreadCount()
})
</script>

<style scoped>
.app-root {
  position: relative;
  min-height: 100vh;
}

.app-root.menu-open {
  overflow: hidden;
}

.mobile-menu-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 200;
}

.mobile-menu-drawer {
  position: fixed;
  top: 0;
  left: 0;
  width: 85%;
  max-width: 320px;
  height: 100vh;
  background: white;
  z-index: 300;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  box-shadow: 2px 0 12px rgba(0, 0, 0, 0.15);
}

.drawer-header {
  padding: 20px 16px;
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: calc(20px + var(--safe-area-inset-top));
}

.drawer-user {
  display: flex;
  align-items: center;
  gap: 12px;
}

.drawer-user-info {
  color: white;
}

.drawer-username {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 2px;
}

.drawer-user-sub {
  font-size: 12px;
  opacity: 0.7;
}

.drawer-close {
  color: white !important;
}

.drawer-menu {
  padding: 12px 0;
  flex: 1;
}

.drawer-item {
  display: flex;
  align-items: center;
  padding: 14px 20px;
  gap: 14px;
  cursor: pointer;
  transition: background 0.15s;
}

.drawer-item:active {
  background: #f5f5f5;
}

.drawer-item.active {
  background: #f9f0ff;
}

.drawer-item.active .drawer-item-label {
  color: #9d4edd;
  font-weight: 600;
}

.drawer-item-icon {
  font-size: 22px;
  width: 28px;
  text-align: center;
}

.drawer-item-label {
  flex: 1;
  font-size: 15px;
  color: #333;
}

.drawer-item-arrow {
  color: #ccc;
  font-size: 20px;
}

.drawer-divider {
  height: 8px;
  background: #f5f5f5;
  margin: 4px 0;
}

.header {
  position: sticky;
  top: 0;
  z-index: 100;
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
}

.header.mobile-header {
  height: 56px;
  padding-top: var(--safe-area-inset-top);
}

.header-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 64px;
}

.mobile-header .header-content {
  height: 56px;
  padding: 0 12px;
}

.header-left,
.header-right {
  display: flex;
  align-items: center;
  gap: 8px;
}

.hamburger-btn {
  color: #e0aaff !important;
  font-size: 24px !important;
  padding: 4px 8px !important;
}

.logo {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
}

.logo-icon {
  font-size: 28px;
}

.mobile-header .logo-icon {
  font-size: 24px;
}

.logo-text {
  font-size: 20px;
  font-weight: bold;
  background: linear-gradient(135deg, #e0aaff 0%, #c77dff 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.nav-menu {
  flex: 1;
  max-width: 500px;
  display: flex;
  justify-content: center;
  gap: 4px;
}

.header-search {
  flex: 1;
  max-width: 280px;
  margin: 0 16px;
}

.mobile-search-icon {
  font-size: 22px;
  padding: 8px;
  cursor: pointer;
  color: #e0aaff;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  color: #c77dff;
  font-size: 14px;
}

.nav-item:hover {
  background: rgba(199, 125, 255, 0.1);
  color: #e0aaff;
}

.nav-item.active {
  background: linear-gradient(135deg, rgba(157, 78, 221, 0.3) 0%, rgba(199, 125, 255, 0.3) 100%);
  color: #ffffff;
}

.nav-icon {
  font-size: 16px;
}

.nav-text {
  font-weight: 500;
}

.user-area {
  display: flex;
  align-items: center;
  gap: 10px;
}

.user-dropdown-trigger {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 8px;
  transition: background 0.2s;
}

.user-dropdown-trigger:hover {
  background: rgba(199, 125, 255, 0.1);
}

.dropdown-arrow {
  font-size: 10px;
  color: #c77dff;
}

.username {
  color: #e0aaff;
  font-size: 14px;
}

.main-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 24px;
  width: 100%;
  box-sizing: border-box;
}

.main-content.mobile-content {
  max-width: 100%;
  padding: 12px;
}

.main-content.has-tabbar {
  padding-bottom: calc(60px + var(--safe-area-inset-bottom) + 12px);
}

.footer {
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
  color: #c77dff;
}

.footer-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px 24px;
  text-align: center;
}

.footer-content p {
  margin: 4px 0;
}

.footer-sub {
  font-size: 12px;
  opacity: 0.7;
}

.mobile-tabbar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 60px;
  padding-bottom: var(--safe-area-inset-bottom);
  background: rgba(255, 255, 255, 0.98);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  display: flex;
  border-top: 1px solid #eee;
  z-index: 150;
  box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.06);
}

.tabbar-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2px;
  cursor: pointer;
  transition: color 0.15s;
  position: relative;
  color: #999;
}

.tabbar-item:active {
  opacity: 0.7;
}

.tabbar-item.active {
  color: #9d4edd;
}

.tabbar-icon {
  font-size: 22px;
  line-height: 1;
}

.tabbar-label {
  font-size: 11px;
  line-height: 1;
}

.tabbar-badge {
  position: absolute;
  top: 4px;
  right: 50%;
  transform: translateX(16px);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.slide-left-enter-active,
.slide-left-leave-active {
  transition: transform 0.25s ease, opacity 0.25s ease;
}

.slide-left-enter-from {
  transform: translateX(-100%);
  opacity: 0;
}

.slide-left-leave-to {
  transform: translateX(-100%);
  opacity: 0;
}
</style>
