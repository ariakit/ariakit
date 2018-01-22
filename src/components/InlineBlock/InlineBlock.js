import styled from 'styled-components'
import { compose, setDisplayName, setPropTypes } from 'recompose'
import as from '../../enhancers/as'
import Base from '../Base'

const InlineBlock = styled(Base)`
  display: inline-block;
`

const enhance = compose(
  as('div'),
  setDisplayName('InlineBlock'),
  setPropTypes(Base.propTypes),
)

export default enhance(InlineBlock)
