<script setup lang="ts">
import { ref, computed } from 'vue'
import { quizService } from '../services/quizService'
import QuizQuestion from './QuizQuestion.vue'
import QuizNavigation from './QuizNavigation.vue'
import QuizResults from './QuizResults.vue'
import type { QuizData, Question } from '../types/quiz'

const props = defineProps<{
  quiz: QuizData | null
}>()

const currentQuestionIndex = ref(0)
const userAnswers = ref<(number | number[] | null)[]>([])
const quizCompleted = ref(false)
const error = ref<string | null>(null)

const questions = computed(() => props.quiz?.questions || [])

const currentQuestion = computed(() => questions.value[currentQuestionIndex.value])

const hasUnansweredQuestions = computed(() => 
  userAnswers.value.some(answer => answer === null)
)

const score = computed(() => {
  if (!props.quiz) return 0
  return userAnswers.value.reduce((total, answer, index) => {
    if (answer === null) return total
    const question = questions.value[index]
    return isAnswerCorrect(answer, question.correctAnswer) ? total + 1 : total
  }, 0)
})

const percentage = computed(() => 
  Math.round((score.value / questions.value.length) * 100)
)

function initializeQuiz() {
  currentQuestionIndex.value = 0
  userAnswers.value = Array(questions.value.length).fill(null)
  quizCompleted.value = false
  error.value = null
}

function isAnswerCorrect(userAnswer: number | number[] | null, correctAnswer: number | number[]): boolean {
  if (userAnswer === null) return false
  
  if (Array.isArray(correctAnswer)) {
    return Array.isArray(userAnswer) && 
           userAnswer.length === correctAnswer.length && 
           userAnswer.every(a => correctAnswer.includes(a))
  }
  
  return userAnswer === correctAnswer
}

async function finishQuiz() {
  if (!props.quiz) return

  try {
    error.value = null
    const answers = questions.value.map((question, index) => ({
      questionId: question.id,
      userAnswer: userAnswers.value[index],
      correct: isAnswerCorrect(userAnswers.value[index], question.correctAnswer)
    }))

    await quizService.saveAttempt(
      props.quiz,
      score.value,
      questions.value.length,
      answers
    )
    quizCompleted.value = true
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to save quiz results'
  }
}

function previousQuestion() {
  if (currentQuestionIndex.value > 0) {
    currentQuestionIndex.value--
  }
}

function nextQuestion() {
  if (currentQuestionIndex.value < questions.value.length - 1) {
    currentQuestionIndex.value++
  }
}

function selectAnswer(answer: number | number[]) {
  userAnswers.value[currentQuestionIndex.value] = answer
}

initializeQuiz()
</script>

<template>
  <div v-if="error" class="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
    <p class="text-red-600">{{ error }}</p>
  </div>

  <div v-else-if="!quizCompleted">
    <QuizQuestion
      :question="currentQuestion"
      :current-number="currentQuestionIndex + 1"
      :total-questions="questions.length"
      :selected-answer="userAnswers[currentQuestionIndex]"
      @select="selectAnswer"
    />

    <QuizNavigation
      :is-first-question="currentQuestionIndex === 0"
      :is-last-question="currentQuestionIndex === questions.length - 1"
      :has-unanswered-questions="hasUnansweredQuestions"
      @previous="previousQuestion"
      @next="nextQuestion"
      @finish="finishQuiz"
    />
  </div>

  <QuizResults
    v-else
    :score="score"
    :total-questions="questions.length"
    :percentage="percentage"
    :questions="questions"
    :user-answers="userAnswers"
    @restart="initializeQuiz"
  />
</template>