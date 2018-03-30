import React from 'react'
import PropTypes from 'prop-types'
import Context from '../Context'
import mapStateToActions from '../../utils/mapStateToActions'
import mapStateToSelectors from '../../utils/mapStateToSelectors'

class State extends React.Component {
  static propTypes = {
    children: PropTypes.func.isRequired,
    actions: PropTypes.objectOf(PropTypes.func),
    selectors: PropTypes.objectOf(PropTypes.func),
    initialState: PropTypes.object,
    context: PropTypes.string,
    logger: PropTypes.func,
  }

  static defaultProps = {
    initialState: {},
  }

  state = this.props.initialState

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
      return <Context.Consumer {...this.props} />
    }

    const { children, actions, selectors } = this.props

    return children({
      ...this.state,
      ...(actions ? mapStateToActions(this.onSetState, actions) : {}),
      ...(selectors ? mapStateToSelectors(this.state, selectors) : {}),
    })
  }
}

export default State
