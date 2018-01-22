import PropTypes from 'prop-types'
import { compose, setDisplayName, setPropTypes, withProps } from 'recompose'
import as from '../../enhancers/as'
import Hidden from '../Hidden'

const enhance = compose(
  as('button'),
  setDisplayName('PopoverToggle'),
  setPropTypes({
    ...Hidden.Toggle.propTypes,
    popoverId: PropTypes.string.isRequired,
    visible: PropTypes.bool,
  }),
  withProps(props => ({
    'aria-expanded': props.visible,
    'aria-controls': props.popoverId,
    'aria-haspopup': true,
  })),
)

export default enhance(Hidden.Toggle)
