<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useTimelineStore } from '../stores/timeline'
import { useProjectStore } from '../stores/project'

const store = useTimelineStore()
const projStore = useProjectStore()

const showAddForm = ref(false)
const showStopForm = ref(false)
const addName = ref('')
const addStart = ref('09:00')
const addEnd = ref('10:00')
const addNote = ref('')
const addProjectId = ref('')
const addClientId = ref('')

const stopName = ref('')
const stopNote = ref('')
const stopProjectId = ref('')
const stopClientId = ref('')

const editingBlock = ref(null)
const popName = ref('')
const popNote = ref('')
const popProjectId = ref('')
const popClientId = ref('')

const recTimer = ref(null)

onMounted(async () => {
  if (!store.loaded) await store.load()
  if (!projStore.loaded) await projStore.load()
})

function scrollToNow() {
  const el = document.getElementById('tl-scroll')
  if (!el || store.nowY === null) return
  el.scrollTop = Math.max(store.constants.TL_HOUR_PX * 0.3, store.nowY - 100)
}

function toggleAddForm() {
  showAddForm.value = !showAddForm.value
  if (showAddForm.value) {
    const n = new Date()
    addStart.value = `${String(n.getHours()).padStart(2, '0')}:${String(n.getMinutes()).padStart(2, '0')}`
    addEnd.value = `${String((n.getHours() + 1) % 24).padStart(2, '0')}:${String(n.getMinutes()).padStart(2, '0')}`
  }
}

function confirmAdd() {
  if (!addName.value.trim()) return
  store.addBlock({
    name: addName.value.trim(),
    start: addStart.value,
    end: addEnd.value,
    note: addNote.value.trim(),
    color: 'var(--acc)',
    projectId: addProjectId.value,
    clientId: addClientId.value.trim(),
  })
  addName.value = ''; addNote.value = ''
  showAddForm.value = false
}

function startRecord() {
  store.startRecording()
  recTimer.value = setInterval(() => {
    if (!store.recStart) return
    const e = Math.floor((new Date() - store.recStart) / 1000)
    store.recElapsed = `${String(Math.floor(e / 60)).padStart(2, '0')}:${String(e % 60).padStart(2, '0')}`
  }, 1000)
}

function stopRecord() {
  clearInterval(recTimer.value)
  showStopForm.value = true
}

function confirmStop() {
  store.stopRecording(stopName.value, stopNote.value, stopProjectId.value, stopClientId.value)
  showStopForm.value = false
  stopName.value = ''; stopNote.value = ''
}

function cancelStop() {
  store.cancelRecording()
  showStopForm.value = false
  clearInterval(recTimer.value)
}

function openBlockPopup(block) {
  if (block.source) return
  editingBlock.value = block
  popName.value = block.name
  popNote.value = block.note || ''
  popProjectId.value = block.projectId || ''
  popClientId.value = block.clientId || ''
}

function saveBlockPopup() {
  if (!editingBlock.value) return
  store.updateBlock(editingBlock.value.id, {
    name: popName.value.trim() || editingBlock.value.name,
    note: popNote.value.trim(),
    projectId: popProjectId.value,
    clientId: popClientId.value.trim(),
  })
  editingBlock.value = null
}

function deleteBlock() {
  if (!editingBlock.value) return
  store.removeBlock(editingBlock.value.id)
  editingBlock.value = null
}

function closePopup() { editingBlock.value = null }

const views = ['timeline', 'routines', 'stats']
const viewLabels = { timeline: '今天', routines: '日常流程', stats: '统计' }

const stats = computed(() => store.getStats())
</script>

