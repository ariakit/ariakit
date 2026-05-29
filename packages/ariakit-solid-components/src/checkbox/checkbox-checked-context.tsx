import { createContext } from "solid-js";
import type { Accessor } from "solid-js";

export const CheckboxCheckedContext = createContext<Accessor<boolean>>(
  () => false,
);
