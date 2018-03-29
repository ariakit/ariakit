import React from 'react'
import PropTypes from 'prop-types'
import polyfill from 'react-lifecycles-compat'
import Context from '../Context'
import mapStateToActions from '../../utils/mapStateToActions'
import mapStateToSelectors from '../../utils/mapStateToSelectors'

class State extends React.Component {
  static propTypes = {
    children: PropTypes.func.isRequired,
    actions: PropTypes.objectOf(PropTypes.func),
    selectors: PropTypes.objectOf(PropTypes.func),
    logger: PropTypes.func,
    context: PropTypes.string,
    stateKeys: PropTypes.arrayOf(PropTypes.string),
  }

  static defaultProps = {
    stateKeys: [],
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    return nextProps.stateKeys.reduce((finalState, key) => {
      if (nextProps[key] !== prevState[key]) {
        return {
          ...finalState,
          [key]: nextProps[key],
        }
      }
      return finalState
    }, null)
  }

  state = {}

  onSetState = fn => {
    if (typeof this.props.logger === 'function') {
      const prevState = { ...this.state }
      this.setState(fn, () => this.props.logger(prevState, this.state))
    } else {
      this.setState(fn)
    }
  }

  render() {
    if (this.props.context) {
      return <Context.Consumer {...this.props} state={this.state} />
    }

    const { children, actions, selectors } = this.props

    return children({
      ...this.state,
      ...(actions ? mapStateToActions(this.onSetState, actions) : {}),
      ...(selectors ? mapStateToSelectors(this.state, selectors) : {}),
    })
  }
}

export default polyfill(State)
