import React from 'react'
import { mount } from 'enzyme'
import State from '../State'

const Base = () => null

const wrap = (Component, props = {}) =>
  mount(<Component {...props}>{state => <Base state={state} />}</Component>)

const getState = wrapper =>
  wrapper
    .update()
    .find(Base)
    .prop('state')

test('actions', () => {
  const initialState = { n: 0 }
  const actions = {
    increment: amount => state => ({ n: state.n + amount }),
  }
  const wrapper = wrap(State, { initialState, actions })
  expect(getState(wrapper).n).toBe(0)
  expect(getState(wrapper).increment).toEqual(expect.any(Function))
  getState(wrapper).increment(2)
  expect(getState(wrapper).n).toBe(2)
})

test('selectors', () => {
  const initialState = { n: 1 }
  const selectors = {
    getParity: () => state => (state.n % 2 === 0 ? 'even' : 'odd'),
  }
  const wrapper = wrap(State, { initialState, selectors })
  expect(getState(wrapper).n).toBe(1)
  expect(getState(wrapper).getParity).toEqual(expect.any(Function))
  expect(getState(wrapper).getParity()).toBe('odd')
})

test('logger', () => {
  const initialState = { n: 0 }
  const actions = {
    increment: amount => state => ({ n: state.n + amount }),
  }
  const logger = jest.fn()
  const wrapper = wrap(State, { initialState, actions, logger })
  getState(wrapper).increment(1)
  expect(logger).toHaveBeenCalledWith({ n: 0 }, { n: 1 })
})
