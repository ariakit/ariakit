import { createContext, RefObject } from "react";
import { CollectionState } from "./collection-state";

export type Item = {
  ref: RefObject<HTMLElement>;
};

export const CollectionItemContext = createContext<
  CollectionState["registerItem"] | undefined
>(undefined);
