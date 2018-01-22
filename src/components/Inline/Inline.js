import styled from 'styled-components'
import { compose, setDisplayName, setPropTypes } from 'recompose'
import as from '../../enhancers/as'
import Base from '../Base'

const Inline = styled(Base)`
  display: inline;
`

const enhance = compose(
  as('span'),
  setDisplayName('Inline'),
  setPropTypes(Base.propTypes),
)

export default enhance(Inline)
