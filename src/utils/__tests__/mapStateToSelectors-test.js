import mapStateToSelectors from '../mapStateToSelectors'

it('works', () => {
  const state = { foo: 1 }
  const selectorsMap = {
    foo: n => s => s.foo + n,
  }
  const result = mapStateToSelectors(state, selectorsMap)
  expect(result.foo(1)).toBe(2)
})
