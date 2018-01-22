import { compose, setDisplayName, setPropTypes } from 'recompose'
import as from '../../enhancers/as'
import Box from '../Box'

const enhance = compose(
  as('div'),
  setPropTypes(Box.propTypes),
  setDisplayName('GroupItem'),
)

export default enhance(Box)
