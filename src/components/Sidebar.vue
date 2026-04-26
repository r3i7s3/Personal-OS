<script setup>
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import { useTodoStore, dispDate } from '../stores/todo'
import { useJournalStore } from '../stores/journal'

const route = useRoute()
const todoStore = useTodoStore()
const journalStore = useJournalStore()

const searchQuery = ref('')

const curMod = computed(() => {
  if (route.path === '/todo') return 'todo'
  if (route.path === '/journal') return 'journal'
  if (route.path === '/project') return 'project'
  return null
})

const sbTabs = computed(() => {
  if (curMod.value === 'todo') return ['工作', '设计', '个人', '娱乐', '已完成']
  if (curMod.value === 'journal') return ['全部', '随笔', '碎碎念']
  return []
})

const sbItems = computed(() => {
  if (curMod.value === 'todo') {
    const tag = todoStore.curTagFilter
    if (tag === '已完成') {
      return todoStore.tasks.filter(t => t.done).map(t => ({
        t: t.text,
        m: dispDate(t.date),
        dot: t.tag === '娱乐' ? 'var(--purple)' : t.tag === '个人' ? 'var(--acc)' : (todoStore.priColor[t.pri] || 'var(--fg3)'),
      }))
    }
    return todoStore.tasks.filter(t => t.tag === tag && !t.done).map(t => ({
      t: t.text,
      m: dispDate(t.date) + (tag === '工作' || tag === '设计' ? ' · ' + t.pri : ''),
      dot: t.tag === '娱乐' ? 'var(--purple)' : t.tag === '个人' ? 'var(--acc)' : (todoStore.priColor[t.pri] || 'var(--fg3)'),
    }))
  }
  if (curMod.value === 'journal') {
    return journalStore.filteredEntries
  }
  return []
})

const filteredItems = computed(() => {
  if (!searchQuery.value) return sbItems.value
  const q = searchQuery.value.toLowerCase()
  return sbItems.value.filter(item => item.t.toLowerCase().includes(q))
})

// 时间分组
const groupedItems = computed(() => {
  if (curMod.value !== 'journal') return null
  const groups = {}
  for (const item of filteredItems.value) {
    const g = item._group || '其他'
    if (!groups[g]) groups[g] = []
    groups[g].push(item)
  }
  return groups
})

function selectTab(tab) {
  if (curMod.value === 'todo') todoStore.setTag(tab)
  if (curMod.value === 'journal') journalStore.setCat(tab)
}

function selectItem(item) {
  if (curMod.value === 'journal' && item._id) {
    journalStore.setCurrent(item._id)
  }
}
</script>

<template>
  <div class="sb-sidebar">
    <div class="sb-search">
      <input v-model="searchQuery" type="text" placeholder="搜索…" />
    </div>

    <div class="sb-tabs" v-if="sbTabs.length">
      <div
        v-for="tab in sbTabs"
        :key="tab"
        class="sb-tab"
        :class="{
          active: (curMod === 'todo' && todoStore.curTagFilter === tab) ||
                  (curMod === 'journal' && journalStore.curCat === tab)
        }"
        @click="selectTab(tab)"
      >{{ tab }}</div>
    </div>

    <!-- 日记日期筛选 -->
    <div v-if="curMod === 'journal'" class="sb-date-filter">
      <input
        type="date"
        class="sb-date-input"
        :value="journalStore.filterDate"
        @change="journalStore.setFilterDate($event.target.value)"
      />
      <button
        v-if="journalStore.filterDate"
        class="sb-date-clear"
        @click="journalStore.setFilterDate('')"
      >✕</button>
    </div>

    <div class="sb-list">
      <!-- 日记：按时间分组 -->
      <template v-if="curMod === 'journal' && groupedItems">
        <template v-for="(items, group) in groupedItems" :key="group">
          <div class="sb-group-label">{{ group }}</div>
          <div
            v-for="(item, i) in items"
            :key="item._id || i"
            class="sb-item"
            :class="{ active: journalStore.currentId === item._id }"
            @click="selectItem(item)"
          >
            <div class="sb-item-title">{{ item.t }}</div>
            <div class="sb-item-meta">
              <span v-if="item.dot" class="sb-dot" :style="{ background: item.dot }" />
              <span>{{ item.m }}</span>
            </div>
          </div>
        </template>
      </template>

      <!-- 其他模块：平铺 -->
      <template v-else>
        <div
          v-for="(item, i) in filteredItems"
          :key="i"
          class="sb-item"
        >
          <div class="sb-item-title">{{ item.t }}</div>
          <div class="sb-item-meta">
            <span v-if="item.dot" class="sb-dot" :style="{ background: item.dot }" />
            <span>{{ item.m }}</span>
          </div>
        </div>
      </template>

      <div v-if="filteredItems.length === 0" style="font-size:11px;color:var(--fg3);padding:10px 0;text-align:center">
        没有项目
      </div>
    </div>
  </div>
</template>

<style scoped>
.sb-sidebar {
  width: 220px;
  flex-shrink: 0;
  background: var(--bg2);
  border-right: 1px solid var(--border);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.sb-dot {
  width: 5px;
  height: 5px;
  border-radius: 50%;
  flex-shrink: 0;
}

.sb-group-label {
  font-size: 10px;
  font-weight: 600;
  letter-spacing: .6px;
  text-transform: uppercase;
  color: var(--fg3);
  padding: 6px 10px 2px;
  margin-top: 2px;
}

.sb-date-filter {
  display: flex;
  gap: 4px;
  padding: 0 10px 8px;
  align-items: center;
}

.sb-date-input {
  flex: 1;
  background: var(--bg1);
  border: 1px solid var(--border2);
  color: var(--fg1);
  padding: 4px 6px;
  border-radius: var(--r6);
  font-size: 11px;
  outline: none;
}

.sb-date-input:focus {
  border-color: var(--acc);
}

.sb-date-clear {
  background: none;
  border: none;
  color: var(--fg3);
  cursor: pointer;
  font-size: 10px;
  padding: 2px 4px;
}

.sb-date-clear:hover {
  color: var(--danger);
}
</style>
