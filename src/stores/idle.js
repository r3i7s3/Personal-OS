import { defineStore } from 'pinia'
import { db } from '../composables/db'

// 称号等级
const TITLES = [
  { min: 0, title: '初来乍到' },
  { min: 100, title: '收心自持' },
  { min: 500, title: '作息有序' },
  { min: 2000, title: '渐入佳境' },
  { min: 5000, title: '开销无忧' },
  { min: 10000, title: '左右逢源' },
  { min: 20000, title: '衣香鬓影' },
  { min: 50000, title: '锦衣玉食' },
  { min: 100000, title: '奢而不显' },
  { min: 200000, title: '富贵等闲' },
  { min: 500000, title: '至尊黑卡' },
]

function getTitle(wealth) {
  let result = TITLES[0]
  for (const t of TITLES) {
    if (wealth >= t.min) result = t
    else break
  }
  return result.title
}

export const useIdleStore = defineStore('idle', {
  state: () => ({
    wealth: 0,
    todayIncome: 0,
    streak: 0,
    multiplier: 1.0,
    lastWorkDate: null,
    todayDate: null,
    todayPomos: 0,
    todayWorkSec: 0,
    loaded: false,
  }),

  getters: {
    title(state) {
      return getTitle(state.wealth)
    },
    displayWealth(state) {
      if (state.wealth >= 10000) return (state.wealth / 10000).toFixed(1) + 'w'
      return String(state.wealth)
    },
    displayToday(state) {
      return '+' + state.todayIncome
    },
  },

  actions: {
    async load() {
      const data = await db.get('idle', {
        wealth: 0, todayIncome: 0, streak: 0, multiplier: 1.0,
        lastWorkDate: null, todayDate: null,
        todayPomos: 0, todayWorkSec: 0,
      })
      Object.assign(this, data)

      // 跨天检查
      const today = new Date().toISOString().slice(0, 10)
      if (this.todayDate !== today) {
        // 昨天是否工作过
        const yesterday = new Date(Date.now() - 864e5).toISOString().slice(0, 10)
        if (this.lastWorkDate === yesterday) {
          this.streak = Math.min(this.streak + 1, 7)
        } else if (this.lastWorkDate !== today) {
          this.streak = 0
        }
        this.multiplier = 1.0 + Math.min(this.streak, 7) * 0.1
        this.todayIncome = 0
        this.todayPomos = 0
        this.todayWorkSec = 0
        this.todayDate = today
        await this.save()
      }
      this.loaded = true
    },

    async save() {
      await db.set('idle', {
        wealth: this.wealth,
        todayIncome: this.todayIncome,
        streak: this.streak,
        multiplier: this.multiplier,
        lastWorkDate: this.lastWorkDate,
        todayDate: this.todayDate,
        todayPomos: this.todayPomos,
        todayWorkSec: this.todayWorkSec,
      })
    },

    // 番茄钟完成时调用
    async onPomoComplete(workSeconds) {
      const today = new Date().toISOString().slice(0, 10)
      this.todayPomos++
      this.todayWorkSec += workSeconds
      this.lastWorkDate = today
      this.todayDate = today

      // 计算奖励
      const baseReward = 100
      const bonus = this.todayPomos >= 4 ? 50 : 0
      const reward = Math.round((baseReward + bonus) * this.multiplier)
      this.wealth += reward
      this.todayIncome += reward

      // 更新连胜
      this.streak = Math.min(this.streak + 1, 7)
      this.multiplier = 1.0 + Math.min(this.streak, 7) * 0.1

      await this.save()
      return reward
    },
  }
})
