/* eslint-disable react/no-unused-prop-types */
import React from 'react'
import PropTypes from 'prop-types'
import getDerivedStateFromProps from '../../utils/getDerivedStateFromProps'
import mapStateToActions from '../../utils/mapStateToActions'

const toggle = () => state => ({ visible: !state.visible })
const show = () => () => ({ visible: true })
const hide = () => () => ({ visible: false })

const actions = { toggle, show, hide }

class HiddenState extends React.Component {
  static propTypes = {
    children: PropTypes.func.isRequired,
    visible: PropTypes.bool,
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
    return this.props.children({
      ...this.state,
      ...mapStateToActions(this, actions),
    })
  }
}

export default HiddenState
