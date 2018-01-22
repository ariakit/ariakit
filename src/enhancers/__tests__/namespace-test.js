import React from 'react'
import { shallow } from 'enzyme'
import { withProps } from 'recompose'
import namespace from '../namespace'

it('passes props with namespace', () => {
  const enhance = namespace('foo', [
    withProps({
      bar: 'baz',
    }),
  ])
  const Component = enhance(props => <div>{props.foo.bar}</div>)
  const wrapper = shallow(<Component />)
  expect(wrapper.html()).toMatch(/^<div>baz<\/div>/)
})

it('passes props with namespace with different name', () => {
  const enhance = namespace('foo', [
    withProps({
      bar: 'baz',
    }),
  ])
  const Component = enhance('qux')(props => <div>{props.qux.bar}</div>)
  const wrapper = shallow(<Component />)
  expect(wrapper.html()).toMatch(/^<div>baz<\/div>/)
})

it('passes props with namespace with different name and renders name', () => {
  const enhance = namespace('foo', ({ name }) => [
    withProps({
      bar: name,
    }),
  ])
  const Component = enhance('qux')(props => <div>{props.qux.bar}</div>)
  const wrapper = shallow(<Component />)
  expect(wrapper.html()).toMatch(/^<div>qux<\/div>/)
})

it('passes props with namespace calling enhance without arg', () => {
  const enhance = namespace('foo', ({ name }) => [
    withProps({
      bar: name,
    }),
  ])
  const Component = enhance()(props => <div>{props.foo.bar}</div>)
  const wrapper = shallow(<Component />)
  expect(wrapper.html()).toMatch(/^<div>foo<\/div>/)
})

it('passes props with namespace with options', () => {
  const enhance = namespace('foo', ({ text }) => [
    withProps({
      bar: text,
    }),
  ])
  const Component = enhance({ text: 'baz' })(props => <div>{props.foo.bar}</div>)
  const wrapper = shallow(<Component />)
  expect(wrapper.html()).toMatch(/^<div>baz<\/div>/)
})

it('passes props with namespace with options and name', () => {
  const enhance = namespace('foo', ({ text }) => [
    withProps({
      bar: text,
    }),
  ])
  const Component = enhance({ text: 'baz', name: 'qux' })(props => <div>{props.qux.bar}</div>)
  const wrapper = shallow(<Component />)
  expect(wrapper.html()).toMatch(/^<div>baz<\/div>/)
})
