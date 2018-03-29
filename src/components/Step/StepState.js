/* eslint-disable react/no-unused-prop-types */
import React from 'react'
import PropTypes from 'prop-types'
import polyfill from 'react-lifecycles-compat'
import getDerivedStateFromProps from '../../utils/getDerivedStateFromProps'
import State from '../State'

const getCurrentId = () => state => state.ids[state.current]

const hasPrevious = () => state =>
  state.ids.length > 1 && !!state.ids[state.current - 1]

const hasNext = () => state =>
  state.ids.length > 1 && !!state.ids[state.current + 1]

const indexOf = idOrIndex => state =>
  typeof idOrIndex === 'number' ? idOrIndex : state.ids.indexOf(idOrIndex)

const isCurrent = idOrIndex => state =>
  state.current >= 0 && state.current === indexOf(idOrIndex)(state)

const show = idOrIndex => state => ({ current: indexOf(idOrIndex)(state) })

const hide = () => () => ({ current: -1 })

const toggle = idOrIndex => state =>
  isCurrent(idOrIndex)(state) ? hide()(state) : show(idOrIndex)(state)

const previous = () => state => {
  if (hasPrevious()(state)) {
    return { current: state.current - 1 }
  } else if (state.loop) {
    return { current: state.ids.length - 1 }
  }
  return state
}

const next = () => state => {
  if (hasNext()(state)) {
    return { current: state.current + 1 }
  } else if (state.loop) {
    return { current: 0 }
  }
  return state
}

const reorder = (id, order) => state => {
  const ordered = { ...state.ordered, [id]: order }
  const ids = state.ids
    .slice()
    .sort((a, b) => (ordered[a] || 0) - (ordered[b] || 0))
  return {
    ordered,
    ids,
    ...(isCurrent(id)(state) ? show(id)({ ...state, ids }) : {}),
  }
}

const register = (id, order = 0) => state => {
  const ids = state.ids.indexOf(id) >= 0 ? state.ids : [...state.ids, id]
  return reorder(id, order)({ ...state, ids })
}

const unregister = id => state => {
  const index = indexOf(id)(state)
  if (index === -1) {
    return state
  }

  const ids = [...state.ids.slice(0, index), ...state.ids.slice(index + 1)]

  if (isCurrent(id)(state) && !hasNext()(state)) {
    if (hasPrevious()(state)) {
      return { ...previous()(state), ids }
    }
    return { ...hide()(state), ids }
  } else if (state.current >= ids.length) {
    return { current: ids.length - 1, ids }
  }
  return { ids }
}

const update = (id, nextId, orderArg) => state => {
  const order = typeof orderArg !== 'undefined' ? orderArg : state.ordered[id]
  const idChanged = id !== nextId
  const orderChanged = order !== state.ordered[id]

  if (!idChanged && !orderChanged) return state

  const overridingId = idChanged && state.ids.indexOf(nextId) >= 0

  if (overridingId) {
    const nextState = orderChanged ? reorder(nextId, order)(state) : {}
    return unregister(id)({ ...state, ...nextState })
  }

  const index = indexOf(id)(state)
  const ids = [
    ...state.ids.slice(0, index),
    nextId,
    ...state.ids.slice(index + 1),
  ]
  return reorder(nextId, order)({ ...state, ids })
}

class StepState extends React.Component {
  static propTypes = {
    loop: PropTypes.bool,
    ids: PropTypes.arrayOf(PropTypes.string),
    current: PropTypes.number,
    ordered: PropTypes.objectOf(PropTypes.number),
    state: PropTypes.object,
    actions: PropTypes.object,
    selectors: PropTypes.object,
  }

  static defaultProps = {
    loop: false,
    ids: [],
    current: -1,
    ordered: {},
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    return getDerivedStateFromProps(
      nextProps,
      prevState,
      Object.keys(StepState.defaultProps),
    )
  }

  state = {}

  render() {
    const state = { ...this.state, ...this.props.state }

    const actions = {
      show,
      hide,
      toggle,
      previous,
      next,
      reorder,
      register,
      unregister,
      update,
      ...this.props.actions,
    }

    const selectors = {
      getCurrentId,
      hasPrevious,
      hasNext,
      indexOf,
      isCurrent,
      ...this.props.selectors,
    }

    return (
      <State
        {...this.props}
        state={state}
        actions={actions}
        selectors={selectors}
        setState={(...args) => this.setState(...args)}
      />
    )
  }
}

export default polyfill(StepState)
