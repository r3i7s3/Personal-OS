<script setup>
import { useRouter, useRoute } from 'vue-router'
import Sidebar from './components/Sidebar.vue'

const router = useRouter()
const route = useRoute()

const navItems = [
  { path: '/today', label: '今天', icon: '🏠' },
  { path: '/todo', label: '待办', icon: '✅' },
  { path: '/journal', label: '随心记', icon: '✍️' },
  { path: '/project', label: '项目', icon: '📋' },
  { path: '/timeline', label: '时间线', icon: '🕐' },
  { path: '/health', label: '健康', icon: '💪' },
  { path: '/assets', label: '素材', icon: '🎨' },
  { path: '/ai', label: 'AI', icon: '🤖' },
  { path: '/settings', label: '设置', icon: '⚙️' },
]

function navigate(path) {
  router.push(path)
}
</script>

<template>
  <div class="app">
    <div class="shell">
      <!-- 左侧导航栏 (rail) -->
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
      </div>

      <!-- 内层卡片：sidebar + main -->
      <div class="inner-wrap">
        <Sidebar />
        <div class="main">
          <div class="content-area">
            <RouterView />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.app {
  height: 100vh;
  overflow: hidden;
  background: var(--bg0);
}

.shell {
  display: grid;
  grid-template-columns: 220px 1fr;
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

.content-area {
  flex: 1;
  overflow-y: auto;
  padding: 18px 22px;
  display: flex;
  flex-direction: column;
}
</style>
