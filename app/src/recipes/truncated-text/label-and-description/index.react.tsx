import {
  Button,
  ButtonContent,
  ButtonDescription,
  ButtonLabel,
  ButtonSlot,
} from "@ariakit/ui/components/button.ariakit.react";
import { Frame } from "@ariakit/ui/components/frame.ariakit.react";
import { Tooltip } from "@ariakit/ui/components/tooltip.ariakit.react";
import { TruncatedText } from "@ariakit/ui/components/truncated-text.ariakit.react";
import { FileTextIcon } from "lucide-react";
import { useId } from "react";

interface File {
  name: string;
  details: string;
}

const files: File[] = [
  { name: "Q3 report.pdf", details: "Edited 2 hours ago" },
  {
    name: "Revenue forecast for the second half of the year.xlsx",
    details: "Edited yesterday",
  },
  {
    name: "Interview notes.md",
    details: "Edited on Monday by the research team in the Lisbon office",
  },
];

export default function Example() {
  const headingId = useId();
  return (
    // Drag the corner to make the panel narrower or wider.
    <Frame
      render={<section aria-labelledby={headingId} />}
      $layer
      $lighten
      $border
      $rounded="xl"
      $p={2}
      className="grid w-72 max-w-full min-w-40 resize-x grid-cols-1 gap-1 overflow-hidden"
    >
      <h2 id={headingId} className="px-2 pt-1 text-sm font-medium">
        Recent files
      </h2>
      <ul className="grid grid-cols-1">
        {files.map((file) => (
          <li key={file.name} className="grid">
            {/* The tooltip shows while either text is cut off, and it holds
                both. */}
            <Tooltip
              text={
                <>
                  <strong>{file.name}</strong>
                  <br />
                  {file.details}
                </>
              }
              placement="right"
              fitViewport
            >
              <Button className="min-w-0 justify-start">
                <ButtonSlot aria-hidden>
                  <FileTextIcon />
                </ButtonSlot>
                <ButtonContent>
                  <TruncatedText render={<ButtonLabel />}>
                    {file.name}
                  </TruncatedText>
                  <TruncatedText render={<ButtonDescription />}>
                    {file.details}
                  </TruncatedText>
                </ButtonContent>
              </Button>
            </Tooltip>
          </li>
        ))}
      </ul>
    </Frame>
  );
}
