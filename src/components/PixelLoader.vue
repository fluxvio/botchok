<template>
  <div class="fixed inset-0 bg-black z-50 flex items-center justify-center">
    <!-- CRT Scan Effect -->
    <div class="absolute inset-0 pointer-events-none">
      <div class="absolute top-0 left-0 w-full h-0.5 bg-green-500/30 animate-scan"></div>
    </div>
    
    <!-- Flicker Effect -->
    <div class="absolute inset-0 pointer-events-none animate-flicker"></div>
    
    <!-- Main Loader Container -->
    <div class="relative">
      <!-- Pixel Border Container -->
      <div class="pixel-loader-container p-8 relative">
        <!-- Pixel Grid Background -->
        <div class="absolute inset-0 grid grid-cols-8 gap-0.5 opacity-10">
          <div v-for="i in 64" :key="i" class="bg-green-500 h-full"></div>
        </div>
        
        <!-- Animated Pixel Logo -->
        <div class="relative mb-6">
          <!-- Outer Ring -->
          <div class="w-32 h-32 mx-auto relative">
            <div class="absolute inset-0 border-4 border-green-500 animate-pulse-slow"></div>
            
            <!-- Inner Pixel Grid -->
            <div class="absolute inset-2 grid grid-cols-4 gap-0.5">
              <div v-for="i in 16" :key="i" 
                   class="bg-green-500/30 animate-pixel-blink"
                   :style="{ animationDelay: `${i * 0.05}s` }">
              </div>
            </div>
            
            <!-- Center Icon -->
            <div class="absolute inset-0 flex items-center justify-center">
              <i class="fas fa-terminal text-3xl text-green-500 animate-pulse"></i>
            </div>
            
            <!-- Scanning Line -->
            <div class="absolute top-0 left-0 w-full h-0.5 bg-green-500 animate-scan-line"></div>
          </div>
        </div>
        
        <!-- Loading Text with Pixel Effect -->
        <div class="text-center space-y-3">
          <div class="relative">
            <h2 class="text-green-500 text-sm font-mono tracking-wider pixel-text">
              INITIALIZING SYSTEMS
            </h2>
            <div class="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-32 h-0.5 bg-green-500/50"></div>
          </div>
          
          <!-- Animated Dots -->
          <div class="flex justify-center space-x-1 mt-2">
            <div class="w-2 h-2 bg-green-500 bounce-pixel" style="animation-delay: 0s"></div>
            <div class="w-2 h-2 bg-green-500 bounce-pixel" style="animation-delay: 0.2s"></div>
            <div class="w-2 h-2 bg-green-500 bounce-pixel" style="animation-delay: 0.4s"></div>
            <div class="w-2 h-2 bg-green-500 bounce-pixel" style="animation-delay: 0.6s"></div>
          </div>
        </div>
        
        <!-- Progress Bar -->
        <div class="mt-6 w-64">
          <div class="flex justify-between text-[10px] text-green-500/70 mb-1 font-mono">
            <span>LOADING SEQUENCE</span>
            <span>{{ progress }}%</span>
          </div>
          <div class="pixel-progress-bar">
            <div class="pixel-progress-fill" :style="{ width: `${progress}%` }"></div>
          </div>
        </div>
        
        <!-- Status Messages -->
        <div class="mt-4 space-y-1 text-[10px] font-mono text-green-500/50">
          <p v-for="(msg, idx) in visibleMessages" :key="idx" class="animate-fade-in">
            > {{ msg }}
          </p>
          <p class="inline-flex items-center">
            > _
            <span class="terminal-cursor ml-1"></span>
          </p>
        </div>
      </div>
      
      <!-- Pixel Corners -->
      <div class="absolute -top-1 -left-1 w-4 h-4 border-t-2 border-l-2 border-green-500"></div>
      <div class="absolute -top-1 -right-1 w-4 h-4 border-t-2 border-r-2 border-green-500"></div>
      <div class="absolute -bottom-1 -left-1 w-4 h-4 border-b-2 border-l-2 border-green-500"></div>
      <div class="absolute -bottom-1 -right-1 w-4 h-4 border-b-2 border-r-2 border-green-500"></div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const progress = ref(0)
