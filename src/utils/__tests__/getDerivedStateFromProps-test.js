import getDerivedStateFromProps from '../getDerivedStateFromProps'

test('same state', () => {
  const nextProps = { foo: 0 }
  const prevState = { foo: 0 }
  const nextState = getDerivedStateFromProps(nextProps, prevState, ['foo'])
  expect(nextState).toEqual(null)
})

test('updated state', () => {
  const nextProps = { foo: 1 }
  const prevState = { foo: 0 }
  const nextState = getDerivedStateFromProps(nextProps, prevState, ['foo'])
  expect(nextState).toEqual({ foo: 1 })
})

test('multiple updated state', () => {
  const nextProps = { foo: 1, bar: 1 }
  const prevState = { foo: 0, bar: 0 }
  const nextState = getDerivedStateFromProps(nextProps, prevState, [
    'foo',
    'bar',
  ])
  expect(nextState).toEqual({ foo: 1, bar: 1 })
})

test('multiple updated state, but only one key', () => {
  const nextProps = { foo: 1, bar: 1 }
  const prevState = { foo: 0, bar: 0 }
  const nextState = getDerivedStateFromProps(nextProps, prevState, ['foo'])
  expect(nextState).toEqual({ foo: 1 })
})

test('multiple state, but only one update', () => {
  const nextProps = { foo: 1, bar: 0 }
  const prevState = { foo: 0, bar: 0 }
  const nextState = getDerivedStateFromProps(nextProps, prevState, [
    'foo',
    'bar',
  ])
  expect(nextState).toEqual({ foo: 1 })
})
