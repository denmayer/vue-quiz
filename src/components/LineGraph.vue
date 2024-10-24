<script setup lang="ts">
import { ref, onMounted, watch, computed } from 'vue'
import type { QuizAttempt } from '../types/quiz'

const props = defineProps<{
  attempts: QuizAttempt[]
}>()

const canvasRef = ref<HTMLCanvasElement | null>(null)
const tooltipRef = ref<HTMLDivElement | null>(null)
const tooltipVisible = ref(false)
const tooltipContent = ref('')
const tooltipX = ref(0)
const tooltipY = ref(0)

// Group attempts by quiz
const quizAttempts = computed(() => {
  const grouped = new Map<string, QuizAttempt[]>()
  props.attempts.forEach(attempt => {
    if (!grouped.has(attempt.quizId)) {
      grouped.set(attempt.quizId, [])
    }
    grouped.get(attempt.quizId)?.push(attempt)
  })
  return grouped
})

// Generate unique colors for each quiz
const quizColors = computed(() => {
  const colors = new Map<string, string>()
  const baseColors = [
    '#059669', // emerald-600
    '#0891B2', // cyan-600
    '#7C3AED', // violet-600
    '#DB2777', // pink-600
    '#D97706', // amber-600
    '#DC2626', // red-600
    '#4F46E5', // indigo-600
  ]

  let colorIndex = 0
  quizAttempts.value.forEach((_, quizId) => {
    colors.set(quizId, baseColors[colorIndex % baseColors.length])
    colorIndex++
  })
  return colors
})

// Store all data points for hover detection
const allDataPoints = ref<{
  x: number
  y: number
  quizName: string
  score: number
  date: string
}[]>([])

function drawGraph() {
  const canvas = canvasRef.value
  if (!canvas) return

  const ctx = canvas.getContext('2d')
  if (!ctx) return

  const width = canvas.width
  const height = canvas.height
  const padding = 40
  const legendHeight = 60 // Space for legend

  // Clear canvas and data points
  ctx.clearRect(0, 0, width, height)
  allDataPoints.value = []

  // Get all dates for x-axis
  const allDates = props.attempts
    .map(a => new Date(a.date).getTime())
    .sort((a, b) => a - b)

  // Calculate scales
  const xScale = (width - padding * 2) / (allDates.length - 1 || 1)
  const yScale = (height - padding * 2 - legendHeight) / 100 // percentage scale 0-100

  // Draw axes
  ctx.beginPath()
  ctx.strokeStyle = '#94a3b8' // slate-400
  ctx.lineWidth = 1
  
  // Y-axis
  ctx.moveTo(padding, padding)
  ctx.lineTo(padding, height - padding - legendHeight)
  
  // X-axis
  ctx.moveTo(padding, height - padding - legendHeight)
  ctx.lineTo(width - padding, height - padding - legendHeight)
  ctx.stroke()

  // Draw grid lines and labels
  ctx.textAlign = 'right'
  ctx.textBaseline = 'middle'
  ctx.font = '12px sans-serif'
  ctx.fillStyle = '#64748b' // slate-500

  // Y-axis grid and labels
  for (let i = 0; i <= 100; i += 20) {
    const y = height - padding - legendHeight - (i * yScale)
    ctx.fillText(`${i}%`, padding - 10, y)
    
    ctx.beginPath()
    ctx.strokeStyle = '#e2e8f0' // slate-200
    ctx.moveTo(padding, y)
    ctx.lineTo(width - padding, y)
    ctx.stroke()
  }

  // Draw lines for each quiz
  quizAttempts.value.forEach((attempts, quizId) => {
    const color = quizColors.value.get(quizId) || '#000000'
    const sortedAttempts = [...attempts].sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    )

    // Draw line
    ctx.beginPath()
    ctx.strokeStyle = color
    ctx.lineWidth = 2

    sortedAttempts.forEach((attempt, index) => {
      const x = padding + (allDates.indexOf(new Date(attempt.date).getTime()) * xScale)
      const y = height - padding - legendHeight - (attempt.percentage * yScale)

      if (index === 0) {
        ctx.moveTo(x, y)
      } else {
        ctx.lineTo(x, y)
      }

      // Store point data for hover detection
      allDataPoints.value.push({
        x,
        y,
        quizName: attempt.quizName,
        score: attempt.percentage,
        date: new Date(attempt.date).toLocaleDateString()
      })
    })
    ctx.stroke()

    // Draw points
    sortedAttempts.forEach(attempt => {
      const x = padding + (allDates.indexOf(new Date(attempt.date).getTime()) * xScale)
      const y = height - padding - legendHeight - (attempt.percentage * yScale)

      ctx.beginPath()
      ctx.fillStyle = '#fff'
      ctx.arc(x, y, 4, 0, Math.PI * 2)
      ctx.fill()
      
      ctx.beginPath()
      ctx.strokeStyle = color
      ctx.lineWidth = 2
      ctx.arc(x, y, 4, 0, Math.PI * 2)
      ctx.stroke()
    })
  })

  // Draw x-axis labels
  ctx.textAlign = 'center'
  ctx.textBaseline = 'top'
  ctx.fillStyle = '#64748b'
  allDates.forEach((date, index) => {
    const x = padding + (index * xScale)
    ctx.fillText(new Date(date).toLocaleDateString(), x, height - padding - legendHeight + 10)
  })

  // Draw legend
  const legendY = height - legendHeight + 10
  const legendX = padding
  const itemWidth = (width - padding * 2) / Math.ceil(quizAttempts.value.size / 2)
  let currentX = legendX
  let currentY = legendY
  let itemCount = 0

  quizAttempts.value.forEach((attempts, quizId) => {
    const color = quizColors.value.get(quizId) || '#000000'
    const quizName = attempts[0]?.quizName || quizId

    // Draw legend item
    ctx.beginPath()
    ctx.strokeStyle = color
    ctx.lineWidth = 2
    ctx.moveTo(currentX, currentY + 6)
    ctx.lineTo(currentX + 20, currentY + 6)
    ctx.stroke()

    ctx.beginPath()
    ctx.fillStyle = '#fff'
    ctx.arc(currentX + 10, currentY + 6, 4, 0, Math.PI * 2)
    ctx.fill()

    ctx.beginPath()
    ctx.strokeStyle = color
    ctx.arc(currentX + 10, currentY + 6, 4, 0, Math.PI * 2)
    ctx.stroke()

    ctx.fillStyle = '#1f2937'
    ctx.textAlign = 'left'
    ctx.fillText(quizName, currentX + 30, currentY + 6)

    itemCount++
    if (itemCount % 2 === 0) {
      currentX = legendX
      currentY += 25
    } else {
      currentX += itemWidth
    }
  })
}

