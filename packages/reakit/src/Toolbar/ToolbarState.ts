export type unstable_ToolbarState = {
  /** TODO: Description */
  orientation: "horizontal" | "vertical";
};

export type unstable_ToolbarActions = {};

export type unstable_ToolbarStateOptions = Partial<unstable_ToolbarState>;

export type unstable_ToolbarStateReturn = unstable_ToolbarState &
  unstable_ToolbarActions;

export function useToolbarState({
  orientation = "horizontal"
}: unstable_ToolbarStateOptions = {}): unstable_ToolbarStateReturn {
  return {
    orientation
  };
}

const keys: Array<keyof unstable_ToolbarStateReturn> = ["orientation"];

useToolbarState.keys = keys;
