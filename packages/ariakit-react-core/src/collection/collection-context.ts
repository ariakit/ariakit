import { createContext } from "react";
import type { CollectionStore } from "./collection-store.js";

export const CollectionContext = createContext<CollectionStore | undefined>(
  undefined
);
