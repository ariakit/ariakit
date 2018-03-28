import React from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components'
import as from '../../enhancers/as'
import Hidden from '../Hidden'
import Perpendicular from '../Perpendicular'
import Box from '../Box'

const HiddenPerpendicularBox = Hidden.as([Perpendicular, Box])

const Component = props => (
  <HiddenPerpendicularBox id={props.popoverId} {...props} />
)

const Popover = styled(Component)`
  user-select: auto;
  cursor: auto;
  color: inherit;
  background-color: white;
  padding: 1em;
  z-index: 999;
  outline: 0;
`

Popover.propTypes = {
  popoverId: PropTypes.string,
}

Popover.defaultProps = {
  role: 'group',
  pos: 'bottom',
  align: 'center',
  hideOnEsc: true,
}

export default as('div')(Popover)
