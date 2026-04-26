<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useTodayStore, getCompletion评价 } from '../stores/today'
import { useTodoStore, fmtDate } from '../stores/todo'
import { useHealthStore } from '../stores/health'
import { useJournalStore } from '../stores/journal'
import { useProjectStore } from '../stores/project'

const router = useRouter()
const todayStore = useTodayStore()
const todoStore = useTodoStore()
const healthStore = useHealthStore()
const journalStore = useJournalStore()
const projStore = useProjectStore()

onMounted(async () => {
  if (!todoStore.loaded) await todoStore.load()
  if (!healthStore.loaded) await healthStore.load()
  if (!journalStore.loaded) await journalStore.load()
  if (!projStore.loaded) await projStore.load()
})

const todayStr = fmtDate(new Date())
const todayDate = computed(() => {
  const n = new Date()
  const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
  return `${n.getMonth() + 1}月${n.getDate()}日 ${weekdays[n.getDay()]}`
})

// 今日待办
const todayTasks = computed(() => todoStore.tasks.filter(t => t.date === todayStr))
const todayDone = computed(() => todayTasks.value.filter(t => t.done).length)
const todayTotal = computed(() => todayTasks.value.length)
const completionPct = computed(() => todayTotal.value ? Math.round(todayDone.value / todayTotal.value * 100) : 0)
const completion评价 = computed(() => getCompletion评价(completionPct.value))

// 今日待办列表（按优先级排序）
const todayTaskList = computed(() => {
  const priOrder = { '高': 0, '中': 1, '低': 2 }
  return todayTasks.value
    .filter(t => !t.done)
    .sort((a, b) => (priOrder[a.pri] || 1) - (priOrder[b.pri] || 1))
    .slice(0, 5)
})

// 健康速览
const healthScore = computed(() => healthStore.score)
const healthScoreColor = computed(() => healthStore.scoreColor)
const waterCups = computed(() => healthStore.data?.water?.cups || 0)
const waterGoal = computed(() => healthStore.data?.water?.goal || 8)

// 今日日记
const todayJournal = computed(() => journalStore.entries.find(e => e.title.startsWith(todayStr.slice(5))))

// 今日项目活跃
const activeProjects = computed(() => projStore.projects.filter(p =>
  p.milestones.some(m => m.active)
))

// 昨日对比（简单版：用健康评分）
const yesterdayScore = computed(() => healthStore.yesterdayScore)
const scoreDiff = computed(() => {
  if (yesterdayScore.value === null) return null
  return healthScore.value - yesterdayScore.value
})

function navigate(path) {
  router.push(path)
}

function refreshEncouragement() {
  todayStore.refreshEncouragement()
}
</script>

