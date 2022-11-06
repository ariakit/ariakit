import { createContext } from "react";
import { CollectionStore } from "./store-collection-store";

export type Item = {
  id: string;
  element?: HTMLElement | null;
};

export const CollectionContext = createContext<CollectionStore | undefined>(
  undefined
);
