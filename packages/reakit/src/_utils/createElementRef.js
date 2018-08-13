/* eslint-disable no-param-reassign */
const createElementRef = (scope, property) => element => {
  scope[property] = element;
  if (scope.props && scope.props.elementRef) {
    scope.props.elementRef(element);
  }
};

export default createElementRef;
