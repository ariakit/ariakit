import { CheckboxField } from "@ariakit/ui/components/checkbox.ariakit.react";
import {
  CodeBlock,
  CodeBlockPanel,
  CodeBlockTab,
  CodeBlockTabList,
} from "@ariakit/ui/components/code-block.ariakit.react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import { CodeFilePanel } from "../code-file-panel.react.tsx";
import { FileIcon } from "../file-icon.react.tsx";
import { codeFileQuery } from "../use-code-file.ts";
import type { load } from "./index.server.ts";

type Props = ReturnType<typeof load>;

// A local server answers at once, so the skeleton would only flash.
const SLOW_NETWORK_DELAY = 1500;

export default function Example({ first, lazy }: Props) {
  const [slowNetwork, setSlowNetwork] = useState(true);
  // The example owns its query client, so a new mount, such as a reload of the
  // preview, loads the files again. It doesn't suspend, so the state stays
  // while the panels load. An app usually has one client at its root instead.
  const [queryClient] = useState(() => new QueryClient());
  // The wait before each request. A file loads once, so the skeleton shows only
  // the first time.
  const delay = slowNetwork ? SLOW_NETWORK_DELAY : 0;
  return (
    <QueryClientProvider client={queryClient}>
      <div className="grid w-xl max-w-full gap-3">
        <CheckboxField
          checked={slowNetwork}
          onChange={(event) => setSlowNetwork(event.target.checked)}
          className="justify-self-start"
        >
          Simulate a slow network
        </CheckboxField>
        <CodeBlock defaultSelectedId={first.name}>
          <CodeBlockTabList aria-label="Files">
            <CodeBlockTab
              id={first.name}
              icon={first.icon && <FileIcon icon={first.icon} />}
            >
              {first.name}
            </CodeBlockTab>
            {lazy.map((file) => (
              <CodeBlockTab
                key={file.name}
                id={file.name}
                icon={file.icon && <FileIcon icon={file.icon} />}
                // The first tab comes before the lazy ones.
                separator
                // A pointer over the tab is a sign of intent, so the file can
                // start to load before the click.
                onPointerEnter={() => {
                  void queryClient.prefetchQuery(
                    codeFileQuery(file.url, delay),
                  );
                }}
              >
                {file.name}
              </CodeBlockTab>
            ))}
          </CodeBlockTabList>
          <CodeBlockPanel
            tabId={first.name}
            html={first.html}
            copy={first.text}
          />
          {lazy.map((file) => (
            <CodeFilePanel
              key={file.name}
              tabId={file.name}
              file={file}
              delay={delay}
            />
          ))}
        </CodeBlock>
      </div>
    </QueryClientProvider>
  );
}
