<script setup>
import { useTodoStore } from '../../stores/todo'

const store = useTodoStore()

function selectDate(cell) {
  if (cell.isOtherMonth) return
  store.setDate(cell.dateStr)
}
</script>

<template>
  <div class="cal-card">
    <!-- 导航栏 -->
    <div class="cal-nav">
      <button class="cal-nav-btn" @click="store.calNav(-1)">‹</button>
      <div class="cal-label">{{ store.calLabel }}</div>
      <button class="cal-nav-btn" @click="store.calNav(1)">›</button>
    </div>

    <!-- 星期标题 -->
    <div class="cal-weekdays">
      <div class="cal-wd">日</div>
      <div class="cal-wd">一</div>
      <div class="cal-wd">二</div>
      <div class="cal-wd">三</div>
      <div class="cal-wd">四</div>
      <div class="cal-wd">五</div>
      <div class="cal-wd">六</div>
    </div>

    <!-- 日历格子 -->
    <div class="cal-grid">
      <div
        v-for="(cell, i) in store.calGrid"
        :key="i"
        class="cal-cell"
        :class="{
          'today': cell.isToday,
          'other-month': cell.isOtherMonth,
          'selected': cell.isSelected
        }"
        @click="selectDate(cell)"
      >
        <div class="cal-num">
          <div v-if="cell.isToday" class="cal-today-badge">{{ cell.day }}</div>
          <template v-else>{{ cell.day }}</template>
        </div>
        <!-- 事件点 -->
        <template v-for="ev in cell.events" :key="ev.t">
          <div class="cal-event">
            <div class="cal-ev-dot" :style="{ background: store.typeColor[ev.type] }" />
            <span>・{{ ev.t }}</span>
          </div>
        </template>
        <!-- 项目日期标记 -->
        <template v-for="p in cell.projEvents" :key="p.name">
          <div class="cal-event">
            <div class="cal-ev-dot" style="background:var(--purple)" />
            <span>・{{ p.label }}</span>
          </div>
        </template>
        <!-- 更多 -->
        <div v-if="cell.events.length + cell.projEvents.length > 1" class="cal-more">
          +{{ cell.events.length + cell.projEvents.length - 1 }}
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.cal-card {
  padding: 10px 12px 8px;
  flex: 2;
  min-height: 0;
  display: flex;
  flex-direction: column;
  background: var(--bg1);
  border: 1px solid var(--border);
  border-radius: var(--r12);
  box-shadow: var(--sh);
}

.cal-nav {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 6px;
  flex-shrink: 0;
}

.cal-label {
  font-size: 13px;
  font-weight: 700;
  color: var(--fg0);
}

.cal-weekdays {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 2px;
  margin-bottom: 2px;
  flex-shrink: 0;
}

.cal-grid {
  flex: 1;
  align-content: stretch;
}
</style>
