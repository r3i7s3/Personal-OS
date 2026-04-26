import { defineStore } from 'pinia'
import { db } from '../composables/db'

// 默认项目数据
const DEFAULT_PROJECTS = [
  {
    id: 'pos',
    name: 'Personal OS',
    meta: '进行中 · 预计6月',
    pct: 35,
    startDate: '2026-04-01',
    endDate: '2026-06-30',
    milestones: [
      { t: 'UI 框架原型', done: true, active: false, subs: [] },
      { t: '待办 + 日历模块', done: false, active: true, subs: ['数据层接入', '日历格子事项联动'] },
      { t: '日记 + 健康模块', done: false, active: false, subs: [] },
      { t: 'AI 集成', done: false, active: false, subs: [] },
      { t: '数据导入导出', done: false, active: false, subs: [] },
    ]
  },
  {
    id: 'obs',
    name: 'Obsidian 知识库',
    meta: '进行中 · 预计4月末',
    pct: 60,
    startDate: '2026-03-15',
    endDate: '2026-04-30',
    milestones: [
      { t: 'MOC 结构重组', done: true, active: false, subs: [] },
      { t: '孤立笔记整理', done: false, active: true, subs: ['技术类', '读书笔记'] },
      { t: '双链梳理', done: false, active: false, subs: [] },
    ]
  },
  {
    id: 'eng',
    name: '英语听力计划',
    meta: '暂停 · 已14天',
    pct: 20,
    startDate: '2026-04-01',
    endDate: '',
    milestones: [
      { t: '基础词汇巩固', done: false, active: false, subs: [] },
      { t: '精听练习', done: false, active: false, subs: [] },
    ]
  },
]

export const useProjectStore = defineStore('project', {
  state: () => ({
    projects: [],
    currentProjectId: 'pos',
    milestonesAnimated: false, // 控制里程碑动画只播一次
    loaded: false,
  }),

  getters: {
    currentProject(state) {
      return state.projects.find(p => p.id === state.currentProjectId) || state.projects[0] || null
    },
  },

  actions: {
    async load() {
      const saved = await db.get('projects_v1', null)
      if (saved && Array.isArray(saved)) {
        // 合并默认数据和保存的数据
        const merged = DEFAULT_PROJECTS.map(defaultProj => {
          const savedProj = saved.find(s => s.id === defaultProj.id)
          return savedProj ? { ...defaultProj, ...savedProj } : { ...defaultProj }
        })
        // 添加用户新增的项目（不在默认列表中的）
        saved.forEach(sp => {
          if (!merged.find(m => m.id === sp.id)) {
            merged.push(sp)
          }
        })
        this.projects = merged
      } else {
        this.projects = DEFAULT_PROJECTS.map(p => ({ ...p, milestones: p.milestones.map(m => ({ ...m, subs: [...m.subs] })) }))
      }
      this.loaded = true
    },

    async save() {
      await db.set('projects_v1', this.projects)
    },

    setCurrentProject(id) {
      this.currentProjectId = id
      this.milestonesAnimated = false // 切换项目时重置动画
    },

    // 里程碑操作
    toggleMilestone(msIndex) {
      const proj = this.currentProject
      if (!proj) return
      const ms = proj.milestones[msIndex]
      if (!ms) return
      if (!ms.done && !ms.active) { ms.active = true }
      else if (ms.active) { ms.active = false; ms.done = true }
      else { ms.done = false; ms.active = false }
      this.save()
    },

    addMilestone(title) {
      const proj = this.currentProject
      if (!proj || !title.trim()) return
      proj.milestones.push({ t: title.trim(), done: false, active: false, subs: [] })
      this.save()
    },

    removeMilestone(msIndex) {
      const proj = this.currentProject
      if (!proj) return
      proj.milestones.splice(msIndex, 1)
      this.save()
    },

    setMilestonesAnimated(val) {
      this.milestonesAnimated = val
    },
  }
})
