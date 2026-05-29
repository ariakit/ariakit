import { createContext } from "react";
import type { HeadingLevels } from "./utils.ts";

export const HeadingContext = createContext<HeadingLevels | 0>(0);
