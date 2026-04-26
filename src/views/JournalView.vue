<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useJournalStore } from '../stores/journal'

const store = useJournalStore()
const editorTa = ref(null)
const viewTa = ref(null)

onMounted(async () => {
  if (!store.loaded) await store.load()
})

const todayDate = computed(() => {
  const n = new Date()
  return (n.getMonth() + 1) + '月' + n.getDate() + '日'
})

const isViewMode = computed(() => store.currentId !== null)
const currentEntry = computed(() => store.currentEntry)

function saveNew() {
  const ta = editorTa.value
  if (!ta || !ta.value.trim()) return
  store.createEntry(ta.value)
  ta.value = ''
}

function saveEdit() {
  if (!store.currentId) return
  const ta = viewTa.value
  if (!ta) return
  store.updateEntry(store.currentId, ta.value)
}

function openEntry(id) {
  store.setCurrent(id)
}

function newEntry() {
  store.setCurrent(null)
}

function deleteEntry() {
  if (!store.currentId) return
  store.deleteEntry(store.currentId)
}
</script>

<template>
  <div class="journal-view">
    <!-- 无选中：全屏新建 -->
    <div v-if="!isViewMode" class="journal-blank">
      <!-- header -->
      <div class="journal-header">
        <div>
          <div class="journal-date">{{ todayDate }}</div>
          <div class="journal-sub">写点什么吧</div>
        </div>
        <div class="journal-header-right">
          <button class="btn btn-acc btn-sm" @click="saveNew()">保存</button>
        </div>
      </div>

      <!-- 心情 + 标签 -->
      <div class="journal-mood-row">
        <div class="mood-picker">
          <span class="mood-label">心情</span>
          <span
            v-for="m in store.moods"
            :key="m"
            class="mood-opt"
            :class="{ active: store.curMood === m }"
            @click="store.pickMood(m)"
          >{{ m }}</span>
        </div>
        <div class="tag-picker">
          <span
            v-for="tag in store.tags"
            :key="tag"
            class="jtag"
            :class="{ 'active-tag': store.activeTags.includes(tag) }"
            @click="store.toggleTag(tag)"
          >{{ tag }}</span>
        </div>
      </div>

      <textarea
        ref="editorTa"
        class="editor-ta"
        placeholder="今天发生了什么，或者随便写点什么……"
      />
    </div>

    <!-- 有选中：查看/编辑 -->
    <div v-else class="journal-view-mode">
      <div class="journal-header">
        <div>
          <div class="journal-date">{{ currentEntry?.title }}</div>
          <div class="journal-sub">
            {{ currentEntry?.weather }} · {{ currentEntry?.mood }} · {{ currentEntry?.tags?.join('、') }}
          </div>
        </div>
        <div class="journal-header-right">
          <button class="btn btn-sm" style="margin-right:6px" @click="newEntry()">+ 新建</button>
          <button
            class="btn btn-sm"
            style="margin-right:6px;color:var(--danger);border-color:var(--danger)"
            @click="deleteEntry()"
          >删除</button>
          <button class="btn btn-acc btn-sm" @click="saveEdit()">保存</button>
        </div>
      </div>

      <textarea
        ref="viewTa"
        class="editor-ta"
        :value="currentEntry?.content"
      />
    </div>
  </div>
</template>

<style scoped>
.journal-view {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.journal-blank,
.journal-view-mode {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.journal-header {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
  flex-shrink: 0;
}

.journal-date {
  font-size: 13px;
  font-weight: 600;
  color: var(--fg0);
}

.journal-sub {
  font-size: 11px;
  color: var(--fg2);
  margin-top: 2px;
}

.journal-header-right {
  text-align: right;
  white-space: nowrap;
}

.btn-sm {
  padding: 4px 10px;
  font-size: 12px;
}

.journal-mood-row {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
  flex-shrink: 0;
}

.mood-picker {
  white-space: nowrap;
}

.mood-label {
  font-size: 11px;
  color: var(--fg2);
  margin-right: 8px;
}

.mood-opt {
  font-size: 17px;
  cursor: pointer;
  opacity: .35;
  transition: opacity .15s;
  margin-right: 2px;
}

.mood-opt.active {
  opacity: 1;
}

.tag-picker {
  text-align: right;
  white-space: nowrap;
}

.jtag {
  font-size: 10px;
  padding: 3px 9px;
  border-radius: 12px;
  cursor: pointer;
  background: var(--bg3);
  color: var(--fg2);
  border: 1px solid var(--border);
  transition: all .12s;
  user-select: none;
  margin-left: 4px;
}

.jtag.active-tag {
  background: var(--acc-dim);
  color: var(--acc-text);
  border-color: var(--acc);
}

.editor-ta {
  width: 100%;
  min-height: 420px;
  resize: none;
  font-size: 13.5px;
  line-height: 1.85;
  display: block;
  flex: 1;
  background: var(--bg1);
  color: var(--fg0);
  border: 1px solid var(--border);
  border-radius: var(--r8);
  padding: 12px 14px;
  outline: none;
  font-family: inherit;
}

.editor-ta:focus {
  border-color: var(--acc);
}

.editor-ta::placeholder {
  color: var(--fg3);
}
</style>