const messages = ref([
  'BOOT SEQUENCE INITIATED',
  'CALIBRATING NEURAL NETWORKS',
  'SYNCHRONIZING AGENT MATRIX',
  'ESTABLISHING QUANTUM LINK',
  'LOADING MISSION PROTOCOLS',
  'SYSTEM READY'
])

const visibleMessages = ref([])

let progressInterval
let messageInterval

onMounted(() => {
  // Progress bar animation
  progressInterval = setInterval(() => {
    if (progress.value < 100) {
      progress.value += Math.floor(Math.random() * 5) + 1
      if (progress.value > 100) progress.value = 100
    } else {
      clearInterval(progressInterval)
    }
  }, 100)
  
  // Message sequence
  let msgIndex = 0
  messageInterval = setInterval(() => {
    if (msgIndex < messages.value.length) {
      visibleMessages.value.push(messages.value[msgIndex])
      msgIndex++
    } else {
      clearInterval(messageInterval)
    }
  }, 800)
})

onUnmounted(() => {
  if (progressInterval) clearInterval(progressInterval)
  if (messageInterval) clearInterval(messageInterval)
})
</script>

<style scoped>
/* Pixel Loader Container */
.pixel-loader-container {
  background: linear-gradient(135deg, rgba(0, 20, 0, 0.95) 0%, rgba(0, 0, 0, 0.98) 100%);
  border: 2px solid #22c55e;
  box-shadow: 6px 6px 0px 0px #166534;
  position: relative;
  image-rendering: crisp-edges;
  image-rendering: pixelated;
}

/* Pixel Text Effect */
.pixel-text {
  font-family: 'Press Start 2P', monospace;
  text-shadow: 2px 2px 0px #166534;
  letter-spacing: 1px;
}

/* Pixel Progress Bar */
.pixel-progress-bar {
  height: 12px;
  background: #0a0f0a;
  border: 1px solid #22c55e;
  image-rendering: crisp-edges;
  overflow: hidden;
}

.pixel-progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #22c55e, #4ade80, #22c55e);
  background-size: 200% 100%;
  animation: shimmer 1s linear infinite;
  transition: width 0.1s steps(10);
}

/* Terminal Cursor */
.terminal-cursor {
  display: inline-block;
  width: 8px;
  height: 12px;
  background-color: #22c55e;
  animation: blink 1s step-end infinite;
}

/* Animations */
@keyframes scan {
  0% {
    transform: translateY(-100%);
  }
  100% {
    transform: translateY(1000%);
  }
}

@keyframes scan-line {
  0% {
    transform: translateY(-100%);
  }
  100% {
    transform: translateY(400%);
  }
}

@keyframes bounce-pixel {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-6px);
  }
}

@keyframes fade-in {
  from {
    opacity: 0;
    transform: translateX(-8px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes pulse-slow {
  0%, 100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.8;
    transform: scale(1.02);
  }
}

@keyframes shimmer {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}

@keyframes blink {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0;
  }
}

@keyframes pixel-blink {
  0%, 100% {
    opacity: 0.3;
  }
  50% {
    opacity: 1;
  }
}

@keyframes flicker {
  0% {
    opacity: 0.95;
  }
  100% {
    opacity: 1;
  }
}

/* Animation Classes */
.animate-scan {
  animation: scan 3s linear infinite;
}

.animate-scan-line {
  animation: scan-line 2s linear infinite;
}

.bounce-pixel {
  animation: bounce-pixel 0.6s steps(2) infinite;
}

.animate-fade-in {
  animation: fade-in 0.3s steps(5) forwards;
}

.animate-pulse-slow {
  animation: pulse-slow 2s ease-in-out infinite;
}

.animate-pixel-blink {
  animation: pixel-blink 0.5s step-end infinite;
}

.animate-flicker {
  animation: flicker 0.15s infinite;
}

/* CRT Flicker Effect Overlay */
.pixel-loader-container::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: repeating-linear-gradient(
    0deg,
    rgba(0, 0, 0, 0.1) 0px,
    rgba(0, 0, 0, 0.1) 1px,
    transparent 1px,
    transparent 2px
  );
  pointer-events: none;
  animation: flicker 0.15s infinite;
}

/* Pixel Grid Animation */
.grid > div {
  transition: all 0.1s steps(2);
}

.grid > div:hover {
  background-color: rgba(34, 197, 94, 0.8);
}
</style>