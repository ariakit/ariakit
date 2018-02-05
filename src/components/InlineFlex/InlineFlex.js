import styled from 'styled-components'
import { compose, setDisplayName, setPropTypes } from 'recompose'
import as from '../../enhancers/as'
import Flex from '../Flex'

const InlineFlex = styled(Flex)`
  display: inline-flex;
`

const enhance = compose(
  as('div'),
  setDisplayName('InlineFlex'),
  setPropTypes(Flex.propTypes),
)

export default enhance(InlineFlex)
