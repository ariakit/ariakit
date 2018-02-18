import React from 'react'
import { mount } from 'enzyme'
import withStepState from '../withStepState'

const Base = () => null

const wrap = (enhance, props = {}) => {
  const Comp = enhance(Base)
  return mount(<Comp {...props} />)
}

const getState = (wrapper, prop = 'step') =>
  wrapper
    .update()
    .find(Base)
    .prop(prop)

const structure = (wrapper, prop) => {
  const state = getState(wrapper, prop)
  expect(state).toHaveProperty('loop', expect.any(Boolean))
  expect(state).toHaveProperty('ids', expect.any(Array))
  expect(state).toHaveProperty('setIds', expect.any(Function))
  expect(state).toHaveProperty('current', expect.any(Number))
  expect(state).toHaveProperty('setCurrent', expect.any(Function))
  expect(state).toHaveProperty('getCurrentId', expect.any(Function))
  expect(state).toHaveProperty('hasPrevious', expect.any(Function))
  expect(state).toHaveProperty('hasNext', expect.any(Function))
  expect(state).toHaveProperty('indexOf', expect.any(Function))
  expect(state).toHaveProperty('show', expect.any(Function))
  expect(state).toHaveProperty('hide', expect.any(Function))
  expect(state).toHaveProperty('isCurrent', expect.any(Function))
  expect(state).toHaveProperty('toggle', expect.any(Function))
  expect(state).toHaveProperty('previous', expect.any(Function))
  expect(state).toHaveProperty('next', expect.any(Function))
  expect(state).toHaveProperty('register', expect.any(Function))
  expect(state).toHaveProperty('unregister', expect.any(Function))
  expect(state).toHaveProperty('update', expect.any(Function))
}

const loop = (wrapper, initialState = false) => {
  expect(getState(wrapper).loop).toBe(initialState)
}

const ids = (wrapper, initialState = []) => {
  expect(getState(wrapper).ids).toEqual(initialState)
}

const setIds = wrapper => {
  expect(getState(wrapper).ids).toEqual([])

  getState(wrapper).setIds(['foo', 'bar'])
  expect(getState(wrapper).ids).toEqual(['foo', 'bar'])

  getState(wrapper).setIds(arr => [...arr, 'foo'])
  expect(getState(wrapper).ids).toEqual(['foo', 'bar', 'foo'])
}

const current = (wrapper, initialState = -1) => {
  expect(getState(wrapper).current).toBe(initialState)
}

const setCurrent = wrapper => {
  expect(getState(wrapper).current).toBe(-1)

  getState(wrapper).setCurrent(2)
  expect(getState(wrapper).current).toBe(2)
}

const getCurrentId = wrapper => {
  expect(getState(wrapper).getCurrentId()).toBeUndefined()

  getState(wrapper).setIds(['foo'])
  expect(getState(wrapper).getCurrentId()).toBeUndefined()

  getState(wrapper).setCurrent(0)
  expect(getState(wrapper).getCurrentId()).toBe('foo')
}

const hasPrevious = wrapper => {
  expect(getState(wrapper).hasPrevious()).toBe(false)

  getState(wrapper).setIds(['foo', 'bar'])
  expect(getState(wrapper).hasPrevious()).toBe(false)

  getState(wrapper).setCurrent(0)
  expect(getState(wrapper).hasPrevious()).toBe(false)

  getState(wrapper).setCurrent(1)
  expect(getState(wrapper).hasPrevious()).toBe(true)
}

const hasNext = wrapper => {
  expect(getState(wrapper).hasNext()).toBe(false)

  getState(wrapper).setIds(['foo', 'bar'])
  expect(getState(wrapper).hasNext()).toBe(true)

  getState(wrapper).setCurrent(0)
  expect(getState(wrapper).hasNext()).toBe(true)

  getState(wrapper).setCurrent(1)
  expect(getState(wrapper).hasNext()).toBe(false)
}

