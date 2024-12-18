import type { SetState } from "@ariakit/core/utils/types";
import { createContext } from "react";

export const GroupLabelContext = createContext<
  SetState<string | undefined> | undefined
>(undefined);
