import { RefObject, createContext } from "react";
import { CollectionState } from "./collection-state";

export type CollectionStateItem = {
  ref: RefObject<HTMLElement>;
};

export const CollectionItemContext = createContext<
  CollectionState["registerItem"] | undefined
>(undefined);