<template>
  <div class="tl-view">
    <!-- Header -->
    <div class="tl-header">
      <div class="tl-header-top">
        <div>
          <div class="tl-title">时间线</div>
          <div class="tl-clock">{{ new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }) }}</div>
        </div>
        <div class="tl-tabs">
          <div
            v-for="v in views"
            :key="v"
            class="tl-tab"
            :class="{ active: store.activeView === v }"
            @click="store.setView(v)"
          >{{ viewLabels[v] }}</div>
        </div>
      </div>
    </div>

    <!-- Timeline View -->
    <div v-show="store.activeView === 'timeline'" class="tl-scroll" id="tl-scroll">
      <div class="tl-grid" :style="{ height: store.gridHeight + 'px' }">
        <!-- Hour lines -->
        <div
          v-for="(line, i) in store.hourLines"
          :key="i"
          class="tl-hour-line"
          :class="{ even: line.isEven }"
          :style="{ top: line.y + 'px' }"
        >
          <span class="tl-hour-label">{{ line.label }}</span>
          <span class="tl-hour-rule" />
        </div>

        <!-- Time blocks -->
        <div
          v-for="block in store.gridBlocks"
          :key="block.id"
          class="tl-block"
          :class="{ routine: block.source }"
          :style="{
            top: block.y + 'px',
            height: block.h + 'px',
            background: block.cm.bg,
            borderLeftColor: block.cm.border,
          }"
          @click="openBlockPopup(block)"
        >
          <div class="tl-block-name">{{ block.name }}</div>
          <div v-if="block.h > 26" class="tl-block-time">
            {{ block.start }}–{{ block.end }}{{ block.note ? ' · ' + block.note : '' }}
          </div>
          <div v-if="block.source" class="tl-block-routine-icon">
            <svg width="10" height="10" viewBox="0 0 12 12" fill="none"><path d="M10 3.5A4.5 4.5 0 002 5.5" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/><path d="M2 8.5a4.5 4.5 0 008-2" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/></svg>
          </div>
        </div>

        <!-- Now line -->
        <div
          v-if="store.nowY !== null"
          class="tl-now-line"
          :style="{ top: store.nowY + 'px' }"
        >
          <span class="tl-now-dot" />
        </div>

        <!-- Live recording block -->
        <div
          v-if="store.recording && store.recStart"
          class="tl-live-block"
          :style="{
            top: (store.constants.TL_TOP_PAD + Math.round(((store.recStart.getHours() - store.constants.TL_START) + store.recStart.getMinutes() / 60) * store.constants.TL_HOUR_PX)) + 'px',
          }"
        >
          <div class="tl-live-indicator">
            <span class="tl-live-dot" />
            录制中
          </div>
          <div class="tl-live-time">
            {{ String(store.recStart.getHours()).padStart(2, '0') }}:{{ String(store.recStart.getMinutes()).padStart(2, '0') }}–{{ new Date().getHours().toString().padStart(2, '0') }}:{{ new Date().getMinutes().toString().padStart(2, '0') }}（{{ store.recElapsed }}）
          </div>
        </div>
      </div>
    </div>

    <!-- Routines View -->
    <div v-show="store.activeView === 'routines'" class="tl-rt-view">
      <div
        v-for="rt in store.routines"
        :key="rt.id"
        class="tl-rt-card"
      >
        <div class="tl-rt-header">
          <div class="tl-rt-name">{{ rt.name }}</div>
          <span class="tl-rt-del" @click="store.removeRoutine(rt.id)">✕</span>
        </div>
        <div class="tl-rt-repeat">
          {{ rt.repeat.type === 'daily' ? '每天(' + rt.repeat.days.map(d => store.constants.TL_DAYS[d]).join('') + ')' : '每周 ' + rt.repeat.days.map(d => '周' + store.constants.TL_DAYS[d]).join('、') }}
          · {{ rt.steps.length }} 步
        </div>
        <div
          v-for="s in rt.steps"
          :key="s.name"
          class="tl-rt-step"
        >
          <div class="tl-rt-step-dot" :style="{ background: (store.constants.TL_COLORS[s.color] || store.constants.TL_COLORS['var(--acc)']).border }" />
          <span>{{ s.offset }} · {{ s.name }} ({{ s.duration }}min)</span>
        </div>
      </div>
    </div>

    <!-- Stats View -->
    <div v-show="store.activeView === 'stats'" class="tl-stats-view">
      <div class="tl-stat-card">
        <div class="tl-stat-label">今日总用时</div>
        <div class="tl-stat-val">{{ Math.floor(stats.totalMins / 60) }}h {{ stats.totalMins % 60 }}min</div>
        <div class="tl-stat-sub">{{ stats.blockCount }} 个时间块</div>
      </div>
      <div v-if="Object.keys(stats.byProject).length" class="tl-stat-card">
        <div class="tl-stat-label">按项目</div>
        <div v-for="(v, k) in stats.byProject" :key="k" class="tl-stat-row">
          <span>{{ k }}</span>
          <span>{{ Math.floor(v.mins / 60) }}h{{ v.mins % 60 }}m · {{ v.blocks }}块</span>
        </div>
      </div>
    </div>

    <!-- Footer: Controls -->
    <div class="tl-footer">
      <!-- Add block form -->
      <div v-if="showAddForm" class="tl-add-form">
        <input v-model="addName" class="tl-input" placeholder="活动名称" />
        <div style="display:flex;gap:6px">
          <input v-model="addStart" type="time" class="tl-input" style="flex:1" />
          <span style="color:var(--fg3)">–</span>
          <input v-model="addEnd" type="time" class="tl-input" style="flex:1" />
        </div>
        <input v-model="addNote" class="tl-input" placeholder="备注" />
        <select v-model="addProjectId" class="tl-input">
          <option value="">关联项目</option>
          <option v-for="p in projStore.projects" :key="p.id" :value="p.id">{{ p.name }}</option>
        </select>
        <div style="display:flex;gap:4px">
          <button class="tl-btn ok" @click="confirmAdd()">添加</button>
          <button class="tl-btn" @click="showAddForm = false">取消</button>
        </div>
      </div>

      <!-- Stop record form -->
      <div v-if="showStopForm" class="tl-add-form">
        <input v-model="stopName" class="tl-input" placeholder="活动名称" />
        <input v-model="stopNote" class="tl-input" placeholder="备注" />
        <select v-model="stopProjectId" class="tl-input">
          <option value="">关联项目</option>
          <option v-for="p in projStore.projects" :key="p.id" :value="p.id">{{ p.name }}</option>
        </select>
        <div style="display:flex;gap:4px">
          <button class="tl-btn ok" @click="confirmStop()">保存</button>
          <button class="tl-btn" @click="cancelStop()">取消</button>
        </div>
      </div>

      <!-- Buttons -->
      <div class="tl-footer-btns">
        <button class="tl-btn" @click="toggleAddForm()">+ 添加</button>
        <button
          v-if="!store.recording"
          class="tl-btn rec"
          @click="startRecord()"
        >⏺ 录制</button>
        <button
          v-else
          class="tl-btn stop"
          @click="stopRecord()"
        >⏹ 停止 ({{ store.recElapsed }})</button>
        <button class="tl-btn" @click="scrollToNow()">定位现在</button>
      </div>
    </div>

    <!-- Block Edit Popup -->
    <div
      v-if="editingBlock"
      class="tl-popup-overlay"
      @click.self="closePopup()"
    >
      <div class="tl-popup">
        <input v-model="popName" class="tl-input" placeholder="名称" />
        <input v-model="popNote" class="tl-input" placeholder="备注" />
        <select v-model="popProjectId" class="tl-input">
          <option value="">无</option>
          <option v-for="p in projStore.projects" :key="p.id" :value="p.id">{{ p.name }}</option>
        </select>
        <input v-model="popClientId" class="tl-input" placeholder="客户" />
        <div style="display:flex;gap:4px">
          <button class="tl-btn ok" @click="saveBlockPopup()">保存</button>
          <button class="tl-btn danger" @click="deleteBlock()">删除</button>
          <button class="tl-btn" @click="closePopup()">取消</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.tl-view {
  display: flex;
  flex-direction: column;
  height: 100%;
}

