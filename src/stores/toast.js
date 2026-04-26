import { defineStore } from 'pinia'
import { ENCOURAGEMENTS } from './today'

let _nextId = 0

export const useToastStore = defineStore('toast', {
  state: () => ({
    toasts: [],
    // 连续完成计数（用于三连击彩蛋）
    streakCount: 0,
    streakTimer: null,
  }),

  actions: {
    /**
     * 显示一条 toast
     * @param {string} text  文案
     * @param {string} emoji 左侧 emoji
     * @param {boolean} isStreak 是否为三连击（特殊样式）
     */
    show(text, emoji = '✨', isStreak = false) {
      const id = ++_nextId
      this.toasts.push({ id, text, emoji, isStreak })
      // 3.5s 后自动消失
      setTimeout(() => this.dismiss(id), 3500)
    },

    dismiss(id) {
      this.toasts = this.toasts.filter(t => t.id !== id)
    },

    /**
     * 任务完成时调用：随机鼓励语 + 三连击检测
     */
    onTaskDone() {
      // 重置计时器（3 秒内连续完成才算连击）
      if (this.streakTimer) clearTimeout(this.streakTimer)
      this.streakCount++
      this.streakTimer = setTimeout(() => { this.streakCount = 0 }, 3000)

      if (this.streakCount >= 3) {
        this.show('三连击！🔥 你今天状态超棒！', '🔥', true)
        this.streakCount = 0
      } else {
        const text = ENCOURAGEMENTS[Math.floor(Math.random() * ENCOURAGEMENTS.length)]
        this.show(text, '✨')
      }
    },
  }
})
