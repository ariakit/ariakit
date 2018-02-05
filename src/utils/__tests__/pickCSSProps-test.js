import pickCSSProps from '../pickCSSProps'

it('picks css props correctly', () => {
  const props = {
    foo: 'bar',
    position: 'absolute',
  }
  expect(pickCSSProps(props)).toEqual({ position: 'absolute' })
})
