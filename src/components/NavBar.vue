<script setup lang="ts">
const props = defineProps<{
  currentPage: 'quizzes' | 'history' | 'manage'
}>()

const emit = defineEmits<{
  (e: 'navigate', page: 'quizzes' | 'history' | 'manage'): void
}>()
</script>

<template>
  <nav class="bg-white shadow-md">
    <div class="max-w-4xl mx-auto px-6">
      <div class="flex items-center h-16">
        <div class="flex space-x-8">
          <button
            @click="emit('navigate', 'quizzes')"
            class="inline-flex items-center px-1 pt-1 text-sm font-medium transition-colors duration-200"
            :class="[
              currentPage === 'quizzes'
                ? 'text-emerald-600 border-b-2 border-emerald-600'
                : 'text-gray-500 hover:text-emerald-600'
            ]"
          >
            Quizzes
          </button>
          <button
            @click="emit('navigate', 'history')"
            class="inline-flex items-center px-1 pt-1 text-sm font-medium transition-colors duration-200"
            :class="[
              currentPage === 'history'
                ? 'text-emerald-600 border-b-2 border-emerald-600'
                : 'text-gray-500 hover:text-emerald-600'
            ]"
          >
            History
          </button>
          <button
            @click="emit('navigate', 'manage')"
            class="inline-flex items-center px-1 pt-1 text-sm font-medium transition-colors duration-200"
            :class="[
              currentPage === 'manage'
                ? 'text-emerald-600 border-b-2 border-emerald-600'
                : 'text-gray-500 hover:text-emerald-600'
            ]"
          >
            Manage Quizzes
          </button>
        </div>
      </div>
    </div>
  </nav>
</template>