import React from 'react'
import { compose, setDisplayName, setPropTypes } from 'recompose'
import as from '../../enhancers/as'
import Box from '../Box'

const GroupItem = props => <Box {...props} />

const enhance = compose(
  as('div'),
  setDisplayName('GroupItem'),
  setPropTypes(Box.propTypes),
)

export default enhance(GroupItem)
