import React from 'react'
import { mount } from 'enzyme'
import Hidden from '../Hidden'

const addEventListener = jest.spyOn(document.body, 'addEventListener')
const removeEventListener = jest.spyOn(document.body, 'removeEventListener')

const dispatchEvent = key => {
  const event = new KeyboardEvent('keydown', { key })
  document.body.dispatchEvent(event)
}

beforeEach(() => {
  jest.clearAllMocks()
})

it('adds event handler on mount', () => {
  const props = {
    hide: jest.fn(),
    visible: true,
    hideOnEsc: true,
  }
  mount(<Hidden {...props} />)
  expect(addEventListener).toHaveBeenCalledTimes(1)
})

it('calls hide when press Escape', () => {
  const props = {
    hide: jest.fn(),
    visible: true,
    hideOnEsc: true,
  }
  mount(<Hidden {...props} />)
  expect(props.hide).toHaveBeenCalledTimes(0)
  dispatchEvent('Enter')
  expect(props.hide).toHaveBeenCalledTimes(0)
  dispatchEvent('Escape')
  expect(props.hide).toHaveBeenCalledTimes(1)
})

it('removes event handler when component becomes hidden', () => {
  const props = {
    hide: jest.fn(),
    visible: true,
    hideOnEsc: true,
  }
  const wrapper = mount(<Hidden {...props} />)
  expect(addEventListener).toHaveBeenCalledTimes(1)
  wrapper.setProps({ visible: false })
  expect(removeEventListener).toHaveBeenCalledTimes(1)
})

it('adds event handler when component becomes visible', () => {
  const props = {
    hide: jest.fn(),
    hideOnEsc: true,
  }
  const wrapper = mount(<Hidden {...props} />)
  expect(addEventListener).not.toHaveBeenCalled()
  wrapper.setProps({ visible: true })
  expect(addEventListener).toHaveBeenCalledTimes(1)
})
