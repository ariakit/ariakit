/* eslint-disable no-console */
import { diffString } from 'json-diff'

const colorLogger = string => {
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

const stateLogger = (prevState, nextState) => {
  const diff = diffString(prevState, nextState, { color: false }).trim()
  if (diff.split('\n').length > 6) {
    console.groupCollapsed('State Update')
  } else {
    console.group('State Update')
  }
  console.log('State', nextState)
  colorLogger(diff)
  console.groupEnd()
}

export default stateLogger
