import styled from 'styled-components'
import { compose, setDisplayName, setPropTypes } from 'recompose'
import as from '../../enhancers/as'
import Base from '../Base'

const Box = styled(Base)`
  border: 1px solid rgba(0, 0, 0, 0.3);
  border-radius: 0.25em;
`

const enhance = compose(
  as('div'),
  setDisplayName('Box'),
  setPropTypes(Base.propTypes),
)

export default enhance(Box)
