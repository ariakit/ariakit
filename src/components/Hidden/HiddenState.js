/* eslint-disable react/no-unused-prop-types */
import React from 'react'
import PropTypes from 'prop-types'
import polyfill from 'react-lifecycles-compat'
import Context from '../Context'
import getDerivedStateFromProps from '../../utils/getDerivedStateFromProps'
import mapStateToActions from '../../utils/mapStateToActions'

const toggle = () => state => ({ visible: !state.visible })
const show = () => () => ({ visible: true })
const hide = () => () => ({ visible: false })

class HiddenState extends React.Component {
  static propTypes = {
    children: PropTypes.func.isRequired,
    visible: PropTypes.bool,
    state: PropTypes.object,
    actions: PropTypes.object,
    context: PropTypes.string,
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

    if (this.props.context) {
      return (
        <Context.Consumer {...this.props} state={state} actions={actions} />
      )
    }
    return this.props.children({
      ...state,
      ...mapStateToActions(this.setState.bind(this), actions),
    })
  }
}

export default polyfill(HiddenState)