<template>
  <div class="today-view">
    <!-- 日期头 -->
    <div class="today-header">
      <div>
        <div class="today-date">{{ todayDate }}</div>
        <div class="today-sub">Personal OS</div>
      </div>
      <div class="today-encouragement" @click="refreshEncouragement" :title="'点击换一句'">
        {{ todayStore.encouragement }}
      </div>
    </div>

    <!-- 主区域：两列 -->
    <div class="today-grid">
      <!-- 左列 -->
      <div class="today-left">
        <!-- 进度环 + 评价 -->
        <div class="today-card progress-card">
          <div class="progress-ring-wrap">
            <svg class="progress-ring" viewBox="0 0 80 80">
              <circle cx="40" cy="40" r="34" fill="none" stroke="var(--bg3)" stroke-width="6" />
              <circle
                cx="40" cy="40" r="34" fill="none"
                :stroke="completion评价.color"
                stroke-width="6"
                stroke-linecap="round"
                :stroke-dasharray="2 * Math.PI * 34"
                :stroke-dashoffset="2 * Math.PI * 34 * (1 - completionPct / 100)"
                transform="rotate(-90 40 40)"
                style="transition: stroke-dashoffset .6s cubic-bezier(.4,0,.2,1)"
              />
            </svg>
            <div class="progress-center">
              <div class="progress-pct">{{ completionPct }}%</div>
            </div>
          </div>
          <div class="progress-info">
            <div class="progress-emoji">{{ completion评价.emoji }}</div>
            <div class="progress-text" :style="{ color: completion评价.color }">{{ completion评价.text }}</div>
            <div class="progress-detail">完成 {{ todayDone }}/{{ todayTotal }} 个任务</div>
            <div v-if="scoreDiff !== null" class="progress-diff">
              <span :style="{ color: scoreDiff >= 0 ? 'var(--ok)' : 'var(--danger)' }">
                {{ scoreDiff >= 0 ? '↑' : '↓' }}{{ Math.abs(scoreDiff) }} 分
              </span>
              <span class="progress-diff-label">较昨日</span>
            </div>
          </div>
        </div>

        <!-- 今日待办 -->
        <div class="today-card">
          <div class="today-card-header">
            <div class="today-card-title">📋 今日待办</div>
            <span class="today-card-link" @click="navigate('/todo')">查看全部 →</span>
          </div>
          <div v-if="todayTaskList.length === 0" class="today-empty">
            {{ todayTotal === 0 ? '今天没有待办，轻松一天 ☕' : '全部完成！🎉' }}
          </div>
          <div v-else class="today-task-list">
            <div
              v-for="t in todayTaskList"
              :key="t.id"
              class="today-task-item"
            >
              <div
                class="today-task-pri"
                :style="{ background: t.tag === '娱乐' ? 'var(--purple)' : t.tag === '个人' ? 'var(--acc)' : (todoStore.priColor[t.pri] || 'var(--border2)') }"
              />
              <span class="today-task-text">{{ t.text }}</span>
              <span class="today-task-tag">{{ t.tag }}</span>
            </div>
          </div>
        </div>

        <!-- 活跃项目 -->
        <div v-if="activeProjects.length" class="today-card">
          <div class="today-card-header">
            <div class="today-card-title">🔥 进行中的项目</div>
            <span class="today-card-link" @click="navigate('/project')">查看全部 →</span>
          </div>
          <div class="today-project-list">
            <div
              v-for="p in activeProjects"
              :key="p.id"
              class="today-project-item"
            >
              <span class="today-project-name">{{ p.name }}</span>
              <span class="today-project-ms">
                {{ p.milestones.filter(m => m.active).map(m => m.t).join('、') }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- 右列 -->
      <div class="today-right">
        <!-- 健康速览 -->
        <div class="today-card health-card">
          <div class="today-card-header">
            <div class="today-card-title">💪 健康</div>
            <span class="today-card-link" @click="navigate('/health')">详情 →</span>
          </div>
          <div class="health-quick">
            <div class="health-score" :style="{ color: healthScoreColor }">{{ healthScore }}</div>
            <div class="health-metrics">
              <div class="health-metric">
                <span>💧</span>
                <span>{{ waterCups }}/{{ waterGoal }} 杯</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 今日心情 -->
        <div class="today-card">
          <div class="today-card-header">
            <div class="today-card-title">✍️ 今日随心记</div>
            <span class="today-card-link" @click="navigate('/journal')">{{ todayJournal ? '查看 →' : '写一篇 →' }}</span>
          </div>
          <div v-if="todayJournal" class="today-journal-preview">
            <div class="today-journal-mood">{{ todayJournal.mood }}</div>
            <div class="today-journal-text">{{ todayJournal.content.substring(0, 80) }}…</div>
          </div>
          <div v-else class="today-empty">
            今天还没写，记录一下吧
          </div>
        </div>

        <!-- 快速入口 -->
        <div class="today-card quick-actions">
          <button class="quick-btn" @click="navigate('/todo')">
            <span class="quick-icon">✅</span>
            <span>添加待办</span>
          </button>
          <button class="quick-btn" @click="navigate('/journal')">
            <span class="quick-icon">✍️</span>
            <span>写日记</span>
          </button>
          <button class="quick-btn" @click="navigate('/todo')">
            <span class="quick-icon">🍅</span>
            <span>开始专注</span>
          </button>
          <button class="quick-btn" @click="navigate('/project')">
            <span class="quick-icon">📋</span>
            <span>看项目</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.today-view {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

/* Header */
.today-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
}

.today-date {
  font-size: 18px;
  font-weight: 700;
  color: var(--fg0);
}

.today-sub {
  font-size: 11px;
  color: var(--fg3);
  margin-top: 2px;
}

.today-encouragement {
  font-size: 12px;
  color: var(--acc-text);
  background: var(--acc-dim);
  padding: 6px 12px;
  border-radius: 20px;
  cursor: pointer;
  transition: all .15s;
  max-width: 260px;
  text-align: right;
}

.today-encouragement:hover {
  background: var(--acc);
  color: #fff;
}

/* Grid */
.today-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

/* Cards */
.today-card {
  background: var(--bg1);
  border: 1px solid var(--border);
  border-radius: var(--r12);
  padding: 14px 16px;
  box-shadow: var(--sh);
}

.today-card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
}