/* Header */
.tl-header {
  padding: 12px 14px 8px;
  border-bottom: 1px solid var(--border);
  flex-shrink: 0;
}
.tl-header-top { display: flex; align-items: center; justify-content: space-between; }
.tl-title { font-size: 13px; font-weight: 700; color: var(--fg0); }
.tl-clock { font-size: 10px; color: var(--fg2); margin-top: 2px; font-variant-numeric: tabular-nums; }
.tl-tabs { display: flex; gap: 3px; }
.tl-tab {
  font-size: 11px; padding: 3px 7px; border-radius: var(--r4);
  cursor: pointer; color: var(--fg2); border: 1px solid transparent;
  transition: all .12s; user-select: none;
}
.tl-tab.active { background: var(--acc-dim); color: var(--acc); border-color: rgba(26,95,168,.2); font-weight: 600; }

/* Scroll */
.tl-scroll { flex: 1; overflow-y: auto; overflow-x: hidden; }

/* Grid */
.tl-grid { position: relative; }

/* Hour lines */
.tl-hour-line {
  position: absolute; left: 0; right: 0;
  display: flex; align-items: center;
  pointer-events: none;
}
.tl-hour-label {
  width: 34px; text-align: right;
  font-size: 10px; color: var(--fg2);
  font-variant-numeric: tabular-nums; font-weight: 500;
  line-height: 1; flex-shrink: 0;
}
.tl-hour-rule {
  flex: 1; border-top: 1px solid var(--border);
  margin-left: 2px;
}
.tl-hour-line.even .tl-hour-rule {
  border-top-color: var(--border2);
  background: rgba(0,0,0,.02);
  height: 52px;
  position: relative;
}

