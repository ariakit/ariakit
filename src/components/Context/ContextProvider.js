import React from 'react'
import PropTypes from 'prop-types'
import Context from './Context'

class ContextProvider extends React.Component {
  static propTypes = {
    children: PropTypes.node,
  }

  state = {}

  render() {
    return (
      <Context.Provider
        value={{
          state: this.state,
          setState: (...args) => this.setState(...args),
        }}
      >
        {this.props.children}
      </Context.Provider>
    )
  }
}

export default ContextProvider
