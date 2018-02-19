import { withStateHandlers } from 'recompose'
import namespace from '../../enhancers/namespace'

const toggle = state => () => ({ visible: !state.visible })
const show = () => () => ({ visible: true })
const hide = () => () => ({ visible: false })

const handlers = { toggle, show, hide }

const withHiddenState = namespace(
  'hidden',
  options => [
    withStateHandlers(
      {
        visible: !!options.visible,
      },
      handlers,
    ),
  ],
  ['visible', ...Object.keys(handlers)],
)

export default withHiddenState
