import styled from 'styled-components'
import as from '../../enhancers/as'
import Flex from '../Flex'

const Field = styled(Flex)`
  flex-direction: column;
  flex: 1;
  label {
    padding-bottom: 0.5em;
  }
  > *:not(label):not(:last-child) {
    margin-bottom: 0.5em;
  }
`

export default as('div')(Field)
