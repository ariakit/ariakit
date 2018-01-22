import { withState, withHandlers } from 'recompose'
import namespace from '../../enhancers/namespace'

const withHiddenState = namespace('hidden', options => [
  withState('visible', 'setVisible', !!options.visible),
  withHandlers({
    toggle: ({ visible, setVisible }) => () => setVisible(!visible),
    show: ({ setVisible }) => () => setVisible(true),
    hide: ({ setVisible }) => () => setVisible(false),
  }),
])

export default withHiddenState
