import React from 'react'
import PropTypes from 'prop-types'
import { compose, setDisplayName, setPropTypes, setStatic } from 'recompose'
import flow from 'lodash/flow'
import as from '../../enhancers/as'
import Base from '../Base'

const HiddenHide = ({ onClick, ...props }) => (
  <Base onClick={flow(onClick, props.hide)} {...props} />
)

const enhance = compose(
  as('button'),
  setDisplayName('HiddenHide'),
  setPropTypes({
    ...Base.propTypes,
    hide: PropTypes.func.isRequired,
    onClick: PropTypes.func,
  }),
  setStatic('defaultProps', {
    onClick: () => {},
  }),
)

export default enhance(HiddenHide)
