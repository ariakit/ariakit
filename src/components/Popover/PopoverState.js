/* eslint-disable react/prefer-stateless-function */
import React from 'react'
import PropTypes from 'prop-types'
import uniqueId from 'lodash/uniqueId'
import HiddenState from '../Hidden/HiddenState'

class PopoverState extends React.Component {
  static propTypes = {
    initialState: PropTypes.object,
  }

  popoverId = uniqueId('popover')

  render() {
    return (
      <HiddenState
        {...this.props}
        initialState={{
          popoverId: this.popoverId,
          ...this.props.initialState,
        }}
      />
    )
  }
}

export default PopoverState
