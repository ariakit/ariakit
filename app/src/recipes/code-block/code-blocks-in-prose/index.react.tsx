import {
  CodeBlock,
  CodeBlockCode,
} from "@ariakit/ui/components/code-block.ariakit.react";
import { Code } from "@ariakit/ui/components/code.ariakit.react";
import {
  Heading,
  HeadingDescription,
} from "@ariakit/ui/components/heading.ariakit.react";
import { Prose } from "@ariakit/ui/components/prose.ariakit.react";
import {
  Shell,
  ShellMain,
  ShellMainBody,
  ShellMainIntro,
  ShellPopout,
} from "@ariakit/ui/components/shell.ariakit.react";
import { FileIcon } from "../file-icon.react.tsx";
import type { load } from "./index.server.ts";
import { InstallBlock } from "./install-block.react.tsx";

type File = ReturnType<typeof load>["usage"];

// The title of a block, with the icon of its file.
function getTitle(file: File) {
  return {
    children: file.name,
    icon: file.icon && <FileIcon icon={file.icon} />,
  };
}

export default function Example({
  prerequisites,
  library,
  usage,
  styles,
}: ReturnType<typeof load>) {
  return (
    <Shell>
      <ShellMain>
        <ShellMainIntro>
          <Prose>
            <Heading render={<h1 />}>Disclosure</Heading>
            <HeadingDescription>
              A disclosure shows and hides a section of the page. A button
              controls it, and the button tells screen readers whether the
              section is open.
            </HeadingDescription>
          </Prose>
        </ShellMainIntro>
        {/* Each code block is a popout, so it's wider than the text column,
            and the code has more room before it scrolls. */}
        <ShellMainBody>
          <Prose>
            <Heading render={<h2 />}>Installation</Heading>
            <p>
              Pick your package manager in a tab, and the other install command
              follows. The page remembers your choice.
            </p>
            <Heading render={<h3 />}>Install the prerequisites</Heading>
            <p>The components need React and React DOM:</p>
          </Prose>
          <ShellPopout>
            <InstallBlock commands={prerequisites} />
          </ShellPopout>
          <Prose>
            <Heading render={<h3 />}>Install the library</Heading>
            <p>Then install the package:</p>
          </Prose>
          <ShellPopout>
            <InstallBlock commands={library} />
          </ShellPopout>
          <Prose>
            <Heading render={<h2 />}>Usage</Heading>
            <p>
              Put the button and the content in a{" "}
              <Code>DisclosureProvider</Code>. The provider holds the open
              state, so both parts stay in sync without props between them.
            </p>
          </Prose>
          <ShellPopout>
            <CodeBlock title={getTitle(usage)}>
              <CodeBlockCode html={usage.html} copy={usage.text} $lineNumbers />
            </CodeBlock>
          </ShellPopout>
          <Prose>
            <p>
              The <Code>Disclosure</Code> on line 6 is a button. A click on it
              opens the content, and another click closes it again.
            </p>
            <Heading render={<h2 />}>Animation</Heading>
            <p>
              The content gets a <Code>data-enter</Code> attribute while it
              opens, so a CSS animation can run at that moment:
            </p>
          </Prose>
          <ShellPopout>
            <CodeBlock title={getTitle(styles)}>
              <CodeBlockCode html={styles.html} copy={styles.text} />
            </CodeBlock>
          </ShellPopout>
        </ShellMainBody>
      </ShellMain>
    </Shell>
  );
}
