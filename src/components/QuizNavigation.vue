<script setup lang="ts">
defineProps<{
  isFirstQuestion: boolean
  isLastQuestion: boolean
  hasUnansweredQuestions: boolean
}>()

const emit = defineEmits<{
  (e: 'previous'): void
  (e: 'next'): void
  (e: 'finish'): void
}>()
</script>

<template>
  <div class="mt-6 flex justify-between items-center">
    <button
      @click="emit('previous')"
      :disabled="isFirstQuestion"
      :class="[
        'px-4 py-2 rounded-lg font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-opacity-50',
        isFirstQuestion
          ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
          : 'bg-emerald-600 text-white hover:bg-emerald-700'
      ]"
    >
      Previous
    </button>

    <div v-if="isLastQuestion" class="flex gap-4">
      <button
        @click="emit('finish')"
        class="px-6 py-2 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-opacity-50"
      >
        Finish Quiz
      </button>
      <div v-if="hasUnansweredQuestions" class="text-amber-600 text-sm">
        Note: Unanswered questions will be marked as wrong
      </div>
    </div>
    
    <button
      v-else
      @click="emit('next')"
      :disabled="isLastQuestion"
      class="px-4 py-2 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-opacity-50"
    >
      Next
    </button>
  </div>
</template>