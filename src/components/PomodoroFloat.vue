<script setup>
import { ref, computed, onUnmounted } from 'vue'
import { useIdleStore } from '../stores/idle'
import { useTimelineStore } from '../stores/timeline'

const idleStore = useIdleStore()
const tlStore = useTimelineStore()

const expanded = ref(false)
const running = ref(false)
const paused = ref(false)
const isBreak = ref(false)
const timeLeft = ref(25 * 60) // seconds
const workMin = ref(25)
const breakMin = ref(5)
const sessions = ref(0)
const goalSessions = ref(4)
let timer = null

const displayTime = computed(() => {
  const m = Math.floor(timeLeft.value / 60)
  const s = timeLeft.value % 60
  return String(m).padStart(2, '0') + ':' + String(s).padStart(2, '0')
})

const progress = computed(() => {
  const total = (isBreak.value ? breakMin.value : workMin.value) * 60
  return 1 - (timeLeft.value / total)
})

const circumference = 2 * Math.PI * 34
const dashOffset = computed(() => circumference * (1 - progress.value))

function toggle() {
  expanded.value = !expanded.value
}

function playPause() {
  if (!running.value) {
    // Start
    running.value = true
    paused.value = false
    isBreak.value = false
    timeLeft.value = workMin.value * 60
    startTimer()
  } else if (paused.value) {
    paused.value = false
    startTimer()
  } else {
    paused.value = true
    clearInterval(timer)
  }
}

function startTimer() {
  clearInterval(timer)
  timer = setInterval(() => {
    if (timeLeft.value > 0) {
      timeLeft.value--
    } else {
      clearInterval(timer)
      if (isBreak.value) {
        // Break finished
        isBreak.value = false
        running.value = false
        paused.value = false
        timeLeft.value = workMin.value * 60
      } else {
        // Work session finished
        sessions.value++
        // 赏金奖励
        idleStore.onPomoComplete(workMin.value * 60)
        // 往时间线插一条记录
        const now = new Date()
        const startH = String(now.getHours()).padStart(2, '0')
        const startM = String(now.getMinutes()).padStart(2, '0')
        const endH = String(Math.floor((now.getHours() * 60 + now.getMinutes() + workMin.value) / 60)).padStart(2, '0')
        const endM = String((now.getHours() * 60 + now.getMinutes() + workMin.value) % 60).padStart(2, '0')
        // 计算开始时间（workMin 分钟前）
        const startTime = new Date(now.getTime() - workMin.value * 60000)
        const sH = String(startTime.getHours()).padStart(2, '0')
        const sM = String(startTime.getMinutes()).padStart(2, '0')
        tlStore.addBlock({
          name: '番茄 ×' + sessions.value,
          start: sH + ':' + sM,
          end: startH + ':' + startM,
          note: '专注',
          color: 'var(--tomato)',
          projectId: '',
          clientId: '',
        })
        if (sessions.value >= goalSessions.value) {
          // All sessions done
          running.value = false
          paused.value = false
          timeLeft.value = workMin.value * 60
        } else {
          // Start break
          isBreak.value = true
          timeLeft.value = breakMin.value * 60
          startTimer()
        }
      }
    }
  }, 1000)
}

function reset() {
  clearInterval(timer)
  running.value = false
  paused.value = false
  isBreak.value = false
  timeLeft.value = workMin.value * 60
}

function skip() {
  clearInterval(timer)
  if (isBreak.value) {
    isBreak.value = false
    timeLeft.value = workMin.value * 60
  } else {
    sessions.value++
    isBreak.value = true
    timeLeft.value = breakMin.value * 60
    startTimer()
  }
  running.value = true
  paused.value = false
}

onUnmounted(() => {
  if (timer) clearInterval(timer)
})
</script>

