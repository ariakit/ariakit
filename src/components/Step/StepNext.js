import React from 'react'
import PropTypes from 'prop-types'
import flow from 'lodash/flow'
import { compose, setDisplayName, setPropTypes, setStatic } from 'recompose'
import as from '../../enhancers/as'
import Base from '../Base'

const StepNext = ({ onClick, ...props }) => (
  <Base
    onClick={flow(props.next, onClick)}
    disabled={!props.loop && !props.hasNext()}
    {...props}
  />
)

const enhance = compose(
  as('button'),
  setDisplayName('StepNext'),
  setPropTypes({
    ...Base.propTypes,
    next: PropTypes.func.isRequired,
    hasNext: PropTypes.func.isRequired,
    loop: PropTypes.bool,
    onClick: PropTypes.func,
  }),
  setStatic('defaultProps', {
    onClick: () => {},
  }),
)

export default enhance(StepNext)
