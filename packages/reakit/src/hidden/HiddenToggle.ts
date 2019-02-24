import { createComponent } from "../utils/_createComponent";
import { useHiddenToggle } from "./useHiddenToggle";

export const HiddenToggle = createComponent("button", useHiddenToggle);
