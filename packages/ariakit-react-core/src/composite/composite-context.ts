import { createContext } from "react";
import type { CompositeStore } from "./composite-store.js";

type ItemContext = { baseElement?: HTMLElement; id?: string } | undefined;

export const CompositeRowContext = createContext<ItemContext>(undefined);
export const CompositeItemContext = createContext<ItemContext>(undefined);

export const CompositeContext = createContext<CompositeStore | undefined>(
  undefined
);
