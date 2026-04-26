import { defineStore } from 'pinia'

const ASSET_CATS = [
  { id: 'all', name: '全部素材' },
  { id: 'design', name: '设计素材' },
  { id: 'ui', name: 'UI' },
  { id: 'fashion', name: '服设' },
  { id: 'goods', name: '谷' },
  { id: 'compose', name: '构图' },
  { id: 'other', name: '其他' },
]

const ASSETS_DATA = [
  { name: 'landing-page-v3.png', cat: 'design', ext: 'png', size: '2.4 MB', date: '04-08', color: 'var(--purple)', usedIn: ['pos'] },
  { name: 'hero-banner.psd', cat: 'design', ext: 'psd', size: '48 MB', date: '04-07', color: 'var(--purple)', usedIn: ['pos', 'obs'] },
  { name: 'icon-set-v2.svg', cat: 'design', ext: 'svg', size: '156 KB', date: '04-06', color: 'var(--purple)', usedIn: [] },
  { name: 'gradient-pack.sketch', cat: 'design', ext: 'sketch', size: '12 MB', date: '04-05', color: 'var(--purple)', usedIn: ['pos'] },
  { name: 'dashboard-dark.png', cat: 'ui', ext: 'png', size: '1.8 MB', date: '04-07', color: 'var(--acc)', usedIn: ['pos'] },
  { name: 'portfolio-2026.fig', cat: 'ui', ext: 'fig', size: '34 MB', date: '04-08', color: 'var(--acc)', usedIn: [] },
  { name: 'mobile-wireframe.sketch', cat: 'ui', ext: 'sketch', size: '9 MB', date: '04-05', color: 'var(--acc)', usedIn: ['pos'] },
  { name: 'dress-pattern-01.psd', cat: 'fashion', ext: 'psd', size: '22 MB', date: '04-03', color: 'var(--warn)', usedIn: [] },
  { name: 'fabric-swatch.ai', cat: 'fashion', ext: 'ai', size: '8 MB', date: '04-01', color: 'var(--warn)', usedIn: [] },
  { name: 'merch-preview.png', cat: 'goods', ext: 'png', size: '3.2 MB', date: '04-06', color: 'var(--ok)', usedIn: [] },
  { name: 'golden-ratio.ref', cat: 'compose', ext: 'png', size: '1.1 MB', date: '04-04', color: 'var(--acc-soft)', usedIn: [] },
  { name: 'rule-of-thirds.png', cat: 'compose', ext: 'png', size: '980 KB', date: '04-02', color: 'var(--acc-soft)', usedIn: [] },
  { name: 'visual-hierarchy.png', cat: 'compose', ext: 'png', size: '1.5 MB', date: '04-01', color: 'var(--acc-soft)', usedIn: ['pos'] },
  { name: 'system-design-doc.md', cat: 'other', ext: 'md', size: '24 KB', date: '04-08', color: 'var(--fg3)', usedIn: ['pos', 'obs'] },
  { name: 'requirement-v2.pdf', cat: 'other', ext: 'pdf', size: '3.1 MB', date: '04-06', color: 'var(--fg3)', usedIn: ['pos'] },
]

const EXT_COLORS = {
  png: 'var(--ok)', jpg: 'var(--acc)', jpeg: 'var(--acc)', gif: 'var(--purple)',
  svg: 'var(--warn)', psd: 'var(--purple)', sketch: 'var(--purple)', fig: 'var(--acc-soft)',
  ai: 'var(--warn)', md: 'var(--fg2)', pdf: 'var(--danger)',
}

const IMG_EXTS = ['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg', 'bmp']

export const useAssetsStore = defineStore('assets', {
  state: () => ({
    viewMode: 'grid',
    activeCat: '全部素材',
    previewAsset: null,
  }),

  getters: {
    cats: () => ASSET_CATS.map(c => c.name),

    filteredAssets(state) {
      const catMap = {}
      ASSET_CATS.forEach(c => catMap[c.name] = c.id)
      const catId = catMap[state.activeCat] || 'all'
      return catId === 'all' ? ASSETS_DATA : ASSETS_DATA.filter(a => a.cat === catId)
    },

    extColors: () => EXT_COLORS,
    imgExts: () => IMG_EXTS,
  },

  actions: {
    setView(mode) { this.viewMode = mode },
    setCat(cat) { this.activeCat = cat },
    openPreview(item) { this.previewAsset = item },
    closePreview() { this.previewAsset = null },
  }
})
