import React from 'react'
import { mount } from 'enzyme'
import HiddenShow from '../HiddenShow'

it('calls show on click', () => {
  const props = { show: jest.fn() }
  const wrapper = mount(<HiddenShow {...props} />)
  expect(props.show).toHaveBeenCalledTimes(0)
  wrapper.simulate('click')
  expect(props.show).toHaveBeenCalledTimes(1)
})

it('calls show and onClick on click', () => {
  const props = { show: jest.fn(), onClick: jest.fn() }
  const wrapper = mount(<HiddenShow {...props} />)
  expect(props.show).toHaveBeenCalledTimes(0)
  expect(props.onClick).toHaveBeenCalledTimes(0)
  wrapper.simulate('click')
  expect(props.show).toHaveBeenCalledTimes(1)
  expect(props.onClick).toHaveBeenCalledTimes(1)
})
