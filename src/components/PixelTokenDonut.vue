<template>
  <div class="pixel-card">
    <div class="pixel-card-header">
      <h2 class="pixel-card-title flex items-center space-x-2">
        <i class="fas fa-chart-pie text-green-500"></i>
        <span>TOKEN DISTRIBUTION</span>
      </h2>
    </div>
    
    <div v-if="loading" class="p-12 text-center">
      <i class="fas fa-spinner fa-pulse text-2xl text-green-500"></i>
    </div>
    
    <div v-else class="p-4">
      <div class="flex flex-col items-center">
        <!-- Donut Chart Canvas -->
        <canvas ref="donutChart" width="200" height="200" class="w-48 h-48"></canvas>
        
        <!-- Total Tokens Display -->
        <div class="mt-4 text-center">
          <div class="text-2xl font-bold text-green-500">{{ totalTokensFormatted }}</div>
          <div class="text-[8px] text-green-500/70">TOTAL TOKENS</div>
          <div class="text-[8px] text-green-500/50 mt-1">≈ ${{ totalCost.toFixed(2) }}</div>
        </div>
        
        <!-- Legend -->
        <div class="mt-4 grid grid-cols-2 gap-2 w-full">
          <div v-for="(item, idx) in tokenData" :key="idx" class="flex items-center space-x-2 text-[8px]">
            <div class="w-2 h-2" :style="{ backgroundColor: item.color }"></div>
            <span class="text-green-500/70">{{ item.name }}</span>
            <span class="text-green-500">{{ item.percentage }}%</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'

const props = defineProps({
  tokens: Array,
  loading: Boolean
})

const donutChart = ref(null)
let chartInstance = null

const totalTokens = computed(() => {
  return props.tokens.reduce((sum, t) => sum + (t?.total_tokens || 0), 0)
})

const totalCost = computed(() => {
  return props.tokens.reduce((sum, t) => sum + (t?.total_cost || 0), 0)
})

const totalTokensFormatted = computed(() => {
  const num = totalTokens.value
  if (num > 1000000) return (num / 1000000).toFixed(1) + 'M'
  if (num > 1000) return (num / 1000).toFixed(1) + 'K'
  return num.toString()
})

const tokenData = computed(() => {
  const agentTokens = {}
  props.tokens.forEach(token => {
    const name = token.agents?.name || 'Unknown'
    agentTokens[name] = (agentTokens[name] || 0) + (token.total_tokens || 0)
  })
  
  const total = totalTokens.value
  const colors = ['#22c55e', '#4ade80', '#86efac', '#bbf7d0', '#dcfce7']
  
  return Object.entries(agentTokens).map(([name, value], idx) => ({
    name: name.substring(0, 12),
    value,
    percentage: total > 0 ? ((value / total) * 100).toFixed(1) : 0,
    color: colors[idx % colors.length]
  }))
})

const drawDonutChart = () => {
  if (!donutChart.value) return
  
  const canvas = donutChart.value
  const ctx = canvas.getContext('2d')
  const centerX = canvas.width / 2
  const centerY = canvas.height / 2
  const radius = 80
  const startAngle = -Math.PI / 2
  
  ctx.clearRect(0, 0, canvas.width, canvas.height)
  
  if (tokenData.value.length === 0) {
    ctx.beginPath()
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2)
    ctx.fillStyle = '#1a2a1a'
    ctx.fill()
    ctx.strokeStyle = '#22c55e'
    ctx.lineWidth = 2
    ctx.stroke()
    return
  }
  
  let currentAngle = startAngle
  tokenData.value.forEach((item, idx) => {
    const angle = (item.percentage / 100) * Math.PI * 2
    const endAngle = currentAngle + angle
    
    ctx.beginPath()
    ctx.arc(centerX, centerY, radius, currentAngle, endAngle)
    ctx.lineTo(centerX, centerY)
    ctx.fillStyle = item.color
    ctx.fill()
    ctx.strokeStyle = '#000000'
    ctx.lineWidth = 1
    ctx.stroke()
    
    currentAngle = endAngle
  })
  
  // Draw inner circle for donut hole
  ctx.beginPath()
  ctx.arc(centerX, centerY, 45, 0, Math.PI * 2)
  ctx.fillStyle = '#000000'
  ctx.fill()
  ctx.strokeStyle = '#22c55e'
  ctx.lineWidth = 2
  ctx.stroke()
}

onMounted(() => {
  drawDonutChart()
})

watch(() => props.tokens, () => {
  setTimeout(() => drawDonutChart(), 100)
}, { deep: true })
</script>