<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useTimelineStore } from '../stores/timeline'
import { useIdleStore } from '../stores/idle'

const store = useTimelineStore()
const idleStore = useIdleStore()

const activeTab = ref('timeline') // 'timeline' | 'routines' | 'stats'
const clock = ref('')
let clockTimer = null

// 时钟
function updateClock() {
  const now = new Date()
  clock.value = String(now.getHours()).padStart(2, '0') + ':' + String(now.getMinutes()).padStart(2, '0')
}

onMounted(() => {
  updateClock()
  clockTimer = setInterval(updateClock, 10000)
  if (!store.loaded) store.load()
})

onUnmounted(() => {
  if (clockTimer) clearInterval(clockTimer)
})

// 时间线网格参数
const TL_START = 6
const TL_END = 24
const TL_HOUR_PX = 48
const TL_TOP_PAD = 8

function gridHeight() {
  return (TL_END - TL_START) * TL_HOUR_PX + 20 + TL_TOP_PAD
}

function hourY(h) {
  return Math.round((h - TL_START) * TL_HOUR_PX) + TL_TOP_PAD
}

function timeToY(timeStr) {
  if (!timeStr) return 0
  const [h, m] = timeStr.split(':').map(Number)
  return hourY(h) + Math.round(m / 60 * TL_HOUR_PX)
}

function blockHeight(start, end) {
  if (!start || !end) return 20
  const [sh, sm] = start.split(':').map(Number)
  const [eh, em] = end.split(':').map(Number)
  const mins = (eh * 60 + em) - (sh * 60 + sm)
  return Math.max(Math.round(mins / 60 * TL_HOUR_PX), 20)
}

// 当前时间线位置
function nowLineY() {
  const now = new Date()
  const h = now.getHours()
  const m = now.getMinutes()
  if (h < TL_START || h >= TL_END) return null
  return hourY(h) + Math.round(m / 60 * TL_HOUR_PX)
}

// 偶数小时背景条
function isEvenHour(h) {
  return h < TL_END && h % 2 === 0
}
</script>

