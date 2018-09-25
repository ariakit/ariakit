import * as React from "react";
import * as PropTypes from "prop-types";
import {
  Container,
  ActionMap,
  SelectorMap,
  ComposableContainer
} from "constate";
import callMeMaybe from "../_utils/callMeMaybe";
import omit from "../_utils/omit";

export interface StepContainerState {
  loop: boolean;
  ids: Array<string>;
  current: number;
  ordered: {
    [key: string]: number;
  };
}

export interface StepContainerSelectors {
  getCurrentId: () => string;
  hasPrevious: () => boolean;
  hasNext: () => boolean;
  indexOf: (idOrIndex: string | number) => number;
  isCurrent: (idOrIndex: string | number) => boolean;
}

export interface StepContainerActions {
  show: (idOrIndex: string | number) => void;
  hide: () => void;
  toggle: (idOrIndex: string | number) => void;
  previous: () => void;
  next: () => void;
  reorder: (id: string, order?: number) => void;
  register: (id: string, order?: number) => void;
  unregister: (id: string) => void;
  update: (id: string, nextId: string, orderArg?: number) => void;
}

const initialState: StepContainerState = {
  loop: false,
  ids: [],
  current: -1,
  ordered: {}
};

const selectors: SelectorMap<StepContainerState, StepContainerSelectors> = {
  getCurrentId: () => state => state.ids[state.current],

  hasPrevious: () => state =>
    state.ids.length > 1 && !!state.ids[state.current - 1],

  hasNext: () => state =>
    state.ids.length > 1 && !!state.ids[state.current + 1],

  indexOf: (idOrIndex: string | number) => state =>
    typeof idOrIndex === "number" ? idOrIndex : state.ids.indexOf(idOrIndex),

  isCurrent: (idOrIndex: string | number) => state =>
    state.current >= 0 && state.current === selectors.indexOf(idOrIndex)(state)
};

const actions: ActionMap<StepContainerState, StepContainerActions> = {
  show: (idOrIndex: string | number) => state => ({
    current: selectors.indexOf(idOrIndex)(state)
  }),

  hide: () => ({ current: -1 }),

  toggle: (idOrIndex: string | number) => state =>
    selectors.isCurrent(idOrIndex)(state)
      ? callMeMaybe(actions.hide(), state)
      : callMeMaybe(actions.show(idOrIndex), state),

  previous: () => state => {
    if (selectors.hasPrevious()(state)) {
      return { current: state.current - 1 };
    }
    if (state.loop) {
      return { current: state.ids.length - 1 };
    }
    return {};
  },

  next: () => state => {
    if (selectors.hasNext()(state)) {
      return { current: state.current + 1 };
    }
    if (state.loop) {
      return { current: 0 };
    }
    return {};
  },

  reorder: (id: string, order = 0) => state => {
    const ordered = { ...state.ordered, [id]: order };
    const ids = state.ids
      .slice()
      .sort((a, b) => (ordered[a] || 0) - (ordered[b] || 0));
    return {
      ordered,
      ids,
      ...(selectors.isCurrent(id)(state)
        ? callMeMaybe(actions.show(id), { ...state, ids })
        : {})
    };
  },

  register: (id: string, order = 0) => state => {
    const ids = state.ids.indexOf(id) >= 0 ? state.ids : [...state.ids, id];
    return callMeMaybe(actions.reorder(id, order), { ...state, ids });
  },

  unregister: (id: string) => state => {
    const index = selectors.indexOf(id)(state);
    if (index === -1) {
      return {};
    }

    const ordered = omit(state.ordered, state.ids[index]);
    const ids = [...state.ids.slice(0, index), ...state.ids.slice(index + 1)];

    if (selectors.isCurrent(id)(state) && !selectors.hasNext()(state)) {
      if (selectors.hasPrevious()(state)) {
        return { ...callMeMaybe(actions.previous(), state), ids, ordered };
      }
      return { ...callMeMaybe(actions.hide(), state), ids, ordered };
    }
    if (state.current >= ids.length) {
      return { current: ids.length - 1, ids, ordered };
    }
    return { ids, ordered };
  },

  update: (id: string, nextId: string, orderArg?: number) => state => {
    const order =
      typeof orderArg !== "undefined" ? orderArg : state.ordered[id];
    const idChanged = id !== nextId;
    const orderChanged = order !== state.ordered[id];

    if (!idChanged && !orderChanged) return {};

    const overridingId = idChanged && state.ids.indexOf(nextId) >= 0;

    if (overridingId) {
      const nextOrderChanged = order !== state.ordered[nextId];
      const nextState = nextOrderChanged
        ? callMeMaybe(actions.reorder(nextId, order), state)
        : {};
      return callMeMaybe(actions.unregister(id), { ...state, ...nextState });
    }

    const index = selectors.indexOf(id)(state);
    const ids = [
      ...state.ids.slice(0, index),
      nextId,
      ...state.ids.slice(index + 1)
    ];

    return callMeMaybe(actions.reorder(nextId, order), { ...state, ids });
  }
};

// istanbul ignore next
const StepContainer: ComposableContainer<
  StepContainerState,
  StepContainerActions,
  StepContainerSelectors
> = props => (
  <Container
    {...props}
    initialState={{ ...initialState, ...props.initialState }}
    selectors={selectors}
    actions={actions}
  />
);

// @ts-ignore
StepContainer.propTypes = {
  initialState: PropTypes.object
};

export const stepContainerState = initialState;
export const stepContainerActions = actions;
export const stepContainerSelectors = selectors;

export default StepContainer;
