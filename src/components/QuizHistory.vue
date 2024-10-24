<script setup lang="ts">
import { ref, computed } from 'vue'
import type { QuizData, QuizAttempt } from '../types/quiz'
import { quizService } from '../services/quizService'
import LineGraph from './LineGraph.vue'
import QuizAttemptDetails from './QuizAttemptDetails.vue'

const props = defineProps<{
  attempts: QuizAttempt[]
}>()

const emit = defineEmits<{
  (e: 'clearHistory'): void
}>()

const error = ref<string | null>(null)
const selectedAttempt = ref<string | null>(null)
const quizzes = ref<Record<string, QuizData>>({})

const sortedAttempts = computed(() => {
  return [...props.attempts].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  )
})

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleString()
}

const averageScore = computed(() => {
  if (props.attempts.length === 0) return 0
  const sum = props.attempts.reduce((acc, attempt) => acc + attempt.percentage, 0)
  return Math.round(sum / props.attempts.length)
})

const bestScore = computed(() => {
  if (props.attempts.length === 0) return 0
  return Math.max(...props.attempts.map(a => a.percentage))
})

async function clearHistory() {
  try {
    error.value = null
    emit('clearHistory')
  } catch (err) {
    error.value = 'Failed to clear history'
    console.error('Error clearing history:', err)
  }
}

async function loadQuizDetails(quizId: string) {
  if (!quizzes.value[quizId]) {
    try {
      const quiz = await quizService.getQuizById(quizId)
      quizzes.value[quizId] = quiz
    } catch (err) {
      console.error('Error loading quiz details:', err)
    }
  }
}

async function toggleAttemptDetails(attempt: QuizAttempt) {
  if (selectedAttempt.value === attempt.id) {
    selectedAttempt.value = null
  } else {
    await loadQuizDetails(attempt.quizId)
    selectedAttempt.value = attempt.id
  }
}
</script>

<template>
  <div class="bg-white rounded-lg shadow-md p-6">
    <div class="flex justify-between items-center mb-6">
      <h2 class="text-2xl font-bold text-gray-800">Quiz History</h2>
      <button
        v-if="attempts.length > 0"
        @click="clearHistory"
        class="px-4 py-2 text-sm text-red-600 hover:text-red-700 transition-colors duration-200"
      >
        Clear History
      </button>
    </div>

    <div v-if="error" class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
      {{ error }}
    </div>

    <div v-if="attempts.length > 0" class="space-y-6">
      <div class="grid grid-cols-2 gap-4">
        <div class="bg-emerald-50 p-4 rounded-lg">
          <div class="text-sm text-emerald-600 mb-1">Average Score</div>
          <div class="text-2xl font-bold text-emerald-700">{{ averageScore }}%</div>
        </div>
        <div class="bg-emerald-50 p-4 rounded-lg">
          <div class="text-sm text-emerald-600 mb-1">Best Score</div>
          <div class="text-2xl font-bold text-emerald-700">{{ bestScore }}%</div>
        </div>
      </div>

      <!-- Progress Graph -->
      <div v-if="attempts.length >= 2" class="border rounded-lg p-4">
        <h3 class="text-lg font-semibold text-gray-800 mb-4">Progress Over Time</h3>
        <LineGraph :attempts="attempts" />
      </div>

      <div class="space-y-4">
        <div
          v-for="attempt in sortedAttempts"
          :key="attempt.id"
          class="border rounded-lg hover:bg-gray-50 transition-colors duration-200"
        >
          <div 
            class="p-4 cursor-pointer"
            @click="toggleAttemptDetails(attempt)"
          >
            <div class="flex justify-between items-center">
              <div>
                <div class="text-sm text-gray-500">{{ formatDate(attempt.date) }}</div>
                <div class="font-medium">
                  Score: {{ attempt.score }}/{{ attempt.totalQuestions }}
                </div>
                <div class="text-sm text-gray-600">
                  Quiz: {{ attempt.quizName }}
                </div>
              </div>
              <div class="flex items-center gap-3">
                <div class="text-lg font-semibold text-emerald-600">
                  {{ attempt.percentage }}%
                </div>
                <svg
                  class="w-5 h-5 text-gray-500 transform transition-transform"
                  :class="{ 'rotate-180': selectedAttempt === attempt.id }"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </div>
            </div>
          </div>

          <!-- Detailed Answers -->
          <div 
            v-if="selectedAttempt === attempt.id && attempt.answers"
            class="border-t p-4"
          >
            <QuizAttemptDetails
              :answers="attempt.answers"
              :quiz-id="attempt.quizId"
              :quiz="quizzes[attempt.quizId]"
            />
          </div>
        </div>
      </div>
    </div>

    <div v-else class="text-center text-gray-500 py-8">
      No quiz attempts yet. Take the quiz to see your history!
    </div>
  </div>
</template>