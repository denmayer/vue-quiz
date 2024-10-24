<script setup lang="ts">
import { computed } from 'vue'
import type { Question } from '../types/quiz'

const props = defineProps<{
  question: Question
  currentNumber: number
  totalQuestions: number
  selectedAnswer: number | number[] | null
}>()

const emit = defineEmits<{
  (e: 'select', answer: number | number[]): void
}>()

const isMultipleResponse = computed(() => props.question.type === 'multiple-response')

function toggleAnswer(optionIndex: number) {
  if (!isMultipleResponse.value) {
    emit('select', optionIndex)
    return
  }

  const currentSelection = Array.isArray(props.selectedAnswer) ? props.selectedAnswer : []
  const newSelection = currentSelection.includes(optionIndex)
    ? currentSelection.filter(i => i !== optionIndex)
    : [...currentSelection, optionIndex].sort()
  
  emit('select', newSelection)
}

function isSelected(optionIndex: number) {
  if (Array.isArray(props.selectedAnswer)) {
    return props.selectedAnswer.includes(optionIndex)
  }
  return props.selectedAnswer === optionIndex
}
</script>

<template>
  <div class="bg-white rounded-lg shadow-md p-6">
    <div class="text-gray-600 mb-4">
      Question {{ currentNumber }} of {{ totalQuestions }}
      <span class="ml-2 px-2 py-1 bg-gray-100 rounded-full text-sm">
        {{ 
          question.type === 'true-false' 
            ? 'True/False' 
            : question.type === 'multiple-response'
              ? 'Multiple Response'
              : 'Multiple Choice' 
        }}
      </span>
    </div>
    
    <h2 class="text-2xl font-semibold text-gray-800 mb-6">{{ question.text }}</h2>
    
    <div v-if="question.image" class="mb-6">
      <img 
        :src="question.image" 
        :alt="question.text"
        class="w-full h-64 object-cover rounded-lg shadow-sm"
        loading="lazy"
      />
    </div>

    <p v-if="isMultipleResponse" class="text-sm text-gray-500 mb-4">
      Select all correct answers that apply
    </p>
    
    <div class="space-y-3">
      <button
        v-for="(option, index) in question.options"
        :key="index"
        @click="toggleAnswer(index)"
        :class="[
          'w-full py-4 px-6 text-left border-2 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-opacity-50',
          isSelected(index)
            ? 'border-emerald-500 bg-emerald-50'
            : 'border-gray-200 hover:border-emerald-500 hover:bg-emerald-50',
          question.type === 'true-false' ? 'text-center font-semibold' : '',
          isMultipleResponse ? 'flex items-center gap-3' : ''
        ]"
      >
        <div 
          v-if="isMultipleResponse" 
          class="w-5 h-5 border-2 rounded flex-shrink-0"
          :class="[
            isSelected(index)
              ? 'border-emerald-500 bg-emerald-500'
              : 'border-gray-300'
          ]"
        >
          <svg
            v-if="isSelected(index)"
            class="w-4 h-4 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
        {{ option }}
      </button>
    </div>
  </div>
</template>