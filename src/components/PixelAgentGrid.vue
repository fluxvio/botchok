<template>
  <div class="pixel-card">
    <div class="pixel-card-header">
      <h2 class="pixel-card-title flex items-center space-x-2">
        <i class="fas fa-microchip text-green-500"></i>
        <span>AGENT MATRIX</span>
        <span class="text-[8px] border border-green-500 px-1">{{ agents.length }} UNITS</span>
      </h2>
    </div>
    
    <div v-if="loading" class="p-12 text-center">
      <i class="fas fa-spinner fa-pulse text-2xl text-green-500"></i>
      <p class="text-xs text-green-500/70 mt-2 pixel-text">LOADING...</p>
    </div>
    
    <div v-else class="p-4">
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div v-for="agent in agents" :key="agent.id" 
             class="border-2 border-green-500 p-3 hover:bg-green-500/5 transition-all relative group">
          <!-- Pixel Corner Decorations -->
          <div class="absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 border-green-500"></div>
          <div class="absolute top-0 right-0 w-2 h-2 border-t-2 border-r-2 border-green-500"></div>
          <div class="absolute bottom-0 left-0 w-2 h-2 border-b-2 border-l-2 border-green-500"></div>
          <div class="absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2 border-green-500"></div>
          
          <div class="flex items-start justify-between mb-2">
            <div class="flex items-center space-x-2">
              <div :class="agent.is_active ? 'bg-green-500' : 'bg-gray-600'" class="w-2 h-2 blink-pixel"></div>
              <h3 class="text-sm font-bold text-green-500 font-mono">{{ agent.name }}</h3>
            </div>
            <span class="text-[8px] px-1 border border-green-500/50 text-green-500/70">
              {{ agent.model?.split('/').pop()?.substring(0, 8) }}
            </span>
          </div>
          
          <p class="text-[10px] text-green-500/70 mb-2 line-clamp-2">{{ agent.description || 'NO DATA' }}</p>
          
          <div class="flex flex-wrap gap-1 mb-2">
            <span v-for="skill in agent.skills?.slice(0, 2)" :key="skill" class="text-[7px] px-1 border border-green-500/30 text-green-500/50">
              {{ skill }}
            </span>
          </div>
          
          <div class="grid grid-cols-3 gap-1 text-center text-[8px] mt-2">
            <div class="border border-green-500/30 p-1">
              <div class="text-green-500/50">TASKS</div>
              <div class="text-green-500">{{ getTaskCount() }}</div>
            </div>
            <div class="border border-green-500/30 p-1">
              <div class="text-green-500/50">LOAD</div>
              <div class="text-green-500">{{ getLoad() }}%</div>
            </div>
            <div class="border border-green-500/30 p-1">
              <div class="text-green-500/50">XP</div>
              <div class="text-green-500">{{ getXP() }}</div>
            </div>
          </div>
          
          <div class="mt-2">
            <div class="flex justify-between text-[7px] mb-0.5">
              <span class="text-green-500/50">POWER</span>
              <span class="text-green-500">{{ getLoad() }}%</span>
            </div>
            <div class="pixel-progress">
              <div class="pixel-progress-fill" :style="{ width: `${getLoad()}%` }"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  agents: Array,
  loading: Boolean
})

const getTaskCount = () => Math.floor(Math.random() * 15) + 1
const getLoad = () => Math.floor(Math.random() * 70) + 20
const getXP = () => Math.floor(Math.random() * 999) + 100
</script>