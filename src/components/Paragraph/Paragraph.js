import styled from 'styled-components'
import as from '../../enhancers/as'
import Base from '../Base'

const Paragraph = styled(Base)`
  margin-bottom: 1rem;
`

export default as('p')(Paragraph)
