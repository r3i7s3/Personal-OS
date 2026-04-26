<script setup>
import { onMounted } from 'vue'
import { useHealthStore } from '../stores/health'

const store = useHealthStore()

onMounted(async () => {
  if (!store.loaded) await store.load()
})

function trendBars(vals, max, color) {
  const days = ['一','二','三','四','五','六','日']
  return vals.map((v, i) => {
    const h = Math.max(2, Math.round(v / max * 100))
    const c = h >= 80 ? 'var(--ok)' : h >= 50 ? color : 'var(--bg3)'
    return { h, c, label: days[i], delay: (i * 40) + 'ms' }
  })
}

function trendAvg(vals, decimals = 0) {
  return (vals.reduce((a, b) => a + b, 0) / 7).toFixed(decimals)
}
</script>

<template>
  <div class="health-view" v-if="store.data">
    <!-- Row 1: 综合评分 + AI评估 + 健康贴士 -->
    <div class="h-row1">
      <!-- 综合评分 -->
      <div class="card">
        <div class="card-title">综合评分</div>
        <div style="display:flex;align-items:flex-end;gap:6px;margin-bottom:6px">
          <div class="score-num" :style="{ color: store.scoreColor }">{{ store.score }}</div>
          <div v-if="store.yesterdayScore !== null" style="display:flex;flex-direction:column;gap:2px;padding-bottom:4px">
            <div v-if="store.score !== store.yesterdayScore" style="display:flex;align-items:center;gap:3px">
              <span style="font-size:15px;font-weight:700" :style="{ color: store.score > store.yesterdayScore ? 'var(--ok)' : 'var(--danger)' }">
                {{ store.score > store.yesterdayScore ? '↑' : '↓' }}
              </span>
              <span style="font-size:12px;font-weight:600" :style="{ color: store.score > store.yesterdayScore ? 'var(--ok)' : 'var(--danger)' }">
                {{ store.score > store.yesterdayScore ? '+' : '' }}{{ store.score - store.yesterdayScore }} 分
              </span>
            </div>
            <span style="font-size:10px;color:var(--fg3)">较昨日</span>
          </div>
        </div>
        <!-- 进度条 -->
        <div style="display:flex;flex-direction:column;gap:5px">
          <div v-for="bar in store.bars" :key="bar.label" class="score-bar-row">
            <span class="score-bar-label">{{ bar.label }}</span>
            <div class="score-bar-track">
              <div class="score-bar-fill" :style="{ width: bar.pct + '%', background: bar.color }" />
            </div>
            <span class="score-bar-val">{{ bar.pct }}%</span>
          </div>
        </div>
      </div>

      <!-- AI 健康评估 -->
      <div class="card" style="display:flex;flex-direction:column">
        <div class="card-title">AI 健康评估</div>
        <div style="font-size:12.5px;color:var(--fg1);line-height:1.75;flex:1">{{ store.aiText }}</div>
      </div>

      <!-- 健康贴士 -->
      <div class="card" style="display:flex;flex-direction:column;gap:8px">
        <div style="font-size:10px;font-weight:700;color:var(--fg2);letter-spacing:.8px;text-transform:uppercase">今日健康贴士</div>
        <div style="font-size:13px;color:var(--fg0);line-height:1.7;flex:1">
          久坐 90 分钟后站起来活动 5 分钟，可有效降低腰背疼痛风险，并显著提升下午的专注力与心情。
        </div>
        <div style="font-size:10px;color:var(--fg3)">💡 每天更新</div>
      </div>
    </div>

    <!-- Row 2: 五小卡 -->
    <div class="h-row2">
      <!-- 喝水 -->
      <div class="h-metric" style="animation-delay:0ms">
        <div class="h-metric-icon">💧</div>
        <div class="h-metric-label">喝水</div>
        <div class="h-metric-val">
          <span class="n" style="color:var(--acc-text)">{{ store.data.water.cups }}</span>
          <span class="u">/ {{ store.data.water.goal }} 杯</span>
        </div>
        <div class="h-metric-bar">
          <div class="h-metric-bar-fill" :style="{ width: Math.min(100, Math.round(store.data.water.cups / store.data.water.goal * 100)) + '%', background: 'var(--acc-soft)' }" />
        </div>
        <div style="display:flex;flex-direction:column;gap:4px">
          <button class="h-metric-btn" @click="store.add('water', 1)">+ 一杯</button>
          <button class="h-metric-btn" @click="store.add('water', -1)">− 一杯</button>
        </div>
      </div>

      <!-- 运动 -->
      <div class="h-metric" style="animation-delay:60ms">
        <div class="h-metric-icon">🏃</div>
        <div class="h-metric-label">运动</div>
        <div class="h-metric-val">
          <span class="n" style="color:var(--ok)">{{ store.data.exercise.minutes }}</span>
          <span class="u">/ {{ store.data.exercise.goal }} 分钟</span>
        </div>
        <div class="h-metric-bar">
          <div class="h-metric-bar-fill" :style="{ width: Math.min(100, Math.round(store.data.exercise.minutes / store.data.exercise.goal * 100)) + '%', background: 'var(--ok)' }" />
        </div>
        <div style="display:flex;flex-direction:column;gap:4px">
          <button class="h-metric-btn" @click="store.add('exercise', 15)">+ 15 min</button>
          <button class="h-metric-btn" @click="store.add('exercise', -15)">− 15 min</button>
        </div>
      </div>

      <!-- 睡眠 -->
      <div class="h-metric" style="animation-delay:120ms">
        <div class="h-metric-icon">🌙</div>
        <div class="h-metric-label">睡眠</div>
        <div class="h-metric-val">
          <span class="n" style="color:var(--purple)">{{ store.data.sleep.hours }}</span>
          <span class="u">/ {{ store.data.sleep.goal }} 小时</span>
        </div>
        <div class="h-metric-bar">
          <div class="h-metric-bar-fill" :style="{ width: Math.min(100, Math.round(store.data.sleep.hours / store.data.sleep.goal * 100)) + '%', background: 'var(--purple)' }" />
        </div>
        <div style="display:flex;flex-direction:column;gap:5px">
          <div style="display:flex;align-items:center;gap:6px;font-size:10px">
            <span style="color:var(--fg3);font-weight:600;width:28px">BED</span>
            <input type="time" :value="store.data.sleep.start" @change="store.setSleep('start', $event.target.value)" class="sleep-input" />
          </div>
          <div style="display:flex;align-items:center;gap:6px;font-size:10px">
            <span style="color:var(--fg3);font-weight:600;width:28px">WAKE</span>
            <input type="time" :value="store.data.sleep.end" @change="store.setSleep('end', $event.target.value)" class="sleep-input" />
          </div>
        </div>
      </div>

      <!-- 冥想 -->
      <div class="h-metric" style="animation-delay:180ms">
        <div class="h-metric-icon">🧘</div>
        <div class="h-metric-label">冥想</div>
        <div class="h-metric-val">
          <span class="n" style="color:var(--purple)">{{ store.data.meditation.minutes }}</span>
          <span class="u">/ {{ store.data.meditation.goal }} 分钟</span>
        </div>
        <div class="h-metric-bar">
          <div class="h-metric-bar-fill" :style="{ width: Math.min(100, Math.round(store.data.meditation.minutes / store.data.meditation.goal * 100)) + '%', background: 'var(--purple)' }" />
        </div>
        <div style="display:flex;flex-direction:column;gap:4px">
          <button class="h-metric-btn" @click="store.add('meditation', 5)">+ 5 min</button>
          <button class="h-metric-btn" @click="store.add('meditation', -5)">− 5 min</button>
        </div>
      </div>

      <!-- 番茄钟 -->
      <div class="card h-metric" style="animation-delay:240ms">
        <div style="font-size:18px;margin-bottom:4px">🍅</div>
        <div style="font-size:10px;color:var(--fg2);margin-bottom:6px">今日专注</div>
        <div style="font-size:22px;font-weight:700;color:var(--tomato);line-height:1;margin-bottom:2px">{{ store.pomodoroCount }}</div>
        <div style="font-size:10px;color:var(--fg3);margin-bottom:8px">个番茄</div>
        <div style="display:flex;gap:3px;flex-wrap:wrap">
          <div
            v-for="i in 8"
            :key="i"
            class="pomo-dot"
            :class="{ on: i <= store.pomodoroCount }"
          />
        </div>
        <div style="font-size:11px;color:var(--fg2);margin-top:8px">{{ store.data.focus.minutes }} 分钟</div>
      </div>
    </div>

    <!-- Row 3: 趋势图 -->
    <div class="trend-grid">
      <!-- 专注 -->
      <div class="trend-card">
        <div class="trend-title">专注 · 近 7 天</div>
        <div class="trend-bars">
          <div v-for="(bar, i) in trendBars(store.trendDays.map(x => x.focus), 120, 'var(--tomato)')" :key="i" class="trend-col">
            <div class="trend-col-bar" :style="{ height: bar.h + '%', background: bar.c, animationDelay: bar.delay }" />
            <div class="trend-col-label">{{ bar.label }}</div>
          </div>
        </div>
        <div class="trend-summary">近 7 天均 <b style="color:var(--tomato)">{{ trendAvg(store.trendDays.map(x => x.focus), 0) }} min</b></div>
      </div>

      <!-- 喝水 -->
      <div class="trend-card">
        <div class="trend-title">喝水 · 近 7 天</div>
        <div class="trend-bars">
          <div v-for="(bar, i) in trendBars(store.trendDays.map(x => x.water), 10, 'var(--acc-soft)')" :key="i" class="trend-col">
            <div class="trend-col-bar" :style="{ height: bar.h + '%', background: bar.c, animationDelay: bar.delay }" />
            <div class="trend-col-label">{{ bar.label }}</div>
          </div>
        </div>
        <div class="trend-summary">近 7 天均 <b style="color:var(--acc-soft)">{{ trendAvg(store.trendDays.map(x => x.water), 1) }} 杯</b></div>
      </div>

      <!-- 睡眠 -->
      <div class="trend-card">
        <div class="trend-title">睡眠 · 近 7 天</div>
        <div class="trend-bars">
          <div v-for="(bar, i) in trendBars(store.trendDays.map(x => x.sleep), 10, 'var(--purple)')" :key="i" class="trend-col">
            <div class="trend-col-bar" :style="{ height: bar.h + '%', background: bar.c, animationDelay: bar.delay }" />
            <div class="trend-col-label">{{ bar.label }}</div>
          </div>
        </div>
        <div class="trend-summary">近 7 天均 <b style="color:var(--purple)">{{ trendAvg(store.trendDays.map(x => x.sleep), 1) }} h</b></div>
      </div>

      <!-- 运动 -->
      <div class="trend-card">
        <div class="trend-title">运动 · 近 7 天</div>
        <div class="trend-bars">
          <div v-for="(bar, i) in trendBars(store.trendDays.map(x => x.exercise), 60, '#5e4db8')" :key="i" class="trend-col">
            <div class="trend-col-bar" :style="{ height: bar.h + '%', background: bar.c, animationDelay: bar.delay }" />
            <div class="trend-col-label">{{ bar.label }}</div>
          </div>
        </div>
        <div class="trend-summary">近 7 天均 <b style="color:#5e4db8">{{ trendAvg(store.trendDays.map(x => x.exercise), 0) }} min</b></div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.health-view {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

/* Row 1 */
.h-row1 {
  display: grid;
  grid-template-columns: 200px 1fr 220px;
  gap: 10px;
}

/* Row 2 */
.h-row2 {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 10px;
}

/* Score */
.score-num {
  font-size: 52px;
  font-weight: 700;
  line-height: 1;
  letter-spacing: -3px;
  transition: color .4s;
}

.score-bar-row {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 10px;
}

.score-bar-label {
  color: var(--fg2);
  width: 26px;
  flex-shrink: 0;
}

.score-bar-track {
  flex: 1;
  height: 4px;
  background: var(--bg3);
  border-radius: 2px;
  overflow: hidden;
}

.score-bar-fill {
  height: 100%;
  border-radius: 2px;
  transition: width .5s;
}

.score-bar-val {
  width: 28px;
  text-align: right;
  font-weight: 500;
  color: var(--fg1);
}

/* Metric cards */
.h-metric {
  background: var(--bg1);
  border: 1px solid var(--border);
  border-radius: var(--r12);
  padding: 14px;
  box-shadow: var(--sh);
  display: flex;
  flex-direction: column;
  animation: metric-in .3s both;
}

@keyframes metric-in {
  from { opacity: 0; transform: translateY(12px); }
  to { opacity: 1; transform: translateY(0); }
}

.h-metric-icon { font-size: 22px; margin-bottom: 5px; }
.h-metric-label { font-size: 11px; color: var(--fg2); margin-bottom: 6px; font-weight: 500; }
.h-metric-val { display: flex; align-items: baseline; gap: 3px; margin-bottom: 3px; }
.h-metric-val .n { font-size: 28px; font-weight: 700; line-height: 1; }
.h-metric-val .u { font-size: 11px; color: var(--fg3); }
.h-metric-bar { height: 3px; background: var(--bg3); border-radius: 2px; overflow: hidden; margin-bottom: 10px; }
.h-metric-bar-fill { height: 100%; border-radius: 2px; transition: width .6s cubic-bezier(.4,0,.2,1); }

.h-metric-btn {
  width: 100%; padding: 6px; background: var(--bg1);
  border: 1px solid var(--border2); border-radius: var(--r8);
  cursor: pointer; font-size: 12px; font-family: inherit;
  color: var(--fg1); box-shadow: var(--sh); transition: all .12s;
}
.h-metric-btn:hover { background: var(--bg2); color: var(--fg0); }

.sleep-input {
  width: 80px; padding: 3px 4px;
  border: 1px solid var(--border); border-radius: 4px;
  background: var(--bg2); color: var(--fg1); font-size: 11px;
}

/* Pomo dots */
.pomo-dot {
  width: 10px; height: 10px; border-radius: 2px;
  background: var(--bg3);
}
.pomo-dot.on { background: var(--tomato); }

/* Trends */
.trend-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}

.trend-card {
  background: var(--bg1);
  border: 1px solid var(--border);
  border-radius: var(--r12);
  padding: 13px 16px;
  box-shadow: var(--sh);
}

.trend-title {
  font-size: 11px; font-weight: 600; color: var(--fg2);
  letter-spacing: .4px; text-transform: uppercase; margin-bottom: 8px;
}

.trend-bars {
  display: flex; align-items: flex-end; gap: 4px; height: 80px;
}

.trend-col {
  flex: 1; display: flex; flex-direction: column;
  align-items: center; gap: 3px;
}

.trend-col-bar {
  width: 100%; border-radius: 3px 3px 0 0;
  transition: height .4s;
  animation: bar-in .4s both;
  transform-origin: bottom;
}

@keyframes bar-in {
  from { transform: scaleY(0); }
  to { transform: scaleY(1); }
}

.trend-col-label { font-size: 10px; color: var(--fg3); }

.trend-summary {
  font-size: 11px; color: var(--fg2); margin-top: 8px;
}
.trend-summary b { font-weight: 600; }
</style>
