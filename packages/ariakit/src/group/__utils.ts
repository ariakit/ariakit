import { createContext } from "react";
import { SetState } from "ariakit-utils/types";

export const GroupLabelContext = createContext<
  SetState<string | undefined> | undefined
>(undefined);
