<script setup lang="ts">
import type { QuizData } from '../types/quiz'

defineProps<{
  quiz: QuizData
}>()
</script>

<template>
  <div class="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-200">
    <div class="flex justify-between items-start mb-4">
      <h3 class="text-xl font-bold text-gray-800">{{ quiz.name }}</h3>
      <span 
        class="px-3 py-1 text-sm rounded-full"
        :class="{
          'bg-green-100 text-green-800': quiz.difficulty === 'easy',
          'bg-yellow-100 text-yellow-800': quiz.difficulty === 'medium',
          'bg-red-100 text-red-800': quiz.difficulty === 'hard'
        }"
      >
        {{ quiz.difficulty.charAt(0).toUpperCase() + quiz.difficulty.slice(1) }}
      </span>
    </div>
    
    <p class="text-gray-600 mb-6">{{ quiz.description }}</p>
    
    <div class="flex justify-between items-center text-sm text-gray-500">
      <span>{{ quiz.questions.length }} questions</span>
      <span v-if="quiz.timeLimit">{{ quiz.timeLimit }} minutes</span>
    </div>
  </div>
</template>