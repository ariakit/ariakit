import pickCSSProps from '../pickCSSProps'

it('picks css props correctly', () => {
  const props = {
    foo: 'bar',
    position: 'absolute',
  }
  expect(pickCSSProps(props)).toEqual({ position: 'absolute' })
})

it('picks shorthand props', () => {
  const props = {
    foo: 'bar',
    absolute: true,
  }
  expect(pickCSSProps(props)).toEqual({ position: 'absolute' })
})
