<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import Sidebar from './components/Sidebar.vue'
import Toast from './components/Toast.vue'
import TimelineSidebar from './components/TimelineSidebar.vue'
import PomodoroFloat from './components/PomodoroFloat.vue'
import { useIdleStore } from './stores/idle'

const router = useRouter()
const route = useRoute()
const idleStore = useIdleStore()

onMounted(async () => {
  if (!idleStore.loaded) await idleStore.load()
})

// 暗色模式
const isDark = ref(false)
function toggleDark() {
  isDark.value = !isDark.value
  document.documentElement.classList.toggle('dark', isDark.value)
}

// 主题色
const accentTheme = ref('blue')
function setAccentTheme(t) {
  accentTheme.value = t
  document.documentElement.classList.toggle('theme-green', t === 'green')
}

const navItems = [
  { path: '/today', label: '今天', icon: '🏠' },
  { path: '/todo', label: '待办', icon: '✅' },
  { path: '/journal', label: '随心记', icon: '✍️' },
  { path: '/project', label: '项目', icon: '📋' },
  { path: '/feed', label: '动态', icon: '📡' },
  { path: '/health', label: '健康', icon: '💪' },
  { path: '/assets', label: '素材', icon: '🎨' },
  { path: '/ai', label: 'AI', icon: '🤖' },
  { path: '/settings', label: '设置', icon: '⚙️' },
]

// 模块标题映射
const moduleTitles = {
  '/today': { title: '今天', sub: '今日看板' },
  '/todo': { title: '待办', sub: '任务管理' },
  '/journal': { title: '随心记', sub: '日记' },
  '/project': { title: '项目', sub: '里程碑追踪' },
  '/feed': { title: '动态', sub: '信息流' },
  '/health': { title: '健康', sub: '今日看板' },
  '/assets': { title: '素材', sub: '资源库' },
  '/ai': { title: 'AI', sub: '对话助手' },
  '/settings': { title: '设置', sub: '偏好配置' },
}

const currentModule = moduleTitles[route.path] || { title: '', sub: '' }

function navigate(path) {
  router.push(path)
}
</script>

<template>
  <div class="app">
    <div class="shell">
      <!-- ═══ 左侧导航栏 (rail) ═══ -->
      <div class="rail">
        <div class="rail-header">
          <div class="rail-title">Personal OS</div>
          <div class="rail-sub">v15 · Vue</div>
        </div>

        <div class="nav">
          <div
            v-for="item in navItems"
            :key="item.path"
            class="nav-item"
            :class="{ active: route.path === item.path }"
            @click="navigate(item.path)"
          >
            <span class="ni-ico">{{ item.icon }}</span>
            <span>{{ item.label }}</span>
          </div>
        </div>

        <!-- 番茄钟 -->
        <PomodoroFloat />

        <!-- 赏金 widget -->
        <div class="idle-widget" @click="navigate('/today')">
          <div class="idle-widget-left">
            <div class="idle-widget-wealth">¥{{ idleStore.displayWealth }}</div>
          </div>
          <div class="idle-widget-right">
            <div class="idle-widget-today">{{ idleStore.displayToday }}</div>
            <div class="idle-widget-title">{{ idleStore.title }}</div>
          </div>
        </div>

        <!-- 主题切换 -->
        <div class="rail-foot">
          <div class="theme-row" @click="toggleDark">
            <span class="th-label">暗色模式</span>
            <div class="pill" :class="{ on: isDark }"><div class="pill-k"></div></div>
          </div>
          <div class="accent-picker">
            <span class="accent-picker-label">主题色</span>
            <div
              class="accent-swatch blue"
              :class="{ active: accentTheme === 'blue' }"
              @click="setAccentTheme('blue')"
            ></div>
            <div
              class="accent-swatch green"
              :class="{ active: accentTheme === 'green' }"
              @click="setAccentTheme('green')"
            ></div>
          </div>
        </div>
      </div>

      <!-- ═══ 内层卡片：sidebar + main ═══ -->
      <div class="inner-wrap">
        <Sidebar />
        <div class="main">
          <div class="topbar">
            <div class="topbar-left">
              <div class="topbar-title">{{ currentModule.title }}</div>
              <div class="topbar-sub">{{ currentModule.sub }}</div>
            </div>
            <div class="topbar-actions" id="tb-actions"></div>
          </div>
          <div class="content-area">
            <RouterView />
          </div>
        </div>
      </div>

      <!-- ═══ 右侧时间线 (tl-rail) ═══ -->
      <TimelineSidebar />
    </div>
  </div>
  <Toast />
</template>

<style scoped>
.app {
  height: 100vh;
  overflow: hidden;
  background: var(--bg0);
}

/* ═══ 3 列布局：与原始 HTML 完全一致 ═══ */
.shell {
  display: grid;
  grid-template-columns: 220px 1fr 240px;
  height: 100%;
  background: var(--bg1);
  border: 1px solid var(--border);
  box-shadow: var(--sh2);
  overflow: hidden;
}

