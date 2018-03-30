/* eslint-disable react/no-unused-prop-types */
import React from 'react'
import PropTypes from 'prop-types'
import State from '../State'

const toggle = () => state => ({ visible: !state.visible })
const show = () => () => ({ visible: true })
const hide = () => () => ({ visible: false })

const HiddenState = ({ actions, initialState, ...props }) => (
  <State
    {...props}
    initialState={{ visible: false, ...initialState }}
    actions={{ toggle, show, hide, ...actions }}
  />
)

HiddenState.propTypes = {
  actions: PropTypes.objectOf(PropTypes.func),
  initialState: PropTypes.object,
}

export default HiddenState
