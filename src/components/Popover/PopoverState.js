/* eslint-disable react/no-unused-prop-types */
import React from 'react'
import PropTypes from 'prop-types'
import uniqueId from 'lodash/uniqueId'
import HiddenState from '../Hidden/HiddenState'

class PopoverState extends React.Component {
  static propTypes = {
    ...HiddenState.propTypes,
    children: PropTypes.func.isRequired,
    popoverId: PropTypes.string,
  }

  static defaultProps = {
    popoverId: uniqueId('popover'),
  }

  static getDerivedStateFromProps({ popoverId }, prevState) {
    if (popoverId !== prevState.popoverId) {
      return { popoverId }
    }
    return null
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

export default PopoverState
