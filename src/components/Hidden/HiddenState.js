/* eslint-disable react/no-unused-prop-types */
import React from 'react'
import PropTypes from 'prop-types'
import State from '../State'

const toggle = () => state => ({ visible: !state.visible })
const show = () => () => ({ visible: true })
const hide = () => () => ({ visible: false })

const HiddenState = ({ actions, stateKeys, ...props }) => (
  <State
    {...props}
    actions={{ toggle, show, hide, ...actions }}
    stateKeys={['visible', ...stateKeys]}
  />
)

HiddenState.propTypes = {
  visible: PropTypes.bool,
  actions: PropTypes.objectOf(PropTypes.func),
  stateKeys: PropTypes.arrayOf(PropTypes.string),
}

HiddenState.defaultProps = {
  visible: false,
}

export default HiddenState
