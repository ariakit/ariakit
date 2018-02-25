import styled from 'styled-components'
import { compose, setDisplayName, setPropTypes } from 'recompose'
import as from '../../enhancers/as'
import Box from '../Box'

const GroupItem = styled(Box)``

const enhance = compose(
  as('div'),
  setDisplayName('GroupItem'),
  setPropTypes(Box.propTypes),
)

export default enhance(GroupItem)
