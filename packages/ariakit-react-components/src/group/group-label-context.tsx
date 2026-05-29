import type { SetState } from "@ariakit/utils";
import { createContext } from "react";

export const GroupLabelContext = createContext<
  SetState<string | undefined> | undefined
>(undefined);
