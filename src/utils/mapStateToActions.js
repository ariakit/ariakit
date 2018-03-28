const mapStateToActions = (scope, actionsMap) =>
  Object.keys(actionsMap).reduce(
    (finalActions, actionKey) => ({
      ...finalActions,
      [actionKey]: (...args) => scope.setState(actionsMap[actionKey](...args)),
    }),
    {},
  )

export default mapStateToActions
