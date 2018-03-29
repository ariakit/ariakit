/* eslint-disable react/prefer-stateless-function */
import React from 'react'
import PropTypes from 'prop-types'
import uniqueId from 'lodash/uniqueId'
import HiddenState from '../Hidden/HiddenState'

class PopoverState extends React.Component {
  static propTypes = {
    popoverId: PropTypes.string,
    stateKeys: PropTypes.arrayOf(PropTypes.string),
  }

  static defaultProps = {
    popoverId: uniqueId('popover'),
  }

  render() {
    const stateKeys = ['popoverId', ...this.props.stateKeys]
    return <HiddenState {...this.props} stateKeys={stateKeys} />
  }
}

export default PopoverState
