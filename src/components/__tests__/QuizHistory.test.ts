import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import QuizHistory from '../QuizHistory.vue'
import type { QuizAttempt } from '../../types/quiz'

describe('QuizHistory', () => {
  const mockAttempts: QuizAttempt[] = [
    {
      id: '1',
      date: '2024-01-01T12:00:00Z',
      score: 3,
      totalQuestions: 5,
      percentage: 60
    },
    {
      id: '2',
      date: '2024-01-02T12:00:00Z',
      score: 4,
      totalQuestions: 5,
      percentage: 80
    }
  ]

  it('displays average and best scores', () => {
    const wrapper = mount(QuizHistory, {
      props: { attempts: mockAttempts }
    })

    expect(wrapper.text()).toContain('70%') // Average score
    expect(wrapper.text()).toContain('80%') // Best score
  })

  it('shows empty state when no attempts', () => {
    const wrapper = mount(QuizHistory, {
      props: { attempts: [] }
    })

    expect(wrapper.text()).toContain('No quiz attempts yet')
    expect(wrapper.find('button').exists()).toBe(false)
  })

  it('emits clear-history event', async () => {
    const wrapper = mount(QuizHistory, {
      props: { attempts: mockAttempts }
    })

    await wrapper.find('button').trigger('click')
    expect(wrapper.emitted('clearHistory')).toBeTruthy()
  })

  it('sorts attempts by date in descending order', () => {
    const wrapper = mount(QuizHistory, {
      props: { attempts: mockAttempts }
    })

    const attemptElements = wrapper.findAll('.border')
    expect(attemptElements[0].text()).toContain('80%')
    expect(attemptElements[1].text()).toContain('60%')
  })
})