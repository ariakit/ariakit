import React from 'react'
import PropTypes from 'prop-types'
import flow from 'lodash/flow'
import { compose, setDisplayName, setPropTypes, setStatic } from 'recompose'
import as from '../../enhancers/as'
import Base from '../Base'

const StepHide = ({ onClick, ...props }) => (
  <Base onClick={flow(props.hide, onClick)} {...props} />
)

const enhance = compose(
  as('button'),
  setDisplayName('StepHide'),
  setPropTypes({
    ...Base.propTypes,
    hide: PropTypes.func.isRequired,
    onClick: PropTypes.func,
  }),
  setStatic('defaultProps', {
    onClick: () => {},
  }),
)

export default enhance(StepHide)
