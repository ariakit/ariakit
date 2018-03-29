import React from 'react'
import PropTypes from 'prop-types'
import Context from './Context'

class ContextProvider extends React.Component {
  static propTypes = {
    children: PropTypes.node,
    logger: PropTypes.func,
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
    return (
      <Context.Provider
        value={{
          state: this.state,
          setState: this.onSetState,
        }}
      >
        {this.props.children}
      </Context.Provider>
    )
  }
}

export default ContextProvider
