import { PageMarkdown } from "components/page-markdown.jsx";
import { renderToReadableStream } from "next/dist/server/app-render/entry-base.js";
import type { NextRequest } from "next/server.js";

export async function GET(
  _: NextRequest,
  { params }: { params: { category: string; page: string } },
) {
  return new Response(
    renderToReadableStream(
      <PageMarkdown category={params.category} page={params.page} />,
    ),
  );
  // return new Response(renderToReadableStream(<button>adsadas</button>));
}
