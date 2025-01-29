import { type Setter, createContext } from "solid-js";

export const GroupLabelContext = createContext<
  // TODO: document SetState -> Setter
  Setter<string | undefined> | undefined
>(undefined);
