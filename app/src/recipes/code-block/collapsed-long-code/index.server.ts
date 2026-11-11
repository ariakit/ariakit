import { highlight } from "@ariakit/ui/utils/highlight.server";

const source = `import { useEffect, useState } from "react";

interface User {
  id: string;
  name: string;
  email: string;
}

type State =
  | { status: "loading" }
  | { status: "loaded"; users: User[] }
  | { status: "failed"; error: Error };

export function useUsers(teamId: string) {
  const [state, setState] = useState<State>({ status: "loading" });

  useEffect(() => {
    const controller = new AbortController();
    setState({ status: "loading" });
    fetch(\`/api/teams/\${teamId}/users\`, { signal: controller.signal })
      .then((response) => {
        if (!response.ok) {
          throw new Error(\`Request failed: \${response.status}\`);
        }
        return response.json();
      })
      .then((users: User[]) => setState({ status: "loaded", users }))
      .catch((error: Error) => {
        if (controller.signal.aborted) return;
        setState({ status: "failed", error });
      });
    return () => controller.abort();
  }, [teamId]);

  return state;
}`;

export function load() {
  return { code: highlight(source, "ts") };
}
