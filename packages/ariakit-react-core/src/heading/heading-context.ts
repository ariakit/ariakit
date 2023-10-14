import { createContext } from "react";
import type { HeadingLevels } from "./utils.js";

export const HeadingContext = createContext<HeadingLevels | 0>(0);
