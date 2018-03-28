/* eslint-disable react/no-unused-prop-types */
import React from 'react'
import PropTypes from 'prop-types'
import uniqueId from 'lodash/uniqueId'
import polyfill from 'react-lifecycles-compat'
import HiddenState from '../Hidden/HiddenState'
import getDerivedStateFromProps from '../../utils/getDerivedStateFromProps'

class PopoverState extends React.Component {
  static propTypes = {
    children: PropTypes.func.isRequired,
    popoverId: PropTypes.string,
  }

  static defaultProps = {
    popoverId: uniqueId('popover'),
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    return getDerivedStateFromProps(
      nextProps,
      prevState,
      Object.keys(PopoverState.defaultProps),
    )
  }

  state = {}

  render() {
    return (
      <HiddenState {...this.props}>
        {hidden =>
          this.props.children({
            ...hidden,
            ...this.state,
          })
        }
      </HiddenState>
    )
  }
}

export default polyfill(PopoverState)
