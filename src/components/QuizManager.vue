<script setup lang="ts">
import { ref, computed } from 'vue'
import type { QuizData, Question } from '../types/quiz'
import { quizService } from '../services/quizService'

const props = defineProps<{
  quizzes: QuizData[]
}>()

const emit = defineEmits<{
  (e: 'quiz-updated'): void
}>()

const selectedQuizId = ref<string | null>(null)
const editingQuestion = ref<Question | null>(null)
const isCreatingQuestion = ref(false)
const isCreatingQuiz = ref(false)
const error = ref<string | null>(null)

const newQuiz = ref<Omit<QuizData, 'id'>>({
  name: '',
  description: '',
  difficulty: 'medium',
  questions: []
})

const selectedQuiz = computed(() => 
  props.quizzes.find(q => q.id === selectedQuizId.value)
)

const newQuestion: Question = {
  id: 0,
  text: '',
  options: ['', '', '', ''],
  correctAnswer: 0,
  type: 'multiple-choice',
  explanation: ''
}

function startEditingQuestion(question: Question) {
  editingQuestion.value = { ...question }
}

function startCreatingQuestion() {
  isCreatingQuestion.value = true
  editingQuestion.value = { ...newQuestion }
}

function startCreatingQuiz() {
  isCreatingQuiz.value = true
  newQuiz.value = {
    name: '',
    description: '',
    difficulty: 'medium',
    questions: []
  }
}

function cancelEditing() {
  editingQuestion.value = null
  isCreatingQuestion.value = false
  error.value = null
}

function cancelCreatingQuiz() {
  isCreatingQuiz.value = false
  error.value = null
}

async function saveQuestion() {
  if (!editingQuestion.value || (!selectedQuizId.value && !isCreatingQuiz.value)) return

  try {
    error.value = null
    
    // Validate question
    if (!editingQuestion.value.text.trim()) {
      error.value = 'Question text is required'
      return
    }

    if (editingQuestion.value.type === 'multiple-response' && !Array.isArray(editingQuestion.value.correctAnswer)) {
      editingQuestion.value.correctAnswer = [editingQuestion.value.correctAnswer]
    }

    if (isCreatingQuiz.value) {
      newQuiz.value.questions.push(editingQuestion.value)
      cancelEditing()
    } else {
      if (isCreatingQuestion.value) {
        await quizService.addQuestion(selectedQuizId.value, editingQuestion.value)
      } else {
        await quizService.updateQuestion(selectedQuizId.value, editingQuestion.value)
      }
      emit('quiz-updated')
      cancelEditing()
    }
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to save question'
  }
}

async function saveQuiz() {
  try {
    error.value = null

    // Validate quiz
    if (!newQuiz.value.name.trim()) {
      error.value = 'Quiz name is required'
      return
    }
    if (!newQuiz.value.description.trim()) {
      error.value = 'Quiz description is required'
      return
    }
    if (newQuiz.value.questions.length === 0) {
      error.value = 'Quiz must have at least one question'
      return
    }

    await quizService.createQuiz({
      ...newQuiz.value,
      id: crypto.randomUUID()
    })
    
    emit('quiz-updated')
    isCreatingQuiz.value = false
    newQuiz.value = {
      name: '',
      description: '',
      difficulty: 'medium',
      questions: []
    }
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to create quiz'
  }
}

