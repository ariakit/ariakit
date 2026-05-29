import type { Accessor } from "solid-js";
import { createContext } from "solid-js";
import type { HeadingLevels } from "./utils.ts";

export const HeadingContext = createContext<Accessor<HeadingLevels>>();
