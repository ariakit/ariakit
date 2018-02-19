import React from 'react'
import PropTypes from 'prop-types'
import { compose, setDisplayName, setPropTypes } from 'recompose'
import as from '../../enhancers/as'
import Hidden from '../Hidden'

class Step extends React.Component {
  componentDidMount() {
    const { register, step } = this.props
    register(step)
  }

  componentDidUpdate(prevProps) {
    const { step, update } = this.props
    if (prevProps.step !== step) {
      update(prevProps.step, step)
    }
  }

  componentWillUnmount() {
    const { step, unregister } = this.props
    unregister(step)
  }

  render() {
    const { isCurrent, step } = this.props
    return <Hidden destroy {...this.props} visible={isCurrent(step)} />
  }
}

const enhance = compose(
  as('div'),
  setDisplayName('Step'),
  setPropTypes({
    ...Hidden.propTypes,
    step: PropTypes.string.isRequired,
    register: PropTypes.func.isRequired,
    update: PropTypes.func.isRequired,
    unregister: PropTypes.func.isRequired,
    isCurrent: PropTypes.func.isRequired,
  }),
)

export default enhance(Step)