<template>
  <div class="tl-rail">
    <!-- Header -->
    <div class="tl-header">
      <div class="tl-header-top">
        <div class="tl-title">Timeline</div>
      </div>
      <div style="display:flex;align-items:center;justify-content:space-between">
        <div class="tl-clock">{{ clock }}</div>
        <div class="tl-tabs">
          <div
            class="tl-tab"
            :class="{ active: activeTab === 'timeline' }"
            @click="activeTab = 'timeline'"
          >Today</div>
          <div
            class="tl-tab"
            :class="{ active: activeTab === 'routines' }"
            @click="activeTab = 'routines'"
          >Routines</div>
          <div
            class="tl-tab"
            :class="{ active: activeTab === 'stats' }"
            @click="activeTab = 'stats'"
          >Stats</div>
        </div>
      </div>
    </div>

    <!-- Timeline grid -->
    <div v-show="activeTab === 'timeline'" class="tl-scroll">
      <div class="tl-grid" :style="{ position: 'relative', height: gridHeight() + 'px' }">
        <!-- 时间刻度 -->
        <template v-for="h in (TL_END - TL_START + 1)" :key="h">
          <div
            v-if="isEvenHour(TL_START + h - 1)"
            class="tl-hour-bg"
            :style="{
              position: 'absolute',
              top: hourY(TL_START + h - 1) + 'px',
              left: 0, right: 0,
              height: TL_HOUR_PX + 'px',
              background: 'var(--bg2)',
              opacity: 0.25,
              pointerEvents: 'none'
            }"
          />
          <div
            class="tl-hour-label"
            :style="{
              position: 'absolute',
              top: (hourY(TL_START + h - 1) - 6) + 'px',
              left: 0,
              width: '34px',
              textAlign: 'right',
              fontSize: '10px',
              color: 'var(--fg2)',
              fontVariantNumeric: 'tabular-nums',
              fontWeight: 500,
              lineHeight: 1,
              pointerEvents: 'none'
            }"
          >{{ String(TL_START + h - 1).padStart(2, '0') }}:00</div>
          <div
            class="tl-hour-line"
            :style="{
              position: 'absolute',
              top: hourY(TL_START + h - 1) + 'px',
              left: '36px', right: 0,
              borderTop: '1px solid var(--border)'
            }"
          />
        </template>

        <!-- 时间块 -->
        <div
          v-for="block in store.blocks"
          :key="block.id"
          class="tl-block"
          :style="{
            position: 'absolute',
            top: timeToY(block.start) + 'px',
            left: '40px', right: '8px',
            height: blockHeight(block.start, block.end) + 'px',
            background: block.color === 'tomato' ? 'var(--tomato-bg)' :
                        block.color === 'purple' ? 'var(--purple-bg)' :
                        block.color === 'ok' ? 'var(--ok-bg)' :
                        block.color === 'warn' ? 'var(--warn-bg)' :
                        'var(--acc-dim)',
            borderLeft: '2.5px solid ' + (
              block.color === 'tomato' ? 'var(--tomato)' :
              block.color === 'purple' ? 'var(--purple)' :
              block.color === 'ok' ? 'var(--ok)' :
              block.color === 'warn' ? 'var(--warn)' :
              'var(--acc)'
            ),
            borderRadius: 0,
            padding: '4px 7px',
            cursor: 'grab',
            overflow: 'hidden',
            zIndex: 2,
            userSelect: 'none'
          }"
        >
          <div style="font-size:11px;font-weight:600;color:var(--fg0);white-space:nowrap;overflow:hidden;text-overflow:ellipsis">
            {{ block.name }}
          </div>
          <div
            v-if="blockHeight(block.start, block.end) > 26"
            style="font-size:9.5px;color:var(--fg2);font-variant-numeric:tabular-nums"
          >
            {{ block.start }}–{{ block.end }}
            <span v-if="block.note"> · {{ block.note }}</span>
          </div>
        </div>

        <!-- 当前时间线 -->
        <div
          v-if="nowLineY() !== null"
          :style="{
            position: 'absolute',
            top: nowLineY() + 'px',
            left: '36px', right: 0,
            borderTop: '2px solid var(--danger)',
            zIndex: 3,
            pointerEvents: 'none'
          }"
        >
          <div
            :style="{
              position: 'absolute',
              top: '-4px', left: '-4px',
              width: '8px', height: '8px',
              borderRadius: '50%',
              background: 'var(--danger)'
            }"
          />
        </div>
      </div>
    </div>

    <!-- Routines -->
    <div v-show="activeTab === 'routines'" class="tl-routines">
      <div
        v-for="rt in store.routines"
        :key="rt.id"
        class="rt-card"
      >
        <div class="rt-card-header">
          <div class="rt-card-name">{{ rt.name }}</div>
          <div class="rt-card-del" @click="store.removeRoutine(rt.id)">✕</div>
        </div>
        <div class="rt-card-meta">
          <span class="rt-card-repeat">
            {{ rt.repeat.type === 'daily'
              ? '每天(' + rt.repeat.days.map(d => ['日','一','二','三','四','五','六'][d]).join('') + ')'
              : '每周 ' + rt.repeat.days.map(d => '周' + ['日','一','二','三','四','五','六'][d]).join('、')
            }}
          </span>
          <span class="rt-card-count">· {{ rt.steps.length }} 步</span>
        </div>
        <div
          v-for="step in rt.steps"
          :key="step.offset"
          class="rt-step"
        >
          <div
            class="rt-step-dot"
            :style="{
              background: step.color === 'tomato' ? 'var(--tomato)' :
                          step.color === 'ok' ? 'var(--ok)' :
                          step.color === 'warn' ? 'var(--warn)' :
                          step.color === 'purple' ? 'var(--purple)' :
                          'var(--acc)'
            }"
          />
          <span>{{ step.offset }} · {{ step.name }} ({{ step.duration }}min)</span>
        </div>
      </div>
      <div v-if="store.routines.length === 0" style="font-size:11px;color:var(--fg3);text-align:center;padding:20px 0">
        暂无日常流程
      </div>
    </div>

    <!-- Stats -->
    <div v-show="activeTab === 'stats'" class="tl-stats">
      <div class="stat-card">
        <div class="stat-label">今日总用时</div>
        <div class="stat-value">{{ Math.floor(store.todayFocusMin / 60) }}h {{ store.todayFocusMin % 60 }}m</div>
        <div class="stat-sub">{{ store.blocks.length }} 个时间块</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">番茄钟</div>
        <div class="stat-value">{{ idleStore.todayPomos }} 组</div>
        <div class="stat-sub">专注 {{ Math.floor(idleStore.todayWorkSec / 60) }} 分钟</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">赏金</div>
        <div class="stat-value">¥{{ idleStore.displayWealth }}</div>
        <div class="stat-sub">今日 +{{ idleStore.todayIncome }}</div>
      </div>
    </div>

    <!-- Footer: 记录按钮 -->
    <div class="tl-footer">
      <div class="tl-actions">
        <button class="tl-btn-start" @click="store.startRecording()">
          ● 开始记录
        </button>
        <button class="tl-btn-add" @click="store.addBlock({ name: '新活动', start: '10:00', end: '11:00', note: '', color: 'var(--acc)', projectId: '', clientId: '' })">
          + 添加
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.tl-rail {
  background: transparent;
  border-left: none;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.tl-header {
  padding: 12px 14px 8px;
  border-bottom: 1px solid var(--border);
  flex-shrink: 0;
}

.tl-header-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.tl-title {
  font-size: 13px;
  font-weight: 700;
  color: var(--fg0);
}

.tl-clock {
  font-size: 10px;
  color: var(--fg2);
  margin-top: 2px;
  font-variant-numeric: tabular-nums;
}

.tl-tabs {
  display: flex;
  gap: 3px;
}

.tl-tab {
  font-size: 11px;
  padding: 3px 7px;
  border-radius: var(--r4);
  cursor: pointer;
  color: var(--fg2);
  border: 1px solid transparent;
  transition: all .12s;
  user-select: none;
}

.tl-tab.active {
  background: var(--acc-dim);
  color: var(--acc);
  border-color: rgba(26,95,168,.2);
  font-weight: 600;
}

.tl-scroll {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
}

.tl-grid {
  position: relative;
}

.tl-routines {
  padding: 10px 12px;
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.rt-card {
  background: var(--bg2);
  border-radius: var(--r6);
  padding: 8px 10px;
  border: 1px solid var(--border);
}

.rt-card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 4px;
}

.rt-card-name {
  font-size: 12px;
  font-weight: 600;
  color: var(--fg0);
}

.rt-card-del {
  font-size: 11px;
  color: var(--fg3);
  cursor: pointer;
  padding: 1px 4px;
  border-radius: var(--r4);
}

.rt-card-del:hover {
  color: var(--danger);
}

.rt-card-meta {
  font-size: 10px;
  color: var(--fg2);
  margin-bottom: 5px;
  display: flex;
  align-items: center;
  gap: 4px;
}

.rt-card-repeat {
  font-size: 9px;
  padding: 1px 5px;
  border-radius: 3px;
  background: var(--acc-dim);
  color: var(--acc);
  font-weight: 500;
}

.rt-card-count {
  color: var(--fg3);
}

.rt-step {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 11px;
  color: var(--fg1);
  margin-bottom: 1px;
}

.rt-step-dot {
  width: 5px;
  height: 5px;
  flex-shrink: 0;
}

.tl-stats {
  padding: 12px;
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.stat-card {
  background: var(--bg2);
  border-radius: var(--r8);
  padding: 10px 12px;
}

.stat-label {
  font-size: 10px;
  color: var(--fg3);
  margin-bottom: 2px;
}

.stat-value {
  font-size: 15px;
  font-weight: 700;
  color: var(--fg0);
}

.stat-sub {
  font-size: 10px;
  color: var(--fg3);
  margin-top: 2px;
}

.tl-footer {
  border-top: 1px solid var(--border);
  padding: 8px 10px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.tl-actions {
  display: flex;
  gap: 5px;
}

.tl-btn-start {
  flex: 1;
  padding: 6px;
  background: var(--danger);
  border: none;
  border-radius: var(--r6);
  color: #fff;
  font-size: 11px;
  cursor: pointer;
  font-family: inherit;
  font-weight: 500;
  transition: opacity .15s;
}

.tl-btn-start:hover {
  opacity: .85;
}

.tl-btn-add {
  padding: 6px 10px;
  background: var(--bg2);
  border: 1px solid var(--border2);
  border-radius: var(--r6);
  color: var(--fg1);
  font-size: 11px;
  cursor: pointer;
  font-family: inherit;
}
</style>
