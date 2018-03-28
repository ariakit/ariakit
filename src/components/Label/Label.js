import React from 'react'
import as from '../../enhancers/as'
import InlineBlock from '../InlineBlock'

const Label = props => <InlineBlock {...props} />

export default as('label')(Label)
