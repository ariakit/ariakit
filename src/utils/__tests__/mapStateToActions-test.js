import mapStateToActions from '../mapStateToActions'

it('works', () => {
  const setState = jest.fn(fn => fn(2))
  const actionsMap = {
    foo: n => state => ({ n: state + n }),
  }
  const result = mapStateToActions(setState, actionsMap)
  expect(result.foo(2)).toEqual({ n: 4 })
})
