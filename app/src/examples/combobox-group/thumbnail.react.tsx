import {
  comboboxGroupLabel,
  comboboxInput,
  comboboxItem,
  comboboxItemContent,
  comboboxItemDescription,
  comboboxItemLabel,
  comboboxItemSlot,
  comboboxPopover,
} from "@ariakit/ui/styles/combobox";
import { PlaceholderText } from "#app/components/placeholder-text.react.tsx";

export default function Thumbnail() {
  return (
    <div
      className="flex flex-col gap-2 items-center pointer-events-none"
      aria-hidden
    >
      <div {...comboboxInput.jsx({ className: "w-64 mt-4" })}>
        <PlaceholderText>e.g., John Doe</PlaceholderText>
      </div>
      <div
        data-open
        {...comboboxPopover.jsx({
          className: "w-66 max-w-full transition-none",
        })}
      >
        <div {...comboboxGroupLabel.jsx()}>Members</div>
        <div {...comboboxItem.jsx({ $highlighted: true })}>
          <div
            {...comboboxItemSlot.jsx({
              $kind: "avatar",
              $size: "sm",
              $rowSpan: 2,
              $layer: "brand",
              $contrast: true,
            })}
          />
          <div {...comboboxItemContent.jsx()}>
            <div {...comboboxItemLabel.jsx()}>John Smith</div>
            <div {...comboboxItemDescription.jsx()}>john@example.com</div>
          </div>
        </div>
        <div {...comboboxItem.jsx()}>
          <div
            {...comboboxItemSlot.jsx({
              $kind: "avatar",
              $size: "sm",
              $rowSpan: 2,
            })}
          />
          <div {...comboboxItemContent.jsx()}>
            <PlaceholderText>Emma Johnson</PlaceholderText>
            <PlaceholderText weight="light" size="sm">
              emma@example.com
            </PlaceholderText>
          </div>
        </div>
        <div {...comboboxGroupLabel.jsx()}>Files</div>
        <div {...comboboxItem.jsx()}>
          <div
            {...comboboxItemSlot.jsx({
              $kind: "avatar",
              $size: "sm",
              $rowSpan: 2,
            })}
          />
          <div {...comboboxItemContent.jsx()}>
            <PlaceholderText>annual_report.pdf</PlaceholderText>
            <PlaceholderText weight="light" size="sm">
              Documents
            </PlaceholderText>
          </div>
        </div>
      </div>
    </div>
  );
}
