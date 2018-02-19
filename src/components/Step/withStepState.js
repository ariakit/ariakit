import PropTypes from 'prop-types'
import { withState, withHandlers, withProps, setPropTypes } from 'recompose'
import namespace from '../../enhancers/namespace'

const getCurrentId = props => () => props.ids[props.current]

const hasPrevious = props => () =>
  props.ids.length > 1 && !!props.ids[props.current - 1]

const hasNext = props => () =>
  props.ids.length > 1 && !!props.ids[props.current + 1]

const indexOf = props => idOrIndex =>
  typeof idOrIndex === 'number' ? idOrIndex : props.ids.indexOf(idOrIndex)

const show = props => idOrIndex => props.setCurrent(indexOf(props)(idOrIndex))

const hide = props => () => props.setCurrent(-1)

const isCurrent = props => idOrIndex =>
  props.current >= 0 && props.current === indexOf(props)(idOrIndex)

const toggle = props => idOrIndex =>
  isCurrent(props)(idOrIndex) ? hide(props)() : show(props)(idOrIndex)

const previous = props => () => {
  if (hasPrevious(props)()) {
    props.setCurrent(current => current - 1)
  } else if (props.loop) {
    show(props)(props.ids.length - 1)
  }
}

const next = props => () => {
  if (hasNext(props)()) {
    props.setCurrent(current => current + 1)
  } else if (props.loop) {
    show(props)(0)
  }
}

const reorder = props => (id, order) => {
  props.setOrdered(ordered => {
    const nextOrdered = { ...ordered, [id]: order }
    const current = isCurrent(props)(id)
    props.setIds(
      ids => ids.sort((a, b) => (nextOrdered[a] || 0) - (nextOrdered[b] || 0)),
      () => current && show(props)(id),
    )
    return nextOrdered
  })
}

const register = props => (id, order = 0) => {
  props.setIds(
    ids => {
      if (ids.indexOf(id) >= 0) {
        return ids
      }
      return [...ids, id]
    },
    () => reorder(props)(id, order),
  )
}

const unregister = props => id => {
  props.setIds(ids => {
    const index = indexOf(props)(id)
    if (index === -1) {
      return ids
    }

    if (isCurrent(props)(id) && !hasNext(props)()) {
      if (hasPrevious(props)()) {
        previous(props)()
      } else {
        hide(props)()
      }
    }
    return [...props.ids.slice(0, index), ...ids.slice(index + 1)]
  })
}

const update = props => (id, nextId, order = props.ordered[id]) => {
  const idChanged = id !== nextId
  const orderChanged = order !== props.ordered[id]

  if (!idChanged && !orderChanged) return

  const overridingId = idChanged && props.ids.indexOf(nextId) >= 0

  if (overridingId) {
    unregister(props)(id)
    if (orderChanged) {
      reorder(props)(nextId, order)
    }
  } else {
    props.setIds(
      ids => {
        const index = indexOf(props)(id)
        return [...props.ids.slice(0, index), nextId, ...ids.slice(index + 1)]
      },
      () => {
        if (orderChanged) {
          reorder(props)(nextId, order)
        }
      },
    )
  }
}

const handlers = {
  getCurrentId,
  hasPrevious,
  hasNext,
  indexOf,
  show,
  hide,
  isCurrent,
  toggle,
  previous,
  next,
  reorder,
  register,
  unregister,
  update,
}

const propTypes = {
  loop: PropTypes.bool,
  ids: PropTypes.array,
  current: PropTypes.number,
}

const withStepState = namespace(
  'step',
  options => [
    setPropTypes(propTypes),
    withProps(props => ({
      loop: typeof props.loop !== 'undefined' ? props.loop : !!options.loop,
    })),
    withState('ids', 'setIds', props => props.ids || options.ids || []),
    withState('ordered', 'setOrdered', {}),
    withState('current', 'setCurrent', props => {
      if (typeof props.current !== 'undefined') {
        return props.current
      }
      return typeof options.current !== 'undefined' ? options.current : -1
    }),
    withHandlers(handlers),
  ],
  Object.keys(propTypes),
)

export default withStepState
