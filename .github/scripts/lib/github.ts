import { getOptionalEnv, getRequiredEnv, parseRepo } from "./workflow.ts";

interface RequestOptions {
  method?: string;
  body?: unknown;
}

export async function githubRequest<T>(
  pathname: string,
  options: RequestOptions = {},
): Promise<T> {
  const token = getOptionalEnv("GITHUB_TOKEN") ?? getRequiredEnv("GH_TOKEN");
  const response = await fetch(`https://api.github.com${pathname}`, {
    method: options.method ?? "GET",
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      "User-Agent": "ariakit-workflows",
      "X-GitHub-Api-Version": "2022-11-28",
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
  });
  if (!response.ok) {
    const responseText = await response.text();
    throw new Error(
      `GitHub API request failed (${response.status} ${response.statusText}): ${responseText}`,
    );
  }
  if (response.status === 204) {
    return undefined as T;
  }
  return (await response.json()) as T;
}

export async function createCommitStatus(
  repository: string,
  sha: string,
  status: {
    context: string;
    state: "pending" | "success" | "failure";
    target_url: string;
  },
): Promise<void> {
  const { owner, repo } = parseRepo(repository);
  await githubRequest(`/repos/${owner}/${repo}/statuses/${sha}`, {
    method: "POST",
    body: status,
  });
}
