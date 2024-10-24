import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import QuizQuestion from '../QuizQuestion.vue'
import type { Question } from '../../types/quiz'

describe('QuizQuestion', () => {
  const mockMultipleChoiceQuestion: Question = {
    id: 1,
    text: 'Test question?',
    options: ['Option 1', 'Option 2', 'Option 3', 'Option 4'],
    correctAnswer: 2,
    type: 'multiple-choice',
    image: 'https://example.com/test.jpg'
  }

  const mockTrueFalseQuestion: Question = {
    id: 2,
    text: 'Is this a true/false question?',
    options: ['True', 'False'],
    correctAnswer: 0,
    type: 'true-false'
  }

  it('renders multiple choice question correctly', () => {
    const wrapper = mount(QuizQuestion, {
      props: {
        question: mockMultipleChoiceQuestion,
        currentNumber: 1,
        totalQuestions: 3,
        selectedAnswer: null
      }
    })

    expect(wrapper.text()).toContain('Multiple Choice')
    expect(wrapper.text()).toContain('Test question?')
    mockMultipleChoiceQuestion.options.forEach(option => {
      expect(wrapper.text()).toContain(option)
    })
  })

  it('renders true/false question correctly', () => {
    const wrapper = mount(QuizQuestion, {
      props: {
        question: mockTrueFalseQuestion,
        currentNumber: 1,
        totalQuestions: 3,
        selectedAnswer: null
      }
    })

    expect(wrapper.text()).toContain('True/False')
    expect(wrapper.text()).toContain('Is this a true/false question?')
    expect(wrapper.text()).toContain('True')
    expect(wrapper.text()).toContain('False')
  })

  it('renders image when provided', () => {
    const wrapper = mount(QuizQuestion, {
      props: {
        question: mockMultipleChoiceQuestion,
        currentNumber: 1,
        totalQuestions: 3,
        selectedAnswer: null
      }
    })

    const img = wrapper.find('img')
    expect(img.exists()).toBe(true)
    expect(img.attributes('src')).toBe(mockMultipleChoiceQuestion.image)
    expect(img.attributes('alt')).toBe(mockMultipleChoiceQuestion.text)
    expect(img.attributes('loading')).toBe('lazy')
    expect(img.classes()).toContain('object-cover')
  })

  it('does not render image when not provided', () => {
    const wrapper = mount(QuizQuestion, {
      props: {
        question: mockTrueFalseQuestion,
        currentNumber: 1,
        totalQuestions: 3,
        selectedAnswer: null
      }
    })

    expect(wrapper.find('img').exists()).toBe(false)
  })

  it('emits select event when option is clicked', async () => {
    const wrapper = mount(QuizQuestion, {
      props: {
        question: mockTrueFalseQuestion,
        currentNumber: 1,
        totalQuestions: 3,
        selectedAnswer: null
      }
    })

    await wrapper.findAll('button')[1].trigger('click')
    expect(wrapper.emitted('select')?.[0]).toEqual([1])
  })

  it('highlights selected answer', () => {
    const wrapper = mount(QuizQuestion, {
      props: {
        question: mockTrueFalseQuestion,
        currentNumber: 1,
        totalQuestions: 3,
        selectedAnswer: 1
      }
    })

    const buttons = wrapper.findAll('button')
    expect(buttons[1].classes()).toContain('border-emerald-500')
    expect(buttons[0].classes()).not.toContain('border-emerald-500')
  })
})