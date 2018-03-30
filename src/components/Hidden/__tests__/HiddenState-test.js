import React from 'react'
import { mount } from 'enzyme'
import HiddenState from '../HiddenState'
import Context from '../../Context'

const Base = () => null

const wrap = (State, props = {}) => {
  const children = (
    <State {...props}>{hidden => <Base hidden={hidden} />}</State>
  )
  const component = props.context ? (
    <Context.Provider>{children}</Context.Provider>
  ) : (
    children
  )
  return mount(component)
}

const getState = wrapper =>
  wrapper
    .update()
    .find(Base)
    .prop('hidden')

const initialState = {
  visible: false,
}

const ensureState = wrapper => {
  const state = getState(wrapper)
  expect(state).toHaveProperty('visible', expect.any(Boolean))
  expect(state).toHaveProperty('toggle', expect.any(Function))
  expect(state).toHaveProperty('show', expect.any(Function))
  expect(state).toHaveProperty('hide', expect.any(Function))
}

const createTests = State => {
  test('state', () => {
    ensureState(wrap(State))
  })

  test('visible', () => {
    const wrapper = wrap(State)
    expect(getState(wrapper).visible).toBe(initialState.visible)
  })

  test('initialState visible true', () => {
    const wrapper = wrap(State, { initialState: { visible: true } })
    expect(getState(wrapper).visible).toBe(true)
  })

  test('initialState visible false', () => {
    const wrapper = wrap(State, { initialState: { visible: false } })
    expect(getState(wrapper).visible).toBe(false)
  })

  test('initialState visible context true', () => {
    const wrapper = wrap(State, {
      context: 'foo',
      initialState: { visible: true },
    })
    expect(getState(wrapper).visible).toBe(true)
  })

  test('visible prop context false', () => {
    const wrapper = wrap(State, {
      context: 'foo',
      initialState: { visible: false },
    })
    expect(getState(wrapper).visible).toBe(false)
  })

  test('toggle', () => {
    const wrapper = wrap(State, { initialState: { visible: false } })
    getState(wrapper).toggle()
    expect(getState(wrapper).visible).toBe(true)
    getState(wrapper).toggle()
    expect(getState(wrapper).visible).toBe(false)
  })

  test('show', () => {
    const wrapper = wrap(State, { initialState: { visible: false } })
    getState(wrapper).show()
    expect(getState(wrapper).visible).toBe(true)
    getState(wrapper).show()
    expect(getState(wrapper).visible).toBe(true)
  })

  test('hide', () => {
    const wrapper = wrap(State, { initialState: { visible: true } })
    getState(wrapper).hide()
    expect(getState(wrapper).visible).toBe(false)
    getState(wrapper).hide()
    expect(getState(wrapper).visible).toBe(false)
  })
}

describe('HiddenState', () => createTests(HiddenState))
