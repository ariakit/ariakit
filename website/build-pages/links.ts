// @ts-ignore
import links from "../.pages/links.json";

console.log("pqp");

export interface PageLink {
  path: string;
  hashes: string[];
}

const pageLinks = links as PageLink[];

export default pageLinks;
