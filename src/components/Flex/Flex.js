import styled from 'styled-components'
import { compose, setDisplayName, setPropTypes } from 'recompose'
import as from '../../enhancers/as'
import Base from '../Base'

const Flex = styled(Base)`
  display: flex;
`

const enhance = compose(
  as('div'),
  setDisplayName('Flex'),
  setPropTypes(Base.propTypes),
)

export default enhance(Flex)
