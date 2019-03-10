import * as React from "react";

export type unstable_RovingState = {
  /** TODO: Description */
  orientation: "horizontal" | "vertical";
  /** TODO: Description */
  matrix: Array<Array<number>>;
  /** TODO: Description */
  active: [number, number] | null;
  /** TODO: Description */
  loop: boolean;
  /** TODO: Description */
  upCoords: [number, number] | null;
  /** TODO: Description */
  rightCoords: [number, number] | null;
  /** TODO: Description */
  downCoords: [number, number] | null;
  /** TODO: Description */
  leftCoords: [number, number] | null;
};

export type unstable_RovingActions = {
  /** TODO: Description */
  register: (disabled?: boolean, row?: number, col?: number) => void;
  /** TODO: Description */
  unregister: (row?: number, col?: number) => void;
  /** TODO: Description */
  goto: (row: number, col: number) => void;
  /** TODO: Description */
  update: () => void;
  /** TODO: Description */
  up: () => void;
  /** TODO: Description */
  right: () => void;
  /** TODO: Description */
  down: () => void;
  /** TODO: Description */
  left: () => void;
  /** TODO: Description */
  home: () => void;
  /** TODO: Description */
  end: () => void;
  /** TODO: Description */
  pageUp: () => void;
  /** TODO: Description */
  pageDown: () => void;
  /** TODO: Description */
  first: () => void;
  /** TODO: Description */
  last: () => void;
};

export type unstable_RovingStateOptions = Partial<unstable_RovingState>;

export type unstable_RovingStateReturn = unstable_RovingState &
  unstable_RovingActions;

type RovingAction =
  | { type: "register"; disabled?: boolean; row?: number; col?: number }
  | { type: "unregister"; row: number; col: number }
  | { type: "goto"; row: number; col: number }
  | { type: "update" }
  | { type: "up" }
  | { type: "right" }
  | { type: "down" }
  | { type: "left" }
  | { type: "home" }
  | { type: "end" }
  | { type: "pageUp" }
  | { type: "pageDown" }
  | { type: "first" }
  | { type: "last" };

function findCoords(
  { active, matrix, loop }: unstable_RovingState,
  dir: "up" | "right" | "down" | "left"
): [number, number] | null {
  const [row, col] = active;
  const isVertical = dir === "up" || dir === "down";
  const isAdditive = dir === "down" || dir === "right";
  const items = isVertical ? matrix.map(cols => cols[col]) : matrix[row];

  if (items.filter(Boolean).length === 0) return null;

  let coord = isVertical ? row : col;

  if (isAdditive) {
    do {
      coord = coord === items.length && loop ? 0 : coord + 1;
    } while (coord < items.length && !items[coord]);
    if (coord >= items.length) return null;
  } else {
    do {
      coord = coord === 0 && loop ? items.length - 1 : coord - 1;
    } while (coord >= 0 && !items[coord]);
    if (coord < 0) return null;
  }
  return isVertical ? [coord, col] : [row, coord];
}

function findOutermostCoords(
  { active, matrix, orientation }: unstable_RovingState,
  dir: "up" | "right" | "down" | "left"
): [number, number] | null {
  const [row, col] = active;
  const isVertical =
    orientation === "horizontal" && (dir === "up" || dir === "down");
  const isAdditive = dir === "up" || dir === "left";
  const items = isVertical ? matrix.map(cols => cols[col]) : matrix[row];

  if (items.filter(Boolean).length === 0) return null;

  let coord = isAdditive ? 0 : items.length - 1;
  while (!items[coord] && coord >= 0 && coord < items.length) {
    coord += isAdditive ? 1 : -1;
  }
  if (items[coord]) {
    return isVertical ? [coord, col] : [row, coord];
  }
  return null;
}

function reducer(
  state: unstable_RovingState,
  action: RovingAction
): unstable_RovingState {
  const {
    orientation,
    active,
    matrix,
    upCoords,
    rightCoords,
    downCoords,
    leftCoords
  } = state;
  switch (action.type) {
    case "register": {
      const {
        disabled,
        row = orientation === "vertical" ? matrix.length : matrix.length - 1
      } = action;
      const { col = matrix[row].length } = action;
      const nextState = {
        ...state,
        matrix: [
          ...matrix.slice(0, row),
          [
            ...matrix[row].slice(0, col),
            Number(!disabled),
            ...matrix[row].slice(col + 1)
          ],
          ...matrix.slice(row + 1)
        ]
      };
      return reducer(nextState, { type: "update" });
    }
    case "unregister": {
      const { row, col } = action;
      const nextState = {
        ...state,
        matrix: [
          ...matrix.slice(0, row),
          matrix[row].length > 1
            ? [...matrix[row].slice(0, col), ...matrix[row].slice(col + 1)]
            : [],
          ...matrix.slice(row + 1)
        ]
      };
      return reducer(nextState, { type: "update" });
    }
    case "goto": {
      if (!matrix[action.col] || !matrix[action.col][action.row]) return state;
      const nextState = {
        ...state,
        active: [action.col, action.row] as [number, number]
      };
      return reducer(nextState, { type: "update" });
    }
    case "update": {
      const nextState = {
        ...state,
        upCoords: findCoords(state, "up"),
        rightCoords: findCoords(state, "right"),
        downCoords: findCoords(state, "down"),
        leftCoords: findCoords(state, "left")
      };

      if (!active) return nextState;

      const [row, col] = active;
      const rowEnabled = Boolean(matrix[row]);
      const colEnabled = rowEnabled && Boolean(matrix[row][col]);

      if (colEnabled) return nextState;

      if (rowEnabled) {
        return {
          ...nextState,
          active: nextState.rightCoords || nextState.leftCoords
        };
      }

      return {
        ...nextState,
        active: nextState.downCoords || nextState.upCoords
      };
    }
    case "up": {
      if (!upCoords) return state;
      const [row, col] = upCoords;
      return reducer(state, { type: "goto", row, col });
    }
    case "right": {
      if (!rightCoords) return state;
      const [row, col] = rightCoords;
      return reducer(state, { type: "goto", row, col });
    }
    case "down": {
      if (!downCoords) return state;
      const [row, col] = downCoords;
      return reducer(state, { type: "goto", row, col });
    }
    case "left": {
      if (!leftCoords) return state;
      const [row, col] = leftCoords;
      return reducer(state, { type: "goto", row, col });
    }
    case "home": {
      const coords = findOutermostCoords(state, "left");
      if (!coords) return state;
      const [row, col] = coords;
      return reducer(state, { type: "goto", row, col });
    }
    case "end": {
      const coords = findOutermostCoords(state, "right");
      if (!coords) return state;
      const [row, col] = coords;
      return reducer(state, { type: "goto", row, col });
    }
    case "pageUp": {
      const coords = findOutermostCoords(state, "up");
      if (!coords) return state;
      const [row, col] = coords;
      return reducer(state, { type: "goto", row, col });
    }
    case "pageDown": {
      const coords = findOutermostCoords(state, "down");
      if (!coords) return state;
      const [row, col] = coords;
      return reducer(state, { type: "goto", row, col });
    }

    default: {
      return state;
    }
  }
}

export function useRovingState({
  orientation = "horizontal"
}: unstable_RovingStateOptions = {}): unstable_RovingStateReturn {
  return {
    orientation
  };
}

const keys: Array<keyof unstable_RovingStateReturn> = ["orientation"];

useRovingState.keys = keys;
