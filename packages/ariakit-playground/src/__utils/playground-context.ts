import { createContext } from "react";
import { PlaygroundStore } from "../playground-store.js";

export const PlaygroundContext = createContext<PlaygroundStore | undefined>(
  undefined
);