const indexOf = wrapper => {
  expect(getState(wrapper).indexOf('foo')).toBe(-1)

  getState(wrapper).setIds(['foo'])
  expect(getState(wrapper).indexOf('foo')).toBe(0)
}

const show = wrapper => {
  expect(getState(wrapper).current).toBe(-1)

  getState(wrapper).show(2)
  expect(getState(wrapper).current).toBe(2)

  getState(wrapper).show('foo')
  expect(getState(wrapper).current).toBe(-1)

  getState(wrapper).setIds(['foo'])
  getState(wrapper).show('foo')
  expect(getState(wrapper).current).toBe(0)
}

const hide = wrapper => {
  getState(wrapper).setCurrent(2)
  expect(getState(wrapper).current).toBe(2)

  getState(wrapper).hide()
  expect(getState(wrapper).current).toBe(-1)
}

const isCurrent = wrapper => {
  expect(getState(wrapper).isCurrent(0)).toBe(false)
  expect(getState(wrapper).isCurrent('foo')).toBe(false)

  getState(wrapper).setIds(['foo', 'bar'])
  expect(getState(wrapper).isCurrent(0)).toBe(false)
  expect(getState(wrapper).isCurrent('foo')).toBe(false)

  getState(wrapper).setCurrent(1)
  expect(getState(wrapper).isCurrent(0)).toBe(false)
  expect(getState(wrapper).isCurrent('foo')).toBe(false)

  getState(wrapper).setCurrent(0)
  expect(getState(wrapper).isCurrent(0)).toBe(true)
  expect(getState(wrapper).isCurrent('foo')).toBe(true)
}

const toggle = wrapper => {
  getState(wrapper).setIds(['foo'])
  expect(getState(wrapper).isCurrent(0)).toBe(false)
  expect(getState(wrapper).isCurrent('foo')).toBe(false)

  getState(wrapper).toggle(0)
  expect(getState(wrapper).isCurrent(0)).toBe(true)
  expect(getState(wrapper).isCurrent('foo')).toBe(true)

  getState(wrapper).toggle('foo')
  expect(getState(wrapper).isCurrent(0)).toBe(false)
  expect(getState(wrapper).isCurrent('foo')).toBe(false)
}

const previous = wrapper => {
  getState(wrapper).setIds(['foo', 'bar'])
  getState(wrapper).previous()
  expect(getState(wrapper).getCurrentId()).toBeUndefined()

  getState(wrapper).setCurrent(0)
  expect(getState(wrapper).getCurrentId()).toBe('foo')

  getState(wrapper).previous()
  expect(getState(wrapper).getCurrentId()).toBe('foo')

  getState(wrapper).setCurrent(1)
  expect(getState(wrapper).getCurrentId()).toBe('bar')

  getState(wrapper).previous()
  expect(getState(wrapper).getCurrentId()).toBe('foo')
}

const previousLoop = wrapper => {
  getState(wrapper).setIds(['foo', 'bar'])
  getState(wrapper).previous()
  expect(getState(wrapper).getCurrentId()).toBe('bar')

  getState(wrapper).previous()
  expect(getState(wrapper).getCurrentId()).toBe('foo')

  getState(wrapper).previous()
  expect(getState(wrapper).getCurrentId()).toBe('bar')
}

const next = wrapper => {
  getState(wrapper).setIds(['foo', 'bar'])
  expect(getState(wrapper).getCurrentId()).toBeUndefined()

  getState(wrapper).next()
  expect(getState(wrapper).getCurrentId()).toBe('foo')

  getState(wrapper).next()
  expect(getState(wrapper).getCurrentId()).toBe('bar')

  getState(wrapper).next()
  expect(getState(wrapper).getCurrentId()).toBe('bar')
}

const nextLoop = wrapper => {
  getState(wrapper).setIds(['foo', 'bar'])
  getState(wrapper).next()
  expect(getState(wrapper).getCurrentId()).toBe('foo')

  getState(wrapper).next()
  expect(getState(wrapper).getCurrentId()).toBe('bar')

  getState(wrapper).next()
  expect(getState(wrapper).getCurrentId()).toBe('foo')
}

