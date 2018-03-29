/* eslint-disable no-console */
import { diffString } from 'json-diff'

const logColor = string => {
  const colorMap = {
    '+': 'green',
    '-': 'red',
  }

  string
    .split('\n')
    .filter(x => !!x)
    .forEach(line => {
      const color = colorMap[line.charAt(0)]
      if (color) {
        console.log(`%c${line}`, `color: ${color}`)
      } else {
        console.log(line)
      }
    })
}

const ContextLogger = (prevState, nextState) => {
  const diff = diffString(prevState, nextState, { color: false }).trim()
  if (diff.split('\n').length > 6) {
    console.groupCollapsed('Context Update')
  } else {
    console.group('Context Update')
  }
  console.log('State', nextState)
  logColor(diff)
  console.groupEnd()
}

export default ContextLogger
