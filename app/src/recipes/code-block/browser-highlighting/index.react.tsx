import {
  CodeBlock,
  CodeBlockCode,
} from "@ariakit/ui/components/code-block.ariakit.react";
import {
  Input,
  InputField,
  InputLabel,
} from "@ariakit/ui/components/input.ariakit.react";
import { Suspense, use, useDeferredValue, useId, useState } from "react";
import type { load } from "./index.server.ts";

// Each edit makes new code, so the cache keeps only the recent results.
const MAX_CACHED_RESULTS = 50;
const results = new Map<string, Promise<string | undefined>>();

/**
 * Returns the HTML of the code. `use` gets the same promise on every render of
 * the same code. The first call loads Shiki with a dynamic import, and the code
 * stays plain if the highlighter can't load.
 */
function getHighlightedHtml(code: string) {
  const cached = results.get(code);
  if (cached) return cached;
  const result = import("./highlight-in-browser.ts")
    .then(({ highlightInBrowser }) => highlightInBrowser(code))
    .catch(() => undefined);
  results.set(code, result);
  const oldest = results.keys().next().value;
  if (results.size > MAX_CACHED_RESULTS && oldest != null) {
    results.delete(oldest);
  }
  return result;
}

interface PreviewCodeProps extends ReturnType<typeof load> {
  code: string;
  stale: boolean;
}

function PreviewCode({
  code,
  stale,
  initialCode,
  initialHtml,
}: PreviewCodeProps) {
  // The server highlighted the first code, so Shiki loads only after the first
  // edit.
  const html =
    code === initialCode ? initialHtml : use(getHighlightedHtml(code));
  return (
    <CodeBlockCode
      html={html}
      // The title isn't a file name, so the copy button doesn't name it.
      copy={{ value: code, label: "Copy code" }}
      aria-busy={stale}
    >
      {code}
    </CodeBlockCode>
  );
}

export default function Example(props: ReturnType<typeof load>) {
  const id = useId();
  const [code, setCode] = useState(props.initialCode);
  // The textarea updates at once, and React highlights the new code in the
  // background. Until the HTML is ready, the preview keeps the last code that
  // it highlighted, a bit faded.
  const previewCode = useDeferredValue(code);
  const stale = previewCode !== code;
  return (
    <div className="grid w-xl max-w-full gap-4">
      <InputField>
        <InputLabel htmlFor={id}>Code</InputLabel>
        <Input
          id={id}
          render={<textarea rows={4} spellCheck={false} />}
          value={code}
          onChange={(event) => setCode(event.target.value)}
          className="font-mono text-[0.9375em]"
        />
      </InputField>
      {/* A short delay keeps fast results from flashing the fade. */}
      <CodeBlock
        title="Preview"
        className="transition-opacity has-aria-busy:opacity-60 has-aria-busy:delay-200"
      >
        {/* The preview suspends only while it renders in the background, so
            it keeps the last code instead of showing this fallback. */}
        <Suspense
          fallback={
            <CodeBlockCode copy={{ value: code, label: "Copy code" }}>
              {code}
            </CodeBlockCode>
          }
        >
          <PreviewCode {...props} code={previewCode} stale={stale} />
        </Suspense>
      </CodeBlock>
    </div>
  );
}
