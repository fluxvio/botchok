<template>
  <div class="min-h-screen flex items-center justify-center p-8">
    <!-- Carbon Style Terminal -->
    <div class="terminal-container">
      <!-- Terminal Window -->
      <div class="terminal-window">
        <!-- macOS Window Controls -->
        <div class="terminal-header">
          <div class="window-controls">
            <div class="window-btn close"></div>
            <div class="window-btn minimize"></div>
            <div class="window-btn maximize"></div>
          </div>
          <div class="terminal-title">
            <span class="text-xs font-mono text-gray-500">mission-control — zsh</span>
          </div>
          <div class="terminal-actions">
            <button 
              @click="toggleMockData" 
              class="toggle-mock-btn group relative px-2 py-1 rounded-md transition-all duration-200"
              :class="useMockData ? 'bg-blue-50 text-blue-600' : 'bg-gray-100 text-gray-500'"
              :title="useMockData ? 'Using mock data - Click to switch to real data' : 'Using real data - Click to switch to mock data'"
            >
              <div class="flex items-center gap-1.5">
                <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <span class="text-xs font-mono font-medium">{{ useMockData ? 'MOCK' : 'LIVE' }}</span>
              </div>
              <!-- Tooltip -->
              <div class="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-[10px] font-mono rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10">
                {{ useMockData ? 'Using mock data' : 'Using real data' }}
              </div>
            </button>
            <svg class="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v16h16" />
            </svg>
          </div>
        </div>
        
        <!-- Terminal Content - Carbon Theme -->
        <div class="terminal-content" ref="terminalContent">
          <div class="terminal-logs">
            <!-- Header Info -->
            <div class="text-gray-500 mb-2 font-mono text-xs">Last update: {{ formatFullDate(lastUpdated) }} on ttys002</div>
            <div class="terminal-prompt mb-4">
              <span class="text-gray-700">➜</span>
              <span class="text-blue-600"> ~/mission-control </span>
              <span class="text-purple-600">botchok:(main) </span>
              <span class="text-gray-500">$</span>
            </div>
            
            <!-- System Status Messages -->
            <div class="system-messages space-y-1 mb-4">
              <div class="text-green-600 font-mono text-sm">[SYSTEM] Mission Control Terminal v1.0</div>
              <div class="text-green-600 font-mono text-sm">[SYSTEM] WebSocket connected to Supabase</div>
            </div>
            
            <div class="separator mb-4">
              <span class="text-gray-300 text-xs">━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━</span>
            </div>
            
            <!-- Real-time Logs -->
            <div v-for="log in logs" :key="log.id" class="log-entry">
              <div class="log-line">
                <span class="log-timestamp text-gray-400">{{ formatTimeShort(log.created_at) }}</span>
                <span class="log-action text-blue-600 font-semibold">{{ log.action.toUpperCase() }}</span>
                <span v-if="log.agents?.name" class="log-agent text-orange-600">[{{ log.agents.name }}]</span>
                <span class="log-message text-gray-700">{{ log.tasks?.title || log.details?.message || log.entity_type || 'system event' }}</span>
                <span v-if="log.status === 'success'" class="log-status text-green-600">✓</span>
                <span v-else-if="log.status === 'pending'" class="log-status text-yellow-500">•</span>
                <span v-else-if="log.status === 'running'" class="log-status text-blue-500">⟳</span>
                <span v-else-if="log.status === 'error'" class="log-status text-red-500">✗</span>
              </div>
              <div v-if="log.error_message" class="log-error text-red-500 text-xs mt-1 ml-28">
                └─ error: {{ log.error_message }}
              </div>
            </div>
            
            <!-- Empty State -->
            <div v-if="logs.length === 0" class="text-center text-gray-400 py-12">
              <div class="text-3xl mb-3">⌨️</div>
              <div class="text-sm font-mono">Waiting for system events...</div>
              <div class="text-xs text-gray-400 mt-2">Real-time logs will appear here</div>
            </div>
          </div>
        </div>
        
        <!-- Terminal Status Bar -->
        <div class="terminal-footer">
          <div class="flex items-center space-x-4 text-xs">
            <div class="flex items-center space-x-1">
              <div class="w-2 h-2 rounded-full bg-green-500"></div>
              <span class="text-gray-600 font-mono">LIVE</span>
            </div>
            <div class="text-gray-400">|</div>
            <div class="text-gray-600 font-mono">{{ logs.length }} entries</div>
            <div class="text-gray-400">|</div>
            <div class="text-gray-600 font-mono">{{ activeAgents }}/{{ totalAgents }} agents</div>
            <div class="text-gray-400">|</div>
            <div class="text-gray-600 font-mono">{{ formatNumber(totalTokens) }} tokens</div>
            <div class="text-gray-400">|</div>
            <div class="text-gray-600 font-mono">${{ totalCost.toFixed(2) }} cost</div>
          </div>
          <div class="text-gray-500 font-mono text-xs">
            {{ formatTimeShort(lastUpdated) }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch, nextTick } from 'vue'
import { useDashboard } from './composables/useDashboard'

const {
  agents,
  logs,
  lastUpdated,
  stats,
  useMockData,
  refreshData
} = useDashboard()

const terminalContent = ref(null)

onMounted(async () => {
  await refreshData()
})

// Auto-scroll to bottom when new logs arrive
watch(() => logs.value.length, async () => {
  await nextTick()
  if (terminalContent.value) {
    terminalContent.value.scrollTop = terminalContent.value.scrollHeight
  }
})

const toggleMockData = () => {
  useMockData.value = !useMockData.value
  refreshData()
}

