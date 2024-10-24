import { describe, it, expect, beforeEach, vi } from 'vitest'
import { quizService } from '../quizService'

describe('quizService', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.useFakeTimers()
  })

  it('returns quiz name from JSON data', () => {
    const name = quizService.getQuizName()
    expect(typeof name).toBe('string')
    expect(name).toBe('General Knowledge Quiz')
  })

  it('returns questions from JSON data', () => {
    const questions = quizService.getQuestions()
    
    expect(Array.isArray(questions)).toBe(true)
    expect(questions.length).toBeGreaterThan(0)
    
    const firstQuestion = questions[0]
    expect(firstQuestion).toHaveProperty('id')
    expect(firstQuestion).toHaveProperty('text')
    expect(firstQuestion).toHaveProperty('options')
    expect(firstQuestion).toHaveProperty('correctAnswer')
    expect(firstQuestion).toHaveProperty('type')
  })

  it('has valid question structure', () => {
    const questions = quizService.getQuestions()
    
    questions.forEach(question => {
      expect(typeof question.id).toBe('number')
      expect(typeof question.text).toBe('string')
      expect(Array.isArray(question.options)).toBe(true)
      expect(typeof question.correctAnswer).toBe('number')
      expect(question.correctAnswer).toBeLessThan(question.options.length)
      
      if (question.image !== undefined) {
        expect(typeof question.image).toBe('string')
        expect(question.image).toMatch(/^https?:\/\//)
      }

      if (question.type === 'true-false') {
        expect(question.options).toEqual(['True', 'False'])
      }
    })
  })

  it('handles both multiple choice and true/false questions', () => {
    const questions = quizService.getQuestions()
    
    const hasMultipleChoice = questions.some(q => q.type === 'multiple-choice')
    const hasTrueFalse = questions.some(q => q.type === 'true-false')
    
    expect(hasMultipleChoice).toBe(true)
    expect(hasTrueFalse).toBe(true)
  })

  it('saves and retrieves quiz attempts', () => {
    const mockDate = new Date('2024-01-01T12:00:00Z')
    vi.setSystemTime(mockDate)

    const attempt = quizService.saveAttempt(3, 5)
    expect(attempt.score).toBe(3)
    expect(attempt.totalQuestions).toBe(5)
    expect(attempt.percentage).toBe(60)
    expect(attempt.date).toBe(mockDate.toISOString())

    const attempts = quizService.getAttempts()
    expect(attempts).toHaveLength(1)
    expect(attempts[0]).toEqual(attempt)
  })

  it('clears quiz attempts', () => {
    quizService.saveAttempt(3, 5)
    expect(quizService.getAttempts()).toHaveLength(1)

    quizService.clearAttempts()
    expect(quizService.getAttempts()).toHaveLength(0)
  })
})