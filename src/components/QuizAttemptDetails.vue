<script setup lang="ts">
import type { QuizData } from '../types/quiz'

const props = defineProps<{
  answers: {
    questionId: number
    userAnswer: number | number[] | null
    correct: boolean
  }[]
  quizId: string
  quiz?: QuizData
}>()

function formatAnswer(question: { options: string[]; type: string } | undefined, answer: number | number[] | null): string {
  if (!question || answer === null) {
    return 'Question was not answered'
  }

  // Handle true/false questions
  if (question.type === 'true-false') {
    return question.options[answer as number]
  }

  // Handle multiple response questions
  if (question.type === 'multiple-response') {
    if (!Array.isArray(answer)) return 'Invalid answer format'
    return answer.map(a => question.options[a]).join(', ')
  }

  // Handle multiple choice questions
  if (Array.isArray(answer)) {
    // If we somehow got an array for a single-answer question, take the first value
    return question.options[answer[0]] || 'Invalid answer format'
  }

  return question.options[answer]
}

function getChatGPTLink(question: string): string {
  const searchQuery = encodeURIComponent(question)
  return `https://chat.openai.com/?q=${searchQuery}`
}

function getQuestionDetails(questionId: number) {
  return props.quiz?.questions.find(q => q.id === questionId)
}

function getQuestionTypeLabel(type: string | undefined): string {
  switch (type) {
    case 'multiple-choice':
      return 'Multiple Choice'
    case 'multiple-response':
      return 'Multiple Response'
    case 'true-false':
      return 'True/False'
    default:
      return 'Unknown'
  }
}

function getAnswerStatusColor(correct: boolean): string {
  return correct ? 'text-green-600' : 'text-red-600'
}

function formatCorrectAnswer(question: { options: string[]; type: string; correctAnswer: number | number[] } | undefined): string {
  if (!question) return 'Unknown'

  if (question.type === 'true-false') {
    return question.options[question.correctAnswer as number]
  }

  if (question.type === 'multiple-response') {
    if (!Array.isArray(question.correctAnswer)) return 'Invalid answer format'
    return question.correctAnswer.map(a => question.options[a]).join(', ')
  }

  if (Array.isArray(question.correctAnswer)) {
    return question.options[question.correctAnswer[0]] || 'Invalid answer format'
  }

  return question.options[question.correctAnswer]
}
</script>

<template>
  <div class="space-y-6">
    <div
      v-for="answer in answers"
      :key="answer.questionId"
      class="border-b last:border-b-0 pb-6 last:pb-0"
    >
      <div class="flex items-start gap-4">
        <div
          class="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full"
          :class="{
            'bg-green-100': answer.correct,
            'bg-red-100': !answer.correct
          }"
        >
          <span
            class="text-lg font-bold"
            :class="getAnswerStatusColor(answer.correct)"
          >
            {{ answer.correct ? '✓' : '✗' }}
          </span>
        </div>

        <div class="flex-grow">
          <!-- Question Text and Type -->
          <div class="font-medium text-gray-800 mb-2">
            {{ getQuestionDetails(answer.questionId)?.text }}
            <span class="ml-2 text-sm text-gray-500">
              ({{ getQuestionTypeLabel(getQuestionDetails(answer.questionId)?.type) }})
            </span>
          </div>

          <!-- Question Image if available -->
          <div v-if="getQuestionDetails(answer.questionId)?.image" class="mb-4">
            <img 
              :src="getQuestionDetails(answer.questionId)?.image" 
              :alt="getQuestionDetails(answer.questionId)?.text"
              class="w-full max-w-md h-48 object-cover rounded-lg"
            />
          </div>

          <!-- Answers -->
          <div class="space-y-1 text-sm">
            <p :class="getAnswerStatusColor(answer.correct)">
              Your answer: {{ formatAnswer(getQuestionDetails(answer.questionId), answer.userAnswer) }}
            </p>
            <p class="text-green-600">
              Correct answer: {{ formatCorrectAnswer(getQuestionDetails(answer.questionId)) }}
            </p>
          </div>

          <!-- Explanation and Learn More -->
          <div class="mt-3 space-y-2">
            <div 
              v-if="getQuestionDetails(answer.questionId)?.explanation"
              class="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg"
            >
              <strong class="text-gray-700">Explanation:</strong>
              {{ getQuestionDetails(answer.questionId)?.explanation }}
            </div>
            
            <a
              v-if="getQuestionDetails(answer.questionId)?.text"
              :href="getChatGPTLink(getQuestionDetails(answer.questionId)?.text || '')"
              target="_blank"
              rel="noopener noreferrer"
              class="inline-flex items-center gap-1 text-sm text-emerald-600 hover:text-emerald-700 hover:underline"
            >
              <span>Learn more</span>
              <svg 
                class="w-4 h-4" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth="2" 
                  d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>