/* Time blocks */
.tl-block {
  position: absolute; left: 40px; right: 8px;
  border-left: 2.5px solid;
  border-radius: 0; padding: 4px 7px;
  cursor: pointer; overflow: hidden; z-index: 2;
  user-select: none; transition: box-shadow .15s;
}
.tl-block:hover { box-shadow: var(--sh); }
.tl-block-name { font-size: 11px; font-weight: 600; color: var(--fg0); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.tl-block-time { font-size: 9.5px; color: var(--fg2); font-variant-numeric: tabular-nums; }
.tl-block-routine-icon { position: absolute; top: 4px; right: 5px; opacity: .3; }
.tl-block.routine { cursor: default; opacity: .8; }

/* Now line */
.tl-now-line {
  position: absolute; left: 0; right: 0;
  height: 1px; background: var(--danger);
  z-index: 10; pointer-events: none;
}
.tl-now-dot {
  position: absolute; left: 35px; top: -2.5px;
  width: 6px; height: 6px; border-radius: 50%;
  background: var(--danger);
}

/* Live recording */
.tl-live-block {
  position: absolute; left: 40px; right: 8px;
  background: rgba(192,57,43,.1);
  border-left: 2.5px solid var(--danger);
  padding: 4px 7px; z-index: 3;
  pointer-events: none;
  animation: tl-live-pulse 2s ease-in-out infinite;
}
@keyframes tl-live-pulse { 0%,100% { opacity: .85 } 50% { opacity: .55 } }
.tl-live-indicator {
  font-size: 11px; font-weight: 600; color: var(--danger);
  display: flex; align-items: center; gap: 5px;
}
.tl-live-dot {
  width: 6px; height: 6px; border-radius: 50%;
  background: var(--danger); flex-shrink: 0;
  animation: tl-live-pulse 1.2s ease-in-out infinite;
}
.tl-live-time { font-size: 9.5px; color: var(--fg2); font-variant-numeric: tabular-nums; }

/* Routines */
.tl-rt-view {
  flex: 1; overflow-y: auto;
  display: flex; flex-direction: column; gap: 6px;
  padding: 10px;
}
.tl-rt-card {
  background: var(--bg2); border-radius: var(--r6);
  padding: 8px 10px; border: 1px solid var(--border);
}
.tl-rt-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 4px; }
.tl-rt-name { font-size: 12px; font-weight: 600; color: var(--fg0); }
.tl-rt-del { font-size: 11px; color: var(--fg3); cursor: pointer; padding: 1px 4px; border-radius: var(--r4); }
.tl-rt-del:hover { color: var(--danger); }
.tl-rt-repeat { font-size: 10px; color: var(--fg2); margin-bottom: 5px; }
.tl-rt-step {
  display: flex; align-items: center; gap: 5px;
  font-size: 11px; color: var(--fg1); margin-bottom: 1px;
}
.tl-rt-step-dot { width: 5px; height: 5px; flex-shrink: 0; }

/* Stats */
.tl-stats-view {
  flex: 1; overflow-y: auto;
  display: flex; flex-direction: column; gap: 8px;
  padding: 10px;
}
.tl-stat-card {
  background: var(--bg2); border: 1px solid var(--border);
  border-radius: var(--r8); padding: 10px 12px;
}
.tl-stat-label { font-size: 10px; color: var(--fg2); text-transform: uppercase; letter-spacing: .5px; margin-bottom: 4px; }
.tl-stat-val { font-size: 20px; font-weight: 700; color: var(--fg0); }
.tl-stat-sub { font-size: 11px; color: var(--fg3); margin-top: 2px; }
.tl-stat-row { display: flex; justify-content: space-between; font-size: 12px; color: var(--fg1); padding: 4px 0; border-bottom: 1px solid var(--border); }

/* Footer */
.tl-footer {
  border-top: 1px solid var(--border);
  padding: 8px 10px; flex-shrink: 0;
  display: flex; flex-direction: column; gap: 6px;
}
.tl-footer-btns { display: flex; gap: 4px; }

/* Forms */
.tl-add-form {
  display: flex; flex-direction: column; gap: 5px;
  background: var(--bg2); border-radius: var(--r6);
  padding: 8px 10px; border: 1px solid var(--border);
}
.tl-input {
  width: 100%; background: var(--bg1);
  border: 1px solid var(--border2); color: var(--fg0);
  padding: 5px 7px; border-radius: var(--r4);
  font-size: 12px; outline: none; font-family: inherit;
  box-sizing: border-box;
}
.tl-input:focus { border-color: var(--acc); }

.tl-btn {
  padding: 4px 10px; background: var(--bg1);
  border: 1px solid var(--border); color: var(--fg2);
  border-radius: var(--r4); cursor: pointer;
  font-size: 11px; font-family: inherit; transition: all .12s;
}
.tl-btn:hover { background: var(--bg2); color: var(--fg0); }
.tl-btn.ok { color: var(--ok); border-color: var(--ok); }
.tl-btn.danger { color: var(--danger); border-color: var(--danger); }
.tl-btn.rec { color: var(--danger); border-color: var(--danger); }
.tl-btn.stop { color: var(--fg2); }

/* Popup */
.tl-popup-overlay {
  position: fixed; inset: 0; z-index: 100;
  background: rgba(0,0,0,.3);
  display: flex; align-items: center; justify-content: center;
}
.tl-popup {
  background: var(--bg1); border: 1px solid var(--border2);
  border-radius: var(--r10); box-shadow: var(--sh2);
  padding: 12px; width: 240px;
  display: flex; flex-direction: column; gap: 6px;
}
</style>
