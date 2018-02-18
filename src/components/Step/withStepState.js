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
    show(props)(props.current - 1)
  } else if (props.loop) {
    show(props)(props.ids.length - 1)
  }
}

const next = props => () => {
  if (hasNext(props)()) {
    show(props)(props.current + 1)
  } else if (props.loop) {
    show(props)(0)
  }
}

const register = props => id => {
  props.setIds(ids => {
    if (ids.indexOf(id) >= 0) return ids
    return [...ids, id]
  })
}

const unregister = props => id => {
  props.setIds(ids => {
    const index = indexOf(props)(id)
    if (index === -1) return ids

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

const update = props => (id, nextId) => {
  if (id === nextId) return
  if (props.ids.indexOf(nextId) >= 0) {
    unregister(props)(id)
  } else {
    props.setIds(ids => {
      const index = indexOf(props)(id)
      return [...props.ids.slice(0, index), nextId, ...ids.slice(index + 1)]
    })
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
  register,
  unregister,
  update,
}

const withStepState = namespace(
  'step',
  options => [
    setPropTypes({
      loop: PropTypes.bool,
      ids: PropTypes.array,
      current: PropTypes.number,
    }),
    withProps(props => ({
      loop: typeof props.loop !== 'undefined' ? props.loop : !!options.loop,
    })),
    withState('ids', 'setIds', props => props.ids || options.ids || []),
    withState('current', 'setCurrent', props => {
      if (typeof props.current !== 'undefined') {
        return props.current
      }
      return typeof options.current !== 'undefined' ? options.current : -1
    }),
    withHandlers(handlers),
  ],
  ['loop', 'ids', 'current'],
)

export default withStepState
