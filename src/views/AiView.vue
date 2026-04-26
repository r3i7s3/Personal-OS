<script setup>
import { ref, nextTick, onMounted } from 'vue'
import { useAiStore } from '../stores/ai'

const store = useAiStore()
const inputRef = ref(null)
const bubblesRef = ref(null)
const isTyping = ref(false)

const tabs = ['对话', '洞察', '历史']

const shortcuts = [
  { label: '📋 周报总结', text: '总结我这周的项目进展' },
  { label: '✍️ 整理随笔', text: '整理我最近的随心记，找出关键主题' },
  { label: '❤️ 健康评估', text: '分析我本周的健康数据，给出建议' },
  { label: '🗂 今日复盘', text: '帮我做一个今天的项目复盘' },
]

onMounted(async () => {
  if (!store.loaded) await store.load()
  if (store.messages.length === 0) {
    store.addMessage('你好！我可以帮你总结项目进展、分析健康数据、整理随心记，或者聊聊你这周的状态。', false)
  }
})

async function send() {
  const inp = inputRef.value
  if (!inp || !inp.value.trim()) return
  const text = inp.value.trim()
  inp.value = ''
  isTyping.value = true
  await store.sendMessage(text)
  isTyping.value = false
  await nextTick()
  scrollToBottom()
}

function sendShortcut(text) {
  store.setTab('对话')
  if (inputRef.value) inputRef.value.value = text
  send()
}

function scrollToBottom() {
  if (bubblesRef.value) {
    bubblesRef.value.scrollTop = bubblesRef.value.scrollHeight
  }
}

function clearChat() {
  store.clearMessages()
}

function handleKeydown(e) {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault()
    send()
  }
}
</script>

