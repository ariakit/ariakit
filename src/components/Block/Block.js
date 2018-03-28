import styled from 'styled-components'
import as from '../../enhancers/as'
import Base from '../Base'

const Block = styled(Base)`
  display: block;
`

export default as('div')(Block)
