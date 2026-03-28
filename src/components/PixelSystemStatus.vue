<!-- src/components/PixelSystemStatus.vue -->
<template>
  <div class="pixel-card">
    <div class="pixel-card-header">
      <h2 class="pixel-card-title flex items-center space-x-2">
        <i class="fas fa-heartbeat text-green-500"></i>
        <span>SYSTEM STATUS</span>
      </h2>
    </div>
    
    <div class="p-4 space-y-3">
      <!-- Health Bar -->
      <div>
        <div class="flex justify-between text-xs mb-1">
          <span class="text-green-500/70">CORE HEALTH</span>
          <span class="text-green-500">{{ health }}%</span>
        </div>
        <div class="pixel-progress">
          <div class="pixel-progress-fill" :style="{ width: `${health}%` }"></div>
        </div>
      </div>
      
      <!-- Performance Metrics -->
      <div class="space-y-2">
        <div>
          <div class="flex justify-between text-[10px] mb-0.5">
            <span class="text-green-500/70">THROUGHPUT</span>
            <span class="text-green-500">{{ metrics.throughput }}/min</span>
          </div>
          <div class="pixel-progress">
            <div class="pixel-progress-fill" :style="{ width: `${(metrics.throughput / 100) * 100}%` }"></div>
          </div>
        </div>
        
        <div>
          <div class="flex justify-between text-[10px] mb-0.5">
            <span class="text-green-500/70">LATENCY</span>
            <span class="text-green-500">{{ metrics.latency }}ms</span>
          </div>
          <div class="pixel-progress">
            <div class="pixel-progress-fill" :style="{ width: `${(1 - metrics.latency / 500) * 100}%` }"></div>
          </div>
        </div>
        
        <div>
          <div class="flex justify-between text-[10px] mb-0.5">
            <span class="text-green-500/70">SUCCESS RATE</span>
            <span class="text-green-500">{{ metrics.successRate }}%</span>
          </div>
          <div class="pixel-progress">
            <div class="pixel-progress-fill" :style="{ width: `${metrics.successRate}%` }"></div>
          </div>
        </div>
      </div>
      
      <!-- System Info -->
      <div class="border-t border-green-500/30 pt-2 mt-2">
        <div class="grid grid-cols-2 gap-2 text-[8px]">
          <div>
            <span class="text-green-500/50">UPTIME</span>
            <div class="text-green-500">{{ uptime }}</div>
          </div>
          <div>
            <span class="text-green-500/50">NODES</span>
            <div class="text-green-500">{{ nodes }}</div>
          </div>
        </div>
      </div>
      
      <!-- Terminal Line -->
      <div class="bg-black border border-green-500 p-1 text-center">
        <div class="text-[7px] text-green-500/70 font-mono">
          > SYSTEM READY
          <span class="terminal-cursor ml-1"></span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const props = defineProps({
  health: Number,
  metrics: Object
})

const uptime = ref('12d 4h 23m')
const nodes = ref(8)
</script>