<template>
  <div class="ai-view">
    <!-- Tab 栏 -->
    <div class="ai-tabs">
      <div
        v-for="tab in tabs"
        :key="tab"
        class="ai-tab"
        :class="{ active: store.activeTab === tab }"
        @click="store.setTab(tab)"
      >{{ tab }}</div>
    </div>

    <!-- 对话区 -->
    <div v-show="store.activeTab === '对话'" class="ai-chat-view">
      <!-- 状态栏 -->
      <div class="ai-status-bar">
        <div style="display:flex;align-items:center;gap:8px">
          <div class="ai-status-dot" />
          <span class="ai-model-label">{{ store.modelLabel }}</span>
        </div>
        <div style="display:flex;gap:4px">
          <select
            class="ai-provider-sel"
            :value="store.provider"
            @change="store.setProvider($event.target.value)"
          >
            <option value="ollama">Ollama（本地）</option>
            <option value="openai">OpenAI 兼容</option>
            <option value="custom">自定义 API</option>
          </select>
          <button class="btn btn-sm" @click="clearChat()">清空</button>
        </div>
      </div>

      <!-- 气泡区 -->
      <div class="ai-bubbles" ref="bubblesRef">
        <div
          v-for="(msg, i) in store.messages"
          :key="i"
          class="ai-bubble"
          :class="msg.role === 'user' ? 'ai-user' : 'ai-bot'"
        >{{ msg.content }}</div>

        <!-- 打字指示器 -->
        <div v-if="isTyping" class="ai-bubble ai-bot">
          <span style="opacity:.5;font-style:italic;font-size:12px">思考中…</span>
        </div>
      </div>

      <!-- 快捷指令 -->
      <div class="ai-shortcuts">
        <button
          v-for="s in shortcuts"
          :key="s.text"
          class="tb-btn"
          style="font-size:11px"
          @click="sendShortcut(s.text)"
        >{{ s.label }}</button>
      </div>

      <!-- 输入行 -->
      <div class="ai-input-row">
        <input
          ref="inputRef"
          class="ai-input"
          placeholder="问点什么，或者聊聊今天的状态…"
          @keydown="handleKeydown"
        />
        <button class="btn btn-acc" @click="send()">发送</button>
      </div>
    </div>

    <!-- 洞察区 -->
    <div v-show="store.activeTab === '洞察'" class="ai-insight-view">
      <div class="card insight-card">
        <div style="display:flex;align-items:flex-start;gap:10px;margin-bottom:10px">
          <div style="font-size:22px;flex-shrink:0">🔍</div>
          <div>
            <div style="font-size:13px;font-weight:600;color:var(--fg0);margin-bottom:3px">本月洞察报告</div>
            <div style="font-size:10.5px;color:var(--fg2)">基于 30 条随心记 · 4 个项目 · 健康数据</div>
          </div>
          <div style="margin-left:auto;font-size:10px;color:var(--acc-text)">2026-04-05</div>
        </div>
        <div style="font-size:12.5px;color:var(--fg1);line-height:1.75;margin-bottom:12px">
          <strong style="color:var(--fg0)">你这个月的主要模式：</strong>深度工作集中在上午 9–11 点，下午效率明显下滑；项目推进稳定但复盘频率偏低；运动记录连续两周缺失。<br><br>
          <strong style="color:var(--fg0)">一个你可能没意识到的倾向：</strong>随心记里出现了 7 次「拖延」相关词汇，但实际完成率达 82%——你可能在低估自己的执行力，而非真的拖延。<br><br>
          <strong style="color:var(--fg0)">建议：</strong>在下午 2 点加一个 15 分钟的「微复盘」，把当天进度写一句话，比周末大复盘效果更好。
        </div>
        <button class="btn" style="width:100%;padding:7px;font-size:12px;color:var(--acc-text);border-color:var(--acc)" @click="sendShortcut('请基于我所有的笔记和数据，生成一份详细的洞察报告')">
          重新生成洞察 ↗
        </button>
      </div>

      <!-- 历史洞察 -->
      <div class="insight-section-title">历史洞察</div>
      <div style="display:flex;flex-direction:column;gap:6px">
        <div class="card insight-history-card">
          <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:4px">
            <span style="font-size:12px;font-weight:500;color:var(--fg0)">3月洞察报告</span>
            <span style="font-size:10px;color:var(--fg3)">2026-03-31</span>
          </div>
          <div style="font-size:11px;color:var(--fg2);line-height:1.5">效率瓶颈分析：番茄钟使用频率高但完成率偏低，建议缩短单轮时长…</div>
        </div>
        <div class="card insight-history-card">
          <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:4px">
            <span style="font-size:12px;font-weight:500;color:var(--fg0)">2月洞察报告</span>
            <span style="font-size:10px;color:var(--fg3)">2026-02-28</span>
          </div>
          <div style="font-size:11px;color:var(--fg2);line-height:1.5">发现明显的周期性低效区间（周三下午），睡眠质量与次日专注度强相关…</div>
        </div>
      </div>
    </div>

    <!-- 历史记录区 -->
    <div v-show="store.activeTab === '历史'" class="ai-history-view">
      <div class="card insight-history-card" style="cursor:pointer">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:4px">
          <span style="font-size:12px;font-weight:500;color:var(--fg0)">本周专注时间分析</span>
          <span style="font-size:10px;color:var(--fg3)">昨天</span>
        </div>
        <div style="font-size:11px;color:var(--fg2)">共完成 28 个番茄钟，11.6 小时…</div>
      </div>
      <div class="card insight-history-card" style="cursor:pointer">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:4px">
          <span style="font-size:12px;font-weight:500;color:var(--fg0)">健康评估报告</span>
          <span style="font-size:10px;color:var(--fg3)">3天前</span>
        </div>
        <div style="font-size:11px;color:var(--fg2)">运动频率偏低，睡眠质量优秀，建议…</div>
      </div>
      <div class="card insight-history-card" style="cursor:pointer">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:4px">
          <span style="font-size:12px;font-weight:500;color:var(--fg0)">项目进展周报</span>
          <span style="font-size:10px;color:var(--fg3)">上周</span>
        </div>
        <div style="font-size:11px;color:var(--fg2)">Personal OS 进度 35%，里程碑 2/5 已完成…</div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.ai-view {
  display: flex;
  flex-direction: column;
  height: 100%;
  gap: 0;
}

