<template>
  <div class="pixel-card">
    <div class="pixel-card-header">
      <h2 class="pixel-card-title flex items-center space-x-2">
        <i class="fas fa-columns text-green-500"></i>
        <span>KANBAN BOARD</span>
        <span class="text-[8px] border border-green-500 px-1">{{ totalTasks }} TASKS</span>
      </h2>
    </div>
    
    <div v-if="loading" class="p-12 text-center">
      <i class="fas fa-spinner fa-pulse text-2xl text-green-500"></i>
    </div>
    
    <div v-else class="p-4">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <!-- Todo Column -->
        <div class="border-2 border-green-500 flex flex-col min-h-[500px]">
          <div class="bg-black border-b-2 border-green-500 p-3">
            <div class="flex items-center justify-between">
              <span class="text-xs font-bold text-green-500 pixel-text">📋 TO DO</span>
              <span class="text-[10px] text-green-500/70">{{ todoTasks.length }}</span>
            </div>
          </div>
          <div class="p-3 space-y-3 max-h-[500px] overflow-y-auto flex-1">
            <div v-for="task in todoTasks" :key="task.id" class="border border-green-500/30 p-3 hover:bg-green-500/5">
              <div class="flex flex-col">
                <div class="flex items-start justify-between mb-2">
                  <div class="flex-1">
                    <div class="flex items-center space-x-2 mb-2">
                      <div class="w-1.5 h-1.5 bg-yellow-500"></div>
                      <span class="text-sm font-bold text-green-500">{{ task.title }}</span>
                    </div>
                    <p class="text-[10px] text-green-500/70 line-clamp-2">{{ task.description || 'NO DESCRIPTION' }}</p>
                  </div>
                </div>
                <div class="flex items-center space-x-2 mt-2 text-[8px]">
                  <span :class="priorityClass(task.priority)" class="px-2 py-0.5 border">
                    {{ task.priority?.toUpperCase() }}
                  </span>
                  <span class="text-green-500/50">{{ task.agents?.name || 'UNASSIGNED' }}</span>
                </div>
              </div>
            </div>
            <div v-if="todoTasks.length === 0" class="text-center py-8 text-[8px] text-green-500/50">
              NO TASKS
            </div>
          </div>
        </div>
        
        <!-- In Progress Column - Fixed Overlapping -->
        <div class="border-2 border-green-500 flex flex-col min-h-[500px]">
          <div class="bg-black border-b-2 border-green-500 p-3">
            <div class="flex items-center justify-between">
              <span class="text-xs font-bold text-green-500 pixel-text">⚡ IN PROGRESS</span>
              <span class="text-[10px] text-green-500/70 blink-pixel">{{ inProgressTasks.length }}</span>
            </div>
          </div>
          <div class="p-3 space-y-3 max-h-[500px] overflow-y-auto flex-1">
            <div v-for="task in inProgressTasks" :key="task.id" class="border border-green-500/30 p-3 hover:bg-green-500/5">
              <div class="flex flex-col">
                <!-- Title Section -->
                <div class="flex items-start justify-between mb-2">
                  <div class="flex-1">
                    <div class="flex items-center space-x-2 mb-2">
                      <div class="w-1.5 h-1.5 bg-blue-500 blink-pixel"></div>
                      <span class="text-sm font-bold text-green-500">{{ task.title }}</span>
                    </div>
                    <p class="text-[10px] text-green-500/70 mb-2 line-clamp-2">{{ task.description || 'NO DESCRIPTION' }}</p>
                  </div>
                </div>
                
                <!-- Tags Section -->
                <div class="flex items-center space-x-2 mb-3 text-[8px]">
                  <span :class="priorityClass(task.priority)" class="px-2 py-0.5 border">
                    {{ task.priority?.toUpperCase() }}
                  </span>
                  <span class="text-green-500/50">{{ task.agents?.name || 'UNASSIGNED' }}</span>
                </div>
                
                <!-- Progress Bar Section - Fixed Spacing -->
                <div class="mt-2 pt-2 border-t border-green-500/20">
                  <div class="flex justify-between text-[8px] mb-1">
                    <span class="text-green-500/50">PROGRESS</span>
                    <span class="text-green-500">{{ getProgress(task) }}%</span>
                  </div>
                  <div class="pixel-progress-bar w-full">
                    <div class="pixel-progress-fill" :style="{ width: `${getProgress(task)}%` }"></div>
                  </div>
                </div>
              </div>
            </div>
            <div v-if="inProgressTasks.length === 0" class="text-center py-8 text-[8px] text-green-500/50">
              NO ACTIVE TASKS
            </div>
          </div>
        </div>
        
        <!-- Done Column -->
        <div class="border-2 border-green-500 flex flex-col min-h-[500px]">
          <div class="bg-black border-b-2 border-green-500 p-3">
            <div class="flex items-center justify-between">
              <span class="text-xs font-bold text-green-500 pixel-text">✅ DONE</span>
              <span class="text-[10px] text-green-500/70">{{ completedTasks.length }}</span>
            </div>
          </div>
          <div class="p-3 space-y-3 max-h-[500px] overflow-y-auto flex-1">
            <div v-for="task in completedTasks" :key="task.id" class="border border-green-500/30 p-3 opacity-70 hover:opacity-100">
              <div class="flex flex-col">
                <div class="flex items-start justify-between mb-2">
                  <div class="flex-1">
                    <div class="flex items-center space-x-2 mb-2">
                      <div class="w-1.5 h-1.5 bg-green-500"></div>
                      <span class="text-sm font-bold text-green-500 line-through">{{ task.title }}</span>
                    </div>
                    <p class="text-[10px] text-green-500/50 line-clamp-2">{{ task.description || 'NO DESCRIPTION' }}</p>
                  </div>
                </div>
                <div class="text-[8px] text-green-500/50 mt-2 pt-2 border-t border-green-500/20">
                  {{ formatDate(task.completed_at || task.created_at) }}
                </div>
              </div>
            </div>
            <div v-if="completedTasks.length === 0" class="text-center py-8 text-[8px] text-green-500/50">
              NO COMPLETED TASKS
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  tasks: Array,
  loading: Boolean
})