.today-card-title {
  font-size: 12px;
  font-weight: 600;
  color: var(--fg1);
}

.today-card-link {
  font-size: 10px;
  color: var(--acc-text);
  cursor: pointer;
}

.today-card-link:hover {
  text-decoration: underline;
}

.today-empty {
  font-size: 12px;
  color: var(--fg3);
  padding: 10px 0;
  text-align: center;
}

/* Progress */
.progress-card {
  display: flex;
  align-items: center;
  gap: 18px;
}

.progress-ring-wrap {
  position: relative;
  width: 80px;
  height: 80px;
  flex-shrink: 0;
}

.progress-ring {
  width: 80px;
  height: 80px;
}

.progress-center {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.progress-pct {
  font-size: 18px;
  font-weight: 700;
  color: var(--fg0);
}

.progress-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.progress-emoji {
  font-size: 20px;
}

.progress-text {
  font-size: 14px;
  font-weight: 600;
}

.progress-detail {
  font-size: 11px;
  color: var(--fg2);
}

.progress-diff {
  font-size: 11px;
  font-weight: 600;
  margin-top: 2px;
}

.progress-diff-label {
  color: var(--fg3);
  font-weight: 400;
  margin-left: 4px;
}

/* Tasks */
.today-task-list {
  display: flex;
  flex-direction: column;
  gap: 0;
}

.today-task-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 0;
  border-bottom: 1px solid var(--border);
}

.today-task-item:last-child {
  border-bottom: none;
}

.today-task-pri {
  width: 3px;
  height: 16px;
  border-radius: 2px;
  flex-shrink: 0;
}

.today-task-text {
  flex: 1;
  font-size: 12px;
  color: var(--fg1);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.today-task-tag {
  font-size: 10px;
  color: var(--fg3);
  flex-shrink: 0;
}

/* Projects */
.today-project-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.today-project-item {
  display: flex;
  flex-direction: column;
  gap: 1px;
  padding: 6px 8px;
  background: var(--bg2);
  border-radius: var(--r6);
}

.today-project-name {
  font-size: 12px;
  font-weight: 600;
  color: var(--fg0);
}

.today-project-ms {
  font-size: 10px;
  color: var(--acc-text);
}

/* Health */
.health-quick {
  display: flex;
  align-items: center;
  gap: 14px;
}

.health-score {
  font-size: 36px;
  font-weight: 700;
  line-height: 1;
}

.health-metrics {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.health-metric {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: var(--fg1);
}

/* Journal */
.today-journal-preview {
  display: flex;
  align-items: flex-start;
  gap: 10px;
}

.today-journal-mood {
  font-size: 24px;
  flex-shrink: 0;
}

.today-journal-text {
  font-size: 12px;
  color: var(--fg2);
  line-height: 1.5;
}

/* Quick actions */
.quick-actions {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 6px;
  padding: 10px 12px;
}

.quick-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 10px;
  background: var(--bg2);
  border: 1px solid var(--border);
  border-radius: var(--r8);
  cursor: pointer;
  font-size: 11px;
  color: var(--fg1);
  font-family: inherit;
  transition: all .12s;
}

.quick-btn:hover {
  background: var(--acc-dim);
  border-color: var(--acc);
  color: var(--acc-text);
}

.quick-icon {
  font-size: 14px;
}
</style>
