import React from 'react'
import PropTypes from 'prop-types'
import flow from 'lodash/flow'
import { compose, setDisplayName, setPropTypes, setStatic } from 'recompose'
import as from '../../enhancers/as'
import Base from '../Base'

const show = props => () => props.show(props.step)

const StepShow = ({ onClick, ...props }) => (
  <Base onClick={flow(show(props), onClick)} {...props} />
)

const enhance = compose(
  as('button'),
  setDisplayName('StepShow'),
  setPropTypes({
    ...Base.propTypes,
    show: PropTypes.func.isRequired,
    step: PropTypes.string.isRequired,
    onClick: PropTypes.func,
  }),
  setStatic('defaultProps', {
    onClick: () => {},
  }),
)

export default enhance(StepShow)
