import PropTypes from 'prop-types'
import { withState, withHandlers, setPropTypes } from 'recompose'
import namespace from '../../enhancers/namespace'

const propTypes = {
  visible: PropTypes.bool,
}

const withHiddenState = namespace(
  'hidden',
  options => [
    setPropTypes(propTypes),
    withState(
      'visible',
      'setVisible',
      props =>
        typeof props.visible !== 'undefined'
          ? props.visible
          : !!options.visible,
    ),
    withHandlers({
      toggle: ({ visible, setVisible }) => () => setVisible(!visible),
      show: ({ setVisible }) => () => setVisible(true),
      hide: ({ setVisible }) => () => setVisible(false),
    }),
  ],
  Object.keys(propTypes),
)

export default withHiddenState
