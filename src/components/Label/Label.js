import React from 'react'
import { compose, setDisplayName, setPropTypes } from 'recompose'
import as from '../../enhancers/as'
import InlineBlock from '../InlineBlock'

const Label = props => <InlineBlock {...props} />

const enhance = compose(
  as('label'),
  setDisplayName('Label'),
  setPropTypes(InlineBlock.propTypes),
)

export default enhance(Label)
