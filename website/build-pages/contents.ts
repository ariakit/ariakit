// @ts-ignore
import contents from "../.pages/contents.json" assert { type: "json" };
import type { PageContent, PageContents } from "./types.ts";

export type { PageContent, PageContents };

export default contents as PageContents;
