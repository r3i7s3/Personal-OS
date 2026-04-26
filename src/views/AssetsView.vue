<script setup>
import { useAssetsStore } from '../stores/assets'

const store = useAssetsStore()

function getExtColor(ext) {
  return store.extColors[ext] || 'var(--fg3)'
}

function isImg(ext) {
  return store.imgExts.includes(ext)
}
</script>

<template>
  <div class="assets-view">
    <!-- 顶栏 -->
    <div class="assets-toolbar">
      <div class="assets-toolbar-left">
        <span class="assets-cat-label">{{ store.activeCat }}</span>
        <span class="assets-count">{{ store.filteredAssets.length }} 个文件</span>
      </div>
      <div style="display:flex;gap:4px">
        <button
          class="assets-view-btn"
          :class="{ active: store.viewMode === 'grid' }"
          @click="store.setView('grid')"
          title="网格"
        >⊞</button>
        <button
          class="assets-view-btn"
          :class="{ active: store.viewMode === 'list' }"
          @click="store.setView('list')"
          title="列表"
        >☰</button>
      </div>
    </div>

    <!-- 分类 tabs -->
    <div class="assets-cat-tabs">
      <div
        v-for="cat in store.cats"
        :key="cat"
        class="sb-tab"
        :class="{ active: store.activeCat === cat }"
        @click="store.setCat(cat)"
      >{{ cat }}</div>
    </div>

    <!-- 网格/列表 -->
    <div
      class="assets-grid"
      :class="{ 'list-mode': store.viewMode === 'list' }"
    >
      <div
        v-for="(item, i) in store.filteredAssets"
        :key="i"
        class="asset-card"
        :class="{ 'list-card': store.viewMode === 'list' }"
        @click="store.openPreview(item)"
      >
        <!-- 网格模式 -->
        <template v-if="store.viewMode === 'grid'">
          <div class="asset-thumb">
            <template v-if="isImg(item.ext)">
              <div class="asset-thumb-img" :style="{ background: 'linear-gradient(135deg,' + item.color + '22,' + item.color + '11)' }">
                <span style="font-size:36px;opacity:.3">🖼️</span>
              </div>
            </template>
            <template v-else>
              <div class="asset-thumb-icon">
                <span class="asset-thumb-ext" :style="{ color: getExtColor(item.ext), background: getExtColor(item.ext) + '18' }">{{ item.ext }}</span>
              </div>
            </template>
          </div>
          <div class="asset-info">
            <div class="asset-name" :title="item.name">{{ item.name }}</div>
            <div class="asset-meta">
              {{ item.size }} · {{ item.date }}
              <template v-if="item.usedIn && item.usedIn.length"> · 🔗 {{ item.usedIn.length }}</template>
            </div>
          </div>
        </template>

        <!-- 列表模式 -->
        <template v-else>
          <span class="asset-thumb-ext list-ext" :style="{ color: getExtColor(item.ext), background: getExtColor(item.ext) + '18' }">{{ item.ext }}</span>
          <span class="list-name">{{ item.name }}</span>
          <span class="list-size">{{ item.size }}</span>
          <span v-if="item.usedIn && item.usedIn.length" class="list-link">🔗 {{ item.usedIn.length }}</span>
          <span class="list-date">{{ item.date }}</span>
        </template>
      </div>
    </div>

    <!-- 预览浮层 -->
    <div
      v-if="store.previewAsset"
      class="assets-overlay show"
      @click.self="store.closePreview()"
    >
      <div class="assets-preview-card">
        <div class="assets-preview-header">
          <span class="assets-preview-title">{{ store.previewAsset.name }}</span>
          <button class="tb-btn" @click="store.closePreview()">✕</button>
        </div>
        <div class="assets-preview-body">
          <div class="assets-preview-icon">
            <span class="asset-thumb-ext" :style="{ color: getExtColor(store.previewAsset.ext), background: getExtColor(store.previewAsset.ext) + '18', fontSize: '16px', padding: '6px 14px', borderRadius: '6px' }">
              {{ store.previewAsset.ext }}
            </span>
          </div>
        </div>
        <div class="assets-preview-info">
          {{ store.previewAsset.size }} · {{ store.previewAsset.date }}
          <template v-if="store.previewAsset.usedIn?.length"> · 关联 {{ store.previewAsset.usedIn.length }} 个项目</template>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.assets-view {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.assets-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
  flex-shrink: 0;
}

