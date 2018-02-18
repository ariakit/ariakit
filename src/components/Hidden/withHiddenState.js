import { withState, withHandlers } from 'recompose'
import namespace from '../../enhancers/namespace'

const withHiddenState = namespace(
  'hidden',
  options => [
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
  ['visible'],
)

export default withHiddenState
