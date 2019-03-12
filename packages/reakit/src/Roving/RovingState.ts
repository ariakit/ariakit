import * as React from "react";

export type unstable_RovingState = {
  /** TODO: Description */
  orientation: "horizontal" | "vertical";
  /** TODO: Description */
  refs: any[];
  /** TODO: Description */
  enabled: boolean[];
  /** TODO: Description */
  selectedRef: any;
  /** TODO: Description */
  focusedRef: any;
  /** TODO: Description */
  autoSelect: boolean;
  /** TODO: Description */
  loop: boolean;
};

export type unstable_RovingSelectors = {
  /** TODO: Description */
  getNextRef: (ref: any) => any;
  /** TODO: Description */
  getPreviousRef: (ref: any) => any;
  /** TODO: Description */
  getFirstRef: () => any;
  /** TODO: Description */
  getLastRef: () => any;
};

export type unstable_RovingActions = {
  /** TODO: Description */
  register: (ref: any, disabled?: boolean) => void;
  /** TODO: Description */
  unregister: (ref: any) => void;
  /** TODO: Description */
  select: (ref: any) => void;
  /** TODO: Description */
  focus: (ref: any, select?: boolean) => void;
  /** TODO: Description */
  selectNext: () => void;
  /** TODO: Description */
  selectPrevious: () => void;
  /** TODO: Description */
  selectFirst: () => void;
  /** TODO: Description */
  selectLast: () => void;
  /** TODO: Description */
  focusNext: (select?: boolean) => void;
  /** TODO: Description */
  focusPrevious: (select?: boolean) => void;
  /** TODO: Description */
  focusFirst: (select?: boolean) => void;
  /** TODO: Description */
  focusLast: (select?: boolean) => void;
  /** TODO: Description */
  setOrientation: (orientation: unstable_RovingState["orientation"]) => void;
};

export type unstable_RovingInitialState = Partial<
  Pick<
    unstable_RovingState,
    "orientation" | "selectedRef" | "loop" | "autoSelect"
  >
>;

export type unstable_RovingStateReturn = unstable_RovingState &
  unstable_RovingSelectors &
  unstable_RovingActions;

type RovingAction =
  | { type: "register"; ref: any; disabled?: boolean }
  | { type: "unregister"; ref: any }
  | { type: "select"; ref: any }
  | { type: "focus"; ref: any; select?: boolean }
  | { type: "selectNext" }
  | { type: "selectPrevious" }
  | { type: "selectFirst" }
  | { type: "selectLast" }
  | { type: "focusNext"; select?: boolean }
  | { type: "focusPrevious"; select?: boolean }
  | { type: "focusFirst"; select?: boolean }
  | { type: "focusLast"; select?: boolean }
  | {
      type: "setOrientation";
      orientation: unstable_RovingState["orientation"];
    };

// TODO: Should focus disabled, but not select
function getNextRef({ refs, enabled, loop }: unstable_RovingState, ref: any) {
  if (!enabled.find(Boolean)) return null;
  const index = refs.indexOf(ref);
  const reordered = [
    ...refs.slice(index + 1),
    ...(loop ? refs.slice(0, index) : [])
  ];
  return reordered.find(r => enabled[refs.indexOf(r)]);
}

function getPreviousRef(
  { refs, enabled, ...state }: unstable_RovingState,
  ref: any
) {
  return getNextRef(
    {
      refs: refs.slice().reverse(),
      enabled: enabled.slice().reverse(),
      ...state
    },
    ref
  );
}

function getFirstRef({ refs, enabled }: unstable_RovingState) {
  return refs.find((_, i) => enabled[i]);
}

function getLastRef({ refs, enabled, ...state }: unstable_RovingState) {
  return getFirstRef({
    refs: refs.slice().reverse(),
    enabled: enabled.slice().reverse(),
    ...state
  });
}

