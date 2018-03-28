import styled from 'styled-components'
import as from '../../enhancers/as'
import Base from '../Base'

const Inline = styled(Base)`
  display: inline;
`

export default as('span')(Inline)
