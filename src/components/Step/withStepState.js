import { withHandlers, withProps, withStateHandlers } from 'recompose'
import namespace from '../../enhancers/namespace'

const getCurrentId = state => () => state.ids[state.current]

const hasPrevious = state => () =>
  state.ids.length > 1 && !!state.ids[state.current - 1]

const hasNext = state => () =>
  state.ids.length > 1 && !!state.ids[state.current + 1]

const indexOf = state => idOrIndex =>
  typeof idOrIndex === 'number' ? idOrIndex : state.ids.indexOf(idOrIndex)

const isCurrent = state => idOrIndex =>
  state.current >= 0 && state.current === indexOf(state)(idOrIndex)

const show = state => idOrIndex => ({ current: indexOf(state)(idOrIndex) })

const hide = () => () => ({ current: -1 })

const toggle = state => idOrIndex =>
  isCurrent(state)(idOrIndex) ? hide(state)() : show(state)(idOrIndex)

const previous = (state, props) => () => {
  if (hasPrevious(state)()) {
    return { current: state.current - 1 }
  } else if (props.loop) {
    return { current: state.ids.length - 1 }
  }
  return state
}

const next = (state, props) => () => {
  if (hasNext(state)()) {
    return { current: state.current + 1 }
  } else if (props.loop) {
    return { current: 0 }
  }
  return state
}

const reorder = state => (id, order) => {
  const ordered = { ...state.ordered, [id]: order }
  const ids = state.ids
    .slice()
    .sort((a, b) => (ordered[a] || 0) - (ordered[b] || 0))
  return {
    ordered,
    ids,
    ...(isCurrent(state)(id) ? show({ ...state, ids })(id) : {}),
  }
}

const register = state => (id, order = 0) => {
  const ids = state.ids.indexOf(id) >= 0 ? state.ids : [...state.ids, id]
  return reorder({ ...state, ids })(id, order)
}

const unregister = state => id => {
  const index = indexOf(state)(id)
  if (index === -1) {
    return state
  }

  const ids = [...state.ids.slice(0, index), ...state.ids.slice(index + 1)]

  if (isCurrent(state)(id) && !hasNext(state)()) {
    if (hasPrevious(state)()) {
      return { ...previous(state)(), ids }
    }
    return { ...hide(state)(), ids }
  } else if (state.current >= ids.length) {
    return { current: ids.length - 1, ids }
  }
  return { ids }
}

const update = state => (id, nextId, order = state.ordered[id]) => {
  const idChanged = id !== nextId
  const orderChanged = order !== state.ordered[id]

  if (!idChanged && !orderChanged) return state

  const overridingId = idChanged && state.ids.indexOf(nextId) >= 0

  if (overridingId) {
    const nextState = orderChanged ? reorder(state)(nextId, order) : {}
    return unregister({ ...state, ...nextState })(id)
  }

  const index = indexOf(state)(id)
  const ids = [
    ...state.ids.slice(0, index),
    nextId,
    ...state.ids.slice(index + 1),
  ]
  return reorder({ ...state, ids })(nextId, order)
}

const selectors = { getCurrentId, hasPrevious, hasNext, indexOf, isCurrent }
const handlers = {
  show,
  hide,
  toggle,
  previous,
  next,
  reorder,
  register,
  unregister,
  update,
}

const withStepState = namespace(
  'step',
  options => [
    withProps({ loop: !!options.loop }),
    withStateHandlers(
      {
        ids: options.ids || [],
        current: typeof options.current !== 'undefined' ? options.current : -1,
        ordered: options.ordered || {},
      },
      handlers,
    ),
    withHandlers(selectors),
  ],
  [
    'loop',
    'ids',
    'current',
    'ordered',
    ...Object.keys(selectors),
    ...Object.keys(handlers),
  ],
)

export default withStepState
