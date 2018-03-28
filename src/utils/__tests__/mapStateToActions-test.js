import mapStateToActions from '../mapStateToActions'

const scope = { setState: jest.fn(fn => fn(2)) }

beforeEach(() => {
  scope.setState.mockClear()
})

it('works', () => {
  const actionsMap = {
    foo: n => state => ({ n: state + n }),
  }
  const result = mapStateToActions(scope, actionsMap)
  expect(result.foo(2)).toEqual({ n: 4 })
})