const formatFullDate = (timestamp) => {
  if (!timestamp) return '--:--:--'
  const date = new Date(timestamp)
  return date.toLocaleString('en-US', { 
    weekday: 'short', 
    month: 'short', 
    day: 'numeric',
    hour: '2-digit', 
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  }).replace(',', '')
}

const formatTimeShort = (timestamp) => {
  if (!timestamp) return '--:--:--'
  const date = new Date(timestamp)
  return `${date.getHours().toString().padStart(2,'0')}:${date.getMinutes().toString().padStart(2,'0')}:${date.getSeconds().toString().padStart(2,'0')}`
}

const formatNumber = (num) => {
  if (!num && num !== 0) return '0'
  const number = Number(num)
  if (isNaN(number)) return '0'
  if (number > 1000000) return (number / 1000000).toFixed(1) + 'M'
  if (number > 1000) return (number / 1000).toFixed(1) + 'K'
  return number.toString()
}

// Computed stats
const activeAgents = computed(() => stats.value?.activeAgents || 0)
const totalAgents = computed(() => agents.value?.length || 0)
const totalTokens = computed(() => stats.value?.totalTokens || 0)
const totalCost = computed(() => stats.value?.totalCost || 0)
</script>

<style scoped>
.terminal-container {
  width: 100%;
  max-width: 1000px;
  height: 600px;
  box-shadow: 0 20px 35px -10px rgba(0, 0, 0, 0.1);
}

.terminal-window {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  height: 100%;
  border: 1px solid #e5e7eb;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

/* Terminal Header - macOS Style */
.terminal-header {
  background: #f9fafb;
  padding: 12px 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid #e5e7eb;
}

.window-controls {
  display: flex;
  align-items: center;
  gap: 8px;
}

.window-btn {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  transition: all 0.2s ease;
  cursor: pointer;
}

.window-btn.close {
  background: #ff5f56;
  border: 1px solid #e0443e;
}

.window-btn.minimize {
  background: #ffbd2e;
  border: 1px solid #df9f23;
}

.window-btn.maximize {
  background: #27c93f;
  border: 1px solid #1aab2f;
}

.window-btn:hover {
  filter: brightness(0.9);
  transform: scale(1.05);
}

.terminal-title {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  color: #6b7280;
  font-size: 11px;
  font-family: 'SF Mono', 'JetBrains Mono', 'Monaco', monospace;
  font-weight: 500;
}

.terminal-actions {
  width: 40px;
  display: flex;
  justify-content: flex-end;
  cursor: pointer;
  opacity: 0.5;
  transition: opacity 0.2s;
}

.terminal-actions:hover {
  opacity: 1;
}

/* Terminal Content */
.terminal-content {
  background: white;
  color: #1f2937;
  overflow-y: auto;
  flex: 1;
  font-family: 'SF Mono', 'JetBrains Mono', 'Monaco', 'Menlo', monospace;
  font-size: 13px;
  line-height: 1.6;
}

.terminal-logs {
  padding: 24px;
}

/* Custom Scrollbar - Clean Style */
.terminal-content::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

.terminal-content::-webkit-scrollbar-track {
  background: #f3f4f6;
  border-radius: 4px;
}

.terminal-content::-webkit-scrollbar-thumb {
  background: #d1d5db;
  border-radius: 4px;
}

.terminal-content::-webkit-scrollbar-thumb:hover {
  background: #9ca3af;
}

/* Terminal Prompt */
.terminal-prompt {
  font-family: 'SF Mono', monospace;
  font-size: 13px;
  margin-bottom: 20px;
  padding: 4px 0;
}

/* System Messages */
.system-messages {
  margin-bottom: 20px;
}

.system-messages > div {
  font-size: 13px;
  line-height: 1.5;
}

/* Separator */
.separator {
  margin: 16px 0;
}

.separator span {
  font-family: monospace;
  font-size: 10px;
  letter-spacing: 0.5px;
}

/* Log Entries */
.log-entry {
  margin-bottom: 8px;
  animation: fadeInUp 0.2s ease-out;
  border-left: 2px solid transparent;
  padding-left: 12px;
  margin-left: -12px;
  transition: all 0.2s ease;
}

.log-entry:hover {
  border-left-color: #3b82f6;
  background: #f9fafb;
}

.log-line {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  gap: 8px;
  font-size: 13px;
  font-family: 'SF Mono', monospace;
}

.log-timestamp {
  font-size: 11px;
  font-family: monospace;
  color: #9ca3af;
  flex-shrink: 0;
}

.log-action {
  font-weight: 600;
  color: #2563eb;
  flex-shrink: 0;
}

.log-agent {
  color: #ea580c;
  flex-shrink: 0;
}

.log-message {
  color: #374151;
  flex: 1;
  word-break: break-word;
}

.log-status {
  font-weight: bold;
  flex-shrink: 0;
}

.log-error {
  font-family: monospace;
  padding-left: 28px;
  margin-top: 4px;
  font-size: 11px;
}

/* Terminal Footer - Like Carbon Status Bar */
.terminal-footer {
  background: #f9fafb;
  border-top: 1px solid #e5e7eb;
  padding: 8px 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 11px;
  font-family: 'SF Mono', monospace;
}

/* Animations */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(4px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Text Colors - Carbon Theme */
.text-green-600 {
  color: #059669;
}

.text-blue-600 {
  color: #2563eb;
}

.text-purple-600 {
  color: #7c3aed;
}

.text-orange-600 {
  color: #ea580c;
}

.text-gray-700 {
  color: #374151;
}

.text-gray-500 {
  color: #6b7280;
}

.text-gray-400 {
  color: #9ca3af;
}

.text-gray-300 {
  color: #d1d5db;
}

.text-red-500 {
  color: #ef4444;
}
</style>