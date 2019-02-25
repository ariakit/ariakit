import { unstable_createComponent } from "../utils/createComponent";
import { useTab } from "./useTab";

export const Tab = unstable_createComponent("li", useTab);
