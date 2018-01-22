import React from 'react'
import PropTypes from 'prop-types'
import flow from 'lodash/flow'
import { compose, setDisplayName, setPropTypes } from 'recompose'
import as from '../../enhancers/as'
import Base from '../Base'

const StepPrevious = ({ onClick = () => {}, ...props }) => (
  <Base
    onClick={flow(props.previous, onClick)}
    disabled={!props.loop && !props.hasPrevious()}
    {...props}
  />
)

const enhance = compose(
  as('button'),
  setDisplayName('StepPrevious'),
  setPropTypes({
    ...Base.propTypes,
    previous: PropTypes.func.isRequired,
    hasPrevious: PropTypes.func.isRequired,
    loop: PropTypes.bool,
    onClick: PropTypes.func,
  }),
)

export default enhance(StepPrevious)
