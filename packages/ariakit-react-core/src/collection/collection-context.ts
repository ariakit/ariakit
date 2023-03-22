import { createContext } from "react";
import { CollectionStore } from "./collection-store.js";

export const CollectionContext = createContext<CollectionStore | undefined>(
  undefined
);