function handleMouseMove(event: MouseEvent) {
  const canvas = canvasRef.value
  if (!canvas) return

  const rect = canvas.getBoundingClientRect()
  const scaleX = canvas.width / rect.width
  const scaleY = canvas.height / rect.height
  const mouseX = (event.clientX - rect.left) * scaleX
  const mouseY = (event.clientY - rect.top) * scaleY

  let found = false
  for (const point of allDataPoints.value) {
    const distance = Math.sqrt(
      Math.pow(mouseX - point.x, 2) + 
      Math.pow(mouseY - point.y, 2)
    )

    if (distance < 10) {
      tooltipContent.value = `${point.quizName}\nScore: ${point.score}%\nDate: ${point.date}`
      tooltipX.value = event.clientX
      tooltipY.value = event.clientY - 10
      tooltipVisible.value = true
      found = true
      break
    }
  }

  if (!found) {
    tooltipVisible.value = false
  }
}

function handleMouseLeave() {
  tooltipVisible.value = false
}

// Watch for changes in attempts and redraw graph
watch(() => props.attempts, drawGraph, { deep: true })

onMounted(() => {
  drawGraph()
})
</script>

<template>
  <div class="relative">
    <canvas
      ref="canvasRef"
      width="600"
      height="300"
      class="w-full h-full"
      @mousemove="handleMouseMove"
      @mouseleave="handleMouseLeave"
    ></canvas>
    
    <div
      v-if="tooltipVisible"
      ref="tooltipRef"
      class="absolute bg-gray-800 text-white px-3 py-2 rounded text-sm pointer-events-none whitespace-pre-line"
      :style="{
        left: `${tooltipX}px`,
        top: `${tooltipY}px`,
        transform: 'translate(-500px, -400px)'
      }"
    >
      {{ tooltipContent }}
    </div>
  </div>
</template>