/* eslint-disable react/no-unused-prop-types */
import React from 'react'
import PropTypes from 'prop-types'
import polyfill from 'react-lifecycles-compat'
import getDerivedStateFromProps from '../../utils/getDerivedStateFromProps'
import State from '../State'

const toggle = () => state => ({ visible: !state.visible })
const show = () => () => ({ visible: true })
const hide = () => () => ({ visible: false })

class HiddenState extends React.Component {
  static propTypes = {
    visible: PropTypes.bool,
    state: PropTypes.object,
    actions: PropTypes.object,
  }

  static defaultProps = {
    visible: false,
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    return getDerivedStateFromProps(
      nextProps,
      prevState,
      Object.keys(HiddenState.defaultProps),
    )
  }

  state = {}

  render() {
    const state = { ...this.state, ...this.props.state }
    const actions = { toggle, show, hide, ...this.props.actions }
    return (
      <State
        {...this.props}
        state={state}
        actions={actions}
        setState={(...args) => this.setState(...args)}
      />
    )
  }
}

export default polyfill(HiddenState)
