import stateLogger from '../stateLogger'

let logs = []

const fn = v => logs.push(v)

global.console = {
  log: fn,
  group: fn,
  groupEnd: fn,
  groupCollapsed: fn,
}

beforeEach(() => {
  logs = []
})

test('minimal change', () => {
  const left = {
    foo: {
      bar: 'baz',
    },
  }
  const right = {
    foo: {
      bar: 'qux',
    },
  }
  stateLogger(left, right)
  expect(logs.join('\n')).toMatchSnapshot()
})

test('big change', () => {
  const left = {
    foo: {
      bar: 'baz',
      baz: 'qux',
    },
  }
  const right = {
    foo: {
      bar: 'qux',
      baz: 'quux',
    },
  }
  stateLogger(left, right)
  expect(logs.join('\n')).toMatchSnapshot()
})
