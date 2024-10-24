import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import QuizCard from '../QuizCard.vue'
import type { QuizData } from '../../types/quiz'

describe('QuizCard', () => {
  const mockQuiz: QuizData = {
    id: 'test-quiz',
    name: 'Test Quiz',
    description: 'A test quiz description',
    difficulty: 'medium',
    questions: [
      {
        id: 1,
        text: 'Test question',
        options: ['A', 'B', 'C', 'D'],
        correctAnswer: 0
      }
    ]
  }

  it('displays quiz information correctly', () => {
    const wrapper = mount(QuizCard, {
      props: { quiz: mockQuiz }
    })

    expect(wrapper.text()).toContain('Test Quiz')
    expect(wrapper.text()).toContain('A test quiz description')
    expect(wrapper.text()).toContain('Medium')
    expect(wrapper.text()).toContain('1 questions')
  })

  it('applies correct difficulty badge styling', () => {
    const wrapper = mount(QuizCard, {
      props: { quiz: { ...mockQuiz, difficulty: 'easy' } }
    })

    const badge = wrapper.find('.rounded-full')
    expect(badge.classes()).toContain('bg-green-100')
    expect(badge.classes()).toContain('text-green-800')
  })

  it('shows time limit when provided', () => {
    const wrapper = mount(QuizCard, {
      props: { quiz: { ...mockQuiz, timeLimit: 30 } }
    })

    expect(wrapper.text()).toContain('30 minutes')
  })
})