/* ═══ LEFT RAIL ═══ */
.rail {
  background: transparent;
  display: flex;
  flex-direction: column;
  z-index: 10;
}

.rail-header {
  padding: 28px 22px 16px;
  border-bottom: 1px solid var(--border);
}

.rail-title {
  font-size: 14px;
  font-weight: 700;
  color: var(--fg0);
  letter-spacing: -.3px;
}

.rail-sub {
  font-size: 9px;
  color: var(--fg2);
  margin-top: 3px;
}

.nav {
  flex: 1;
  padding: 4px 0;
  overflow-y: auto;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 9px 18px;
  cursor: pointer;
  color: var(--fg2);
  font-size: 14px;
  border-left: 3px solid transparent;
  transition: background .12s, color .12s;
  transition-timing-function: cubic-bezier(.4,0,.2,1);
  user-select: none;
}

.nav-item:hover {
  background: var(--bg2);
  color: var(--fg1);
}

.nav-item.active {
  background: var(--acc-dim);
  color: var(--acc-text);
  border-left: 2px solid var(--acc);
  font-weight: 600;
}

.ni-ico {
  width: 13px;
  height: 13px;
  flex-shrink: 0;
  opacity: .7;
  font-size: 14px;
}

.nav-item.active .ni-ico {
  opacity: 1;
}

/* ═══ RAIL FOOT ═══ */
.rail-foot {
  padding: 14px 20px 18px;
  border-top: 1px solid var(--border);
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.theme-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: pointer;
  user-select: none;
}

.th-label {
  font-size: 9.5px;
  color: var(--fg2);
}

.pill {
  width: 36px;
  height: 20px;
  background: var(--bg3);
  border-radius: 10px;
  position: relative;
  transition: background .2s;
  border: 1px solid var(--border2);
  flex-shrink: 0;
}

.pill.on {
  background: var(--acc);
}

.pill-k {
  position: absolute;
  top: 2px;
  left: 2px;
  width: 14px;
  height: 14px;
  background: #fff;
  border-radius: 50%;
  transition: transform .2s;
  box-shadow: 0 1px 3px rgba(0,0,0,.25);
}

.pill.on .pill-k {
  transform: translateX(16px);
}

/* ═══ IDLE WIDGET ═══ */
.idle-widget {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 16px;
  cursor: pointer;
  border-top: 1px solid var(--border);
  transition: background .12s;
}

.idle-widget:hover {
  background: var(--bg2);
}

.idle-widget-left {
  flex-shrink: 0;
}

.idle-widget-wealth {
  font-size: 14px;
  font-weight: 700;
  color: var(--r-gold);
  font-variant-numeric: tabular-nums;
}

.idle-widget-right {
  display: flex;
  flex-direction: column;
  gap: 1px;
}

.idle-widget-today {
  font-size: 10px;
  font-weight: 600;
  color: var(--ok);
}

.idle-widget-title {
  font-size: 10px;
  color: var(--fg3);
}

/* ═══ ACCENT PICKER ═══ */
.accent-picker {
  display: flex;
  gap: 8px;
  align-items: center;
}

.accent-picker-label {
  font-size: 9px;
  color: var(--fg3);
  flex: 1;
}

.accent-swatch {
  width: 22px;
  height: 22px;
  border-radius: 50%;
  cursor: pointer;
  border: 2px solid transparent;
  transition: border-color .15s, transform .15s;
  flex-shrink: 0;
}

.accent-swatch:hover {
  transform: scale(1.1);
}

.accent-swatch.active {
  border-color: var(--fg0);
}

.accent-swatch.blue {
  background: linear-gradient(135deg, #1a5fa8 50%, #5ba3e0 50%);
}

.accent-swatch.green {
  background: linear-gradient(135deg, #1e6b4a 50%, #52b788 50%);
}

.dark .accent-picker {
  display: none;
}

/* ═══ INNER WRAP ═══ */
.inner-wrap {
  display: flex;
  margin: 12px 8px;
  background: var(--bg1);
  border-radius: var(--r12);
  border: 1px solid var(--border);
  box-shadow: var(--sh2);
  overflow: hidden;
  transition: background .25s;
}

/* ═══ MAIN ═══ */
.main {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: var(--bg1);
  border-radius: 0 var(--r12) var(--r12) 0;
}

/* ═══ TOPBAR ═══ */
.topbar {
  background: var(--bg1);
  border-bottom: 1px solid var(--border);
  padding: 14px 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-shrink: 0;
}

.topbar-left {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.topbar-title {
  font-size: 15px;
  font-weight: 700;
  color: var(--fg0);
  letter-spacing: -.2px;
}

.topbar-sub {
  font-size: 13px;
  color: var(--fg2);
}

.topbar-actions {
  display: flex;
  gap: 8px;
}

.content-area {
  flex: 1;
  overflow-y: auto;
  padding: 18px 22px;
  display: flex;
  flex-direction: column;
}
</style>
