import styled from 'styled-components'
import as from '../../enhancers/as'
import Flex from '../Flex'

const InlineFlex = styled(Flex)`
  display: inline-flex;
`

export default as('div')(InlineFlex)
