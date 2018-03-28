const getDerivedStateFromProps = (nextProps, prevState, keys) =>
  keys.reduce((finalState, key) => {
    if (nextProps[key] !== prevState[key]) {
      return {
        ...finalState,
        [key]: nextProps[key],
      }
    }
    return finalState
  }, null)

export default getDerivedStateFromProps
