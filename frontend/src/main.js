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

const routes = [
  { path: '/', name: 'Home', component: Home },
  { path: '/story/:id', name: 'StoryReader', component: StoryReader },
  { path: '/editor', name: 'StoryEditor', component: StoryEditor },
  { path: '/editor/:id', name: 'StoryEditorEdit', component: StoryEditor },
  { path: '/worlds', name: 'WorldLibrary', component: WorldLibrary },
  { path: '/world/:id', name: 'WorldDetail', component: WorldDetail },
  { path: '/world-editor', name: 'WorldEditor', component: WorldEditor },
  { path: '/world-editor/:id', name: 'WorldEditorEdit', component: WorldEditor }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

const app = createApp(App)
app.use(router)
app.use(naive)
app.mount('#app')
