import type { QuizData, QuizAttempt } from '../types/quiz'

const API_BASE_URL = 'http://localhost:3001'

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const error = await response.text()
    throw new Error(error || response.statusText)
  }
  return response.json()
}

export const apiService = {
  async getAllQuizzes(): Promise<QuizData[]> {
    const response = await fetch(`${API_BASE_URL}/quizzes`)
    return handleResponse<QuizData[]>(response)
  },

  async getQuizById(id: string): Promise<QuizData> {
    const response = await fetch(`${API_BASE_URL}/quizzes/${id}`)
    return handleResponse<QuizData>(response)
  },

  async createQuiz(quiz: QuizData): Promise<QuizData> {
    const response = await fetch(`${API_BASE_URL}/quizzes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(quiz)
    })
    return handleResponse<QuizData>(response)
  },

  async updateQuiz(quiz: QuizData): Promise<QuizData> {
    const response = await fetch(`${API_BASE_URL}/quizzes/${quiz.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(quiz)
    })
    return handleResponse<QuizData>(response)
  },

  async getAttempts(quizId?: string): Promise<QuizAttempt[]> {
    const url = quizId 
      ? `${API_BASE_URL}/attempts?quizId=${quizId}`
      : `${API_BASE_URL}/attempts`
    const response = await fetch(url)
    return handleResponse<QuizAttempt[]>(response)
  },

  async saveAttempt(attempt: Omit<QuizAttempt, 'id' | 'date'>): Promise<QuizAttempt> {
    const response = await fetch(`${API_BASE_URL}/attempts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...attempt,
        date: new Date().toISOString(),
        id: crypto.randomUUID()
      })
    })
    return handleResponse<QuizAttempt>(response)
  },

  async clearAttempts(): Promise<void> {
    const attempts = await this.getAttempts()
    await Promise.all(
      attempts.map(attempt => 
        fetch(`${API_BASE_URL}/attempts/${attempt.id}`, { method: 'DELETE' })
      )
    )
  }
}