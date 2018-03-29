const mapStateToActions = (setState, actionsMap) =>
  Object.keys(actionsMap).reduce(
    (finalActions, actionKey) => ({
      ...finalActions,
      [actionKey]: (...args) => setState(actionsMap[actionKey](...args)),
    }),
    {},
  )

export default mapStateToActions
