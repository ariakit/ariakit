import React from 'react'
import { mount } from 'enzyme'
import withPopoverState from '../withPopoverState'

const Base = () => null

const wrap = (enhance, props = {}) => {
  const Comp = enhance(Base)
  return mount(<Comp {...props} />)
}

const getState = (wrapper, prop = 'popover') =>
  wrapper
    .update()
    .find(Base)
    .prop(prop)

const ensureState = (wrapper, prop) => {
  const state = getState(wrapper, prop)
  expect(state).toHaveProperty('popoverId', expect.any(String))
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
}

describe('withPopoverState', () => createTests(withPopoverState))
