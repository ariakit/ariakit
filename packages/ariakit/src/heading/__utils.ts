import { createContext } from "react";

export type HeadingLevels = 1 | 2 | 3 | 4 | 5 | 6;

export const HeadingContext = createContext<HeadingLevels | 0>(0);
