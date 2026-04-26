<script setup>
import { onMounted } from 'vue'
import { useTodoStore } from '../stores/todo'
import Calendar from '../components/todo/Calendar.vue'
import TaskList from '../components/todo/TaskList.vue'
import TaskInput from '../components/todo/TaskInput.vue'
import DayTasks from '../components/todo/DayTasks.vue'

const store = useTodoStore()

const tags = ['工作', '设计', '个人', '娱乐', '已完成']

onMounted(async () => {
  if (!store.loaded) {
    await store.load()
  }
})
</script>

<template>
  <div class="todo-view">
    <!-- 上：月历 -->
    <Calendar />

    <!-- 下：两列 -->
    <div class="todo-bottom">
      <!-- 左列：全部待办 -->
      <div class="todo-left-col">
        <div class="todo-list-card">
          <div class="card-title" id="todo-label">
            {{ store.curTagFilter }} · {{ store.filteredTasks.length }} 项
          </div>
          <TaskList />
        </div>
        <TaskInput />
      </div>

      <!-- 右列：选中日待办 -->
      <DayTasks />
    </div>
  </div>
</template>

<style scoped>
.todo-view {
  display: flex;
  flex-direction: column;
  gap: 10px;
  height: 100%;
}

.todo-bottom {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  flex: 1;
  min-height: 0;
  align-items: stretch;
}

.todo-left-col {
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.todo-list-card {
  background: var(--bg1);
  border: 1px solid var(--border);
  border-radius: var(--r12) var(--r12) 0 0;
  box-shadow: var(--sh);
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  margin-bottom: 0;
  padding: 16px 20px;
}
</style>
