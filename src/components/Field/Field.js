import styled from 'styled-components'
import { compose, setDisplayName, setPropTypes } from 'recompose'
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

const enhance = compose(
  as('div'),
  setDisplayName('Field'),
  setPropTypes(Flex.propTypes),
)

export default enhance(Field)
