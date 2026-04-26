import { defineStore } from 'pinia'
import { db } from '../composables/db'

const TL_START = 8
const TL_END = 24
const TL_HOUR_PX = 52
const TL_SNAP = 15
const TL_TOP_PAD = 10
const TL_DAYS = ['日', '一', '二', '三', '四', '五', '六']
const TL_COLOR_OPTS = ['var(--acc)', 'var(--ok)', 'var(--warn)', 'var(--danger)', 'var(--purple)', 'var(--tomato)', 'var(--acc-soft)']

const TL_COLORS = {
  'var(--acc)': { bg: 'rgba(26,95,168,.1)', border: 'var(--acc)' },
  'var(--ok)': { bg: 'rgba(26,127,90,.1)', border: 'var(--ok)' },
  'var(--warn)': { bg: 'rgba(138,94,0,.1)', border: 'var(--warn)' },
  'var(--danger)': { bg: 'rgba(192,57,43,.1)', border: 'var(--danger)' },
  'var(--purple)': { bg: 'rgba(94,77,184,.1)', border: 'var(--purple)' },
  'var(--tomato)': { bg: 'rgba(231,76,60,.12)', border: 'var(--tomato)' },
  'var(--acc-soft)': { bg: 'rgba(91,163,224,.15)', border: 'var(--acc-soft)' },
}

const DEFAULT_BLOCKS = [
  { id: 'b1', name: '设计评审', start: '14:00', end: '15:00', note: 'UI v5 反馈', color: 'var(--acc)', projectId: 'pos', clientId: '' },
  { id: 'b2', name: '专注 ×3', start: '09:00', end: '10:30', note: 'Personal OS', color: 'var(--tomato)', projectId: 'pos', clientId: '' },
  { id: 'b3', name: '运动', start: '18:30', end: '19:00', note: '', color: 'var(--ok)', projectId: '', clientId: '' },
]

const DEFAULT_ROUTINES = [
  {
    id: 'r-morning', name: '早间流程', repeat: { type: 'daily', days: [1, 2, 3, 4, 5] },
    steps: [
      { name: '起床洗漱', offset: '07:00', duration: 30, color: 'var(--warn)' },
      { name: '早餐', offset: '07:30', duration: 20, color: 'var(--ok)' },
      { name: '通勤/准备', offset: '07:50', duration: 40, color: 'var(--fg3)' },
    ]
  },
  {
    id: 'r-pomo', name: '上午番茄', repeat: { type: 'daily', days: [1, 2, 3, 4, 5] },
    steps: [{ name: '专注 ×3', offset: '09:00', duration: 90, color: 'var(--tomato)' }]
  },
  {
    id: 'r-exercise', name: '力量训练日', repeat: { type: 'weekly', days: [1, 4] },
    steps: [
      { name: '力量训练', offset: '18:00', duration: 30, color: 'var(--ok)' },
      { name: '拉伸放松', offset: '18:30', duration: 10, color: 'var(--acc-soft)' },
    ]
  },
  {
    id: 'r-evening', name: '晚间流程', repeat: { type: 'daily', days: [0, 1, 2, 3, 4, 5, 6] },
    steps: [
      { name: '洗漱护肤', offset: '22:00', duration: 20, color: 'var(--purple)' },
      { name: '阅读/放松', offset: '22:20', duration: 40, color: 'var(--acc-soft)' },
    ]
  },
]

function timeToY(t) {
  const [h, m] = t.split(':').map(Number)
  return Math.round(((h - TL_START) + m / 60) * TL_HOUR_PX)
}

function minsBetween(a, b) {
  const [ah, am] = a.split(':').map(Number)
  const [bh, bm] = b.split(':').map(Number)
  return (bh - ah) * 60 + (bm - am)
}

