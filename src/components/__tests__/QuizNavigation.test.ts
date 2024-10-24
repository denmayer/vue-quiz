import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import QuizNavigation from '../QuizNavigation.vue'

describe('QuizNavigation', () => {
  it('disables previous button on first question', () => {
    const wrapper = mount(QuizNavigation, {
      props: {
        isFirstQuestion: true,
        isLastQuestion: false,
        hasUnansweredQuestions: false
      }
    })

    const previousButton = wrapper.find('button:first-child')
    expect(previousButton.attributes('disabled')).toBeDefined()
    expect(previousButton.classes()).toContain('bg-gray-100')
  })

  it('shows finish button on last question', () => {
    const wrapper = mount(QuizNavigation, {
      props: {
        isFirstQuestion: false,
        isLastQuestion: true,
        hasUnansweredQuestions: false
      }
    })

    expect(wrapper.text()).toContain('Finish Quiz')
  })

  it('shows warning when there are unanswered questions', () => {
    const wrapper = mount(QuizNavigation, {
      props: {
        isFirstQuestion: false,
        isLastQuestion: true,
        hasUnansweredQuestions: true
      }
    })

    expect(wrapper.text()).toContain('Note: Unanswered questions will be marked as wrong')
  })

  it('emits navigation events', async () => {
    const wrapper = mount(QuizNavigation, {
      props: {
        isFirstQuestion: false,
        isLastQuestion: false,
        hasUnansweredQuestions: false
      }
    })

    await wrapper.find('button:first-child').trigger('click')
    expect(wrapper.emitted('previous')).toBeTruthy()

    await wrapper.find('button:last-child').trigger('click')
    expect(wrapper.emitted('next')).toBeTruthy()
  })
})