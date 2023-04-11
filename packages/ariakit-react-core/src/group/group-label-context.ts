import { createContext } from "react";
import type { SetState } from "@ariakit/core/utils/types";

export const GroupLabelContext = createContext<
  SetState<string | undefined> | undefined
>(undefined);
