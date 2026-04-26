import { defineStore } from 'pinia'
import { db } from '../composables/db'

const H_DEF = {
  date: '', water: { cups: 0, goal: 8 }, exercise: { minutes: 0, goal: 30 },
  sleep: { hours: 0, goal: 8, start: '23:00', end: '07:00' },
  focus: { minutes: 0, goal: 120 }, meditation: { minutes: 0, goal: 20 },
  history: {},
}

export const useHealthStore = defineStore('health', {
  state: () => ({
    data: null,
    loaded: false,
  }),

  getters: {
    score(state) {
      if (!state.data) return 0
      const d = state.data
      const m = [
        Math.min(100, (d.water.cups / d.water.goal) * 100),
        Math.min(100, (d.exercise.minutes / d.exercise.goal) * 100),
        Math.min(100, (d.sleep.hours / d.sleep.goal) * 100),
        Math.min(100, (d.focus.minutes / d.focus.goal) * 100),
        Math.min(100, (d.meditation.minutes / d.meditation.goal) * 100),
      ]
      return Math.round(m.reduce((a, b) => a + b, 0) / 5)
    },

    scoreColor() {
      const s = this.score
      if (s >= 80) return 'var(--ok)'
      if (s >= 60) return 'var(--warn)'
      return 'var(--danger)'
    },

    yesterdayScore(state) {
      if (!state.data) return null
      const yest = new Date(Date.now() - 864e5).toISOString().slice(0, 10)
      const yd = state.data.history?.[yest]
      if (!yd) return null
      const d = state.data
      const m = [
        Math.min(100, ((yd.water || 0) / d.water.goal) * 100),
        Math.min(100, ((yd.exercise || 0) / d.exercise.goal) * 100),
        Math.min(100, ((yd.sleep || 0) / d.sleep.goal) * 100),
        Math.min(100, ((yd.focus || 0) / d.focus.goal) * 100),
        Math.min(100, ((yd.meditation || 0) / d.meditation.goal) * 100),
      ]
      return Math.round(m.reduce((a, b) => a + b, 0) / 5)
    },

    bars(state) {
      if (!state.data) return []
      const d = state.data
      return [
        { label: '水分', pct: Math.min(100, Math.round(d.water.cups / d.water.goal * 100)), color: 'var(--acc-soft)' },
        { label: '运动', pct: Math.min(100, Math.round(d.exercise.minutes / d.exercise.goal * 100)), color: 'var(--ok)' },
        { label: '睡眠', pct: Math.min(100, Math.round(d.sleep.hours / d.sleep.goal * 100)), color: 'var(--purple)' },
        { label: '冥想', pct: Math.min(100, Math.round(d.meditation.minutes / d.meditation.goal * 100)), color: '#5e4db8' },
      ]
    },

    aiText(state) {
      if (!state.data) return ''
      const d = state.data
      const parts = []
      if (d.water.cups < d.water.goal * .5) parts.push('水分摄入偏低，建议下午补两杯水。')
      else if (d.water.cups >= d.water.goal) parts.push('水分摄入达标，继续保持。')
      else parts.push('水分摄入还差 ' + (d.water.goal - d.water.cups) + ' 杯达标。')
      if (d.exercise.minutes >= d.exercise.goal) parts.push('运动目标已达成 ✓')
      else if (d.exercise.minutes > 0) parts.push('运动时间还差 ' + (d.exercise.goal - d.exercise.minutes) + ' 分钟。')
      if (d.sleep.hours >= d.sleep.goal) parts.push('睡眠充足。')
      else if (d.sleep.hours > 0) parts.push('睡眠不足，建议今晚早睡。')
      if (d.focus.minutes >= d.focus.goal) parts.push('专注时间出色。')
      else if (d.focus.minutes > 0) parts.push('专注时间还有提升空间。')
      if (d.meditation.minutes > 0) parts.push('冥想 ' + d.meditation.minutes + ' 分钟，内心平静。')
      const s = this.score
      if (s >= 80) parts.push('综合表现优秀 ✨')
      else if (s >= 60) parts.push('今日状态尚可，继续加油。')
      if (!parts.length) parts.push('开始记录今天的健康数据吧！')
      return parts.join(' ')
    },

    pomodoroCount(state) {
      if (!state.data) return 0
      return Math.floor(state.data.focus.minutes / 25)
    },

    trendDays(state) {
      if (!state.data) return []
      const hist = state.data.history || {}
      const d = state.data
      const days = []
      for (let i = 6; i >= 0; i--) {
        const dt = new Date(Date.now() - i * 864e5)
        const key = dt.toISOString().slice(0, 10)
        const lb = ['一','二','三','四','五','六','日'][dt.getDay() === 0 ? 6 : dt.getDay() - 1]
        const h = hist[key] || {}
        days.push({
          lb, key,
          water: h.water || 0, exercise: h.exercise || 0,
          sleep: h.sleep || 0, focus: h.focus || 0,
        })
      }
      // Today overrides
      days[6] = {
        ...days[6],
        water: d.water.cups, exercise: d.exercise.minutes,
        sleep: d.sleep.hours, focus: d.focus.minutes,
      }
      return days
    },
  },

  actions: {
    async load() {
      const today = new Date().toISOString().slice(0, 10)
      let d = await db.get('health', { ...H_DEF, date: today })
      // Migrate
      if (!d.sleep.start) d.sleep.start = '23:00'
      if (!d.sleep.end) d.sleep.end = '07:00'
      // New day → archive yesterday
      if (d.date !== today) {
        d.history = d.history || {}
        const sc = this._calcScore(d)
        d.history[d.date] = {
          water: d.water.cups, exercise: d.exercise.minutes,
          sleep: d.sleep.hours, focus: d.focus.minutes,
          meditation: d.meditation.minutes, _score: sc,
        }
        const dates = Object.keys(d.history).sort().slice(-30)
        const h = {}
        dates.forEach(k => h[k] = d.history[k])
        d.history = h
        d.date = today
        d.water.cups = 0; d.exercise.minutes = 0; d.sleep.hours = 0
        d.focus.minutes = 0; d.meditation.minutes = 0
        await db.set('health', d)
      }
      this.data = d
      this.loaded = true
    },

    async save() {
      await db.set('health', this.data)
    },

    _calcScore(d) {
      const m = [
        Math.min(100, (d.water.cups / d.water.goal) * 100),
        Math.min(100, (d.exercise.minutes / d.exercise.goal) * 100),
        Math.min(100, (d.sleep.hours / d.sleep.goal) * 100),
        Math.min(100, (d.focus.minutes / d.focus.goal) * 100),
        Math.min(100, (d.meditation.minutes / d.meditation.goal) * 100),
      ]
      return Math.round(m.reduce((a, b) => a + b, 0) / 5)
    },

    add(field, delta) {
      if (!this.data) return
      if (field === 'water') this.data.water.cups = Math.max(0, this.data.water.cups + delta)
      if (field === 'exercise') this.data.exercise.minutes = Math.max(0, this.data.exercise.minutes + delta)
      if (field === 'sleep') this.data.sleep.hours = Math.min(24, Math.max(0, this.data.sleep.hours + delta))
      if (field === 'focus') this.data.focus.minutes = Math.max(0, this.data.focus.minutes + delta)
      if (field === 'meditation') this.data.meditation.minutes = Math.max(0, this.data.meditation.minutes + delta)
      this.save()
    },

    setSleep(field, value) {
      if (!this.data) return
      this.data.sleep[field] = value
      const s = this.data.sleep.start
      const e = this.data.sleep.end
      const [sh, sm] = s.split(':').map(Number)
      const [eh, em] = e.split(':').map(Number)
      let mins = (eh * 60 + em) - (sh * 60 + sm)
      if (mins < 0) mins += 24 * 60
      this.data.sleep.hours = Math.round(mins / 60 * 10) / 10
      this.save()
    },
  }
})
