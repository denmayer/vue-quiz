<script setup lang="ts">
import type { Question } from '../types/quiz'

const props = defineProps<{
  score: number
  totalQuestions: number
  percentage: number
  questions: Question[]
  userAnswers: (number | number[] | null)[]
}>()

const emit = defineEmits<{
  (e: 'restart'): void
}>()

function isAnswerCorrect(userAnswer: number | number[] | null, correctAnswer: number | number[]): boolean {
  if (userAnswer === null) return false
  
  if (Array.isArray(correctAnswer)) {
    return Array.isArray(userAnswer) && 
           userAnswer.length === correctAnswer.length && 
           userAnswer.every(a => correctAnswer.includes(a))
  }
  
  return userAnswer === correctAnswer
}

const getAnswerStatus = (question: Question, userAnswer: number | number[] | null) => {
  if (userAnswer === null) return 'unanswered'
  return isAnswerCorrect(userAnswer, question.correctAnswer) ? 'correct' : 'incorrect'
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'correct':
      return 'text-green-600'
    case 'incorrect':
      return 'text-red-600'
    default:
      return 'text-amber-600'
  }
}

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'correct':
      return '✓'
    case 'incorrect':
      return '✗'
    default:
      return '!'
  }
}

const formatAnswer = (question: Question, answer: number | number[] | null) => {
  if (answer === null) {
    return 'Question was not answered'
  }
  
  if (Array.isArray(answer)) {
    return answer.map(a => question.options[a]).join(', ')
  }
  
  return question.options[answer]
}

function getChatGPTLink(question: string): string {
  const searchQuery = encodeURIComponent(question)
  return `https://chat.openai.com/?q=${searchQuery}`
}
</script>

<template>
  <div class="space-y-8">
    <div class="bg-white rounded-lg shadow-md p-6 text-center">
      <h2 class="text-2xl font-bold text-gray-800 mb-6">Quiz Completed!</h2>
      <div class="space-y-2 mb-8">
        <p class="text-xl text-gray-700">
          Your Score: <span class="font-semibold">{{ score }}</span> out of
          <span class="font-semibold">{{ totalQuestions }}</span>
        </p>
        <p class="text-xl text-gray-700">
          Percentage: <span class="font-semibold">{{ percentage }}%</span>
        </p>
      </div>
      <button
        @click="emit('restart')"
        class="bg-emerald-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-emerald-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-opacity-50"
      >
        Take Quiz Again
      </button>
    </div>

    <div class="bg-white rounded-lg shadow-md p-6">
      <h3 class="text-xl font-bold text-gray-800 mb-6">Detailed Results</h3>
      <div class="space-y-6">
        <div
          v-for="(question, index) in questions"
          :key="question.id"
          class="border-b last:border-b-0 pb-6 last:pb-0"
        >
          <div class="flex items-start gap-4">
            <div
              class="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full"
              :class="{
                'bg-green-100': getAnswerStatus(question, userAnswers[index]) === 'correct',
                'bg-red-100': getAnswerStatus(question, userAnswers[index]) === 'incorrect',
                'bg-amber-100': getAnswerStatus(question, userAnswers[index]) === 'unanswered'
              }"
            >
              <span
                class="text-lg font-bold"
                :class="getStatusColor(getAnswerStatus(question, userAnswers[index]))"
              >
                {{ getStatusIcon(getAnswerStatus(question, userAnswers[index])) }}
              </span>
            </div>
            <div class="flex-grow">
              <p class="font-medium text-gray-800 mb-2">
                Question {{ index + 1 }}: {{ question.text }}
              </p>
              <div class="space-y-1 text-sm">
                <p
                  :class="getStatusColor(getAnswerStatus(question, userAnswers[index]))"
                >
                  Your answer: {{ formatAnswer(question, userAnswers[index]) }}
                </p>
                <p class="text-green-600">
                  Correct answer: {{ formatAnswer(question, question.correctAnswer) }}
                </p>
                <p v-if="question.explanation" class="text-gray-600 mt-2">
                  {{ question.explanation }}
                </p>
                <a
                  :href="getChatGPTLink(question)"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="inline-block mt-2 text-emerald-600 hover:text-emerald-700 hover:underline"
                >
                  Learn more about this topic →
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>