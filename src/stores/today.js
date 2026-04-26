import { defineStore } from 'pinia'

// 鼓励语库
const ENCOURAGEMENTS = [
  '今天也是元气满满的一天！',
  '专注的你最有魅力。',
  '完成比完美更重要。',
  '每一步都算数，别小看自己。',
  '你已经比昨天的自己更棒了。',
  '别忘了喝水 💧',
  '休息一下也没关系，你值得。',
  '坚持本身就是一种能力。',
  '今天做的事，未来的你会感谢。',
  '能坐下来开始，就已经赢了一半。',
  '慢慢来，比较快。',
  '你的努力不会白费。',
  '做自己喜欢的事，本身就是奖励。',
  '保持节奏，别急。',
  '今天的目标不难，你做得到。',
]

// 完成度评价
function getCompletion评价(pct) {
  if (pct >= 80) return { text: '今天状态超棒！', color: 'var(--ok)', emoji: '🌟' }
  if (pct >= 50) return { text: '还行，继续加油', color: 'var(--warn)', emoji: '💪' }
  if (pct > 0) return { text: '没关系，明天再来', color: 'var(--danger)', emoji: '🌅' }
  return { text: '今天还没开始呢', color: 'var(--fg3)', emoji: '☕' }
}

export const useTodayStore = defineStore('today', {
  state: () => ({
    encouragement: ENCOURAGEMENTS[Math.floor(Math.random() * ENCOURAGEMENTS.length)],
  }),

  getters: {
    // 从其他 store 聚合数据需要在组件中调用，这里提供工具方法
  },

  actions: {
    refreshEncouragement() {
      this.encouragement = ENCOURAGEMENTS[Math.floor(Math.random() * ENCOURAGEMENTS.length)]
    },
  }
})

export { ENCOURAGEMENTS, getCompletion评价 }
