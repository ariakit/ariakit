import { createContext } from "react";
import { PlaygroundStore } from "../playground-store";

export const PlaygroundContext = createContext<PlaygroundStore | undefined>(
  undefined
);
