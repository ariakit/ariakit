import { createComponent } from "../_utils/createComponent";
import { useHiddenToggle } from "./useHiddenToggle";

export const HiddenToggle = createComponent("button", useHiddenToggle);