export const useTimelineStore = defineStore('timeline', {
  state: () => ({
    blocks: [],
    routines: [],
    recording: false,
    recStart: null,
    recElapsed: '00:00',
    activeView: 'timeline', // timeline | routines | stats
    editingBlock: null,
    loaded: false,
  }),

  getters: {
    constants: () => ({ TL_START, TL_END, TL_HOUR_PX, TL_TOP_PAD, TL_SNAP, TL_DAYS, TL_COLORS, TL_COLOR_OPTS }),
    todayDay: () => new Date().getDay(),

    expandedBlocks(state) {
      const todayDay = new Date().getDay()
      const routineBlocks = []
      state.routines.forEach(rt => {
        if (!rt.repeat.days.includes(todayDay)) return
        rt.steps.forEach(s => {
          const [h, m] = s.offset.split(':').map(Number)
          const end = h * 60 + m + s.duration
          routineBlocks.push({
            id: `rt-${rt.id}-${s.offset}`,
            name: s.name,
            start: s.offset,
            end: `${String(Math.floor(end / 60)).padStart(2, '0')}:${String(end % 60).padStart(2, '0')}`,
            note: rt.name,
            color: s.color,
            source: 'routine',
          })
        })
      })
      const rt = routineBlocks.filter(t => !state.blocks.some(m => m.start === t.start && m.name === t.name))
      return [...rt, ...state.blocks].sort((a, b) => a.start.localeCompare(b.start))
    },

    gridBlocks() {
      return this.expandedBlocks.map(b => {
        const y = timeToY(b.start) + TL_TOP_PAD
        const mins = minsBetween(b.start, b.end)
        const h = Math.max(Math.round(mins / 60 * TL_HOUR_PX), 20)
        const cm = TL_COLORS[b.color] || TL_COLORS['var(--acc)']
        return { ...b, y, h, cm }
      }).filter(b => b.y >= TL_TOP_PAD)
    },

    hourLines() {
      const lines = []
      for (let h = TL_START; h <= TL_END; h++) {
        const y = Math.round((h - TL_START) * TL_HOUR_PX)
        lines.push({
          y: y + TL_TOP_PAD,
          label: String(h).padStart(2, '0') + ':00',
          isEven: h % 2 === 0 && h < TL_END,
        })
      }
      return lines
    },

    gridHeight() {
      return (TL_END - TL_START) * TL_HOUR_PX + 20 + TL_TOP_PAD
    },

    nowY() {
      const n = new Date()
      const h = n.getHours(), m = n.getMinutes()
      if (h < TL_START || h >= TL_END) return null
      return Math.round(((h - TL_START) + m / 60) * TL_HOUR_PX) + TL_TOP_PAD
    },
  },

  actions: {
    async load() {
      this.blocks = await db.get('tl_blocks', DEFAULT_BLOCKS)
      this.routines = await db.get('tl_routines', DEFAULT_ROUTINES)
      this.loaded = true
    },

    async saveBlocks() { await db.set('tl_blocks', this.blocks) },
    async saveRoutines() { await db.set('tl_routines', this.routines) },

    setView(v) { this.activeView = v },

    addBlock(data) {
      this.blocks.push({ id: 'b' + Date.now(), ...data })
      this.saveBlocks()
    },

    updateBlock(id, data) {
      const b = this.blocks.find(x => x.id === id)
      if (b) { Object.assign(b, data); this.saveBlocks() }
    },

    removeBlock(id) {
      this.blocks = this.blocks.filter(x => x.id !== id)
      this.saveBlocks()
    },

    moveBlock(id, newStart) {
      const b = this.blocks.find(x => x.id === id)
      if (!b) return
      const dur = minsBetween(b.start, b.end)
      const [h, m] = newStart.split(':').map(Number)
      const endMins = h * 60 + m + dur
      b.start = newStart
      b.end = `${String(Math.floor(endMins / 60)).padStart(2, '0')}:${String(endMins % 60).padStart(2, '0')}`
      this.saveBlocks()
    },

    startRecording() {
      this.recording = true
      this.recStart = new Date()
    },

    stopRecording(name, note, projectId, clientId) {
      if (!this.recStart) return
      const end = new Date()
      const sh = String(this.recStart.getHours()).padStart(2, '0')
      const sm = String(this.recStart.getMinutes()).padStart(2, '0')
      const eh = String(end.getHours()).padStart(2, '0')
      const em = String(end.getMinutes()).padStart(2, '0')
      this.blocks.push({
        id: 'b' + Date.now(), name: name || '记录的活动',
        start: `${sh}:${sm}`, end: `${eh}:${em}`,
        note: note || '', color: 'var(--purple)',
        projectId: projectId || '', clientId: clientId || '',
      })
      this.saveBlocks()
      this.recording = false
      this.recStart = null
    },

    cancelRecording() {
      this.recording = false
      this.recStart = null
    },

    addRoutine(data) {
      this.routines.push({ id: 'r-' + Date.now(), ...data })
      this.saveRoutines()
    },

    removeRoutine(id) {
      this.routines = this.routines.filter(r => r.id !== id)
      this.saveRoutines()
    },

    // Stats
    getStats() {
      const blocks = this.blocks.filter(b => !b.source)
      const byProject = {}
      const byClient = {}
      let totalMins = 0

      blocks.forEach(b => {
        const dur = minsBetween(b.start, b.end)
        totalMins += dur
        if (b.projectId) {
          if (!byProject[b.projectId]) byProject[b.projectId] = { mins: 0, blocks: 0 }
          byProject[b.projectId].mins += dur
          byProject[b.projectId].blocks++
        }
        if (b.clientId) {
          if (!byClient[b.clientId]) byClient[b.clientId] = { mins: 0, blocks: 0 }
          byClient[b.clientId].mins += dur
          byClient[b.clientId].blocks++
        }
      })

      return { totalMins, byProject, byClient, blockCount: blocks.length }
    },
  }
})
