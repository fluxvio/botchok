<template>
  <div class="pixel-card">
    <div class="pixel-card-header">
      <h2 class="pixel-card-title flex items-center space-x-2">
        <i class="fas fa-network-wired text-green-500"></i>
        <span>SUBNET TOPOLOGY</span>
        <span class="text-[8px] border border-green-500 px-1">{{ subagents.length }} NODES</span>
      </h2>
    </div>
    
    <div v-if="loading" class="p-12 text-center">
      <i class="fas fa-spinner fa-pulse text-2xl text-green-500"></i>
    </div>
    
    <div v-else class="p-4">
      <!-- Network Visualization -->
      <div class="relative mb-4 min-h-[200px] bg-black/30 border border-green-500/30">
        <svg width="100%" height="200" viewBox="0 0 500 200" class="absolute inset-0">
          <!-- Connection Lines -->
          <line v-for="(conn, idx) in connections" :key="`line-${idx}`" 
                :x1="conn.x1" :y1="conn.y1" :x2="conn.x2" :y2="conn.y2"
                stroke="#22c55e" stroke-width="1" stroke-dasharray="3 3"/>
          
          <!-- Center Hub -->
          <circle cx="250" cy="100" r="20" fill="#1a2a1a" stroke="#22c55e" stroke-width="2"/>
          <text x="250" y="105" text-anchor="middle" fill="#22c55e" font-size="8" font-family="monospace">HUB</text>
          
          <!-- Subagent Nodes -->
          <g v-for="(sub, idx) in subagents.slice(0, 6)" :key="sub.id">
            <circle :cx="nodePositions[idx].x" :cy="nodePositions[idx].y" r="12" 
                    :fill="sub.is_active ? '#1a3a1a' : '#1a1a1a'" 
                    :stroke="sub.is_active ? '#22c55e' : '#555555'" 
                    stroke-width="1.5"/>
            <text :x="nodePositions[idx].x" :y="nodePositions[idx].y + 4" 
                  text-anchor="middle" fill="#22c55e" font-size="7" font-family="monospace">
              {{ sub.name.substring(0, 3) }}
            </text>
          </g>
        </svg>
      </div>
      
      <!-- Subagent Cards Grid -->
      <div class="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-4">
        <div v-for="subagent in subagents" :key="subagent.id" 
             class="border border-green-500/50 p-2 hover:bg-green-500/5 transition-all">
          <div class="flex items-center space-x-2 mb-1">
            <div :class="subagent.is_active ? 'bg-green-500' : 'bg-gray-600'" class="w-1.5 h-1.5 blink-pixel"></div>
            <span class="text-xs font-bold text-green-500 truncate">{{ subagent.name }}</span>
          </div>
          <p class="text-[8px] text-green-500/70 truncate">{{ subagent.description || 'NO DATA' }}</p>
          <div class="flex items-center justify-between mt-1">
            <span class="text-[6px] text-green-500/50">{{ subagent.model?.split('/').pop()?.substring(0, 10) }}</span>
            <span class="text-[8px] text-green-500">{{ getSubnetLoad() }}%</span>
          </div>
          <div class="mt-1">
            <div class="pixel-progress">
              <div class="pixel-progress-fill" :style="{ width: `${getSubnetLoad()}%` }"></div>
            </div>
          </div>
          <div class="mt-1 flex justify-between text-[6px] text-green-500/50">
            <span>LAT: {{ getLatency() }}ms</span>
            <span>PKT: {{ getPackets() }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  subagents: Array,
  loading: Boolean
})

// Node positions for network visualization
const nodePositions = computed(() => {
  const positions = [
    { x: 100, y: 40 },   // top left
    { x: 400, y: 40 },   // top right
    { x: 70, y: 150 },   // bottom left
    { x: 430, y: 150 },  // bottom right
    { x: 180, y: 170 },  // bottom center left
    { x: 320, y: 170 }   // bottom center right
  ]
  return props.subagents.slice(0, 6).map((_, idx) => positions[idx % positions.length])
})

// Connection lines
const connections = computed(() => {
  const conns = []
  nodePositions.value.forEach(pos => {
    conns.push({ x1: 250, y1: 100, x2: pos.x, y2: pos.y })
  })
  return conns
})

const getSubnetLoad = () => Math.floor(Math.random() * 80) + 10
const getLatency = () => Math.floor(Math.random() * 50) + 10
const getPackets = () => Math.floor(Math.random() * 1000) + 100
</script>