const totalTasks = computed(() => props.tasks?.length || 0)
const todoTasks = computed(() => props.tasks?.filter(t => t.status === 'pending') || [])
const inProgressTasks = computed(() => props.tasks?.filter(t => t.status === 'in-progress') || [])
const completedTasks = computed(() => props.tasks?.filter(t => t.status === 'completed') || [])

const priorityClass = (priority) => {
  const classes = {
    urgent: 'bg-red-500/20 text-red-500 border-red-500',
    high: 'bg-orange-500/20 text-orange-500 border-orange-500',
    normal: 'bg-blue-500/20 text-blue-500 border-blue-500',
    low: 'bg-gray-500/20 text-gray-500 border-gray-500'
  }
  return classes[priority] || classes.normal
}

const getProgress = (task) => {
  // Check if task has metadata with progress
  if (task.metadata && task.metadata.progress) {
    return parseInt(task.metadata.progress)
  }
  // Generate random progress for demo
  return Math.floor(Math.random() * 100)
}

const formatDate = (date) => {
  if (!date) return '--/--'
  const d = new Date(date)
  return `${d.getMonth()+1}/${d.getDate()} ${d.getHours()}:${String(d.getMinutes()).padStart(2,'0')}`
}
</script>

<style scoped>
/* Pixel Progress Bar Styles */
.pixel-progress-bar {
  height: 8px;
  background: #0a0f0a;
  border: 1px solid #22c55e;
  image-rendering: crisp-edges;
  overflow: hidden;
  width: 100%;
  position: relative;
}

.pixel-progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #22c55e, #4ade80, #22c55e);
  background-size: 200% 100%;
  animation: shimmer 1s linear infinite;
  transition: width 0.1s steps(10);
  position: relative;
}

@keyframes shimmer {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}

/* Line clamp for text overflow */
.line-clamp-2 {
  display: -webkit-box;
  line-clamp: 2;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Ensure consistent spacing */
.border-green-500\/30 {
  border-color: rgba(34, 197, 94, 0.3);
}

.p-3 {
  padding: 0.75rem;
}

.space-y-3 > :not([hidden]) ~ :not([hidden]) {
  margin-top: 0.75rem;
}

.mb-2 {
  margin-bottom: 0.5rem;
}

.mb-3 {
  margin-bottom: 0.75rem;
}

.mt-2 {
  margin-top: 0.5rem;
}

.pt-2 {
  padding-top: 0.5rem;
}
</style>