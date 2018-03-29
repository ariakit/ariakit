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

test('state without stateKeys', () => {
  const wrapper = wrap(State, { foo: 'bar' })
  expect(getState(wrapper).foo).toBeUndefined()
})

test('state with stateKeys', () => {
  const wrapper = wrap(State, { stateKeys: ['foo'], foo: 'bar' })
  expect(getState(wrapper).foo).toBe('bar')
})

test('actions', () => {
  const actions = {
    increment: amount => state => ({ n: state.n + amount }),
  }
  const wrapper = wrap(State, { actions, stateKeys: ['n'], n: 0 })
  expect(getState(wrapper).n).toBe(0)
  expect(getState(wrapper).increment).toEqual(expect.any(Function))
  getState(wrapper).increment(2)
  expect(getState(wrapper).n).toBe(2)
})

test('selectors', () => {
  const selectors = {
    getParity: () => state => (state.n % 2 === 0 ? 'even' : 'odd'),
  }
  const wrapper = wrap(State, { selectors, stateKeys: ['n'], n: 1 })
  expect(getState(wrapper).n).toBe(1)
  expect(getState(wrapper).getParity).toEqual(expect.any(Function))
  expect(getState(wrapper).getParity()).toBe('odd')
})

test('logger', () => {
  const actions = {
    increment: amount => state => ({ n: state.n + amount }),
  }
  const logger = jest.fn()
  const wrapper = wrap(State, { actions, logger, stateKeys: ['n'], n: 0 })
  getState(wrapper).increment(1)
  expect(logger).toHaveBeenCalledWith({ n: 0 }, { n: 1 })
})
