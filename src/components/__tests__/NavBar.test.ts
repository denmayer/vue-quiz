<script setup lang="ts">
import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import NavBar from '../NavBar.vue'

describe('NavBar', () => {
  it('highlights current page', () => {
    const wrapper = mount(NavBar, {
      props: { currentPage: 'quizzes' }
    })

    const quizzesButton = wrapper.findAll('button')[0]
    const historyButton = wrapper.findAll('button')[1]

    expect(quizzesButton.classes()).toContain('text-emerald-600')
    expect(quizzesButton.classes()).toContain('border-emerald-600')
    expect(historyButton.classes()).toContain('text-gray-500')
  })

  it('emits navigate event with correct page', async () => {
    const wrapper = mount(NavBar, {
      props: { currentPage: 'quizzes' }
    })

    await wrapper.findAll('button')[1].trigger('click')
    expect(wrapper.emitted('navigate')?.[0]).toEqual(['history'])
  })
})
</script>