<template>
  <div class="pixel-card">
    <div class="pixel-card-header">
      <div class="flex items-center justify-between">
        <h2 class="pixel-card-title flex items-center space-x-2">
          <i class="fas fa-terminal text-green-500"></i>
          <span>SYSTEM LOG</span>
          <span class="text-[8px] blink-pixel">LIVE STREAM</span>
        </h2>
        <div class="flex items-center space-x-2 text-[8px]">
          <span class="text-green-500/70">{{ logs.length }} ENTRIES</span>
          <button @click="clearLogs" class="pixel-button text-[8px] px-2 py-0.5">CLEAR</button>
        </div>
      </div>
    </div>
    
    <div v-if="loading" class="p-12 text-center">
      <i class="fas fa-spinner fa-pulse text-2xl text-green-500"></i>
    </div>
    
    <div v-else class="bg-black/50 font-mono max-h-[300px] overflow-y-auto">
      <div v-for="log in visibleLogs" :key="log.id" class="p-2 border-b border-green-500/10 hover:bg-green-500/5">
        <div class="flex items-start gap-3">
          <div class="flex-shrink-0">
            <span class="text-sm text-green-500">{{ getLogIcon(log.status) }}</span>
          </div>
          <div class="flex-1">
            <div class="flex items-baseline justify-between gap-2 flex-wrap">
              <span class="text-xs font-bold" :class="log.status === 'success' ? 'text-green-400' : 'text-red-400'">
                [{{ log.action.toUpperCase() }}]
              </span>
              <span class="text-[8px] text-green-500/50">{{ formatTime(log.created_at) }}</span>
            </div>
            <p class="text-[10px] text-green-500/70">
              <span v-if="log.agents?.name" class="text-green-400">[{{ log.agents.name }}]</span>
              <span v-if="log.tasks?.title"> {{ log.tasks.title }}</span>
              <span v-if="log.details?.message"> {{ log.details.message }}</span>
              <span v-if="!log.agents?.name && !log.tasks?.title && !log.details?.message"> System event detected</span>
            </p>
            <div v-if="log.error_message" class="mt-1 text-[8px] text-red-500">
              ⚠ {{ log.error_message }}
            </div>
            <div class="mt-1 text-[6px] text-green-500/30 font-mono">
              {{ getTimestamp(log.created_at) }}
            </div>
          </div>
        </div>
      </div>
      <div v-if="visibleLogs.length === 0" class="text-center py-8 text-green-500/50 text-xs">
        > NO LOG ENTRIES
        <span class="terminal-cursor ml-1"></span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  logs: Array,
  loading: Boolean
})

const maxLogs = ref(50)

const visibleLogs = computed(() => {
  return props.logs?.slice(0, maxLogs.value) || []
})

const clearLogs = () => {
  maxLogs.value = 20
  setTimeout(() => {
    maxLogs.value = 50
  }, 100)
}

const getLogIcon = (status) => {
  return status === 'success' ? '>' : '!'
}

const formatTime = (date) => {
  if (!date) return '--:--:--'
  const d = new Date(date)
  return `${d.getHours().toString().padStart(2,'0')}:${d.getMinutes().toString().padStart(2,'0')}:${d.getSeconds().toString().padStart(2,'0')}`
}

const getTimestamp = (date) => {
  if (!date) return ''
  const d = new Date(date)
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')} ${formatTime(date)}`
}
</script>