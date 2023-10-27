import type { AnyObject } from "@ariakit/core/utils/types";
import spawn from "cross-spawn";
import updates from "updates.js";
import type { UpdateItem } from "updates.js";

let releasesCache: UpdateItem[] | null = null;

function getReleaseUpdates() {
  if (releasesCache) {
    return releasesCache;
  }
  try {
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
    releasesCache = Object.entries(time).map(([version, dateTime]) => ({
      type: "release",
      title: `New release: @ariakit/react v${version}`,
      dateTime: `${dateTime}`,
      href: `https://github.com/ariakit/ariakit/releases/tag/@ariakit/react@${version}`,
    }));
  } catch {
    releasesCache = [];
  }
  return releasesCache;
}

let substackCache: UpdateItem[] | null = null;

async function getSubstackUpdates() {
  if (substackCache) {
    return substackCache;
  }
  try {
    const response = await fetch(
      "https://newsletter.ariakit.org/api/v1/archive?limit=50&sort=new",
    );
    const data: AnyObject[] = await response.json();
    const items = data.map<UpdateItem>((item) => ({
      type: "newsletter",
      title: `Newsletter: ${item.title}`,
      dateTime: `${item.post_date}`,
      href: `${item.canonical_url}`,
    }));
    substackCache = items;
  } catch {
    substackCache = [];
  }
  return substackCache;
}

export async function getUpdates(): Promise<UpdateItem[]> {
  const releaseUpdates = getReleaseUpdates();
  const substackUpdates = await getSubstackUpdates();
  const allUpdates = [...updates, ...releaseUpdates, ...substackUpdates];
  return allUpdates.sort((a, b) => {
    const dateA = new Date(a.dateTime);
    const dateB = new Date(b.dateTime);
    return dateB.getTime() - dateA.getTime();
  });
}
