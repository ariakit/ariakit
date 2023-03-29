import { createContext } from "react";
import type { SetState } from "@ariakit/core/utils/types";
import type { DialogStore } from "./dialog-store.js";

export const DialogContext = createContext<DialogStore | undefined>(undefined);

export const DialogHeadingContext = createContext<
  SetState<string | undefined> | undefined
>(undefined);
export const DialogDescriptionContext = createContext<
  SetState<string | undefined> | undefined
>(undefined);
