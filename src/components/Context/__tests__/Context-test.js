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
  const children = v => v.foo
  const wrapper = wrap({ children, stateKeys: ['foo'], foo: 'bar' })
  expect(wrapper.contains('bar')).toBe(true)
})

test('actions', () => {
  const actions = {
    increment: () => s => ({ n: s.n + 1 }),
  }
  const children = v => <button onClick={v.increment}>{v.n}</button>
  const wrapper = wrap({ actions, children, stateKeys: ['n'], n: 0 })
  expect(wrapper).toMatchSnapshot()
  wrapper.simulate('click')
  expect(wrapper).toMatchSnapshot()
})

test('selectors', () => {
  const selectors = {
    getFoo: () => s => s.foo,
  }
  const children = v => v.getFoo()
  const wrapper = wrap({ selectors, children, stateKeys: ['foo'], foo: 'bar' })
  expect(wrapper.contains('bar')).toBe(true)
})

test('logger', () => {
  const logger = jest.fn()
  const actions = {
    increment: () => s => ({ n: s.n + 1 }),
  }
  const children = v => <button onClick={v.increment}>{v.n}</button>
  const wrapper = wrap({ actions, children, stateKeys: ['n'], n: 0 }, logger)
  wrapper.simulate('click')
  expect(logger).toHaveBeenCalledWith({}, { foo: { n: 1 } })
})
