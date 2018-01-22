import { compose, setDisplayName, setPropTypes } from 'recompose'
import as from '../../enhancers/as'
import InlineBlock from '../InlineBlock'

const enhance = compose(
  as('label'),
  setDisplayName('Label'),
  setPropTypes(InlineBlock.propTypes),
)

export default enhance(InlineBlock)
