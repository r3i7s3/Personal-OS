<script setup>
import { useTodoStore, dispDate } from '../../stores/todo'

const store = useTodoStore()

function getDotColor(t) {
  return t.tag === '娱乐' ? 'var(--purple)' : t.tag === '个人' ? 'var(--acc)' : (store.priColor[t.pri] || 'var(--acc)')
}
</script>

<template>
  <div class="day-tasks-card">
    <div class="card-title" id="cal-day-label">
      {{ store.selDate ? dispDate(store.selDate) + (store.selDate === new Date().toISOString().slice(0,10) ? ' · 今天' : '') : '今天' }}
    </div>
    <div class="day-tasks-list">
      <template v-if="store.dayTasks.length === 0">
        <div style="font-size:11px;padding:10px 0;color:var(--fg3)">
          当天没有待办
        </div>
      </template>
      <template v-else>
        <div
          v-for="t in store.dayTasks"
          :key="t.id"
          class="day-task-wrap"
        >
          <!-- 主行 -->
          <div
            class="day-task-row"
            @click="store.expandCalDay(t.id)"
          >
            <div class="day-task-dot" :style="{ background: getDotColor(t) }" />
            <span class="day-task-text">{{ t.text }}</span>
            <span class="day-task-tag">{{ t.tag }}</span>
          </div>

          <!-- 展开子待办 -->
          <div v-if="store.calExpandedId === t.id" class="day-task-detail">
            <template v-if="t.subtasks && t.subtasks.length > 0">
              <div
                v-for="(sub, si) in t.subtasks"
                :key="si"
                class="day-sub-row"
              >
                <div
                  class="day-sub-check"
                  :class="{ done: sub.done }"
                  @click.stop="store.toggleSubtask(t.id, si)"
                >✓</div>
                <span
                  class="day-sub-text"
                  :class="{ done: sub.done }"
                >{{ sub.text }}</span>
              </div>
            </template>
            <div v-else style="color:var(--fg3);font-size:10px;padding:2px 0">
              无子待办
            </div>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<style scoped>
.day-tasks-card {
  background: var(--bg1);
  border: 1px solid var(--border);
  border-radius: var(--r12);
  padding: 16px 20px;
  box-shadow: var(--sh);
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  height: 100%;
}

.day-tasks-list {
  flex: 1;
  overflow-y: auto;
}

.day-task-wrap {
  border-bottom: 1px solid var(--border);
}

.day-task-row {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 0;
  font-size: 12px;
  cursor: pointer;
}

.day-task-dot {
  width: 5px;
  height: 5px;
  border-radius: 50%;
  flex-shrink: 0;
}

.day-task-text {
  flex: 1;
  color: var(--fg1);
}

.day-task-tag {
  font-size: 10px;
  color: var(--fg3);
}

.day-task-detail {
  padding: 8px 10px;
  background: var(--bg2);
  border-radius: 0 0 var(--r8) var(--r8);
  margin: 0 -4px;
  font-size: 11px;
}

.day-sub-row {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 3px 0;
  font-size: 11px;
}

.day-sub-check {
  width: 14px;
  height: 14px;
  border-radius: 50%;
  border: 1.5px solid var(--border2);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 8px;
  background: transparent;
  color: transparent;
  flex-shrink: 0;
  transition: all .15s;
}

.day-sub-check.done {
  border-color: var(--ok);
  background: var(--ok);
  color: #fff;
}

.day-sub-text {
  flex: 1;
  color: var(--fg1);
}

.day-sub-text.done {
  color: var(--fg3);
  text-decoration: line-through;
}
</style>
