import React from 'react'
import { mount } from 'enzyme'
import HiddenHide from '../HiddenHide'

it('calls hide on click', () => {
  const props = { hide: jest.fn() }
  const wrapper = mount(<HiddenHide {...props} />)
  expect(props.hide).toHaveBeenCalledTimes(0)
  wrapper.simulate('click')
  expect(props.hide).toHaveBeenCalledTimes(1)
})

it('calls hide and onClick on click', () => {
  const props = { hide: jest.fn(), onClick: jest.fn() }
  const wrapper = mount(<HiddenHide {...props} />)
  expect(props.hide).toHaveBeenCalledTimes(0)
  expect(props.onClick).toHaveBeenCalledTimes(0)
  wrapper.simulate('click')
  expect(props.hide).toHaveBeenCalledTimes(1)
  expect(props.onClick).toHaveBeenCalledTimes(1)
})
