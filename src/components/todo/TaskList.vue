<script setup>
import { ref, watch, nextTick } from 'vue'
import { useTodoStore, dispDate } from '../../stores/todo'

const store = useTodoStore()

const shouldAnimate = ref(false)

watch(
  () => store.filteredTasks,
  async () => {
    await nextTick()
    if (!store.listAnimated) {
      shouldAnimate.value = true
      store.setListAnimated(true)
      setTimeout(() => { shouldAnimate.value = false }, 500)
    }
  },
  { immediate: true }
)

function getAnimDelay(idx) {
  return shouldAnimate.value ? (idx * 30) + 'ms' : '0ms'
}

function getPriBarColor(t) {
  return t.tag === '娱乐' ? 'var(--purple)' : t.tag === '个人' ? 'var(--acc)' : (store.priColor[t.pri] || 'var(--border2)')
}
</script>

<template>
  <div class="task-list">
    <template v-if="store.filteredTasks.length === 0">
      <div style="font-size:12px;padding:20px 0;text-align:center;color:var(--fg3)">
        没有待办，休息一下 ☕
      </div>
    </template>
    <template v-else>
      <div
        v-for="(t, idx) in store.filteredTasks"
        :key="t.id"
        class="task-wrap"
      >
        <!-- 主行 -->
        <div
          class="task-item"
          :class="{ 'animate-in': shouldAnimate }"
          :style="{ animationDelay: getAnimDelay(idx) }"
          @click="store.expandTask(t.id)"
        >
          <div class="task-pri-bar" :style="{ background: getPriBarColor(t) }" />
          <div
            class="task-check"
            :class="{ done: t.done }"
            @click.stop="store.toggleTask(t.id)"
          />
          <div class="task-text" :class="{ done: t.done }">{{ t.text }}</div>
          <span style="font-size:10px;color:var(--fg3);flex-shrink:0;white-space:nowrap">
            {{ t.date ? dispDate(t.date) : '' }}
          </span>
        </div>

        <!-- 展开详情 -->
        <div v-if="store.expandedId === t.id" class="task-detail">
          <!-- 子待办列表 -->
          <template v-if="t.subtasks && t.subtasks.length > 0">
            <div
              v-for="(sub, si) in t.subtasks"
              :key="si"
              class="subtask-row"
            >
              <div
                class="subtask-check"
                :class="{ done: sub.done }"
                @click.stop="store.toggleSubtask(t.id, si)"
              >✓</div>
              <span
                class="subtask-text"
                :class="{ done: sub.done }"
              >{{ sub.text }}</span>
              <span
                class="subtask-del"
                @click.stop="store.removeSubtask(t.id, si)"
              >✕</span>
            </div>
          </template>
          <div v-else style="font-size:11px;color:var(--fg3);padding:4px 0 8px">
            没有子项目
          </div>

          <!-- 删除按钮 -->
          <div style="display:flex;justify-content:flex-end;margin-top:8px">
            <button
              class="tb-btn"
              style="font-size:10px;color:var(--danger);border-color:var(--danger)"
              @click.stop="store.removeTask(t.id)"
            >删除任务</button>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<style scoped>
.task-list {
  flex: 1;
  overflow-y: auto;
}

.task-wrap {
  cursor: pointer;
}

.task-detail {
  padding: 10px 12px;
  border-top: 1px solid var(--border);
  font-size: 11px;
}

.subtask-row {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 5px 0;
  font-size: 11px;
}

.subtask-check {
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

.subtask-check.done {
  border-color: var(--ok);
  background: var(--ok);
  color: #fff;
}

.subtask-text {
  flex: 1;
  color: var(--fg1);
}

.subtask-text.done {
  color: var(--fg3);
  text-decoration: line-through;
}

.subtask-del {
  cursor: pointer;
  color: var(--fg3);
  font-size: 10px;
  padding: 0 4px;
}
</style>
