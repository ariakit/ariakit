import React from 'react'
import PropTypes from 'prop-types'
import Context from '../Context'
import mapStateToActions from '../../utils/mapStateToActions'
import mapStateToSelectors from '../../utils/mapStateToSelectors'

const State = props => {
  if (props.context) {
    return <Context.Consumer {...props} />
  }
  const { children, state, setState, actions, selectors } = props
  return children({
    ...state,
    ...(actions ? mapStateToActions(setState, actions) : {}),
    ...(selectors ? mapStateToSelectors(state, selectors) : {}),
  })
}

State.propTypes = {
  children: PropTypes.func.isRequired,
  state: PropTypes.object,
  setState: PropTypes.func,
  actions: PropTypes.objectOf(PropTypes.func),
  selectors: PropTypes.objectOf(PropTypes.func),
}

export default State
