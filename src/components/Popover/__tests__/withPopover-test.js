import React from 'react'
import { mount } from 'enzyme'
import withPopoverState from '../withPopoverState'

const Base = () => null

const wrap = enhance => {
  const Comp = enhance(Base)
  return mount(<Comp />)
}

const getState = (wrapper, prop = 'popover') =>
  wrapper
    .update()
    .find(Base)
    .prop(prop)

const structure = (wrapper, prop) => {
  const state = getState(wrapper, prop)
  expect(state).toEqual({
    popoverId: expect.any(String),
    visible: expect.any(Boolean),
    setVisible: expect.any(Function),
    toggle: expect.any(Function),
    show: expect.any(Function),
    hide: expect.any(Function),
  })
}

const visible = (wrapper, initialState = false) => {
  const state = getState(wrapper)
  expect(state.visible).toBe(initialState)
}

const setVisible = wrapper => {
  const state = getState(wrapper)
  expect(state.visible).toBe(false)
  state.setVisible(true)
  expect(getState(wrapper).visible).toBe(true)
}

const toggle = wrapper => {
  const state = getState(wrapper)
  expect(state.visible).toBe(false)
  state.toggle()
  expect(getState(wrapper).visible).toBe(true)
  state.toggle()
  expect(getState(wrapper).visible).toBe(false)
}

const show = wrapper => {
  const state = getState(wrapper)
  expect(state.visible).toBe(false)
  state.show()
  expect(getState(wrapper).visible).toBe(true)
}

const hide = wrapper => {
  const state = getState(wrapper)
  expect(state.visible).toBe(false)
  state.show()
  expect(getState(wrapper).visible).toBe(true)
  state.hide()
  expect(getState(wrapper).visible).toBe(false)
}

const createTests = enhance => ({
  structure: () => structure(wrap(enhance)),
  'name argument': () => structure(wrap(enhance('foo')), 'foo'),
  'name option': () => structure(wrap(enhance({ name: 'foo' })), 'foo'),
  visible: () => visible(wrap(enhance)),
  'visible option': () => visible(wrap(enhance({ visible: true })), true),
  setVisible: () => setVisible(wrap(enhance)),
  toggle: () => toggle(wrap(enhance)),
  show: () => show(wrap(enhance)),
  hide: () => hide(wrap(enhance)),
})

describe('withPopoverState', () => {
  Object.entries(createTests(withPopoverState)).forEach(
    ([description, suite]) => {
      test(description, suite)
    },
  )
})
