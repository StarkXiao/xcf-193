<template>
  <n-config-provider :theme="theme" :theme-overrides="themeOverrides">
    <n-layout style="min-height: 100vh">
      <n-layout-header bordered class="header">
        <div class="header-content">
          <div class="logo" @click="goHome">
            <span class="logo-icon">🏰</span>
            <span class="logo-text">浮城回声</span>
          </div>
          <div class="nav-menu">
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
          <div class="user-area">
            <n-avatar round size="medium">
              {{ currentUser.avatar }}
            </n-avatar>
            <span class="username">{{ currentUser.username }}</span>
          </div>
        </div>
      </n-layout-header>
      
      <n-layout-content class="main-content">
        <router-view v-slot="{ Component }">
          <transition name="fade" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </n-layout-content>
      
      <n-layout-footer class="footer">
        <div class="footer-content">
          <p>浮城回声 © 2024 | 幻想恋爱叙事社区</p>
          <p class="footer-sub">用文字编织梦境，让故事超越结局</p>
        </div>
      </n-layout-footer>
    </n-layout>
  </n-config-provider>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { NConfigProvider, NLayout, NLayoutHeader, NLayoutContent, NLayoutFooter, NAvatar } from 'naive-ui'

const route = useRoute()
const router = useRouter()

const theme = ref(null)

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

const menuItems = [
  { key: 'home', label: '首页', icon: '🏠' },
  { key: 'worlds', label: '世界设定', icon: '🌍' },
  { key: 'editor', label: '创作', icon: '✏️' }
]

const activeMenu = computed(() => {
  const path = route.path
  if (path.startsWith('/story')) return 'home'
  if (path.startsWith('/world')) return 'worlds'
  if (path.startsWith('/editor') || path.startsWith('/world-editor')) return 'editor'
  return 'home'
})

const handleMenuClick = (key) => {
  switch (key) {
    case 'home':
      router.push('/')
      break
    case 'worlds':
      router.push('/worlds')
      break
    case 'editor':
      router.push('/editor')
      break
  }
}

const goHome = () => {
  router.push('/')
}
</script>

<style scoped>
.header {
  position: sticky;
  top: 0;
  z-index: 100;
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
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

.logo {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
}

.logo-icon {
  font-size: 28px;
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
  max-width: 400px;
  display: flex;
  justify-content: center;
  gap: 8px;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
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

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
