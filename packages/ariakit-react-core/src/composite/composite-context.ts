import { createContext } from "react";
import type { CompositeStore } from "./composite-store.js";

interface ItemContext {
  baseElement?: HTMLElement;
  id?: string;
}

export const CompositeItemContext = createContext<ItemContext | undefined>(
  undefined
);

interface RowContext extends ItemContext {
  ariaSetSize?: number;
  ariaPosInSet?: number;
}

export const CompositeRowContext = createContext<RowContext | undefined>(
  undefined
);

export const CompositeContext = createContext<CompositeStore | undefined>(
  undefined
);
