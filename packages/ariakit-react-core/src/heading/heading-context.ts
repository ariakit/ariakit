import { createContext } from "react";
import { HeadingLevels } from "./utils.js";

export const HeadingContext = createContext<HeadingLevels | 0>(0);
