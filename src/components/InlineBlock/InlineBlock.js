import styled from 'styled-components'
import as from '../../enhancers/as'
import Base from '../Base'

const InlineBlock = styled(Base)`
  display: inline-block;
`

export default as('div')(InlineBlock)
