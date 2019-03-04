import { unstable_createComponent } from "../utils/createComponent";
import { useHiddenToggle } from "./useHiddenToggle";

export const HiddenToggle = unstable_createComponent("button", useHiddenToggle);
