import { defineStore } from 'pinia'
import { db } from '../composables/db'

export const useAiStore = defineStore('ai', {
  state: () => ({
    messages: [],
    provider: 'ollama',
    model: 'llama3.2',
    activeTab: '对话',
    loaded: false,
  }),

  getters: {
    modelLabel(state) {
      if (state.provider === 'ollama') return 'Ollama · ' + state.model
      if (state.provider === 'openai') return 'OpenAI · ' + state.model
      return '自定义 API'
    },
  },

  actions: {
    async load() {
      const cfg = await db.get('ai-config', null)
      if (cfg) {
        this.provider = cfg.provider || 'ollama'
        this.model = cfg.model || 'llama3.2'
      }
      this.loaded = true
    },

    async saveConfig() {
      await db.set('ai-config', {
        provider: this.provider,
        model: this.model,
      })
    },

    setProvider(p) {
      this.provider = p
      this.saveConfig()
    },

    setTab(tab) {
      this.activeTab = tab
    },

    addMessage(text, isUser) {
      this.messages.push({
        role: isUser ? 'user' : 'assistant',
        content: text,
        time: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
      })
    },

    clearMessages() {
      this.messages = []
      this.addMessage('对话已清空，有什么我可以帮你的？', false)
    },

    async sendMessage(text) {
      if (!text.trim()) return
      this.addMessage(text, true)

      // 模拟回复
      const replies = {
        '周报': '本周共完成 **28 个番茄钟**，合计 11.6 小时专注时间。主要集中在 Personal OS 开发（68%）和 Obsidian 整理（22%）。周三效率最高，建议下周保持工作日早上的节奏。',
        '健康': '本周健康综合评分 74 分（↑较上周 +6）。亮点：睡眠质量优秀，均 7.2h。需改进：运动频率为零，建议每天哪怕步行 20 分钟也好。喝水目标完成率 74%，还有提升空间。',
        '随笔': '梳理了你最近 5 篇随心记，核心主题有三：① 工具设计哲学（出现 4 次）②本地数据主权（3 次）③专注效率（3 次）。你的思考偏向系统性，建议可以把这些想法整理成一篇文章。',
        '洞察': '发现一个有趣的模式：你的高效日期集中在周二和周三，但随心记里「拖延」词汇最多出现在周一——周一可能是情绪准备期而非真正拖延。',
      }

      let reply = '好的，我来帮你处理这个问题。（后端接入 Ollama 或 API 后会返回真实内容）'
      for (const [k, v] of Object.entries(replies)) {
        if (text.includes(k)) { reply = v; break }
      }

      // Simulate delay
      await new Promise(r => setTimeout(r, 800 + Math.random() * 600))
      this.addMessage(reply, false)
    },
  }
})
