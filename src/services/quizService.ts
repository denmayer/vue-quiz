import type { QuizData, Question, QuizAttempt } from '../types/quiz'

const API_URL = 'http://localhost:3000'
const API_TIMEOUT = 5000 // 5 seconds timeout

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const error = await response.text()
    throw new Error(error || `HTTP error! status: ${response.status}`)
  }
  return response.json()
}

async function fetchWithTimeout(url: string, options: RequestInit = {}): Promise<Response> {
  const controller = new AbortController()
  const id = setTimeout(() => controller.abort(), API_TIMEOUT)

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal
    })
    clearTimeout(id)
    return response
  } catch (error) {
    clearTimeout(id)
    throw error
  }
}

export const quizService = {
  async getAllQuizzes(): Promise<QuizData[]> {
    try {
      const response = await fetchWithTimeout(`${API_URL}/quizzes`)
      return handleResponse<QuizData[]>(response)
    } catch (error) {
      if (error.name === 'AbortError') {
        throw new Error('Request timeout. Please check your connection and try again.')
      }
      if (!navigator.onLine) {
        throw new Error('No internet connection. Please check your network and try again.')
      }
      throw new Error('Failed to load quizzes. Please try again later.')
    }
  },

  async getQuizById(id: string): Promise<QuizData> {
    try {
      const response = await fetchWithTimeout(`${API_URL}/quizzes/${id}`)
      return handleResponse<QuizData>(response)
    } catch (error) {
      if (error.name === 'AbortError') {
        throw new Error('Request timeout. Please check your connection and try again.')
      }
      throw new Error('Failed to load quiz. Please try again later.')
    }
  },

  async createQuiz(quiz: QuizData): Promise<QuizData> {
    try {
      const response = await fetchWithTimeout(`${API_URL}/quizzes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(quiz),
      })
      return handleResponse<QuizData>(response)
    } catch (error) {
      if (error.name === 'AbortError') {
        throw new Error('Request timeout. Please check your connection and try again.')
      }
      throw new Error('Failed to create quiz. Please try again later.')
    }
  },

  async saveQuiz(quiz: QuizData): Promise<QuizData> {
    try {
      const response = await fetchWithTimeout(`${API_URL}/quizzes/${quiz.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(quiz),
      })
      return handleResponse<QuizData>(response)
    } catch (error) {
      if (error.name === 'AbortError') {
        throw new Error('Request timeout. Please check your connection and try again.')
      }
      throw new Error('Failed to save quiz. Please try again later.')
    }
  },

  async addQuestion(quizId: string, question: Question): Promise<boolean> {
    try {
      const quiz = await this.getQuizById(quizId)
      const maxId = Math.max(...quiz.questions.map(q => q.id), 0)
      question.id = maxId + 1
      quiz.questions.push(question)
      await this.saveQuiz(quiz)
      return true
    } catch (error) {
      throw new Error('Failed to add question. Please try again later.')
    }
  },

  async updateQuestion(quizId: string, question: Question): Promise<boolean> {
    try {
      const quiz = await this.getQuizById(quizId)
      const index = quiz.questions.findIndex(q => q.id === question.id)
      if (index === -1) {
        throw new Error('Question not found')
      }
      quiz.questions[index] = question
      await this.saveQuiz(quiz)
      return true
    } catch (error) {
      throw new Error('Failed to update question. Please try again later.')
    }
  },

  async deleteQuestion(quizId: string, questionId: number): Promise<boolean> {
    try {
      const quiz = await this.getQuizById(quizId)
      quiz.questions = quiz.questions.filter(q => q.id !== questionId)
      await this.saveQuiz(quiz)
      return true
    } catch (error) {
      throw new Error('Failed to delete question. Please try again later.')
    }
  },

  async saveAttempt(
    quiz: QuizData,
    score: number,
    totalQuestions: number,
    answers: { questionId: number; userAnswer: number | number[] | null; correct: boolean }[]
  ): Promise<QuizAttempt> {
    try {
      const attempt: Omit<QuizAttempt, 'id'> = {
        quizId: quiz.id,
        quizName: quiz.name,
        date: new Date().toISOString(),
        score,
        totalQuestions,
        percentage: Math.round((score / totalQuestions) * 100),
        answers
      }

      const response = await fetchWithTimeout(`${API_URL}/attempts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(attempt),
      })
      return handleResponse<QuizAttempt>(response)
    } catch (error) {
      if (error.name === 'AbortError') {
        throw new Error('Request timeout. Please check your connection and try again.')
      }
      throw new Error('Failed to save attempt. Please try again later.')
    }
  },

  async getAttempts(quizId?: string): Promise<QuizAttempt[]> {
    try {
      const url = quizId 
        ? `${API_URL}/attempts?quizId=${quizId}`
        : `${API_URL}/attempts`
      const response = await fetchWithTimeout(url)
      return handleResponse<QuizAttempt[]>(response)
    } catch (error) {
      console.error('Error fetching attempts:', error)
      if (error.name === 'AbortError') {
        throw new Error('Request timeout. Please check your connection and try again.')
      }
      throw new Error('Failed to load attempts. Please try again later.')
    }
  },

  async clearAttempts(): Promise<void> {
    try {
      const attempts = await this.getAttempts()
      await Promise.all(
        attempts.map(attempt =>
          fetchWithTimeout(`${API_URL}/attempts/${attempt.id}`, { method: 'DELETE' })
            .then(handleResponse)
        )
      )
    } catch (error) {
      console.error('Error clearing attempts:', error)
      throw new Error('Failed to clear attempts. Please try again later.')
    }
  }
}