import styled from 'styled-components'
import { compose, setDisplayName, setPropTypes } from 'recompose'
import as from '../../enhancers/as'
import Base from '../Base'

const InlineFlex = styled(Base)`
  display: inline-flex;
`

const enhance = compose(
  as('div'),
  setDisplayName('InlineFlex'),
  setPropTypes(Base.propTypes),
)

export default enhance(InlineFlex)
