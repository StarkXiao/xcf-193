import { createApp } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import naive from 'naive-ui'
import 'vfonts/Lato.css'
import 'vfonts/FiraCode.css'

import App from './App.vue'
import Home from './views/Home.vue'
import StoryReader from './views/StoryReader.vue'
import StoryEditor from './views/StoryEditor.vue'
import WorldLibrary from './views/WorldLibrary.vue'
import WorldDetail from './views/WorldDetail.vue'
import WorldEditor from './views/WorldEditor.vue'
import UserProfile from './views/UserProfile.vue'
import UserCreations from './views/UserCreations.vue'
import UserMessages from './views/UserMessages.vue'
import UserFavorites from './views/UserFavorites.vue'
import WorldCollaboration from './views/WorldCollaboration.vue'

const routes = [
  { path: '/', name: 'Home', component: Home },
  { path: '/story/:id', name: 'StoryReader', component: StoryReader },
  { path: '/editor', name: 'StoryEditor', component: StoryEditor },
  { path: '/editor/:id', name: 'StoryEditorEdit', component: StoryEditor },
  { path: '/worlds', name: 'WorldLibrary', component: WorldLibrary },
  { path: '/world/:id', name: 'WorldDetail', component: WorldDetail },
  { path: '/world-editor', name: 'WorldEditor', component: WorldEditor },
  { path: '/world-editor/:id', name: 'WorldEditorEdit', component: WorldEditor },
  { path: '/user/profile', name: 'UserProfile', component: UserProfile },
  { path: '/user/creations', name: 'UserCreations', component: UserCreations },
  { path: '/user/messages', name: 'UserMessages', component: UserMessages },
  { path: '/user/favorites', name: 'UserFavorites', component: UserFavorites },
  { path: '/world/:id/collaboration', name: 'WorldCollaboration', component: WorldCollaboration }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

const app = createApp(App)
app.use(router)
app.use(naive)
app.mount('#app')
