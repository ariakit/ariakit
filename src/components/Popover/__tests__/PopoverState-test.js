import React from 'react'
import { mount } from 'enzyme'
import PopoverState from '../PopoverState'

const Base = () => null

const wrap = (State, props = {}) =>
  mount(<State {...props}>{popover => <Base popover={popover} />}</State>)

const getState = wrapper =>
  wrapper
    .update()
    .find(Base)
    .prop('popover')

const ensureState = wrapper => {
  const state = getState(wrapper)
  expect(state).toHaveProperty('popoverId', expect.any(String))
}

const createTests = State => {
  test('state', () => {
    ensureState(wrap(State))
  })

  test('popoverId', () => {
    const wrapper = wrap(State)
    expect(getState(wrapper).popoverId).toMatch(/^popover\d$/)
  })
}

describe('PopoverState', () => createTests(PopoverState))
