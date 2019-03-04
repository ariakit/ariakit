import { unstable_createComponent } from "../utils/createComponent";
import { useTabList } from "./useTabList";

export const TabList = unstable_createComponent("ul", useTabList);
