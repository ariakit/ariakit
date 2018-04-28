/* eslint-disable react/no-unused-prop-types */
import React from "react";
import PropTypes from "prop-types";
import omit from "lodash/omit";
import { Container } from "constate";

export const initialState = {
  loop: false,
  ids: [],
  current: -1,
  ordered: {}
};

export const getCurrentId = () => state => state.ids[state.current];

export const hasPrevious = () => state =>
  state.ids.length > 1 && !!state.ids[state.current - 1];

export const hasNext = () => state =>
  state.ids.length > 1 && !!state.ids[state.current + 1];

export const indexOf = idOrIndex => state =>
  typeof idOrIndex === "number" ? idOrIndex : state.ids.indexOf(idOrIndex);

export const isCurrent = idOrIndex => state =>
  state.current >= 0 && state.current === indexOf(idOrIndex)(state);

export const show = idOrIndex => state => ({
  current: indexOf(idOrIndex)(state)
});

export const hide = () => () => ({ current: -1 });

export const toggle = idOrIndex => state =>
  isCurrent(idOrIndex)(state) ? hide()(state) : show(idOrIndex)(state);

export const previous = () => state => {
  if (hasPrevious()(state)) {
    return { current: state.current - 1 };
  } else if (state.loop) {
    return { current: state.ids.length - 1 };
  }
  return {};
};

export const next = () => state => {
  if (hasNext()(state)) {
    return { current: state.current + 1 };
  } else if (state.loop) {
    return { current: 0 };
  }
  return {};
};

export const reorder = (id, order = 0) => state => {
  const ordered = { ...state.ordered, [id]: order };
  const ids = state.ids
    .slice()
    .sort((a, b) => (ordered[a] || 0) - (ordered[b] || 0));
  return {
    ordered,
    ids,
    ...(isCurrent(id)(state) ? show(id)({ ...state, ids }) : {})
  };
};

export const register = (id, order = 0) => state => {
  const ids = state.ids.indexOf(id) >= 0 ? state.ids : [...state.ids, id];
  return reorder(id, order)({ ...state, ids });
};

export const unregister = id => state => {
  const index = indexOf(id)(state);
  if (index === -1) {
    return {};
  }

  const ordered = omit(state.ordered, state.ids[index]);
  const ids = [...state.ids.slice(0, index), ...state.ids.slice(index + 1)];

  if (isCurrent(id)(state) && !hasNext()(state)) {
    if (hasPrevious()(state)) {
      return { ...previous()(state), ids, ordered };
    }
    return { ...hide()(state), ids, ordered };
  } else if (state.current >= ids.length) {
    return { current: ids.length - 1, ids, ordered };
  }
  return { ids, ordered };
};

export const update = (id, nextId, orderArg) => state => {
  const order = typeof orderArg !== "undefined" ? orderArg : state.ordered[id];
  const idChanged = id !== nextId;
  const orderChanged = order !== state.ordered[id];

  if (!idChanged && !orderChanged) return {};

  const overridingId = idChanged && state.ids.indexOf(nextId) >= 0;

  if (overridingId) {
    const nextOrderChanged = order !== state.ordered[nextId];
    const nextState = nextOrderChanged ? reorder(nextId, order)(state) : {};
    return unregister(id)({ ...state, ...nextState });
  }

  const index = indexOf(id)(state);
  const ids = [
    ...state.ids.slice(0, index),
    nextId,
    ...state.ids.slice(index + 1)
  ];
  return reorder(nextId, order)({ ...state, ids });
};

const selectors = {
  getCurrentId,
  hasPrevious,
  hasNext,
  indexOf,
  isCurrent
};

const actions = {
  show,
  hide,
  toggle,
  previous,
  next,
  reorder,
  register,
  unregister,
  update
};

// istanbul ignore next
const StepContainer = props => (
  <Container
    {...props}
    initialState={{ ...initialState, ...props.initialState }}
    selectors={{ ...selectors, ...props.selectors }}
    actions={{ ...actions, ...props.actions }}
  />
);

StepContainer.propTypes = {
  initialState: PropTypes.object,
  actions: PropTypes.object,
  selectors: PropTypes.object
};

export default StepContainer;
