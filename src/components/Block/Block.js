import styled from 'styled-components'
import { compose, setDisplayName, setPropTypes } from 'recompose'
import as from '../../enhancers/as'
import Base from '../Base'

const Block = styled(Base)`
  display: block;
`

const enhance = compose(
  as('div'),
  setDisplayName('Block'),
  setPropTypes(Base.propTypes),
)

export default enhance(Block)
