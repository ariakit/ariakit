import { createContext } from "react";
import { HeadingLevels } from "./utils";

export const HeadingContext = createContext<HeadingLevels | 0>(0);
