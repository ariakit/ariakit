// @ts-ignore
import links from "../.pages/links.json" assert { type: "json" };

export interface PageLink {
  path: string;
  hashes: string[];
}

const pageLinks = links as PageLink[];

export default pageLinks;
