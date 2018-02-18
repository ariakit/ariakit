import React from 'react'
import { mount } from 'enzyme'
import withTabsState from '../withTabsState'

const Base = () => null

const wrap = (enhance, props = {}) => {
  const Comp = enhance(Base)
  return mount(<Comp {...props} />)
}

const getState = (wrapper, prop = 'tabs') =>
  wrapper
    .update()
    .find(Base)
    .prop(prop)

const structure = (wrapper, prop) => {
  const state = getState(wrapper, prop)
  expect(state).toHaveProperty('loop', true)
  expect(state).toHaveProperty('current', 0)
}

const createTests = enhance => {
  test('structure', () => structure(wrap(enhance)))
  test('name argument', () => structure(wrap(enhance('foo')), 'foo'))
  test('name option', () => structure(wrap(enhance({ name: 'foo' })), 'foo'))
}

describe('withTabsState', () => {
  createTests(withTabsState)
})
