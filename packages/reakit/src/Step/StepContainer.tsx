/* eslint-disable react/no-unused-prop-types */
import * as React from "react";
import * as PropTypes from "prop-types";
import { Container, ContainerProps, SelectorMap } from "constate";
import omit from "../_utils/omit";

export const initialState = {
  loop: false,
  ids: [],
  current: -1,
  ordered: {}
};

export interface StepContainerState {
  loop: boolean;
  ids: Array<string>;
  current: number;
  ordered: {
    [key: string]: string;
  };
}

// Selectors types
export type GetCurrentId = () => string;
export type HasPrevious = () => boolean;
export type HasNext = () => boolean;
export type IndexOf = (idOrIndex: string | number) => number;
export type IsCurrent = (idOrIndex: string | number) => boolean;

// Action types
export type Show = (
  idOrIndex: string | number
) => (state: StepContainerState) => { current: number };

export type Hide = () => (state: StepContainerState) => { current: number };

export type Toggle = (
  idOrIndex: string | number
) => (state: StepContainerState) => { current: number };

export type Previous = () => (
  state: StepContainerState
) => { current?: number };

export type Next = () => (state: StepContainerState) => { current?: number };
export type Reorder = (
  id: string | number,
  order?: number
) => (
  state: StepContainerState
) => {
  ordered: object;
  ids: Array<string>;
  current?: number;
};

export type Register = (
  id: string | number,
  order?: number
) => (
  state: StepContainerState
) => {
  ordered: object;
  ids: Array<string>;
  current?: number;
};

export type Unregister = (
  id: string
) => (
  state: StepContainerState
) => Partial<StepContainerState> & { current?: number };

export type Update = (
  id: string,
  nextId: string,
  orderArg?: number
) => (
  state: StepContainerState
) => Partial<StepContainerState & { current?: number }>;

export const getCurrentId = () => (state: StepContainerState) =>
  state.ids[state.current];

export const hasPrevious = () => (state: StepContainerState) =>
  state.ids.length > 1 && !!state.ids[state.current - 1];

export const hasNext = () => (state: StepContainerState) =>
  state.ids.length > 1 && !!state.ids[state.current + 1];

export const indexOf = (idOrIndex: string | number) => (
  state: StepContainerState
) => (typeof idOrIndex === "number" ? idOrIndex : state.ids.indexOf(idOrIndex));

export const isCurrent = (idOrIndex: string | number) => (
  state: StepContainerState
) => state.current >= 0 && state.current === indexOf(idOrIndex)(state);

export const show = (idOrIndex: string | number) => (
  state: StepContainerState
) => ({
  current: indexOf(idOrIndex)(state)
});

export const hide = () => () => ({ current: -1 });

export const toggle = (idOrIndex: string | number) => (
  state: StepContainerState
) => (isCurrent(idOrIndex)(state) ? hide()() : show(idOrIndex)(state));

export const previous = () => (state: StepContainerState) => {
  if (hasPrevious()(state)) {
    return { current: state.current - 1 };
  }
  if (state.loop) {
    return { current: state.ids.length - 1 };
  }
  return {};
};

export const next = () => (state: StepContainerState) => {
  if (hasNext()(state)) {
    return { current: state.current + 1 };
  }
  if (state.loop) {
    return { current: 0 };
  }
  return {};
};

export const reorder = (id: string, order = 0) => (
  state: StepContainerState
) => {
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

export const register = (id: string, order = 0) => (
  state: StepContainerState
) => {
  const ids = state.ids.indexOf(id) >= 0 ? state.ids : [...state.ids, id];
  return reorder(id, order)({ ...state, ids });
};

export const unregister = (id: string) => (state: StepContainerState) => {
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
    return { ...hide()(), ids, ordered };
  }
  if (state.current >= ids.length) {
    return { current: ids.length - 1, ids, ordered };
  }
  return { ids, ordered };
};

export const update = (id: string, nextId: string, orderArg?: number) => (
  state: StepContainerState
) => {
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

interface Selectors {
  getCurrentId: GetCurrentId;
  hasPrevious: HasPrevious;
  hasNext: HasNext;
  indexOf: IndexOf;
  isCurrent: IsCurrent;
}

// interface Actions {
//   show;
//   hide;
//   toggle;
//   previous;
//   next;
//   reorder;
//   register;
//   unregister;
//   update;
// }

const selectors: SelectorMap<StepContainerState, Selectors> = {
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
const StepContainer: React.SFC<ContainerProps<StepContainerState>> = props => (
  <Container
    {...props}
    initialState={{ ...initialState, ...props.initialState }}
    selectors={{ ...selectors, ...props.selectors }}
    actions={{ ...actions, ...props.actions }}
  />
);

// @ts-ignore
StepContainer.propTypes = {
  initialState: PropTypes.object,
  actions: PropTypes.objectOf(PropTypes.func),
  selectors: PropTypes.objectOf(PropTypes.func)
};

export default StepContainer;