.assets-toolbar-left {
  display: flex;
  align-items: center;
  gap: 8px;
}

.assets-cat-label {
  font-size: 13px;
  font-weight: 700;
  color: var(--fg0);
}

.assets-count {
  font-size: 11px;
  color: var(--fg3);
}

.assets-view-btn {
  width: 30px; height: 30px; border-radius: var(--r6);
  border: 1px solid var(--border); background: var(--bg1);
  color: var(--fg2); cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  font-size: 14px; transition: all .12s;
}
.assets-view-btn.active { background: var(--acc-dim); color: var(--acc-text); border-color: var(--acc); }
.assets-view-btn:hover { border-color: var(--border2); }

.assets-cat-tabs {
  display: flex; gap: 3px; margin-bottom: 10px; flex-wrap: wrap; flex-shrink: 0;
}

.assets-grid {
  flex: 1; overflow-y: auto; padding: 14px;
  display: grid; grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: 10px; align-content: start;
}

.assets-grid.list-mode {
  grid-template-columns: 1fr;
}

/* Asset card */
.asset-card {
  border-radius: var(--r10); overflow: hidden;
  border: 1px solid var(--border); background: var(--bg1);
  cursor: pointer; transition: all .15s; position: relative;
}
.asset-card:hover { border-color: var(--acc); box-shadow: var(--sh); transform: translateY(-1px); }

.asset-thumb {
  width: 100%; aspect-ratio: 1; background: var(--bg2);
  display: flex; align-items: center; justify-content: center;
  overflow: hidden; position: relative;
}
.asset-thumb-img {
  width: 100%; height: 100%;
  display: flex; align-items: center; justify-content: center;
}
.asset-thumb-icon { font-size: 28px; color: var(--fg3); display: flex; flex-direction: column; align-items: center; gap: 4px; }
.asset-thumb-ext { font-size: 10px; font-weight: 700; padding: 2px 6px; border-radius: 4px; text-transform: uppercase; }
.asset-info { padding: 8px 10px; }
.asset-name { font-size: 12px; color: var(--fg0); font-weight: 500; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.asset-meta { font-size: 10px; color: var(--fg3); margin-top: 2px; }

/* List mode */
.list-card {
  display: flex; align-items: center; gap: 12px;
  padding: 10px 14px; border-radius: var(--r8);
}
.list-ext { flex-shrink: 0; font-size: 10px; font-weight: 700; padding: 3px 8px; border-radius: 4px; }
.list-name { flex: 1; font-size: 13px; color: var(--fg0); font-weight: 500; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.list-size { font-size: 11px; color: var(--fg3); flex-shrink: 0; }
.list-link { font-size: 10px; color: var(--acc-text); flex-shrink: 0; }
.list-date { font-size: 11px; color: var(--fg3); flex-shrink: 0; }

/* Overlay */
.assets-overlay {
  position: fixed; inset: 0; z-index: 9999;
  background: rgba(0,0,0,.7); backdrop-filter: blur(8px);
  display: flex; align-items: center; justify-content: center;
}

.assets-preview-card {
  background: var(--bg1); border-radius: var(--r12);
  border: 1px solid var(--border); box-shadow: var(--sh2);
  padding: 20px; min-width: 300px; max-width: 500px;
}

.assets-preview-header {
  display: flex; align-items: center; justify-content: space-between;
  margin-bottom: 16px;
}

.assets-preview-title { font-size: 14px; font-weight: 600; color: var(--fg0); }

.assets-preview-body {
  display: flex; align-items: center; justify-content: center;
  padding: 40px 0; background: var(--bg2); border-radius: var(--r8);
  margin-bottom: 12px;
}

.assets-preview-icon { font-size: 48px; }

.assets-preview-info { font-size: 12px; color: var(--fg2); }
</style>