async function deleteQuestion(questionId: number) {
  if (!selectedQuizId.value && !isCreatingQuiz.value) return
  
  if (confirm('Are you sure you want to delete this question?')) {
    try {
      error.value = null
      if (isCreatingQuiz.value) {
        newQuiz.value.questions = newQuiz.value.questions.filter(q => q.id !== questionId)
      } else {
        await quizService.deleteQuestion(selectedQuizId.value, questionId)
        emit('quiz-updated')
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to delete question'
    }
  }
}

function updateQuestionType(type: 'multiple-choice' | 'multiple-response' | 'true-false') {
  if (!editingQuestion.value) return

  editingQuestion.value = {
    ...editingQuestion.value,
    type,
    options: type === 'true-false' ? ['True', 'False'] : ['', '', '', ''],
    correctAnswer: type === 'multiple-response' ? [] : 0
  }
}

function toggleCorrectAnswer(index: number) {
  if (!editingQuestion.value || !Array.isArray(editingQuestion.value.correctAnswer)) return

  const currentAnswers = [...editingQuestion.value.correctAnswer]
  const answerIndex = currentAnswers.indexOf(index)

  if (answerIndex === -1) {
    currentAnswers.push(index)
  } else {
    currentAnswers.splice(answerIndex, 1)
  }

  editingQuestion.value.correctAnswer = currentAnswers.sort()
}

const isAnswerCorrect = (index: number) => {
  if (!editingQuestion.value) return false
  
  if (Array.isArray(editingQuestion.value.correctAnswer)) {
    return editingQuestion.value.correctAnswer.includes(index)
  }
  
  return editingQuestion.value.correctAnswer === index
}
</script>

<template>
  <div class="space-y-6">
    <!-- Error Message -->
    <div v-if="error" class="bg-red-50 border border-red-200 rounded-lg p-4 text-red-600">
      {{ error }}
    </div>

    <!-- Quiz Selection or Creation -->
    <div class="bg-white rounded-lg shadow-md p-6">
      <div class="flex justify-between items-center mb-6">
        <div class="flex-grow">
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Select Quiz to Manage
          </label>
          <select
            v-model="selectedQuizId"
            :disabled="isCreatingQuiz"
            class="w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
          >
            <option value="">Choose a quiz...</option>
            <option v-for="quiz in quizzes" :key="quiz.id" :value="quiz.id">
              {{ quiz.name }}
            </option>
          </select>
        </div>
        <div class="ml-4">
          <button
            @click="startCreatingQuiz"
            class="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors duration-200"
          >
            Create New Quiz
          </button>
        </div>
      </div>
    </div>

    <!-- Create New Quiz Form -->
    <div v-if="isCreatingQuiz" class="bg-white rounded-lg shadow-md p-6">
      <h2 class="text-xl font-bold text-gray-800 mb-6">Create New Quiz</h2>
      
      <div class="space-y-4">
        <!-- Quiz Name -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Quiz Name
          </label>
          <input
            v-model="newQuiz.name"
            type="text"
            class="w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
            placeholder="Enter quiz name"
          />
        </div>

        <!-- Quiz Description -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Description
          </label>
          <textarea
            v-model="newQuiz.description"
            rows="3"
            class="w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
            placeholder="Enter quiz description"
          ></textarea>
        </div>

        <!-- Difficulty -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Difficulty
          </label>
          <select
            v-model="newQuiz.difficulty"
            class="w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
          >
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>
        </div>

        <!-- Questions List -->
        <div class="mt-6">
          <div class="flex justify-between items-center mb-4">
            <h3 class="text-lg font-semibold text-gray-800">Questions</h3>
            <button
              @click="startCreatingQuestion"
              class="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors duration-200"
            >
              Add Question
            </button>
          </div>

          <div class="space-y-4">
            <div
              v-for="question in newQuiz.questions"
              :key="question.id"
              class="border rounded-lg p-4"
            >
              <div class="flex justify-between items-start">
                <div>
                  <div class="font-medium text-gray-800">{{ question.text }}</div>
                  <div class="text-sm text-gray-500 mt-1">
                    Type: {{ 
                      question.type === 'true-false' 
                        ? 'True/False' 
                        : question.type === 'multiple-response'
                          ? 'Multiple Response'
                          : 'Multiple Choice' 
                    }}
                  </div>
                </div>
                <div class="flex gap-2">
                  <button
                    @click="startEditingQuestion(question)"
                    class="text-emerald-600 hover:text-emerald-700"
                  >
                    Edit
                  </button>
                  <button
                    @click="deleteQuestion(question.id)"
                    class="text-red-600 hover:text-red-700"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Actions -->
        <div class="flex justify-end gap-4 mt-6">
          <button
            @click="cancelCreatingQuiz"
            class="px-4 py-2 text-gray-700 hover:text-gray-900"
          >
            Cancel
          </button>
          <button
            @click="saveQuiz"
            class="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors duration-200"
          >
            Create Quiz
          </button>
        </div>
      </div>
    </div>

    <!-- Question List for Existing Quiz -->
    <div v-else-if="selectedQuiz" class="bg-white rounded-lg shadow-md p-6">
      <div class="flex justify-between items-center mb-6">
        <h2 class="text-xl font-bold text-gray-800">Questions</h2>
        <button
          @click="startCreatingQuestion"
          class="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors duration-200"
        >
          Add Question
        </button>
      </div>

      <div class="space-y-4">
        <div
          v-for="question in selectedQuiz.questions"
          :key="question.id"
          class="border rounded-lg p-4"
        >
          <div class="flex justify-between items-start">
            <div>
              <div class="font-medium text-gray-800">{{ question.text }}</div>
              <div class="text-sm text-gray-500 mt-1">
                Type: {{ 
                  question.type === 'true-false' 
                    ? 'True/False' 
                    : question.type === 'multiple-response'
                      ? 'Multiple Response'
                      : 'Multiple Choice' 
                }}
              </div>
            </div>
            <div class="flex gap-2">
              <button
                @click="startEditingQuestion(question)"
                class="text-emerald-600 hover:text-emerald-700"
              >
                Edit
              </button>
              <button
                @click="deleteQuestion(question.id)"
                class="text-red-600 hover:text-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Question Editor Modal -->
    <div
      v-if="editingQuestion"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
    >
      <div class="bg-white rounded-lg shadow-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <h3 class="text-xl font-bold text-gray-800 mb-6">
          {{ isCreatingQuestion ? 'Create Question' : 'Edit Question' }}
        </h3>

        <div class="space-y-4">
          <!-- Question Type -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Question Type
            </label>
            <select
              v-model="editingQuestion.type"
              @change="updateQuestionType($event.target.value)"
              class="w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
            >
              <option value="multiple-choice">Multiple Choice</option>
              <option value="multiple-response">Multiple Response</option>
              <option value="true-false">True/False</option>
            </select>
          </div>

          <!-- Question Text -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Question Text
            </label>
            <input
              v-model="editingQuestion.text"
              type="text"
              class="w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
              placeholder="Enter your question"
            />
          </div>

          <!-- Options -->
          <div v-if="editingQuestion.type === 'multiple-choice' || editingQuestion.type === 'multiple-response'">
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Options
            </label>
            <div class="space-y-2">
              <div
                v-for="(option, index) in editingQuestion.options"
                :key="index"
                class="flex items-center gap-2"
              >
                <input
                  v-model="editingQuestion.options[index]"
                  type="text"
                  class="flex-grow rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
                  :placeholder="`Option ${index + 1}`"
                />
                <template v-if="editingQuestion.type === 'multiple-choice'">
                  <input
                    type="radio"
                    :name="'correct-answer'"
                    :value="index"
                    v-model="editingQuestion.correctAnswer"
                    class="h-4 w-4 text-emerald-600 focus:ring-emerald-500"
                  />
                  <label class="text-sm text-gray-600">Correct</label>
                </template>
                <template v-else>
                  <input
                    type="checkbox"
                    :checked="isAnswerCorrect(index)"
                    @change="toggleCorrectAnswer(index)"
                    class="h-4 w-4 text-emerald-600 focus:ring-emerald-500"
                  />
                  <label class="text-sm text-gray-600">Correct</label>
                </template>
              </div>
            </div>
          </div>

          <!-- True/False Correct Answer -->
          <div v-else>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Correct Answer
            </label>
            <div class="flex gap-4">
              <label class="inline-flex items-center">
                <input
                  type="radio"
                  v-model="editingQuestion.correctAnswer"
                  :value="0"
                  class="h-4 w-4 text-emerald-600 focus:ring-emerald-500"
                />
                <span class="ml-2">True</span>
              </label>
              <label class="inline-flex items-center">
                <input
                  type="radio"
                  v-model="editingQuestion.correctAnswer"
                  :value="1"
                  class="h-4 w-4 text-emerald-600 focus:ring-emerald-500"
                />
                <span class="ml-2">False</span>
              </label>
            </div>
          </div>

          <!-- Explanation -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Explanation
            </label>
            <textarea
              v-model="editingQuestion.explanation"
              rows="3"
              class="w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
              placeholder="Explain why this answer is correct..."
            ></textarea>
          </div>

          <!-- Image URL (Optional) -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Image URL (Optional)
            </label>
            <input
              v-model="editingQuestion.image"
              type="url"
              class="w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
              placeholder="https://example.com/image.jpg"
            />
          </div>

          <!-- Actions -->
          <div class="flex justify-end gap-4 mt-6">
            <button
              @click="cancelEditing"
              class="px-4 py-2 text-gray-700 hover:text-gray-900"
            >
              Cancel
            </button>
            <button
              @click="saveQuestion"
              class="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors duration-200"
            >
              Save Question
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>