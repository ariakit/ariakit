import React from 'react'
import { shallow } from 'enzyme'
import withId from '../withId'

it('creates component with id', () => {
  const enhance = withId()
  const Component = enhance(props => <div {...props} />)
  const wrapper = shallow(<Component />)
  expect(wrapper.prop('id')).toBeDefined()
})

it('creates component with prefixed id', () => {
  const enhance = withId('foo')
  const Component = enhance(props => <div {...props} />)
  const wrapper = shallow(<Component />)
  expect(wrapper.prop('id')).toMatch(/^foo\d$/)
})

it('creates component with different id prop', () => {
  const enhance = withId('foo', 'bar')
  const Component = enhance(props => <div {...props} />)
  const wrapper = shallow(<Component />)
  expect(wrapper.prop('bar')).toMatch(/^foo\d$/)
})
