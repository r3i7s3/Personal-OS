import { defineStore } from 'pinia'
import { db } from '../composables/db'
import { useToastStore } from './toast'

const TAGS = ['工作', '设计', '个人', '娱乐', '已完成']

export const useTodoStore = defineStore('todo', {
  state: () => ({
    tasks: [],
    nextId: 8,
    curTagFilter: '工作',
    expandedId: null,
    selDate: '',
    calExpandedId: null,
    calY: new Date().getFullYear(),
    calM: new Date().getMonth(),
    calEvents: {},
    newPri: '中',
    loaded: false,
    // 动画控制
    listAnimated: false,
  }),

  getters: {
    priColor: () => ({ '高': 'var(--danger)', '中': 'var(--warn)', '低': 'var(--ok)' }),
    priCycle: () => ['高', '中', '低'],
    priLabel: () => ({ '高': '高 ●', '中': '中 ●', '低': '低 ●' }),
    priStyle: () => ({
      '高': 'color:var(--danger);border-color:var(--danger)',
      '中': 'color:var(--warn);border-color:var(--warn)',
      '低': 'color:var(--ok);border-color:var(--ok)',
    }),
    tagColor: () => ({
      '工作': 'var(--acc)', '设计': 'var(--purple)',
      '个人': 'var(--acc-soft)', '娱乐': 'var(--purple)', '已完成': 'var(--fg3)',
    }),
    typeColor: () => ({
      task: 'var(--ok)', reminder: 'var(--warn)',
      deadline: 'var(--danger)', event: 'var(--purple)',
    }),

    filteredTasks(state) {
      if (state.curTagFilter === '已完成') {
        return state.tasks.filter(t => t.done)
      }
      return state.tasks.filter(t => t.tag === state.curTagFilter && !t.done)
    },

    dayTasks(state) {
      return state.tasks.filter(t => t.date === state.selDate && !t.done)
    },

    calLabel(state) {
      const months = ['1月','2月','3月','4月','5月','6月','7月','8月','9月','10月','11月','12月']
      return state.calY + '年 ' + months[state.calM]
    },

    calGrid(state) {
      const first = new Date(state.calY, state.calM, 1).getDay()
      const days = new Date(state.calY, state.calM + 1, 0).getDate()
      const prevDays = new Date(state.calY, state.calM, 0).getDate()
      const now = new Date()
      const todayStr = fmtDate(now)
      const cells = []

      // 上月补位
      for (let i = 0; i < first; i++) {
        cells.push({
          day: prevDays - first + 1 + i,
          dateStr: '',
          isOtherMonth: true,
          isToday: false,
          isSelected: false,
          events: [],
          projEvents: [],
          taskCount: 0,
        })
      }

      // 本月
      for (let d = 1; d <= days; d++) {
        const dateStr = state.calY + '-' + String(state.calM + 1).padStart(2, '0') + '-' + String(d).padStart(2, '0')
        const isToday = dateStr === todayStr
        const dayTasks = state.tasks.filter(t => t.date === dateStr && !t.done)
        cells.push({
          day: d,
          dateStr,
          isOtherMonth: false,
          isToday,
          isSelected: dateStr === state.selDate,
          events: (state.calEvents[d] || []).slice(0, 1),
          projEvents: [],
          taskCount: dayTasks.length,
        })
      }

      // 下月补位
      const remaining = 42 - cells.length
      for (let i = 1; i <= remaining; i++) {
        cells.push({
          day: i,
          dateStr: '',
          isOtherMonth: true,
          isToday: false,
          isSelected: false,
          events: [],
          projEvents: [],
          taskCount: 0,
        })
      }

      return cells
    },
  },

  actions: {
    async load() {
      const data = await db.get('tasks_v12', { list: [], nextId: 8 })
      this.tasks = data.list || []
      this.nextId = data.nextId || 8
      this.calEvents = await db.get('cal_events', {})
      this.selDate = fmtDate(new Date())
      this.loaded = true
    },

    async save() {
      await db.set('tasks_v12', { list: this.tasks, nextId: this.nextId })
    },

    setTag(tag) {
      this.curTagFilter = tag
      this.listAnimated = false
    },

    setDate(dateStr) {
      this.selDate = dateStr
      this.calExpandedId = null
    },

    toggleTask(taskId) {
      const t = this.tasks.find(x => x.id === taskId)
      if (!t) return
      t.done = !t.done
      if (t.done) {
        this.expandedId = null
        // 触发鼓励 toast
        try { useToastStore().onTaskDone() } catch {}
      }
      this.save()
    },

    expandTask(taskId) {
      this.expandedId = this.expandedId === taskId ? null : taskId
    },

    expandCalDay(taskId) {
      this.calExpandedId = this.calExpandedId === taskId ? null : taskId
    },

    addTask(text, tag, projectId) {
      if (!text.trim()) return
      this.tasks.push({
        id: this.nextId++,
        text: text.trim(),
        tag: tag || (this.curTagFilter === '已完成' ? '工作' : this.curTagFilter),
        pri: this.newPri,
        date: this.selDate,
        done: false,
        desc: '',
        subtasks: [],
        projectId: projectId || '',
      })
      this.save()
    },

    removeTask(taskId) {
      this.tasks = this.tasks.filter(x => x.id !== taskId)
      this.expandedId = null
      this.save()
    },

    toggleSubtask(taskId, subIndex) {
      const t = this.tasks.find(x => x.id === taskId)
      if (!t || !t.subtasks[subIndex]) return
      t.subtasks[subIndex].done = !t.subtasks[subIndex].done
      this.save()
    },

    addSubtask(taskId, text) {
      const t = this.tasks.find(x => x.id === taskId)
      if (!t || !text.trim()) return
      if (!t.subtasks) t.subtasks = []
      t.subtasks.push({ text: text.trim(), done: false })
      this.save()
    },

    removeSubtask(taskId, subIndex) {
      const t = this.tasks.find(x => x.id === taskId)
      if (!t) return
      t.subtasks.splice(subIndex, 1)
      this.save()
    },

    cyclePri() {
      const cycle = this.priCycle
      this.newPri = cycle[(cycle.indexOf(this.newPri) + 1) % 3]
    },

    calNav(delta) {
      this.calM += delta
      if (this.calM > 11) { this.calM = 0; this.calY++ }
      if (this.calM < 0) { this.calM = 11; this.calY-- }
    },

    setNewDate(type) {
      const d = new Date()
      if (type === 'tomorrow') d.setDate(d.getDate() + 1)
      this.selDate = fmtDate(d)
    },

    setListAnimated(val) {
      this.listAnimated = val
    },
  }
})

// 日期工具
export function fmtDate(d) {
  return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0')
}

export function dispDate(s) {
  const p = s.split('-')
  return (+p[1]) + '月' + (+p[2]) + '日'
}
