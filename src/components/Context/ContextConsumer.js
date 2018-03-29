import React from 'react'
import Context from './Context'
import mapStateToActions from '../../utils/mapStateToActions'
import mapStateToSelectors from '../../utils/mapStateToSelectors'

const ContextConsumer = ({ context, state, actions, selectors, children }) => {
  const parseState = globalState => ({
    ...state,
    ...globalState[context],
  })

  const parseActions = globalSetState =>
    mapStateToActions(
      (fn, cb) =>
        globalSetState(
          globalState => ({
            [context]: {
              ...parseState(globalState),
              ...fn(parseState(globalState)),
            },
          }),
          cb,
        ),
      actions,
    )

  const parseSelectors = globalState =>
    mapStateToSelectors(parseState(globalState), selectors)

  return (
    <Context.Consumer>
      {global =>
        children({
          ...parseState(global.state),
          ...(actions && parseActions(global.setState)),
          ...(selectors && parseSelectors(global.state)),
        })
      }
    </Context.Consumer>
  )
}

export default ContextConsumer
