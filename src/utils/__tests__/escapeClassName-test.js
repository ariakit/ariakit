import escapeClassName from '../escapeClassName'

it('works', () => {
  expect(escapeClassName('styled(Foo.as(div))')).toBe('Foo')
  expect(escapeClassName('styled(Foo.as(Bar,div))')).toBe('Foo-Bar')
})
