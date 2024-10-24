import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import QuizApp from '../QuizApp.vue'
import QuizQuestion from '../QuizQuestion.vue'
import QuizNavigation from '../QuizNavigation.vue'
import QuizResults from '../QuizResults.vue'

describe('QuizApp', () => {
  const wrapper = mount(QuizApp)

  it('renders the quiz question component initially', () => {
    expect(wrapper.findComponent(QuizQuestion).exists()).toBe(true)
    expect(wrapper.findComponent(QuizResults).exists()).toBe(false)
  })

  it('displays question image when available', () => {
    const questionComponent = wrapper.findComponent(QuizQuestion)
    const firstQuestion = wrapper.vm.questions[0]
    
    if (firstQuestion.image) {
      const img = questionComponent.find('img')
      expect(img.exists()).toBe(true)
      expect(img.attributes('src')).toBe(firstQuestion.image)
      expect(img.attributes('alt')).toBe(firstQuestion.text)
    }
  })

  it('updates user answers when an answer is selected', async () => {
    const questionComponent = wrapper.findComponent(QuizQuestion)
    await questionComponent.vm.$emit('select', 1)
    
    // Check if the answer was recorded
    const buttons = questionComponent.findAll('button')
    expect(buttons[1].classes()).toContain('border-emerald-500')
  })

  it('navigates between questions', async () => {
    const navigation = wrapper.findComponent(QuizNavigation)
    
    // Initially on first question
    expect(wrapper.vm.currentQuestionIndex).toBe(0)
    
    // Go to next question
    await navigation.vm.$emit('next')
    expect(wrapper.vm.currentQuestionIndex).toBe(1)
    
    // Go back to previous question
    await navigation.vm.$emit('previous')
    expect(wrapper.vm.currentQuestionIndex).toBe(0)
  })

  it('completes the quiz and shows results', async () => {
    const wrapper = mount(QuizApp)
    
    // Answer all questions
    for (let i = 0; i < wrapper.vm.questions.length; i++) {
      await wrapper.findComponent(QuizQuestion).vm.$emit('select', 0)
      if (i < wrapper.vm.questions.length - 1) {
        await wrapper.findComponent(QuizNavigation).vm.$emit('next')
      }
    }

    // Finish the quiz
    await wrapper.findComponent(QuizNavigation).vm.$emit('finish')
    
    // Check if results are shown
    expect(wrapper.findComponent(QuizResults).exists()).toBe(true)
    expect(wrapper.findComponent(QuizQuestion).exists()).toBe(false)
  })
})