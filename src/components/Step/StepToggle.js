import React from 'react'
import PropTypes from 'prop-types'
import flow from 'lodash/flow'
import { compose, setDisplayName, setPropTypes } from 'recompose'
import as from '../../enhancers/as'
import Base from '../Base'

const toggle = props => () => props.toggle(props.step)

const StepToggle = ({ onClick = () => {}, ...props }) => (
  <Base onClick={flow(toggle(props), onClick)} {...props} />
)

const enhance = compose(
  as('button'),
  setDisplayName('StepToggle'),
  setPropTypes({
    ...Base.propTypes,
    step: PropTypes.string.isRequired,
    toggle: PropTypes.func.isRequired,
    onClick: PropTypes.func,
  }),
)

export default enhance(StepToggle)
