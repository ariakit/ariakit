import styled from 'styled-components'
import { compose, setDisplayName, setPropTypes } from 'recompose'
import as from '../../enhancers/as'
import Base from '../Base'

const Paragraph = styled(Base)`
  margin-bottom: 1rem;
`

const enhance = compose(
  as('p'),
  setDisplayName('Paragraph'),
  setPropTypes(Base.propTypes),
)

export default enhance(Paragraph)
