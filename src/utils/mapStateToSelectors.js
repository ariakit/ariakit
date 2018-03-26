const mapStateToSelectors = (state, selectorsMap) =>
  Object.keys(selectorsMap).reduce(
    (finalSelectors, selectorKey) => ({
      ...finalSelectors,
      [selectorKey]: (...args) => selectorsMap[selectorKey](...args)(state),
    }),
    {},
  )

export default mapStateToSelectors
