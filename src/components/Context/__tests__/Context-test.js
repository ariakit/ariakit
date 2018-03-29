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
  const state = { foo: 'bar' }
  const children = v => v.foo
  const wrapper = wrap({ state, children })
  expect(wrapper.contains('bar')).toBe(true)
})

test('actions', () => {
  const state = { n: 0 }
  const actions = {
    increment: () => s => ({ n: s.n + 1 }),
  }
  const children = v => <button onClick={v.increment}>{v.n}</button>
  const wrapper = wrap({ state, actions, children })
  expect(wrapper).toMatchSnapshot()
  wrapper.simulate('click')
  expect(wrapper).toMatchSnapshot()
})

test('selectors', () => {
  const state = { foo: 'bar' }
  const selectors = {
    getFoo: () => s => s.foo,
  }
  const children = v => v.getFoo()
  const wrapper = wrap({ state, selectors, children })
  expect(wrapper.contains('bar')).toBe(true)
})

test('logger', () => {
  const logger = jest.fn()
  const state = { n: 0 }
  const actions = {
    increment: () => s => ({ n: s.n + 1 }),
  }
  const children = v => <button onClick={v.increment}>{v.n}</button>
  const wrapper = wrap({ state, actions, children }, logger)
  wrapper.simulate('click')
  expect(logger).toHaveBeenCalledWith({}, { foo: { n: 1 } })
})
