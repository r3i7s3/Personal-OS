<script setup>
import { ref, computed } from 'vue'
import { useTodoStore } from '../../stores/todo'
import { useProjectStore } from '../../stores/project'

const store = useTodoStore()
const projStore = useProjectStore()
const inputRef = ref(null)
const selectedProject = ref('')

const tags = ['工作', '设计', '个人', '娱乐']

const displayPri = computed(() => store.priLabel[store.newPri])
const priStyle = computed(() => store.priStyle[store.newPri])

function addTask() {
  const inp = inputRef.value
  if (!inp || !inp.value.trim()) return
  store.addTask(inp.value, null, selectedProject.value)
  inp.value = ''
}

function handleKeydown(e) {
  if (e.key === 'Enter') addTask()
}
</script>

<template>
  <div class="task-input-area">
    <!-- 工具栏 -->
    <div class="task-toolbar">
      <button class="tb-btn" @click="store.setNewDate('today')">今天</button>
      <button class="tb-btn" @click="store.setNewDate('tomorrow')">明天</button>
      <button
        class="tb-btn"
        style="min-width:44px"
        :style="priStyle"
        @click="store.cyclePri()"
      >{{ displayPri }}</button>
      <select
        class="task-tag-sel"
        :value="store.curTagFilter === '已完成' ? '工作' : store.curTagFilter"
        @change="store.curTagFilter = $event.target.value"
      >
        <option v-for="tag in tags" :key="tag" :value="tag">{{ tag }}</option>
      </select>
      <select
        v-if="projStore.projects.length"
        class="task-tag-sel"
        v-model="selectedProject"
      >
        <option value="">无项目</option>
        <option v-for="p in projStore.projects" :key="p.id" :value="p.id">{{ p.name }}</option>
      </select>
    </div>

    <!-- 输入框 -->
    <div class="task-input-wrap">
      <input
        ref="inputRef"
        placeholder="添加待办任务…"
        @keydown="handleKeydown"
      />
      <button class="task-input-btn" @click="addTask()">添加</button>
    </div>
  </div>
</template>

<style scoped>
.task-input-area {
  background: var(--bg1);
  border: 1px solid var(--border);
  border-top: none;
  border-radius: 0 0 var(--r12) var(--r12);
  padding: 8px 10px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.task-toolbar {
  display: flex;
  gap: 4px;
  align-items: center;
  flex-wrap: wrap;
}

.task-tag-sel {
  background: var(--bg1);
  border: 1px solid var(--border);
  border-radius: var(--r6);
  color: var(--fg1);
  font-size: 11px;
  padding: 2px 5px;
  outline: none;
  cursor: pointer;
}
</style>
