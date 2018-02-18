import React from 'react'
import { mount } from 'enzyme'
import withHiddenState from '../withHiddenState'

const Base = () => null

const wrap = (enhance, props = {}) => {
  const Comp = enhance(Base)
  return mount(<Comp {...props} />)
}

const getState = (wrapper, prop = 'hidden') =>
  wrapper
    .update()
    .find(Base)
    .prop(prop)

const structure = (wrapper, prop) => {
  const state = getState(wrapper, prop)
  expect(state).toHaveProperty('visible', expect.any(Boolean))
  expect(state).toHaveProperty('setVisible', expect.any(Function))
  expect(state).toHaveProperty('toggle', expect.any(Function))
  expect(state).toHaveProperty('show', expect.any(Function))
  expect(state).toHaveProperty('hide', expect.any(Function))
}

const visible = (wrapper, initialState = false) => {
  expect(getState(wrapper).visible).toBe(initialState)
}

const setVisible = wrapper => {
  expect(getState(wrapper).visible).toBe(false)

  getState(wrapper).setVisible(true)
  expect(getState(wrapper).visible).toBe(true)
}

const toggle = wrapper => {
  expect(getState(wrapper).visible).toBe(false)

  getState(wrapper).toggle()
  expect(getState(wrapper).visible).toBe(true)

  getState(wrapper).toggle()
  expect(getState(wrapper).visible).toBe(false)
}

const show = wrapper => {
  expect(getState(wrapper).visible).toBe(false)

  getState(wrapper).show()
  expect(getState(wrapper).visible).toBe(true)
}

const hide = wrapper => {
  expect(getState(wrapper).visible).toBe(false)

  getState(wrapper).show()
  expect(getState(wrapper).visible).toBe(true)

  getState(wrapper).hide()
  expect(getState(wrapper).visible).toBe(false)
}

const createTests = enhance => {
  test('structure', () => structure(wrap(enhance)))
  test('name argument', () => structure(wrap(enhance('foo')), 'foo'))
  test('name option', () => structure(wrap(enhance({ name: 'foo' })), 'foo'))
  test('visible', () => visible(wrap(enhance)))
  test('visible option', () => visible(wrap(enhance({ visible: true })), true))
  test('visible prop', () => visible(wrap(enhance, { visible: true }), true))
  test('setVisible', () => setVisible(wrap(enhance)))
  test('toggle', () => toggle(wrap(enhance)))
  test('show', () => show(wrap(enhance)))
  test('hide', () => hide(wrap(enhance)))
}

describe('withHiddenState', () => {
  createTests(withHiddenState)
})
