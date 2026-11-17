import {
  CodeBlock,
  CodeBlockCode,
  CodeBlockSkeleton,
} from "@ariakit/ui/components/code-block.ariakit.react";
import {
  Example,
  ExampleGrid,
} from "#app/components/ariakit-ui-example.react.tsx";

export default function CodeBlockSkeletonExamples() {
  return (
    <ExampleGrid>
      <Example
        title="Loading code"
        description="Skeleton lines take the shapes and the colors of highlighted code while the code loads, and the copy button stays in its corner."
        stretch
        code={`
          <CodeBlock title="counter.tsx">
            <CodeBlockCode aria-busy copy={{ value: "", disabled: true }}>
              <CodeBlockSkeleton lines={8} />
            </CodeBlockCode>
          </CodeBlock>
        `}
      >
        <CodeBlock title="counter.tsx">
          <CodeBlockCode aria-busy copy={{ value: "", disabled: true }}>
            <CodeBlockSkeleton lines={8} />
          </CodeBlockCode>
        </CodeBlock>
      </Example>

      <Example
        title="Line numbers"
        description="A bar takes the place of each line number, at the end of the gutter, so the numbers don't show before the code."
        stretch
        code={`
          <CodeBlock title="use-counter.ts">
            <CodeBlockCode aria-busy $lineNumbers>
              <CodeBlockSkeleton lines={12} />
            </CodeBlockCode>
          </CodeBlock>
        `}
      >
        <CodeBlock title="use-counter.ts">
          <CodeBlockCode aria-busy $lineNumbers>
            <CodeBlockSkeleton lines={12} />
          </CodeBlockCode>
        </CodeBlock>
      </Example>

      <Example
        title="Wrapped lines"
        description="In wrapped code, the bars of a line wrap like words, and the bar of the line number stays on the first row of the line."
        stretch
        code={`
          <CodeBlock title="counter.css">
            <CodeBlockCode aria-busy $lineNumbers $wrap className="w-48">
              <CodeBlockSkeleton lines={6} />
            </CodeBlockCode>
          </CodeBlock>
        `}
      >
        <CodeBlock title="counter.css">
          <CodeBlockCode aria-busy $lineNumbers $wrap className="w-48">
            <CodeBlockSkeleton lines={6} />
          </CodeBlockCode>
        </CodeBlock>
      </Example>
    </ExampleGrid>
  );
}
