import { Button } from "@ariakit/ui/components/button.ariakit.react";
import {
  CodeBlock,
  CodeBlockCode,
  CodeBlockPanel,
  CodeBlockTab,
  CodeBlockTabList,
} from "@ariakit/ui/components/code-block.ariakit.react";
import {
  Dialog,
  DialogDisclosure,
  DialogHeading,
  DialogProvider,
} from "@ariakit/ui/components/dialog.ariakit.react";
import {
  Popover,
  PopoverDisclosure,
  PopoverProvider,
} from "@ariakit/ui/components/popover.ariakit.react";
import { Prose } from "@ariakit/ui/components/prose.ariakit.react";
import {
  Shell,
  ShellFooter,
  ShellHeader,
  ShellMain,
  ShellMainBody,
  ShellStart,
} from "@ariakit/ui/components/shell.ariakit.react";
import { startTransition, useState } from "react";
import type { load } from "./index.server.ts";

// The name of the file registers after the tab mounts, so the server HTML has
// no name yet.
function getCopyLabel(name?: string) {
  if (!name) return "Copiar código";
  return `Copiar ${name}`;
}

export default function Example({ hook, style }: ReturnType<typeof load>) {
  const [expanded, setExpanded] = useState(false);
  const [locked, setLocked] = useState(false);
  const [lateExpanded, setLateExpanded] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null | undefined>(
    "use-users.ts",
  );
  return (
    <Shell>
      <ShellHeader>
        <ShellStart>Team docs</ShellStart>
      </ShellHeader>
      <ShellMain>
        <ShellMainBody>
          <Prose>
            <h1>Users</h1>
            <p>
              The hook loads the users of a team and reports the state of the
              request. Read it from the top, or show all lines of each file.
            </p>
          </Prose>
          {/*
           * A page can expand a block from outside, such as from a setting.
           */}
          <Button
            aria-pressed={expanded}
            onClick={() => setExpanded(!expanded)}
            className="justify-self-start"
          >
            Show all lines of use-users.ts
          </Button>
          <CodeBlock
            title="use-users.ts"
            maxLines={12}
            expanded={expanded}
            // A locked block ignores its own buttons, but the button above it
            // still expands it.
            setExpanded={(nextExpanded) => {
              if (locked) return;
              setExpanded(nextExpanded);
            }}
          >
            <CodeBlockCode
              html={hook.html}
              copy={{ value: hook.text, label: "Copy use-users.ts" }}
            />
          </CodeBlock>
          <Prose>
            <p>
              The list takes its spacing from a small style sheet. The style
              sheet is short, so it shows all its lines.
            </p>
          </Prose>
          {/* Labels in another language take the line count, or the name of
              the file. */}
          <CodeBlock
            selectedId={selectedId}
            setSelectedId={setSelectedId}
            maxLines={12}
            expand={{ label: (lineCount) => `Mostrar as ${lineCount} linhas` }}
            collapse="Mostrar menos linhas"
          >
            <CodeBlockTabList
              aria-label="Arquivos"
              previousButton={{ "aria-label": "Arquivos anteriores" }}
              nextButton={{ "aria-label": "Próximos arquivos" }}
            >
              <CodeBlockTab id="use-users.ts">use-users.ts</CodeBlockTab>
              <CodeBlockTab id="users.css">users.css</CodeBlockTab>
            </CodeBlockTabList>
            <CodeBlockPanel
              tabId="use-users.ts"
              html={hook.html}
              copy={{ value: hook.text, label: getCopyLabel }}
            />
            <CodeBlockPanel
              tabId="users.css"
              html={style.html}
              copy={{ value: style.text, label: getCopyLabel }}
            />
          </CodeBlock>
          <Prose>
            <p>
              The hook also opens in a dialog, or in a popover next to its name.
              The expanded code fits in each of them.
            </p>
          </Prose>
          <div className="flex flex-wrap gap-2">
            <DialogProvider>
              <DialogDisclosure>Open use-users.ts</DialogDisclosure>
              {/* A wide margin around the dialog, which is then much shorter
                  than the screen. */}
              <Dialog className="[--dialog-inset:--spacing(16)] [--dialog-max-width:40rem]">
                <DialogHeading>use-users.ts</DialogHeading>
                <CodeBlock maxLines={12}>
                  <CodeBlockCode
                    html={hook.html}
                    aria-label="Hook in a dialog"
                  />
                </CodeBlock>
              </Dialog>
            </DialogProvider>
            <PopoverProvider>
              <PopoverDisclosure>Preview use-users.ts</PopoverDisclosure>
              <Popover aria-label="Preview of use-users.ts">
                <CodeBlock maxLines={12}>
                  <CodeBlockCode
                    html={hook.html}
                    aria-label="Hook in a popover"
                  />
                </CodeBlock>
              </Popover>
            </PopoverProvider>
          </div>
          {/* The controls and blocks below come after the others, so the
              blocks above keep their place on the page. */}
          <Button
            aria-pressed={locked}
            onClick={() => setLocked(!locked)}
            className="justify-self-start"
          >
            Lock the state of use-users.ts
          </Button>
          <Prose>
            <p>
              Long lines can wrap instead of scrolling sideways. Wrapped code is
              not a tab stop, but the expand button still moves the focus to it.
            </p>
          </Prose>
          <CodeBlock
            maxLines={12}
            expand="Show all wrapped lines"
            collapse="Show fewer wrapped lines"
          >
            <CodeBlockCode html={hook.html} $wrap />
          </CodeBlock>
          <Prose>
            <p>
              A page can also apply the state of a block later, such as in a
              transition. The focus waits for it.
            </p>
          </Prose>
          <CodeBlock
            maxLines={12}
            expanded={lateExpanded}
            setExpanded={(nextExpanded) => {
              startTransition(() => setLateExpanded(nextExpanded));
            }}
            title="use-users.ts"
            expand="Show all lines after a transition"
            collapse="Show fewer lines after a transition"
          >
            {/* A label of its own names the code instead of the title. */}
            <CodeBlockCode
              html={hook.html}
              aria-label="Hook that expands in a transition"
            />
          </CodeBlock>
          <Prose>
            <p>
              The next page shows how to render the users in a list with a
              search field.
            </p>
          </Prose>
        </ShellMainBody>
      </ShellMain>
      <ShellFooter $sticky>
        <ShellStart>Last updated in November</ShellStart>
      </ShellFooter>
    </Shell>
  );
}
