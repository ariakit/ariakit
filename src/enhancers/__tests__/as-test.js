import React from 'react'
import { shallow } from 'enzyme'
import as from '../as'

it('creates component passing property as', () => {
  const Comp = ({ as: T, ...props }) => <T {...props} id="comp" />
  const Div = as('div')(Comp)

  const wrapper = shallow(<Div as="span" />)
  expect(wrapper.html()).toMatch(/^<span.+id="comp"/)
})

it('creates component with array of components', () => {
  const Comp = ({ as: T, ...props }) => <T {...props} id="comp" />
  const Comp2 = ({ as: T, ...props }) => <T {...props} id="comp2" />
  const P = as([Comp2, 'p'])(Comp)

  const wrapper = shallow(<P />)
  expect(wrapper.html()).toMatch(/^<p.+id="comp2"/)
})

it('creates component passing property as with array of components', () => {
  const Comp = ({ as: T, ...props }) => <T {...props} id="comp" />
  const Comp2 = ({ as: T, ...props }) => <T {...props} id="comp2" />
  const P = as('p')(Comp)

  const wrapper = shallow(<P as={[Comp2, 'span']} />)
  expect(wrapper.html()).toMatch(/^<span.+id="comp2"/)
})

it('creates component passing property as with another component', () => {
  const Comp = ({ as: T, ...props }) => <T {...props} id="comp" />
  const Comp2 = ({ as: T, ...props }) => <T {...props} id="comp2" />
  const P = as('p')(Comp)
  const Div = as('div')(Comp2)

  const wrapper = shallow(<P as={Div} />)
  expect(wrapper.html()).toMatch(/^<div.+id="comp2"/)
})

it('creates component using as static method', () => {
  const Comp = ({ as: T, ...props }) => <T {...props} id="comp" />
  const Div = as('div')(Comp)
  const P = Div.as('p')

  const wrapper = shallow(<P />)
  expect(wrapper.html()).toMatch(/^<p.+id="comp"/)
})

it('creates component using as static method with array of components', () => {
  const Comp = ({ as: T, ...props }) => <T {...props} id="comp" />
  const Comp2 = ({ as: T, ...props }) => <T {...props} id="comp2" />
  const Div = as('div')(Comp)
  const P = Div.as([Comp2, 'p'])

  const wrapper = shallow(<P />)
  expect(wrapper.html()).toMatch(/^<p.+id="comp2"/)
})

it('renders with style', () => {
  const Comp = ({ as: T, ...props }) => <T {...props} />
  const Div = as('div')(Comp)

  const wrapper = shallow(<Div position="absolute" />)
  expect(wrapper.html()).toMatch(/style="position:absolute/)
})

it('renders with style passing property as with another component', () => {
  const Comp = ({ as: T, ...props }) => <T {...props} />
  const Comp2 = ({ as: T, ...props }) => <T {...props} id="comp2" />
  const P = as('p')(Comp)
  const Div = as('div')(Comp2)

  const wrapper = shallow(<P as={Div} position="absolute" />)
  expect(wrapper.html()).toMatch(/<div.+style="position:absolute/)
})

it('renders with dangerouslySetInnerHTML', () => {
  const Comp = ({ as: T, ...props }) => <T {...props} />
  const Div = as('div')(Comp)
  const props = { dangerouslySetInnerHTML: { __html: '<b>Hello</b>' } }

  const wrapper = shallow(<Div {...props} />)
  expect(wrapper.html()).toMatch(/><b>Hello<\/b><\/div>/)
})

it('renders SVG element', () => {
  const Comp = ({ as: T, ...props }) => <T {...props} />
  const Svg = as('svg')(Comp)

  const wrapper = shallow(<Svg as="circle" />)
  expect(wrapper.html()).toMatch(/^<circle class=/)
})

it('renders with shorthand style', () => {
  const Comp = ({ as: T, ...props }) => <T {...props} />
  const Div = as('div')(Comp)

  const wrapper = shallow(<Div width={50} />)
  expect(wrapper.html()).toMatch(/style="width:50px"/)
})
