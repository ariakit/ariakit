import React from 'react'
import PropTypes from 'prop-types'
import pick from 'lodash/pick'
import Context from './Context'
import mapStateToActions from '../../utils/mapStateToActions'
import mapStateToSelectors from '../../utils/mapStateToSelectors'

const ContextConsumer = ({
  context,
  stateKeys,
  actions,
  selectors,
  children,
  ...props
}) => {
  const parseState = globalState => ({
    ...pick(props, stateKeys),
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

ContextConsumer.propTypes = {
  context: PropTypes.string,
  stateKeys: PropTypes.arrayOf(PropTypes.string),
  actions: PropTypes.objectOf(PropTypes.func),
  selectors: PropTypes.objectOf(PropTypes.func),
  children: PropTypes.func.isRequired,
}

export default ContextConsumer