<template>
  <div class="pomo-float">
    <!-- Collapsed view -->
    <div v-if="!expanded" class="pomo-collapsed" @click="toggle">
      <svg class="pomo-collapsed-icon" viewBox="0 0 14 14" fill="none" width="16" height="16">
        <circle cx="7" cy="7" r="5.5" stroke="currentColor" stroke-width="1.2"/>
        <path d="M7 4.5v3l2 1.5" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
      <span class="pomo-mini-time">{{ displayTime }}</span>
    </div>

    <!-- Expanded view -->
    <div v-else class="pomo-expanded">
      <div class="pomo-ring-wrap">
        <svg class="pomo-ring" viewBox="0 0 80 80">
          <circle cx="40" cy="40" r="34" fill="none" stroke="var(--bg3)" stroke-width="5"/>
          <circle
            cx="40" cy="40" r="34" fill="none"
            :stroke="isBreak ? 'var(--ok)' : 'var(--tomato)'"
            stroke-width="5" stroke-linecap="round"
            :stroke-dasharray="circumference"
            :stroke-dashoffset="dashOffset"
            style="transform:rotate(-90deg);transform-origin:center;transition:stroke-dashoffset .3s"
          />
        </svg>
        <div class="pomo-ring-center">
          <div class="pomo-time">{{ displayTime }}</div>
          <div class="pomo-label">{{ isBreak ? '休息' : '专注' }}</div>
        </div>
      </div>

      <div class="pomo-controls">
        <button class="pomo-btn" @click="skip" title="跳过">⏭</button>
        <button
          class="pomo-btn pomo-btn-main"
          :class="{ paused: paused }"
          @click="playPause"
        >
          <svg v-if="!running || paused" width="14" height="14" viewBox="0 0 14 14" fill="white">
            <polygon points="3,1 13,7 3,13"/>
          </svg>
          <svg v-else width="14" height="14" viewBox="0 0 14 14" fill="white">
            <rect x="2" y="1" width="3.5" height="12" rx="1"/>
            <rect x="8.5" y="1" width="3.5" height="12" rx="1"/>
          </svg>
        </button>
        <button class="pomo-btn" @click="reset" title="重置">↺</button>
      </div>

      <div class="pomo-settings-row">
        <div class="pomo-settings-left">
          <label>工作 <input type="number" v-model.number="workMin" min="1" max="90" @change="reset"> min</label>
          <label>休息 <input type="number" v-model.number="breakMin" min="1" max="30" @change="reset"> min</label>
        </div>
        <div class="pomo-settings-right">
          <label>组数 <input type="number" v-model.number="goalSessions" min="1" max="12"></label>
        </div>
      </div>

      <div class="pomo-footer">
        <span class="pomo-stats">{{ sessions }}/{{ goalSessions }} 组</span>
        <button class="pomo-link" @click="toggle">收起</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.pomo-float {
  border-top: 1px solid var(--border);
  padding: 8px 12px;
}

.pomo-collapsed {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  padding: 6px 8px;
  border-radius: var(--r8);
  transition: background .12s;
}

.pomo-collapsed:hover {
  background: var(--bg2);
}

.pomo-collapsed-icon {
  flex-shrink: 0;
  color: var(--fg2);
}

.pomo-mini-time {
  font-size: 13px;
  font-weight: 600;
  color: var(--fg1);
  font-variant-numeric: tabular-nums;
}

.pomo-expanded {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 8px 0;
}

.pomo-ring-wrap {
  position: relative;
  width: 80px;
  height: 80px;
}

.pomo-ring {
  width: 80px;
  height: 80px;
}

.pomo-ring-center {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.pomo-time {
  font-size: 18px;
  font-weight: 700;
  color: var(--fg0);
  font-variant-numeric: tabular-nums;
  line-height: 1;
}

.pomo-label {
  font-size: 10px;
  color: var(--fg3);
  margin-top: 2px;
}

.pomo-controls {
  display: flex;
  gap: 10px;
  align-items: center;
}

.pomo-btn {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  border: 1px solid var(--border2);
  background: var(--bg1);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  color: var(--fg2);
  transition: all .12s;
}

.pomo-btn:hover {
  background: var(--bg2);
  color: var(--fg0);
}

.pomo-btn-main {
  background: var(--tomato);
  border-color: var(--tomato);
  color: #fff;
}

.pomo-btn-main:hover {
  opacity: .85;
  background: var(--tomato);
}

.pomo-btn-main.paused {
  background: var(--fg3);
  border-color: var(--fg3);
}

.pomo-stats {
  font-size: 12px;
  color: var(--fg2);
  font-weight: 500;
}

.pomo-settings-row {
  display: flex;
  gap: 8px;
  font-size: 10px;
  color: var(--fg2);
  width: 100%;
  max-width: 176px;
  margin: 6px auto 0;
  align-items: center;
}

.pomo-settings-left {
  display: flex;
  flex-direction: column;
  gap: 6px;
  align-items: center;
  flex: 1;
}

.pomo-settings-right {
  display: flex;
  align-items: center;
  justify-content: center;
  flex: 1;
}

.pomo-settings-row input {
  width: 34px;
  padding: 1px 3px;
  border: 1px solid var(--border);
  border-radius: 3px;
  background: var(--bg2);
  color: var(--fg1);
  font-size: 10px;
  text-align: center;
  font-family: inherit;
}

.pomo-footer {
  display: flex;
  gap: 12px;
  align-items: center;
  justify-content: center;
  width: 100%;
}

.pomo-link {
  background: none;
  border: none;
  font-size: 10px;
  color: var(--fg3);
  cursor: pointer;
  padding: 2px 4px;
  font-family: inherit;
}

.pomo-link:hover {
  color: var(--fg1);
}
</style>
