import { createContext } from "react";
import { createStoreContext } from "ariakit-utils/store";
import { SetState } from "ariakit-utils/types";
import { DialogState } from "../dialog-state";

export const DialogContext = createStoreContext<DialogState>();
export const DialogHeadingContext = createContext<
  SetState<string | undefined> | undefined
>(undefined);
export const DialogDescriptionContext = createContext<
  SetState<string | undefined> | undefined
>(undefined);
