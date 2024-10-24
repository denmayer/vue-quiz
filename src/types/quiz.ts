export interface Question {
  id: number
  text: string
  options: string[]
  correctAnswer: number | number[]
  type: 'multiple-choice' | 'multiple-response' | 'true-false'
  image?: string
  explanation?: string
}

export interface QuizData {
  id: string
  name: string
  description: string
  difficulty: 'easy' | 'medium' | 'hard'
  questions: Question[]
  timeLimit?: number
}

export interface QuizAttempt {
  id: string
  quizId: string
  quizName: string
  date: string
  score: number
  totalQuestions: number
  percentage: number
  answers: {
    questionId: number
    userAnswer: number | number[] | null
    correct: boolean
  }[]
}