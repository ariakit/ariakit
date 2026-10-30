import {
  Button,
  ButtonLabel,
  ButtonSlot,
} from "@ariakit/ui/components/button.ariakit.react";
import { Tooltip } from "@ariakit/ui/components/tooltip.ariakit.react";
import {
  DownloadIcon,
  EyeIcon,
  HeartIcon,
  Share2Icon,
  SparklesIcon,
} from "lucide-react";

export default function Example() {
  return (
    <div className="flex max-w-[30rem] flex-wrap justify-center gap-3">
      {/* By default, the tooltip inverts the page colors. */}
      <Tooltip text="Download the PDF">
        <Button $kind="bevel">
          <ButtonSlot>
            <DownloadIcon />
          </ButtonSlot>
          <ButtonLabel>Download</ButtonLabel>
        </Button>
      </Tooltip>
      {/* The popover surface, with an edge. */}
      <Tooltip text="Open a preview" $invert={false}>
        <Button $kind="bevel">
          <ButtonSlot>
            <EyeIcon />
          </ButtonSlot>
          <ButtonLabel>Preview</ButtonLabel>
        </Button>
      </Tooltip>
      {/* A layer color keeps its hue. */}
      <Tooltip text="Available on the Pro plan" $layer="brand">
        <Button $kind="bevel">
          <ButtonSlot>
            <SparklesIcon />
          </ButtonSlot>
          <ButtonLabel>Upgrade</ButtonLabel>
        </Button>
      </Tooltip>
      <Tooltip text="Share with your team" arrow>
        <Button $kind="bevel">
          <ButtonSlot>
            <Share2Icon />
          </ButtonSlot>
          <ButtonLabel>Share</ButtonLabel>
        </Button>
      </Tooltip>
      <Tooltip text="Add to favorites" $rounded="full">
        <Button $kind="bevel">
          <ButtonSlot>
            <HeartIcon />
          </ButtonSlot>
          <ButtonLabel>Favorite</ButtonLabel>
        </Button>
      </Tooltip>
    </div>
  );
}
