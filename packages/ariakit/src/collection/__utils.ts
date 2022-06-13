import { RefObject, createContext } from "react";
import { createStoreContext } from "ariakit-utils/store";
import { CollectionState } from "./collection-state";

export type Item = {
  id: string;
  ref?: RefObject<HTMLElement>;
  presentation?: boolean;
};

export const CollectionContext = createStoreContext<CollectionState>();

export const CollectionItemContext = createContext<
  CollectionState["registerItem"] | undefined
>(undefined);
