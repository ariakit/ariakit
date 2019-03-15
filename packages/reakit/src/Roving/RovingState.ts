import * as React from "react";

export type unstable_RovingState = {
  /** TODO: Description */
  orientation?: "horizontal" | "vertical";
  /** TODO: Description */
  refs: any[];
  /** TODO: Description */
  meta: Array<{ focusable: boolean; selectable: boolean }>;
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
  getNextFocusableRef: (ref: any) => any;
  /** TODO: Description */
  getNextSelectableRef: (ref: any) => any;
  /** TODO: Description */
  getPreviousFocusableRef: (ref: any) => any;
  /** TODO: Description */
  getPreviousSelectableRef: (ref: any) => any;
  /** TODO: Description */
  getFirstFocusableRef: () => any;
  /** TODO: Description */
  getFirstSelectableRef: () => any;
  /** TODO: Description */
  getLastFocusableRef: () => any;
  /** TODO: Description */
  getLastSelectableRef: () => any;
  /** TODO: Description */
  isFocusable: (ref: any) => boolean;
  /** TODO: Description */
  isSelectable: (ref: any) => boolean;
};

export type unstable_RovingActions = {
  /** TODO: Description */
  register: (ref: any, focusable?: boolean, selectable?: boolean) => void;
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
    "orientation" | "selectedRef" | "autoSelect" | "loop"
  >
>;

export type unstable_RovingStateReturn = unstable_RovingState &
  unstable_RovingSelectors &
  unstable_RovingActions;

type RovingAction =
  | { type: "register"; ref: any; focusable: boolean; selectable?: boolean }
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

function getNextRefs(
  { refs, loop }: Pick<unstable_RovingState, "refs" | "loop">,
  ref: any
) {
  const index = refs.indexOf(ref);
  const nextRefs = [
    ...refs.slice(index + 1),
    ...(loop ? refs.slice(0, index) : [])
  ];
  return nextRefs;
}

type IsState = Pick<unstable_RovingState, "refs" | "meta">;

function isFocusable({ refs, meta }: IsState, ref: any) {
  const index = refs.indexOf(ref);
  return meta[index] && meta[index].focusable;
}

function isSelectable({ refs, meta }: IsState, ref: any) {
  const index = refs.indexOf(ref);
  return meta[index] && meta[index].selectable;
}

type GetState = Pick<unstable_RovingState, "refs" | "meta" | "loop">;

function getNextFocusableRef(state: GetState, ref: any) {
  return getNextRefs(state, ref).find(r => isFocusable(state, r));
}

function getNextSelectableRef(state: GetState, ref: any) {
  return getNextRefs(state, ref).find(r => isSelectable(state, r));
}

function getPreviousFocusableRef({ refs, meta, loop }: GetState, ref: any) {
  return getNextFocusableRef(
    {
      refs: refs.slice().reverse(),
      meta: meta.slice().reverse(),
      loop
    },
    ref
  );
}

function getPreviousSelectableRef({ refs, meta, loop }: GetState, ref: any) {
  return getNextSelectableRef(
    {
      refs: refs.slice().reverse(),
      meta: meta.slice().reverse(),
      loop
    },
    ref
  );
}

function getFirstFocusableRef({ refs, ...state }: GetState) {
  return refs.find(ref => isFocusable({ refs, ...state }, ref));
}

function getFirstSelectableRef({ refs, ...state }: GetState) {
  return refs.find(ref => isSelectable({ refs, ...state }, ref));
}

function getLastFocusableRef({ refs, meta, ...state }: GetState) {
  return getFirstFocusableRef({
    refs: refs.slice().reverse(),
    meta: meta.slice().reverse(),
    ...state
  });
}

function getLastSelectableRef({ refs, meta, ...state }: GetState) {
  return getFirstSelectableRef({
    refs: refs.slice().reverse(),
    meta: meta.slice().reverse(),
    ...state
  });
}

function reducer(
  state: unstable_RovingState,
  action: RovingAction
): unstable_RovingState {
  const { refs, meta, autoSelect, selectedRef, focusedRef } = state;

  switch (action.type) {
    case "register": {
      const { ref, focusable } = action;
      const selectable = focusable ? action.selectable || false : false;
      const index = refs.indexOf(ref);

      if (index === -1) {
        // create
        return {
          ...state,
          refs: [...refs, ref],
          meta: [...meta, { focusable, selectable }]
        };
      }

      // update
      let nextState = {
        ...state,
        meta: [
          ...meta.slice(0, index),
          { focusable, selectable },
          ...meta.slice(index + 1)
        ]
      };

      if (!focusable && focusedRef === ref) {
        nextState = reducer(nextState, { type: "focusNext", select: false });
      }

      if (!selectable && selectedRef === ref) {
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
        meta: [...meta.slice(0, index), ...meta.slice(index + 1)]
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
      if (!meta[index] || !meta[index].selectable) return state;
      return { ...state, selectedRef: ref };
    }
    case "focus": {
      const { ref, select = autoSelect } = action;
      const index = refs.indexOf(ref);
      if (!meta[index] || !meta[index].focusable) return state;
      const nextState = { ...state, focusedRef: ref };
      if (select) {
        return reducer(nextState, { type: "select", ref });
      }
      return nextState;
    }
    case "selectNext":
      return reducer(state, {
        type: "select",
        ref: getNextSelectableRef(state, selectedRef)
      });
    case "selectPrevious":
      return reducer(state, {
        type: "select",
        ref: getPreviousSelectableRef(state, selectedRef)
      });
    case "selectFirst":
      return reducer(state, {
        type: "select",
        ref: getFirstSelectableRef(state)
      });
    case "selectLast":
      return reducer(state, {
        type: "select",
        ref: getLastSelectableRef(state)
      });
    case "focusNext":
      return reducer(state, {
        type: "focus",
        ref: getNextFocusableRef(state, focusedRef),
        select: action.select
      });
    case "focusPrevious":
      return reducer(state, {
        type: "focus",
        ref: getPreviousFocusableRef(state, focusedRef),
        select: action.select
      });
    case "focusFirst":
      return reducer(state, {
        type: "focus",
        ref: getFirstFocusableRef(state),
        select: action.select
      });
    case "focusLast":
      return reducer(state, {
        type: "focus",
        ref: getLastFocusableRef(state),
        select: action.select
      });
    case "setOrientation":
      return { ...state, orientation: action.orientation };
    default:
      return state;
  }
}

export function useRovingState({
  orientation,
  selectedRef = null,
  autoSelect = false,
  loop = false
}: unstable_RovingInitialState = {}): unstable_RovingStateReturn {
  const [state, dispatch] = React.useReducer(reducer, {
    orientation,
    refs: [],
    meta: [],
    selectedRef,
    focusedRef: null,
    autoSelect,
    loop
  });

  React.useEffect(() => {
    if (!state.autoSelect || state.selectedRef) return;
    const firstRef = getFirstSelectableRef(state);
    if (firstRef) {
      dispatch({ type: "select", ref: firstRef });
    }
  }, [state.autoSelect, state.refs, state.selectedRef]);

  return {
    ...state,
    isFocusable: React.useCallback(
      ref => isFocusable({ refs: state.refs, meta: state.meta }, ref),
      [state.refs, state.meta]
    ),
    isSelectable: React.useCallback(
      ref => isSelectable({ refs: state.refs, meta: state.meta }, ref),
      [state.refs, state.meta]
    ),
    getNextFocusableRef: React.useCallback(
      ref =>
        getNextFocusableRef(
          { refs: state.refs, meta: state.meta, loop: state.loop },
          ref
        ),
      [state.refs, state.meta, state.loop]
    ),
    getPreviousFocusableRef: React.useCallback(
      ref =>
        getPreviousFocusableRef(
          { refs: state.refs, meta: state.meta, loop: state.loop },
          ref
        ),
      [state.refs, state.meta, state.loop]
    ),
    getFirstFocusableRef: React.useCallback(
      () =>
        getFirstFocusableRef({
          refs: state.refs,
          meta: state.meta,
          loop: state.loop
        }),
      [state.refs, state.meta, state.loop]
    ),
    getLastFocusableRef: React.useCallback(
      () =>
        getLastFocusableRef({
          refs: state.refs,
          meta: state.meta,
          loop: state.loop
        }),
      [state.refs, state.meta, state.loop]
    ),
    getNextSelectableRef: React.useCallback(
      ref =>
        getNextSelectableRef(
          { refs: state.refs, meta: state.meta, loop: state.loop },
          ref
        ),
      [state.refs, state.meta, state.loop]
    ),
    getPreviousSelectableRef: React.useCallback(
      ref =>
        getPreviousSelectableRef(
          { refs: state.refs, meta: state.meta, loop: state.loop },
          ref
        ),
      [state.refs, state.meta, state.loop]
    ),
    getFirstSelectableRef: React.useCallback(
      () =>
        getFirstSelectableRef({
          refs: state.refs,
          meta: state.meta,
          loop: state.loop
        }),
      [state.refs, state.meta, state.loop]
    ),
    getLastSelectableRef: React.useCallback(
      () =>
        getLastSelectableRef({
          refs: state.refs,
          meta: state.meta,
          loop: state.loop
        }),
      [state.refs, state.meta, state.loop]
    ),
    register: React.useCallback(
      (ref, focusable, selectable) =>
        dispatch({ type: "register", ref, focusable, selectable }),
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
  "meta",
  "selectedRef",
  "focusedRef",
  "autoSelect",
  "loop",
  "getNextFocusableRef",
  "getNextSelectableRef",
  "getPreviousFocusableRef",
  "getPreviousSelectableRef",
  "getFirstFocusableRef",
  "getFirstSelectableRef",
  "getLastFocusableRef",
  "getLastSelectableRef",
  "isFocusable",
  "isSelectable",
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
