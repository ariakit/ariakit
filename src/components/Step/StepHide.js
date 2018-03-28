import React from 'react'
import PropTypes from 'prop-types'
import flow from 'lodash/flow'
import as from '../../enhancers/as'
import Base from '../Base'

const StepHide = ({ onClick, ...props }) => (
  <Base onClick={flow(props.hide, onClick)} {...props} />
)

StepHide.propTypes = {
  hide: PropTypes.func.isRequired,
  onClick: PropTypes.func,
}

StepHide.defaultProps = {
  onClick: () => {},
}

export default as('button')(StepHide)
