import type { HighlightResult } from "@ariakit/ui/utils/highlight.server";
import { createSignal, createUniqueId, Show } from "solid-js";
import type { load } from "./index.server.ts";

type Props = ReturnType<typeof load>;

interface CodeFileProps {
  name: string;
  html: string;
}

function CodeFile(props: CodeFileProps) {
  const captionId = createUniqueId();
  return (
    <figure aria-labelledby={captionId} class="grid gap-1">
      <figcaption id={captionId} class="font-mono text-sm">
        {props.name}
      </figcaption>
      <pre class="ak-light:[&_.line_span[style]]:text-(--shiki-light) ak-dark:[&_.line_span[style]]:text-(--shiki-dark)">
        <code innerHTML={props.html} />
      </pre>
    </figure>
  );
}

export default function Example(props: Props) {
  const [lazyCode, setLazyCode] = createSignal<HighlightResult>();
  const loadLazyFile = async () => {
    const response = await fetch(props.lazyFile.url);
    if (!response.ok) {
      throw new Error(
        `Couldn't load ${props.lazyFile.name}: ${response.status}`,
      );
    }
    setLazyCode(await response.json());
  };
  return (
    <div class="grid gap-4">
      <CodeFile name={props.file.name} html={props.file.html} />
      <Show
        when={lazyCode()}
        fallback={
          <button type="button" onClick={loadLazyFile}>
            Load {props.lazyFile.name}
          </button>
        }
      >
        {(code) => <CodeFile name={props.lazyFile.name} html={code().html} />}
      </Show>
    </div>
  );
}
