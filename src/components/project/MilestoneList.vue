<script setup>
import { ref, watch, nextTick } from 'vue'
import { useProjectStore } from '../../stores/project'

const store = useProjectStore()

const isAdding = ref(false)
const newTitle = ref('')
const inputRef = ref(null)
const listRef = ref(null)

// 动画控制：只在首次渲染时播放动画
const shouldAnimate = ref(false)

watch(
  () => store.currentProject?.milestones,
  async () => {
    await nextTick()
    if (!store.milestonesAnimated) {
      shouldAnimate.value = true
      store.setMilestonesAnimated(true)
      // 动画结束后移除类名，避免后续干扰
      setTimeout(() => { shouldAnimate.value = false }, 500)
    }
  },
  { immediate: true }
)

function toggleState(msIndex) {
  store.toggleMilestone(msIndex)
}

function startAdd() {
  if (isAdding.value) return
  isAdding.value = true
  newTitle.value = ''
  nextTick(() => inputRef.value?.focus())
}

function confirmAdd() {
  if (!newTitle.value.trim()) return
  store.addMilestone(newTitle.value)
  isAdding.value = false
  newTitle.value = ''
}

function cancelAdd() {
  isAdding.value = false
  newTitle.value = ''
}

function removeMs(msIndex) {
  store.removeMilestone(msIndex)
}

function getAnimDelay(index) {
  return shouldAnimate.value ? (index * 40) + 'ms' : '0ms'
}
</script>

<template>
  <div class="ms-list" ref="listRef">
    <TransitionGroup name="ms">
      <template v-for="(ms, idx) in store.currentProject?.milestones || []" :key="ms.t + idx">
        <!-- 里程碑行 -->
        <div
          class="ms-row"
          :class="{ 'animate-in': shouldAnimate }"
          :style="{ animationDelay: getAnimDelay(idx) }"
          @click="toggleState(idx)"
          @mouseenter="ms._hover = true"
          @mouseleave="ms._hover = false"
        >
          <!-- 节点 -->
          <div class="ms-node" :class="ms.done ? 'done' : ms.active ? 'active' : 'pending'" />

          <!-- 内容 -->
          <div class="ms-content">
            <div class="ms-title" :class="{ done: ms.done, active: ms.active }">
              {{ ms.t }}
            </div>
            <div class="ms-tag" :class="{ done: ms.done, active: ms.active }">
              {{ ms.done ? '完成' : ms.active ? '进行中' : '' }}
            </div>
          </div>

          <!-- 删除按钮 -->
          <span
            class="ms-del"
            @click.stop="removeMs(idx)"
          >✕</span>
        </div>

        <!-- 子任务 -->
        <div
          v-for="(sub, si) in ms.subs"
          :key="ms.t + '-sub-' + si"
          class="ms-sub"
          :class="{ 'animate-in': shouldAnimate }"
          :style="{ animationDelay: getAnimDelay(idx) }"
        >
          <div class="ms-sub-dot" />
          <div>{{ sub }}</div>
        </div>
      </template>
    </TransitionGroup>

    <!-- 添加输入框 -->
    <div v-if="isAdding" class="ms-add-row">
      <input
        ref="inputRef"
        v-model="newTitle"
        class="ms-add-input"
        placeholder="里程碑名称…"
        @keyup.enter="confirmAdd"
        @keyup.escape="cancelAdd"
      />
      <button class="ms-add-btn ok" @click="confirmAdd">✓</button>
      <button class="ms-add-btn" @click="cancelAdd">✕</button>
    </div>
  </div>

  <button class="ms-add-trigger" @click="startAdd">+ 添加里程碑</button>
</template>

<style scoped>
/* ═══ 里程碑列表 ═══ */
.ms-list {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 0;
  padding-left: 18px;
}

/* 垂直轴线 */
.ms-list::before {
  content: '';
  position: absolute;
  left: 6px;
  top: 8px;
  bottom: 8px;
  width: 1px;
  background: var(--border2);
}

.ms-row {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 7px 0;
  cursor: pointer;
  position: relative;
  transition: opacity 0.12s;
}

.ms-row:hover {
  opacity: 0.85;
}

/* 只在首次渲染时播放动画 */
.ms-row.animate-in {
  animation: ms-in 0.25s both;
}

.ms-sub.animate-in {
  animation: ms-in 0.25s both;
}

@keyframes ms-in {
  from { opacity: 0; transform: translateX(-6px); }
  to { opacity: 1; transform: translateX(0); }
}

/* 节点 */
.ms-node {
  width: 13px;
  height: 13px;
  border-radius: 50%;
  flex-shrink: 0;
  margin-top: 1px;
  margin-left: -18px;
  border: 2px solid;
  transition: all 0.15s;
  position: relative;
  z-index: 1;
  background: var(--bg1);
}

.ms-node.done {
  background: var(--ok);
  border-color: var(--ok);
}

.ms-node.active {
  background: var(--acc);
  border-color: var(--acc);
  box-shadow: 0 0 0 3px var(--acc-dim);
}

.ms-node.pending {
  border-color: var(--border2);
  background: var(--bg1);
}

/* 内容 */
.ms-content {
  flex: 1;
  min-width: 0;
}

.ms-title {
  font-size: 12px;
  color: var(--fg1);
  line-height: 1.4;
  font-weight: 500;
}

.ms-title.done {
  text-decoration: line-through;
  color: var(--fg3);
}

.ms-title.active {
  color: var(--fg0);
  font-weight: 600;
}

.ms-tag {
  font-size: 10px;
  color: var(--fg3);
}

.ms-tag.active {
  color: var(--acc-text);
}

.ms-tag.done {
  color: var(--ok);
}

/* 删除按钮 */
.ms-del {
  position: absolute;
  right: 0;
  top: 7px;
  cursor: pointer;
  color: var(--fg3);
  font-size: 10px;
  opacity: 0;
  transition: opacity 0.15s;
  padding: 0 4px;
}

.ms-row:hover .ms-del {
  opacity: 1;
}

/* 子任务 */
.ms-sub {
  padding: 4px 0 4px 4px;
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: var(--fg2);
}

.ms-sub-dot {
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background: var(--border2);
  flex-shrink: 0;
}

/* 添加输入框 */
.ms-add-row {
  display: flex;
  gap: 6px;
  margin-top: 6px;
  padding-left: 0;
}

.ms-add-input {
  flex: 1;
  padding: 5px 8px;
  border: 1px solid var(--border);
  border-radius: var(--r6);
  background: var(--bg1);
  color: var(--fg1);
  font-size: 11px;
  outline: none;
}

.ms-add-input:focus {
  border-color: var(--acc);
}

.ms-add-btn {
  font-size: 10px;
  padding: 4px 8px;
  border: 1px solid var(--border);
  border-radius: var(--r6);
  background: var(--bg2);
  color: var(--fg2);
  cursor: pointer;
}

.ms-add-btn.ok {
  color: var(--ok);
  border-color: var(--ok);
}

/* 添加按钮 */
.ms-add-trigger {
  margin-top: 8px;
  font-size: 11px;
  padding: 5px 10px;
  border: 1px solid var(--border);
  border-radius: var(--r6);
  background: var(--bg2);
  color: var(--fg2);
  cursor: pointer;
  transition: all 0.12s;
}

.ms-add-trigger:hover {
  border-color: var(--acc);
  color: var(--acc-text);
}

/* TransitionGroup 动画 */
.ms-enter-active {
  animation: ms-in 0.25s both;
}

.ms-leave-active {
  animation: ms-in 0.2s reverse both;
}
</style>
