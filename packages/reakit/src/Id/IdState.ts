import * as React from "react";
import { InitialState } from "reakit-utils/types";
import { useInitialValue } from "reakit-utils/hooks";
import { unstable_IdContext } from "./IdProvider";

export type unstable_IdState = {
  /**
   * ID that will serve as a base for all the items IDs.
   */
  baseId: string;
  /**
   * @private
   */
  unstable_idCountRef: React.MutableRefObject<number>;
};

export type unstable_IdActions = {
  /**
   * Sets `baseId`.
   */
  setBaseId: React.Dispatch<React.SetStateAction<string>>;
};

export type unstable_IdInitialState = Partial<Pick<unstable_IdState, "baseId">>;

export type unstable_IdStateReturn = unstable_IdState & unstable_IdActions;

export function unstable_useIdState(
  initialState: InitialState<unstable_IdInitialState> = {}
): unstable_IdStateReturn {
  const { baseId: initialBaseId } = useInitialValue(initialState);
  const generateId = React.useContext(unstable_IdContext);
  const idCountRef = React.useRef(0);
  const [baseId, setBaseId] = React.useState(
    () => initialBaseId || generateId()
  );
  return {
    baseId,
    setBaseId,
    unstable_idCountRef: idCountRef,
  };
}
