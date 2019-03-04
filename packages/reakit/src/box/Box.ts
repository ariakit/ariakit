import { unstable_createComponent } from "../utils/createComponent";
import { useBox } from "./useBox";

export const Box = unstable_createComponent("div", useBox);
