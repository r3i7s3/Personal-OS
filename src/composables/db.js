/**
 * 统一存储层
 * 开发阶段用 localStorage，Tauri 生产环境自动切换 SQLite
 */

// 检测是否在 Tauri 环境中
const isTauri = () => !!(window.__TAURI__ || window.__TAURI_INTERNALS__)

export const db = {
  async get(key, fallback = null) {
    if (isTauri()) {
      try {
        const { invoke } = window.__TAURI__.core
        const result = await invoke('db_get', { key })
        return result ? JSON.parse(result) : fallback
      } catch {
        return fallback
      }
    }
    try {
      const v = localStorage.getItem('os13_' + key)
      return v ? JSON.parse(v) : fallback
    } catch {
      return fallback
    }
  },

  async set(key, value) {
    if (isTauri()) {
      try {
        const { invoke } = window.__TAURI__.core
        await invoke('db_set', { key, value: JSON.stringify(value) })
      } catch (e) {
        console.error('DB set failed:', e)
      }
      return
    }
    localStorage.setItem('os13_' + key, JSON.stringify(value))
  },

  async remove(key) {
    if (isTauri()) {
      try {
        const { invoke } = window.__TAURI__.core
        await invoke('db_remove', { key })
      } catch (e) {
        console.error('DB remove failed:', e)
      }
      return
    }
    localStorage.removeItem('os13_' + key)
  }
}
