import { highlight } from "@ariakit/ui/utils/highlight.server";

const source = `import type { User } from "./types.ts";

// Loads one page of users. The signal cancels the request when the page
// changes before it ends.
export async function fetchUsers(page: number, signal?: AbortSignal) {
  const params = new URLSearchParams({ page: String(page), limit: "20" });
  const response = await fetch(\`/api/users?\${params}\`, { signal });

  if (!response.ok) {
    throw new Error(\`Couldn't load page \${page} of users: \${response.status} \${response.statusText}\`);
  }

  const users: User[] = await response.json();
  return users.map((user) => ({ ...user, name: user.name.trim() }));
}`;

export function load() {
  return {
    code: highlight(source, "ts", {
      // Lines 6 and 7 are next to each other. Line 10 is longer than the block,
      // so its mark and the gutter stay when the code scrolls sideways.
      lines: [6, 7, 10, 14],
      words: [
        // Each signal: in a comment, as a parameter, and on a marked line.
        "signal",
        // Marks in one token and across tokens, on marked lines, where the
        // second one starts past the end of the block.
        '"20"',
        "${response.status} ${response.statusText}",
        "user.name.trim()",
      ],
    }),
  };
}
