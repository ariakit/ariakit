// @ts-ignore
import index from "../.pages/index.json";
import type { PageIndex, PageIndexDetail } from "./types.ts";

export type { PageIndexDetail, PageIndex };

const pageIndex = index as PageIndex;

export default pageIndex;