/* Tabs */
.ai-tabs {
  display: flex;
  gap: 3px;
  margin-bottom: 12px;
  flex-shrink: 0;
}

.ai-tab {
  font-size: 11px;
  padding: 3px 7px;
  border-radius: var(--r4);
  cursor: pointer;
  color: var(--fg2);
  border: 1px solid transparent;
  transition: all .12s;
  user-select: none;
}

.ai-tab.active {
  background: var(--acc-dim);
  color: var(--acc);
  border-color: rgba(26,95,168,.2);
  font-weight: 600;
}

/* Chat view */
.ai-chat-view {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.ai-status-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
  flex-shrink: 0;
}

.ai-status-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: var(--ok);
}

.ai-model-label {
  font-size: 11px;
  color: var(--fg2);
}

.ai-provider-sel {
  background: var(--bg2);
  border: 1px solid var(--border);
  color: var(--fg1);
  padding: 4px 7px;
  border-radius: var(--r6);
  font-size: 11px;
  outline: none;
}

/* Bubbles */
.ai-bubbles {
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding-bottom: 4px;
}

.ai-bubble {
  padding: 8px 12px;
  border-radius: var(--r10);
  margin-bottom: 12px;
  font-size: 13px;
  line-height: 1.6;
  border: 1px solid var(--border);
  position: relative;
  max-width: 85%;
}

.ai-user {
  background: var(--acc-dim);
  margin-left: auto;
  margin-right: 8px;
  border-bottom-right-radius: 4px;
}

.ai-user::after {
  content: '';
  position: absolute;
  right: -6px;
  bottom: 0;
  width: 12px;
  height: 12px;
  background: var(--acc-dim);
  clip-path: polygon(0 0, 0 100%, 100% 100%);
  border-right: 1px solid var(--border);
  border-bottom: 1px solid var(--border);
}

.ai-bot {
  background: var(--bg2);
  margin-left: 8px;
  margin-right: auto;
  border-bottom-left-radius: 4px;
}

.ai-bot::before {
  content: '';
  position: absolute;
  left: -6px;
  bottom: 0;
  width: 12px;
  height: 12px;
  background: var(--bg2);
  clip-path: polygon(100% 0, 0 100%, 100% 100%);
  border-left: 1px solid var(--border);
  border-bottom: 1px solid var(--border);
}

/* Shortcuts */
.ai-shortcuts {
  display: flex;
  gap: 5px;
  flex-wrap: wrap;
  margin: 10px 0 8px;
  flex-shrink: 0;
}

/* Input */
.ai-input-row {
  display: flex;
  gap: 8px;
  flex-shrink: 0;
}

.ai-input {
  flex: 1;
  background: var(--bg2);
  border: 1px solid var(--border2);
  color: var(--fg0);
  padding: 8px 12px;
  border-radius: var(--r10);
  font-size: 13px;
  outline: none;
  font-family: inherit;
  transition: border-color .15s;
}

.ai-input:focus {
  border-color: var(--acc);
}

.ai-input::placeholder {
  color: var(--fg3);
}

/* Insight */
.ai-insight-view {
  overflow-y: auto;
}

.insight-card {
  padding: 14px 16px;
  margin-bottom: 10px;
  background: var(--acc-dim);
  border-color: var(--acc);
}

.insight-section-title {
  font-size: 10.5px;
  font-weight: 600;
  color: var(--fg2);
  letter-spacing: .4px;
  text-transform: uppercase;
  margin-bottom: 8px;
}

.insight-history-card {
  padding: 10px 14px;
  cursor: pointer;
}

/* History */
.ai-history-view {
  display: flex;
  flex-direction: column;
  gap: 8px;
  overflow-y: auto;
}
</style>
