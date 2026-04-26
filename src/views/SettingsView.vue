<script setup>
import { ref } from 'vue'

const activeTab = ref('通用')
const tabs = ['通用', 'AI 配置', '关于']
</script>

<template>
  <div class="settings-view">
    <div class="settings-header">
      <div class="settings-title">⚙️ 设置</div>
      <div class="settings-subtitle">Personal OS v15</div>
    </div>

    <!-- Tab 栏 -->
    <div class="settings-tabs">
      <button
        v-for="tab in tabs"
        :key="tab"
        class="settings-tab"
        :class="{ active: activeTab === tab }"
        @click="activeTab = tab"
      >
        {{ tab }}
      </button>
    </div>

    <!-- 内容区 -->
    <div class="settings-content">
      <!-- 通用 -->
      <div v-if="activeTab === '通用'" class="settings-section">
        <div class="settings-section-title">🎨 外观</div>
        <div class="settings-row">
          <span class="settings-label">深色模式</span>
          <label class="toggle">
            <input type="checkbox" />
            <span class="toggle-slider"></span>
          </label>
        </div>
        <div class="settings-row">
          <span class="settings-label">主题色</span>
          <span class="settings-hint">开发中…</span>
        </div>
      </div>

      <!-- AI 配置 -->
      <div v-if="activeTab === 'AI 配置'" class="settings-section">
        <div class="settings-section-title">🤖 AI 配置</div>
        <div class="settings-row">
          <span class="settings-label">Provider</span>
          <select class="settings-select">
            <option>Ollama（本地）</option>
            <option>OpenAI 兼容</option>
            <option>自定义 API</option>
          </select>
        </div>
        <div class="settings-row">
          <span class="settings-label">Base URL</span>
          <input class="settings-input" value="http://localhost:11434" />
        </div>
        <div class="settings-row">
          <span class="settings-label">Model</span>
          <input class="settings-input" value="llama3.2" />
        </div>
      </div>

      <!-- 关于 -->
      <div v-if="activeTab === '关于'" class="settings-section">
        <div class="settings-section-title">ℹ️ 关于</div>
        <div class="settings-info">
          Personal OS v15<br />
          技术栈：Vue 3 + Pinia + Vite<br />
          目标平台：Tauri 2 + SQLite + Ollama
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.settings-view {
  padding: 20px;
  max-width: 520px;
}

.settings-header {
  margin-bottom: 20px;
}

.settings-title {
  font-size: 16px;
  font-weight: 700;
  color: var(--fg0);
}

.settings-subtitle {
  font-size: 11px;
  color: var(--fg3);
  margin-top: 2px;
}

.settings-tabs {
  display: flex;
  gap: 4px;
  margin-bottom: 16px;
  border-bottom: 1px solid var(--border);
  padding-bottom: 8px;
}

.settings-tab {
  font-size: 12px;
  padding: 6px 14px;
  border: none;
  border-radius: var(--r6);
  background: transparent;
  color: var(--fg2);
  cursor: pointer;
  transition: all 0.12s;
}

.settings-tab:hover {
  background: var(--bg2);
}

.settings-tab.active {
  background: var(--acc-dim);
  color: var(--acc-text);
  font-weight: 600;
}

.settings-section {
  background: var(--bg2);
  border-radius: var(--r10);
  padding: 16px;
}

.settings-section-title {
  font-size: 13px;
  font-weight: 600;
  color: var(--fg1);
  margin-bottom: 12px;
}

.settings-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 0;
  border-bottom: 1px solid var(--border);
}

.settings-row:last-child {
  border-bottom: none;
}

.settings-label {
  font-size: 12px;
  color: var(--fg1);
}

.settings-hint {
  font-size: 11px;
  color: var(--fg3);
}

.settings-input,
.settings-select {
  padding: 6px 10px;
  border: 1px solid var(--border);
  border-radius: var(--r6);
  background: var(--bg1);
  color: var(--fg1);
  font-size: 12px;
  outline: none;
}

.settings-input:focus,
.settings-select:focus {
  border-color: var(--acc);
}

.settings-info {
  font-size: 12px;
  color: var(--fg2);
  line-height: 1.8;
}

/* Toggle 开关 */
.toggle {
  position: relative;
  display: inline-block;
  width: 36px;
  height: 20px;
}

.toggle input {
  opacity: 0;
  width: 0;
  height: 0;
}

.toggle-slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: var(--bg3);
  border-radius: 20px;
  transition: 0.2s;
}

.toggle-slider::before {
  content: '';
  position: absolute;
  height: 14px;
  width: 14px;
  left: 3px;
  bottom: 3px;
  background-color: var(--fg2);
  border-radius: 50%;
  transition: 0.2s;
}

.toggle input:checked + .toggle-slider {
  background-color: var(--acc);
}

.toggle input:checked + .toggle-slider::before {
  transform: translateX(16px);
  background-color: white;
}
</style>
