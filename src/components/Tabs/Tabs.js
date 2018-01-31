import styled from 'styled-components'
import { compose, setDisplayName, setPropTypes, setStatic } from 'recompose'
import as from '../../enhancers/as'
import Flex from '../Flex'

const Tabs = styled(Flex)`
  align-items: flex-end;
  list-style: none;
  @media screen and (max-width: 640px) {
    overflow-x: auto;
  }
`

const enhance = compose(
  as('ul'),
  setDisplayName('Tabs'),
  setPropTypes(Flex.propTypes),
  setStatic('defaultProps', {
    role: 'tablist',
  }),
)

export default enhance(Tabs)