const register = wrapper => {
  expect(getState(wrapper).ids).toEqual([])

  getState(wrapper).register('foo')
  expect(getState(wrapper).ids).toEqual(['foo'])

  const state = getState(wrapper)
  state.register('foo')
  state.register('foo')
  state.register('bar')
  state.register('baz')

  expect(getState(wrapper).ids).toEqual(['foo', 'bar', 'baz'])
}

const unregister = wrapper => {
  expect(getState(wrapper).ids).toEqual([])

  getState(wrapper).setIds(['foo', 'bar', 'baz'])
  expect(getState(wrapper).ids).toEqual(['foo', 'bar', 'baz'])

  const state = getState(wrapper)
  state.unregister('foo')
  state.unregister('foo')
  state.unregister('bar')
  state.register('qux')
  state.unregister('qux')
  expect(getState(wrapper).ids).toEqual(['baz'])

  getState(wrapper).setCurrent(0)
  getState(wrapper).unregister('baz')
  expect(getState(wrapper).ids).toEqual([])
}

const update = wrapper => {
  expect(getState(wrapper).ids).toEqual([])

  getState(wrapper).setIds(['foo', 'bar'])
  expect(getState(wrapper).ids).toEqual(['foo', 'bar'])

  getState(wrapper).update('bar', 'baz')
  expect(getState(wrapper).ids).toEqual(['foo', 'baz'])

  getState(wrapper).setCurrent(1)
  expect(getState(wrapper).current).toBe(1)

  getState(wrapper).update('baz', 'foo')
  expect(getState(wrapper).ids).toEqual(['foo'])
  expect(getState(wrapper).current).toBe(0)

  getState(wrapper).update('foo', 'foo')
  expect(getState(wrapper).ids).toEqual(['foo'])
}

const createTests = enhance => {
  test('structure', () => structure(wrap(enhance)))
  test('name argument', () => structure(wrap(enhance('foo')), 'foo'))
  test('name option', () => structure(wrap(enhance({ name: 'foo' })), 'foo'))
  test('loop', () => loop(wrap(enhance)))
  test('loop option', () => loop(wrap(enhance({ loop: true })), true))
  test('loop prop', () => loop(wrap(enhance, { loop: true }), true))
  test('ids', () => ids(wrap(enhance)))
  test('ids option', () => ids(wrap(enhance({ ids: ['foo'] })), ['foo']))
  test('ids prop', () => ids(wrap(enhance, { ids: ['foo'] }), ['foo']))
  test('setIds', () => setIds(wrap(enhance)))
  test('current', () => current(wrap(enhance)))
  test('current option', () => current(wrap(enhance({ current: 1 })), 1))
  test('current prop', () => current(wrap(enhance, { current: 1 }), 1))
  test('setCurrent', () => setCurrent(wrap(enhance)))
  test('getCurrentId', () => getCurrentId(wrap(enhance)))
  test('hasPrevious', () => hasPrevious(wrap(enhance)))
  test('hasNext', () => hasNext(wrap(enhance)))
  test('indexOf', () => indexOf(wrap(enhance)))
  test('show', () => show(wrap(enhance)))
  test('hide', () => hide(wrap(enhance)))
  test('isCurrent', () => isCurrent(wrap(enhance)))
  test('toggle', () => toggle(wrap(enhance)))
  test('previous', () => previous(wrap(enhance)))
  test('previous loop', () => previousLoop(wrap(enhance({ loop: true }))))
  test('next', () => next(wrap(enhance)))
  test('next loop', () => nextLoop(wrap(enhance({ loop: true }))))
  test('register', () => register(wrap(enhance)))
  test('unregister', () => unregister(wrap(enhance)))
  test('update', () => update(wrap(enhance)))
}

describe('withStepState', () => {
  createTests(withStepState)
})
