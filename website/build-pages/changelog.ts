import { join } from "node:path";

export function getChangelogFile() {
  return join(process.cwd(), "../packages/ariakit-react/CHANGELOG.md");
}
