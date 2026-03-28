<template>
  <div class="pixel-card p-3">
    <div class="flex items-center justify-between mb-2">
      <span class="text-[10px] text-green-500/70 pixel-text">{{ label }}</span>
      <i :class="`${icon} text-green-500 text-sm`"></i>
    </div>
    <div class="flex items-baseline">
      <span class="text-xl font-bold text-green-500 font-mono">{{ value }}</span>
    </div>
    <div class="mt-2">
      <div class="pixel-progress">
        <div class="pixel-progress-fill" :style="{ width: `${progressPercent}%` }"></div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  label: String,
  value: [Number, String],
  total: Number,
  icon: String
})

const progressPercent = computed(() => {
  if (!props.total) return 0
  const numValue = parseFloat(props.value)
  if (isNaN(numValue)) return 0
  return (numValue / props.total) * 100
})
</script>