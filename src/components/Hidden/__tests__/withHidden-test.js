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

const initialState = {
  visible: false,
}

const ensureState = (wrapper, prop) => {
  const state = getState(wrapper, prop)
  expect(state).toHaveProperty('visible', expect.any(Boolean))
  expect(state).toHaveProperty('toggle', expect.any(Function))
  expect(state).toHaveProperty('show', expect.any(Function))
  expect(state).toHaveProperty('hide', expect.any(Function))
}

const createTests = enhance => {
  test('state', () => {
    ensureState(wrap(enhance))
  })

  test('state name argument', () => {
    ensureState(wrap(enhance('foo')), 'foo')
  })

  test('state name option', () => {
    ensureState(wrap(enhance({ name: 'foo' })), 'foo')
  })

  test('visible', () => {
    const wrapper = wrap(enhance)
    expect(getState(wrapper).visible).toBe(initialState.visible)
  })

  test('visible option true', () => {
    const wrapper = wrap(enhance({ visible: true }))
    expect(getState(wrapper).visible).toBe(true)
  })

  test('visible option false', () => {
    const wrapper = wrap(enhance({ visible: false }))
    expect(getState(wrapper).visible).toBe(false)
  })

  test('toggle', () => {
    const wrapper = wrap(enhance({ visible: false }))
    getState(wrapper).toggle()
    expect(getState(wrapper).visible).toBe(true)
    getState(wrapper).toggle()
    expect(getState(wrapper).visible).toBe(false)
  })

  test('show', () => {
    const wrapper = wrap(enhance({ visible: false }))
    getState(wrapper).show()
    expect(getState(wrapper).visible).toBe(true)
    getState(wrapper).show()
    expect(getState(wrapper).visible).toBe(true)
  })

  test('hide', () => {
    const wrapper = wrap(enhance({ visible: true }))
    getState(wrapper).hide()
    expect(getState(wrapper).visible).toBe(false)
    getState(wrapper).hide()
    expect(getState(wrapper).visible).toBe(false)
  })
}

describe('withHiddenState', () => createTests(withHiddenState))