function reducer(
  state: unstable_RovingState,
  action: RovingAction
): unstable_RovingState {
  const { refs, enabled, autoSelect, selectedRef, focusedRef } = state;

  switch (action.type) {
    case "register": {
      const { disabled, ref } = action;
      const index = refs.indexOf(ref);

      if (index === -1) {
        // create
        return {
          ...state,
          refs: [...refs, ref],
          enabled: [...enabled, !disabled]
        };
      }

      // update
      let nextState = {
        ...state,
        enabled: [
          ...enabled.slice(0, index),
          !disabled,
          ...enabled.slice(index + 1)
        ]
      };

      if (disabled && focusedRef === ref) {
        nextState = reducer(nextState, { type: "focusNext", select: false });
      }

      if (disabled && selectedRef === ref) {
        nextState = reducer(nextState, { type: "selectNext" });
      }

      return nextState;
    }
    case "unregister": {
      const { ref } = action;
      const index = refs.indexOf(ref);
      if (index === -1) return state;

      let nextState = {
        ...state,
        refs: [...refs.slice(0, index), ...refs.slice(index + 1)],
        enabled: [...enabled.slice(0, index), ...enabled.slice(index + 1)]
      };

      if (focusedRef === ref) {
        nextState = reducer(nextState, { type: "focusNext", select: false });
      }

      if (selectedRef === ref) {
        nextState = reducer(nextState, { type: "selectNext" });
      }

      return nextState;
    }
    case "select": {
      const { ref } = action;
      const index = refs.indexOf(ref);
      if (!enabled[index]) return state;
      return { ...state, selectedRef: ref };
    }
    case "focus": {
      const { ref, select = autoSelect } = action;
      const index = refs.indexOf(ref);
      if (!enabled[index]) return state;
      const nextState = { ...state, focusedRef: ref };
      if (select) {
        return reducer(nextState, { type: "select", ref });
      }
      return nextState;
    }
    case "selectNext":
      return reducer(state, {
        type: "select",
        ref: getNextRef(state, selectedRef)
      });
    case "selectPrevious":
      return reducer(state, {
        type: "select",
        ref: getPreviousRef(state, selectedRef)
      });
    case "selectFirst":
      return reducer(state, { type: "select", ref: getFirstRef(state) });
    case "selectLast":
      return reducer(state, { type: "select", ref: getLastRef(state) });
    case "focusNext":
      return reducer(state, {
        type: "focus",
        ref: getNextRef(state, focusedRef),
        select: action.select
      });
    case "focusPrevious":
      return reducer(state, {
        type: "focus",
        ref: getPreviousRef(state, focusedRef),
        select: action.select
      });
    case "focusFirst":
      return reducer(state, {
        type: "focus",
        ref: getFirstRef(state),
        select: action.select
      });
    case "focusLast":
      return reducer(state, {
        type: "focus",
        ref: getLastRef(state),
        select: action.select
      });
    case "setOrientation":
      return { ...state, orientation: action.orientation };
    default:
      return state;
  }
}

export function useRovingState({
  orientation = "horizontal",
  loop = false,
  selectedRef = null,
  autoSelect = false
}: unstable_RovingInitialState = {}): unstable_RovingStateReturn {
  const [state, dispatch] = React.useReducer(reducer, {
    orientation,
    refs: [],
    enabled: [],
    selectedRef,
    focusedRef: null,
    autoSelect,
    loop
  });

  React.useEffect(() => {
    if (!state.autoSelect || state.selectedRef) return;
    const firstRef = getFirstRef(state);
    if (firstRef) {
      dispatch({ type: "select", ref: firstRef });
    }
  }, [state.autoSelect, state.refs, state.selectedRef]);

  return {
    ...state,
    getNextRef: ref => getNextRef(state, ref),
    getPreviousRef: ref => getPreviousRef(state, ref),
    getFirstRef: () => getFirstRef(state),
    getLastRef: () => getLastRef(state),
    register: React.useCallback(
      (ref, disabled) => dispatch({ type: "register", ref, disabled }),
      []
    ),
    unregister: React.useCallback(
      ref => dispatch({ type: "unregister", ref }),
      []
    ),
    select: React.useCallback(ref => dispatch({ type: "select", ref }), []),
    focus: React.useCallback(
      (ref, select) => dispatch({ type: "focus", ref, select }),
      []
    ),
    selectNext: React.useCallback(() => dispatch({ type: "selectNext" }), []),
    selectPrevious: React.useCallback(
      () => dispatch({ type: "selectPrevious" }),
      []
    ),
    selectFirst: React.useCallback(() => dispatch({ type: "selectFirst" }), []),
    selectLast: React.useCallback(() => dispatch({ type: "selectLast" }), []),
    focusNext: React.useCallback(
      select => dispatch({ type: "focusNext", select }),
      []
    ),
    focusPrevious: React.useCallback(
      select => dispatch({ type: "focusPrevious", select }),
      []
    ),
    focusFirst: React.useCallback(
      select => dispatch({ type: "focusFirst", select }),
      []
    ),
    focusLast: React.useCallback(
      select => dispatch({ type: "focusLast", select }),
      []
    ),
    setOrientation: React.useCallback(
      o => dispatch({ type: "setOrientation", orientation: o }),
      []
    )
  };
}

const keys: Array<keyof unstable_RovingStateReturn> = [
  "orientation",
  "refs",
  "enabled",
  "selectedRef",
  "focusedRef",
  "autoSelect",
  "loop",
  "getNextRef",
  "getPreviousRef",
  "getFirstRef",
  "getLastRef",
  "register",
  "unregister",
  "select",
  "focus",
  "selectNext",
  "selectPrevious",
  "selectFirst",
  "selectLast",
  "focusNext",
  "focusPrevious",
  "focusFirst",
  "focusLast"
];

useRovingState.keys = keys;
