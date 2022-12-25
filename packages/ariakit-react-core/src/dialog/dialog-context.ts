import { createContext } from "react";
import { SetState } from "@ariakit/core/utils/types";
import { DialogStore } from "./dialog-store";

export const DialogContext = createContext<DialogStore | undefined>(undefined);

export const DialogHeadingContext = createContext<
  SetState<string | undefined> | undefined
>(undefined);
export const DialogDescriptionContext = createContext<
  SetState<string | undefined> | undefined
>(undefined);
