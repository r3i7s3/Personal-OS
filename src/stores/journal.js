import { defineStore } from 'pinia'
import { db } from '../composables/db'

const MOODS = ['😴', '😔', '😐', '😊', '🤩']
const TAGS = ['开发', '思考', '生活', '学习']

const DEFAULT_ENTRIES = [
  {
    id: 'j1', title: '04-05 今日随笔', cat: '日记', mood: '😊', tags: ['开发'], weather: '晴',
    content: '今天开始搭建 Personal OS 的框架，三栏布局比之前清爽很多。\n\n收获：\n- 日历大格子视图终于对了\n- 二级侧边栏的 tab 分类很实用\n- 番茄钟默认关闭更合理\n\n待解决：\n- Openclaw 脚本格式待确认\n- 待办模块数据层还没接\n\n明天计划：\n- 搭 Tauri 项目骨架\n- 定 SQLite schema',
  },
  {
    id: 'j2', title: '04-04 技术选型', cat: '日记', mood: '😐', tags: ['开发', '思考'], weather: '阴',
    content: '今天花了大半天研究 RSS 聚合方案。\n\nAcFun 没有公开 API，微博也一样。最终决定用 Openclaw 做认证代理，本地 Python 脚本定时抓取，落地成 JSON 文件。\n\n这样数据完全本地，不依赖任何第三方服务。',
  },
  {
    id: 'j3', title: '关于本地优先', cat: '随笔', mood: '😊', tags: ['思考'], weather: '晴',
    content: '数据主权是一个被低估的问题。\n\n我们习惯了把数据交给云端，因为便利。但便利的代价是：你的数据不完全属于你。\n\n本地优先不是反技术，而是重新定义人与工具的关系——工具为人服务，而不是人被工具绑定。',
  },
  {
    id: 'j4', title: '04-01 季度复盘', cat: '日记', mood: '😊', tags: ['生活', '思考'], weather: '晴',
    content: 'Q1 做对了什么：\n- 坚持番茄钟，专注时间从平均 60 分钟提升到 90 分钟\n- 开始写日记，对自己状态的感知清晰很多\n- 减少了无效社交媒体时间\n\nQ2 想改变的：\n- 运动频率太低，要加上去\n- 知识库整理拖太久了',
  },
  {
    id: 'j5', title: '为什么做 Personal OS', cat: '思考', mood: '😊', tags: ['开发', '思考'], weather: '晴',
    content: '工具应当理解使用者。\n\n现有的工具——Notion、Obsidian、Todoist——都很好，但它们都是通用工具。我需要的是一个专门为我的工作流定制的系统。\n\n这就是 Personal OS 的起点：不将就，为自己做一个恰好合适的工具。',
  },
]

export const useJournalStore = defineStore('journal', {
  state: () => ({
    entries: [],
    currentId: null,
    curCat: '全部',
    curMood: '😊',
    activeTags: ['开发'],
    filterDate: '',
    loaded: false,
  }),

  getters: {
    moods: () => MOODS,
    tags: () => TAGS,

    currentEntry(state) {
      return state.entries.find(e => e.id === state.currentId) || null
    },

    filteredEntries(state) {
      const now = new Date()
      const today = now.toISOString().slice(0, 10)
      const weekAgo = new Date(now - 7 * 864e5).toISOString().slice(0, 10)

      let source = state.entries

      // 日期筛选
      if (state.filterDate) {
        const filterMMDD = state.filterDate.slice(5) // "04-25"
        source = source.filter(j => {
          const titleDate = j.title.match(/^(\d{2})-(\d{2})/)
          return titleDate && (titleDate[1] + '-' + titleDate[2]) === filterMMDD
        })
      }

      const items = source.map(j => {
        const lines = j.content.split('\n').filter(l => l.trim()).length
        const cat = lines > 5 ? '随笔' : '碎碎念'
        const preview = j.content.substring(0, 20).replace(/\n/g, ' ') + '…'
        let jDate = null
        const titleDate = j.title.match(/^(\d{2})-(\d{2})/)
        if (titleDate) jDate = now.getFullYear() + '-' + titleDate[1] + '-' + titleDate[2]
        let group = '更早'
        if (jDate) {
          if (jDate >= today) group = '今天'
          else if (jDate >= weekAgo) group = '本周'
        }
        return {
          t: j.title,
          m: j.weather + ' · ' + j.mood,
          dot: cat === '随笔' ? 'var(--acc)' : 'var(--purple)',
          cat,
          _id: j.id,
          _group: group,
          _sortDate: jDate || '0000-00-00',
          preview,
        }
      }).sort((a, b) => b._sortDate.localeCompare(a._sortDate))

      if (state.curCat === '全部') return items
      if (state.curCat === '随笔') return items.filter(i => i.cat === '随笔')
      return items.filter(i => i.cat === '碎碎念')
    },
  },

  actions: {
    async load() {
      const saved = await db.get('journal_data', null)
      if (saved && Array.isArray(saved)) {
        this.entries = saved
      } else {
        this.entries = DEFAULT_ENTRIES.map(e => ({ ...e, tags: [...e.tags] }))
      }
      this.loaded = true
    },

    async save() {
      await db.set('journal_data', this.entries)
    },

    setCat(cat) {
      this.curCat = cat
    },

    setFilterDate(date) {
      this.filterDate = date
    },

    setCurrent(id) {
      this.currentId = id
    },

    pickMood(mood) {
      this.curMood = mood
    },

    toggleTag(tag) {
      const idx = this.activeTags.indexOf(tag)
      if (idx === -1) this.activeTags.push(tag)
      else this.activeTags.splice(idx, 1)
    },

    createEntry(content) {
      if (!content.trim()) return
      const now = new Date()
      const id = 'j' + Date.now()
      const mm = String(now.getMonth() + 1).padStart(2, '0')
      const dd = String(now.getDate()).padStart(2, '0')
      const title = `${mm}-${dd} ${this.activeTags[0] || '随笔'}`
      const entry = {
        id,
        title,
        cat: this.activeTags.includes('思考') ? '随笔' : '日记',
        mood: this.curMood,
        tags: [...this.activeTags],
        weather: '晴',
        content,
      }
      this.entries.unshift(entry)
      this.save()
      // 重置
      this.curMood = '😊'
      this.activeTags = ['开发']
      return entry
    },

    updateEntry(id, content) {
      const entry = this.entries.find(e => e.id === id)
      if (!entry) return
      entry.content = content
      this.save()
    },

    deleteEntry(id) {
      const idx = this.entries.findIndex(e => e.id === id)
      if (idx === -1) return
      this.entries.splice(idx, 1)
      this.currentId = null
      this.save()
    },
  }
})
