import { createContext } from "react";
import type { PlaygroundStore } from "../playground-store.js";

export const PlaygroundContext = createContext<PlaygroundStore | undefined>(
  undefined
);
