import { RefObject } from "react";
import { createStoreContext } from "ariakit-utils/store";
import { CollectionState } from "./collection-state";

export type Item = {
  id: string;
  ref?: RefObject<HTMLElement>;
};

export const CollectionContext = createStoreContext<CollectionState>();
