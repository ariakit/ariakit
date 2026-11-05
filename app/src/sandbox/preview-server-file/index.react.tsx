import type { HighlightResult } from "@ariakit/ui/utils/highlight.server";
import { useId, useState } from "react";
import type { load } from "./index.server.ts";

type Props = ReturnType<typeof load>;

interface CodeFileProps {
  name: string;
  html: string;
}

function CodeFile({ name, html }: CodeFileProps) {
  const captionId = useId();
  return (
    <figure aria-labelledby={captionId} className="grid gap-1">
      <figcaption id={captionId} className="font-mono text-sm">
        {name}
      </figcaption>
      <pre className="ak-light:[&_.line_span[style]]:text-(--shiki-light) ak-dark:[&_.line_span[style]]:text-(--shiki-dark)">
        <code dangerouslySetInnerHTML={{ __html: html }} />
      </pre>
    </figure>
  );
}

export default function Example({ file, lazyFile }: Props) {
  const [lazyCode, setLazyCode] = useState<HighlightResult>();
  const loadLazyFile = async () => {
    const response = await fetch(lazyFile.url);
    if (!response.ok) {
      throw new Error(`Couldn't load ${lazyFile.name}: ${response.status}`);
    }
    setLazyCode(await response.json());
  };
  return (
    <div className="grid gap-4">
      <CodeFile name={file.name} html={file.html} />
      {lazyCode ? (
        <CodeFile name={lazyFile.name} html={lazyCode.html} />
      ) : (
        <button type="button" onClick={loadLazyFile}>
          Load {lazyFile.name}
        </button>
      )}
    </div>
  );
}
