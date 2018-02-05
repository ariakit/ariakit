import { withState, withHandlers, withProps } from 'recompose'
import namespace from '../../enhancers/namespace'

const withStepState = namespace('step', options => [
  withProps({ loop: options.loop }),
  withState('items', 'setItems', options.items || []),
  withState('current', 'setCurrent', options.current),
  withHandlers({
    hasPrevious: ({ items, current }) => () =>
      items.length > 1 && !!items[current - 1],
    hasNext: ({ items, current }) => () =>
      items.length > 1 && !!items[current + 1],
    indexOf: ({ items }) => indexOrStep =>
      typeof indexOrStep === 'number'
        ? indexOrStep
        : items.indexOf(indexOrStep),
  }),
  withHandlers({
    show: ({ indexOf, setCurrent }) => step => setCurrent(indexOf(step)),
    hide: ({ setCurrent }) => () => setCurrent(),
    isCurrent: ({ indexOf, current }) => step => current === indexOf(step),
  }),
  withHandlers({
    toggle: ({ show, hide, isCurrent }) => step =>
      isCurrent(step) ? hide() : show(step),
    previous: ({ hasPrevious, show, current, items }) => () => {
      if (hasPrevious()) {
        show(current - 1)
      } else if (options.loop) {
        show(items.length - 1)
      }
    },
    next: ({ hasNext, show, current }) => () => {
      if (hasNext()) {
        show(current + 1)
      } else if (options.loop) {
        show(0)
      }
    },
  }),
  withHandlers({
    register: ({ setItems }) => step => {
      setItems(items => [...items, step])
    },
    update: ({ setItems, indexOf }) => (step, nextStep) =>
      setItems(items => {
        const index = indexOf(step)
        return [...items.slice(0, index), nextStep, ...items.slice(index + 1)]
      }),
    unregister: props => step => {
      const {
        setItems,
        indexOf,
        current,
        hide,
        hasNext,
        hasPrevious,
        previous,
      } = props
      setItems(items => {
        const index = indexOf(step)
        if (current === index && !hasNext()) {
          if (hasPrevious()) {
            previous()
          } else {
            hide()
          }
        }
        return [...items.slice(0, index), ...items.slice(index + 1)]
      })
    },
  }),
])

export default withStepState
