import spawn from "cross-spawn";
import updates from "updates.js";
import type { UpdateItem } from "updates.js";

export function getReleaseUpdates(): UpdateItem[] {
  const response = spawn.sync("npm", [
    "view",
    "@ariakit/react",
    "versions",
    "time",
    "--json",
  ]);
  const { time } = JSON.parse(response.stdout.toString());
  delete time.created;
  delete time.modified;
  delete time["0.0.1"];
  return Object.entries(time).map(([version, dateTime]) => ({
    type: "release",
    title: `New release: @ariakit/react v${version}`,
    dateTime: `${dateTime}`,
    href: `https://github.com/ariakit/ariakit/releases/tag/@ariakit/react@${version}`,
  }));
}

export function getUpdates(): UpdateItem[] {
  const releaseUpdates = getReleaseUpdates();
  const allUpdates = [...updates, ...releaseUpdates];
  return allUpdates.sort((a, b) => {
    const dateA = new Date(a.dateTime);
    const dateB = new Date(b.dateTime);
    return dateB.getTime() - dateA.getTime();
  });
}
