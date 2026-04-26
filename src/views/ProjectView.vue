<script setup>
import { onMounted } from 'vue'
import { useProjectStore } from '../stores/project'
import MilestoneList from '../components/project/MilestoneList.vue'

const store = useProjectStore()

onMounted(async () => {
  if (!store.loaded) {
    await store.load()
  }
})

function selectProject(id) {
  store.setCurrentProject(id)
}

function onDateChange(field, value) {
  const proj = store.currentProject
  if (proj) {
    proj[field] = value
    store.save()
  }
}
</script>

<template>
  <div class="project-view">
    <!-- 项目列表 -->
    <div class="proj-sidebar">
      <div class="proj-sidebar-title">项目</div>
      <div
        v-for="proj in store.projects"
        :key="proj.id"
        class="proj-item"
        :class="{ active: proj.id === store.currentProjectId }"
        @click="selectProject(proj.id)"
      >
        <div class="proj-item-name">{{ proj.name }}</div>
        <div class="proj-item-meta">{{ proj.meta }}</div>
      </div>
    </div>

    <!-- 项目详情 -->
    <div class="proj-detail" v-if="store.currentProject">
      <!-- 头部 -->
      <div class="proj-header">
        <div class="proj-name">{{ store.currentProject.name }}</div>
        <div class="proj-meta">{{ store.currentProject.meta }}</div>
      </div>

      <!-- 进度条 -->
      <div class="proj-bar-wrap">
        <div class="proj-bar" :style="{ width: store.currentProject.pct + '%' }" />
      </div>

      <!-- 日期选择 -->
      <div class="proj-dates">
        <span class="proj-date-label">开始</span>
        <input
          type="date"
          :value="store.currentProject.startDate"
          @change="onDateChange('startDate', $event.target.value)"
          class="proj-date-input"
        />
        <span class="proj-date-label">截止</span>
        <input
          type="date"
          :value="store.currentProject.endDate"
          @change="onDateChange('endDate', $event.target.value)"
          class="proj-date-input"
        />
      </div>

      <!-- 里程碑 -->
      <div class="proj-section">
        <div class="card-title">里程碑</div>
        <MilestoneList />
      </div>
    </div>
  </div>
</template>

<style scoped>
.project-view {
  display: flex;
  gap: 16px;
  height: 100%;
  padding: 16px;
}

/* 侧边栏 */
.proj-sidebar {
  width: 180px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.proj-sidebar-title {
  font-size: 11px;
  font-weight: 600;
  color: var(--fg3);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  padding: 4px 8px;
  margin-bottom: 4px;
}

.proj-item {
  padding: 8px 10px;
  border-radius: var(--r8);
  cursor: pointer;
  transition: background 0.12s;
}

.proj-item:hover {
  background: var(--bg2);
}

.proj-item.active {
  background: var(--acc-dim);
}

.proj-item-name {
  font-size: 12px;
  font-weight: 600;
  color: var(--fg1);
}

.proj-item-meta {
  font-size: 10px;
  color: var(--fg3);
  margin-top: 2px;
}

/* 详情区 */
.proj-detail {
  flex: 1;
  min-width: 0;
}

.proj-header {
  margin-bottom: 12px;
}

.proj-name {
  font-size: 16px;
  font-weight: 700;
  color: var(--fg0);
}

.proj-meta {
  font-size: 11px;
  color: var(--fg3);
  margin-top: 2px;
}

/* 进度条 */
.proj-bar-wrap {
  height: 3px;
  background: var(--bg3);
  border-radius: 2px;
  overflow: hidden;
  margin-bottom: 12px;
}

.proj-bar {
  height: 100%;
  background: var(--ok);
  border-radius: 2px;
  transition: width 0.6s cubic-bezier(0.4, 0, 0.2, 1);
}

/* 日期 */
.proj-dates {
  display: flex;
  gap: 8px;
  align-items: center;
  font-size: 11px;
  margin-bottom: 16px;
}

.proj-date-label {
  color: var(--fg3);
}

.proj-date-input {
  background: var(--bg1);
  border: 1px solid var(--border);
  border-radius: var(--r6);
  padding: 3px 6px;
  font-size: 11px;
  color: var(--fg1);
  outline: none;
}

.proj-date-input:focus {
  border-color: var(--acc);
}

/* 区块 */
.proj-section {
  margin-bottom: 16px;
}

.card-title {
  font-size: 12px;
  font-weight: 600;
  color: var(--fg2);
  margin-bottom: 8px;
}
</style>
