/* eslint-disable react/no-unused-prop-types */
import React from 'react'
import PropTypes from 'prop-types'

class HiddenState extends React.Component {
  static propTypes = {
    children: PropTypes.func.isRequired,
    visible: PropTypes.bool,
  }

  static defaultProps = {
    visible: false,
  }

  static getDerivedStateFromProps({ visible }, prevState) {
    if (visible !== prevState.visible) {
      return { visible }
    }
    return null
  }

  state = {}

  toggle = () => this.setState(state => ({ visible: !state.visible }))

  show = () => this.setState({ visible: true })

  hide = () => this.setState({ visible: false })

  render() {
    const { toggle, show, hide } = this
    return this.props.children({
      ...this.state,
      toggle,
      show,
      hide,
    })
  }
}

export default HiddenState
