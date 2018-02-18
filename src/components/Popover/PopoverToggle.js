import React from 'react'
import PropTypes from 'prop-types'
import { compose, setDisplayName, setPropTypes } from 'recompose'
import as from '../../enhancers/as'
import Hidden from '../Hidden'

const PopoverToggle = props => (
  <Hidden.Toggle
    aria-expanded={props.visible}
    aria-controls={props.popoverId}
    aria-haspopup
    {...props}
  />
)

const enhance = compose(
  as('button'),
  setDisplayName('PopoverToggle'),
  setPropTypes({
    ...Hidden.Toggle.propTypes,
    popoverId: PropTypes.string.isRequired,
    visible: PropTypes.bool,
  }),
)

export default enhance(PopoverToggle)
