"use server";

import { PageMarkdown } from "./page-markdown.tsx";

export async function getPageMarkdown({
  page,
  category,
}: { page: string; category: string }) {
  return (
    <PageMarkdown category={category} page={page} showHovercards={false} />
  );
}
