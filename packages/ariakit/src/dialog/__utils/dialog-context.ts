import { createContext } from "react";
import { SetState } from "ariakit-utils/types";
import { DialogState } from "../dialog-state";

export const DialogContext = createContext<DialogState | undefined>(undefined);
export const DialogHeadingContext = createContext<
  SetState<string | undefined> | undefined
>(undefined);
export const DialogDescriptionContext = createContext<
  SetState<string | undefined> | undefined
>(undefined);
