import React from 'react'
import PropTypes from 'prop-types'
import flow from 'lodash/flow'
import as from '../../enhancers/as'
import Base from '../Base'

const HiddenShow = ({ onClick, ...props }) => (
  <Base onClick={flow(onClick, props.show)} {...props} />
)

HiddenShow.propTypes = {
  show: PropTypes.func.isRequired,
  onClick: PropTypes.func,
}

HiddenShow.defaultProps = {
  onClick: () => {},
}

export default as('button')(HiddenShow)
