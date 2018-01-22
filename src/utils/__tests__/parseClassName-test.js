import parseClassName from '../parseClassName'

it('unifies class names', () => {
  expect(parseClassName('foo bar foo foo-bar foo-bar')).toBe('foo bar foo-bar')
})
