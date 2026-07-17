import { input } from "@ariakit/ui/styles/input.ts";
import { option } from "@ariakit/ui/styles/option.ts";
import { popover } from "@ariakit/ui/styles/popover.ts";
import { PlaceholderText } from "#app/components/placeholder-text.react.tsx";

// Decorative option lookalikes: keep the resting option look but disable the
// interactive state variants so the thumbnail stays hover-inert, like the
// box-patterns fake buttons.
function fakeOption(props?: Parameters<typeof option.jsx>[0]) {
  return option.jsx({
    $hoverOffset: false,
    $active: false,
    ...props,
  });
}

const optionRowClass = "grid gap-2 grid-cols-[2rem_auto] items-center";

export default function Thumbnail() {
  return (
    <div className="flex flex-col gap-2 items-center">
      <div {...input.jsx({ className: "w-64 flex mt-4" })}>
        <PlaceholderText>e.g., John Doe</PlaceholderText>
      </div>
      <div
        {...popover.jsx({
          // Static preview: no open/close transitions. The frame matches the
          // migrated combobox popover (legacy ak-frame-container/container).
          $state: "none",
          $rounded: "xl",
          $p: 1,
          className: "w-66 max-w-full",
        })}
      >
        <div className="ak-frame ak-frame-container/2 text-sm ak-ink-60 font-medium">
          Members
        </div>
        <div
          {...fakeOption({
            // Restate the legacy forced hover state (ak-option_hover) so this
            // row previews the active item.
            className: `ak-state-6 ${optionRowClass}`,
          })}
        >
          <div className="ak-layer ak-layer-brand ak-layer-contrast rounded-full aspect-square" />
          <div className="grid">
            <div className="ak-ink-90 text-sm font-medium">John Smith</div>
            <div className="ak-ink-60 text-xs">john@example.com</div>
          </div>
        </div>
        <div {...fakeOption({ className: optionRowClass })}>
          <div className="ak-layer ak-layer-6 rounded-full aspect-square" />
          <div className="grid">
            <PlaceholderText>Emma Johnson</PlaceholderText>
            <PlaceholderText weight="light" size="sm">
              emma@example.com
            </PlaceholderText>
          </div>
        </div>
        <div className="ak-frame ak-frame-container/2 text-sm ak-ink-60 font-medium">
          Files
        </div>
        <div {...fakeOption({ className: optionRowClass })}>
          <div className="ak-layer ak-layer-6 rounded-full aspect-square" />
          <div className="grid">
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
