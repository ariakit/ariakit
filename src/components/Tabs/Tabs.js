import styled from 'styled-components'
import as from '../../enhancers/as'
import Flex from '../Flex'

const Tabs = styled(Flex)`
  align-items: flex-end;
  list-style: none;
  @media screen and (max-width: 640px) {
    overflow-x: auto;
  }
`

Tabs.defaultProps = {
  role: 'tablist',
}

export default as('ul')(Tabs)
