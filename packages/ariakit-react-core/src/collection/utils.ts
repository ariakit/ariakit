import { createContext } from "react";
import { CollectionStore } from "./collection-store";

export const CollectionContext = createContext<CollectionStore | undefined>(
  undefined
);
