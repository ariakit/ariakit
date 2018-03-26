import React from 'react'
import { mount } from 'enzyme'
import TabsState from '../TabsState'

const Base = () => null

const wrap = (State, props = {}) =>
  mount(<State {...props}>{tabs => <Base tabs={tabs} />}</State>)

const getState = wrapper =>
  wrapper
    .update()
    .find(Base)
    .prop('tabs')

const ensureState = wrapper => {
  const state = getState(wrapper)
  expect(state).toHaveProperty('loop', true)
  expect(state).toHaveProperty('current', 0)
}

const createTests = State => {
  test('state', () => {
    ensureState(wrap(State))
  })
}

describe('TabsState', () => createTests(TabsState))
