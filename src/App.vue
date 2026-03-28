<template>
  <div class="min-h-screen pixel-grid-bg">
    <!-- Scanning Line Effect -->
    <div class="scan-line"></div>
    
    <!-- Header -->
    <header class="sticky top-0 z-50 bg-black border-b-2 border-green-500 md:w-[70%] mx-auto">
      <div class="max-w-[2000px] mx-auto px-6 py-3">
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-4">
            <div class="relative">
              <div class="w-12 h-12 bg-black border-2 border-green-500 flex items-center justify-center">
                <i class="fas fa-terminal text-green-500 text-xl"></i>
              </div>
              <div class="absolute -top-1 -right-1 w-2 h-2 bg-green-500 blink-pixel"></div>
            </div>
            <div>
              <h1 class="text-base font-bold pixel-text text-green-500">
                MISSION CONTROL
              </h1>
              <p class="text-[8px] text-green-500/70 mt-1">v2.0 - REAL-TIME MONITORING</p>
            </div>
          </div>
          
          <div class="flex items-center space-x-6">
            <!-- WebSocket Status -->
            <div class="flex items-center space-x-2">
              <div class="relative">
                <div class="w-2 h-2" :class="isConnected ? 'bg-green-500 blink-pixel' : 'bg-red-500'"></div>
                <div v-if="isConnected" class="absolute inset-0 w-2 h-2 bg-green-500 animate-ping"></div>
              </div>
              <span class="text-[10px] text-green-500 pixel-text">
                {{ isConnected ? 'LIVE' : 'CONNECTING...' }}
              </span>
            </div>
            
            <!-- Time Display -->
            <div class="border border-green-500 px-3 py-1">
              <div class="flex items-center space-x-2 text-xs font-mono">
                <i class="fas fa-clock text-green-500"></i>
                <span class="text-green-500">{{ formatTime(lastUpdated) }}</span>
              </div>
            </div>
            
            <!-- Manual Refresh Button (optional) -->
            <button @click="refreshData" class="flex items-center space-x-2 hover:bg-green-500/10 px-2 py-1">
              <i class="fas fa-sync-alt text-green-500 text-xs" :class="{ 'fa-spin': isLoading }"></i>
              <span class="text-[8px] text-green-500/70">REFRESH</span>
            </button>
          </div>
        </div>
      </div>
    </header>

    <!-- Loading Overlay (only on initial load) -->
    <PixelLoader v-if="isLoading && !hasData" />

    <!-- Main Dashboard -->
    <main class="max-w-[2000px] mx-auto px-6 py-6 relative z-10 md:w-[70%] mx-auto" v-else>
      <!-- Stats Grid - Top Row -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <PixelStatCard 
          v-for="stat in statsData" 
          :key="stat.label"
          :label="stat.label"
          :value="stat.value"
          :total="stat.total"
          :icon="stat.icon"
        />
      </div>

      <!-- Second Row: Agent Grid -->
      <div class="mb-6">
        <PixelAgentGrid :agents="agents" :loading="isLoading" />
      </div>

      <!-- Third Row: Donut Chart + Subnet -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        <PixelTokenDonut :tokens="tokens" :loading="isLoading" />
        <PixelSubnetGrid :subagents="subagents" :loading="isLoading" />
      </div>

      <!-- Fourth Row: Kanban Board -->
      <div class="mb-6">
        <PixelKanbanBoard :tasks="tasks" :loading="isLoading" />
      </div>

      <!-- Fifth Row: System Log -->
      <div>
        <PixelSystemLog :logs="logs" :loading="isLoading" />
      </div>
    </main>
    
    <!-- Footer -->
    <div class="fixed bottom-0 left-0 right-0 bg-black border-t border-green-500 px-6 py-1 text-[8px] text-green-500/50 font-mono md:w-[70%] mx-auto">
      <span>> WEBSOCKET CONNECTED - REAL-TIME UPDATES ACTIVE</span>
      <span class="terminal-cursor ml-1"></span>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useDashboard } from './composables/useDashboard'
import PixelLoader from './components/PixelLoader.vue'
import PixelStatCard from './components/PixelStatCard.vue'
import PixelAgentGrid from './components/PixelAgentGrid.vue'
import PixelTokenDonut from './components/PixelTokenDonut.vue'
import PixelSubnetGrid from './components/PixelSubnetGrid.vue'
import PixelKanbanBoard from './components/PixelKanbanBoard.vue'
import PixelSystemLog from './components/PixelSystemLog.vue'

const {
  agents,
  subagents,
  tasks,
  tokens,
  logs,
  isLoading,
  lastUpdated,
  stats,
  isConnected,
  refreshData
} = useDashboard()

const hasData = ref(false)

// Initial load
onMounted(async () => {
  await refreshData()
  hasData.value = true
})

const formatTime = (timestamp) => {
  if (!timestamp) return '00:00:00'
  const date = new Date(timestamp)
  return date.toLocaleTimeString('en-US', { 
    hour: '2-digit', 
    minute: '2-digit',
    second: '2-digit'
  })
}

const formatNumber = (num) => {
  if (!num && num !== 0) return '0'
  const number = Number(num)
  if (isNaN(number)) return '0'
  if (number > 1000000) return (number / 1000000).toFixed(1) + 'M'
  if (number > 1000) return (number / 1000).toFixed(1) + 'K'
  return number.toString()
}

const statsData = computed(() => {
  const activeAgents = stats?.activeAgents || 0
  const totalAgents = agents.value?.length || 0
  const completedTasks = stats?.completedTasks || 0
  const totalTasks = stats?.totalTasks || 0
  const inProgressTasks = stats?.inProgressTasks || 0
  const totalTokens = stats?.totalTokens || 0

  return [
    {
      label: 'AGENTS',
      value: `${activeAgents}/${totalAgents}`,
      icon: 'fas fa-microchip'
    },
    {
      label: 'TASKS DONE',
      value: `${completedTasks}/${totalTasks}`,
      icon: 'fas fa-check-circle'
    },
    {
      label: 'ACTIVE',
      value: inProgressTasks,
      icon: 'fas fa-play'
    },
    {
      label: 'TOKENS',
      value: formatNumber(totalTokens),
      icon: 'fas fa-database'
    }
  ]
})
</script>