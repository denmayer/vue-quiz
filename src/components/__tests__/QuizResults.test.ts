import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import QuizResults from '../QuizResults.vue'
import type { Question } from '../../types/quiz'

describe('QuizResults', () => {
  const mockQuestions: Question[] = [
    {
      id: 1,
      text: 'Test question 1',
      options: ['A', 'B', 'C', 'D'],
      correctAnswer: 0,
      type: 'multiple-choice'
    },
    {
      id: 2,
      text: 'Test question 2',
      options: ['True', 'False'],
      correctAnswer: 1,
      type: 'true-false'
    }
  ]

  const mockUserAnswers = [0, 0] // First correct, second incorrect

  it('displays score and percentage correctly', () => {
    const wrapper = mount(QuizResults, {
      props: {
        score: 1,
        totalQuestions: 2,
        percentage: 50,
        questions: mockQuestions,
        userAnswers: mockUserAnswers
      }
    })

    expect(wrapper.text()).toContain('1')
    expect(wrapper.text()).toContain('2')
    expect(wrapper.text()).toContain('50%')
  })

  it('shows detailed results for each question', () => {
    const wrapper = mount(QuizResults, {
      props: {
        score: 1,
        totalQuestions: 2,
        percentage: 50,
        questions: mockQuestions,
        userAnswers: mockUserAnswers
      }
    })

    // First question (correct)
    expect(wrapper.text()).toContain('Test question 1')
    expect(wrapper.text()).toContain('Your answer: A')
    expect(wrapper.text()).toContain('Correct answer: A')

    // Second question (incorrect)
    expect(wrapper.text()).toContain('Test question 2')
    expect(wrapper.text()).toContain('Your answer: True')
    expect(wrapper.text()).toContain('Correct answer: False')
  })

  it('handles unanswered questions', () => {
    const wrapper = mount(QuizResults, {
      props: {
        score: 1,
        totalQuestions: 2,
        percentage: 50,
        questions: mockQuestions,
        userAnswers: [0, null]
      }
    })

    expect(wrapper.text()).toContain('Not answered')
  })

  it('emits restart event when button is clicked', async () => {
    const wrapper = mount(QuizResults, {
      props: {
        score: 1,
        totalQuestions: 2,
        percentage: 50,
        questions: mockQuestions,
        userAnswers: mockUserAnswers
      }
    })

    await wrapper.find('button').trigger('click')
    expect(wrapper.emitted('restart')).toBeTruthy()
  })
})