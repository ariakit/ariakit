import React from 'react'
import { mount } from 'enzyme'
import Context from '..'

const wrap = (props, logger) =>
  mount(
    <Context.Provider logger={logger}>
      <Context.Consumer context="foo" {...props} />
    </Context.Provider>,
  )

test('simple state', () => {
  const initialState = { foo: 'bar' }
  const children = v => <div>{v.foo}</div>
  const wrapper = wrap({ initialState, children })
  expect(wrapper.contains('bar')).toBe(true)
})

test('actions', () => {
  const initialState = { n: 0 }
  const actions = {
    increment: () => s => ({ n: s.n + 1 }),
  }
  const children = v => <button onClick={v.increment}>{v.n}</button>
  const wrapper = wrap({ initialState, actions, children })
  expect(wrapper).toMatchSnapshot()
  wrapper.simulate('click')
  expect(wrapper).toMatchSnapshot()
})

test('selectors', () => {
  const initialState = { foo: 'bar' }
  const selectors = {
    getFoo: () => s => s.foo,
  }
  const children = v => <div>{v.getFoo()}</div>
  const wrapper = wrap({ initialState, selectors, children })
  expect(wrapper.contains('bar')).toBe(true)
})

test('logger', () => {
  const initialState = { n: 0 }
  const logger = jest.fn()
  const actions = {
    increment: () => state => ({ n: state.n + 1 }),
  }
  const children = v => <button onClick={v.increment}>{v.n}</button>
  const wrapper = wrap({ initialState, actions, children }, logger)
  expect(logger).toHaveBeenCalledTimes(1)
  expect(logger).toHaveBeenCalledWith({}, { foo: { n: 0 } })
  wrapper.simulate('click')
  expect(logger).toHaveBeenCalledTimes(2)
  expect(logger).toHaveBeenCalledWith({ foo: { n: 0 } }, { foo: { n: 1 } })
})
