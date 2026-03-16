// @ts-ignore
import index from "../.pages/index.json" with { type: "json" };

import type { PageIndex, PageIndexDetail } from "./types.ts";

export type { PageIndex, PageIndexDetail };

const pageIndex = index as PageIndex;

export default pageIndex;
