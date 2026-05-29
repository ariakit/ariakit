import { PlaceholderText } from "#app/components/placeholder-text.react.tsx";

export default function Thumbnail() {
  return (
    <div className="flex flex-col gap-2 items-center">
      <div className="ak-input_idle w-64 flex mt-4">
        <PlaceholderText>e.g., John Doe</PlaceholderText>
      </div>
      <div className="ak-popover_idle ak-frame ak-frame-force ak-frame-container/container w-66 max-w-full">
        <div className="ak-frame ak-frame-container/2 text-sm ak-ink-60 font-medium">
          Members
        </div>
        <div className="base:ak-option_idle ak-option_hover grid gap-2 grid-cols-[2rem_auto] items-center">
          <div className="ak-layer ak-layer-primary ak-layer-contrast rounded-full aspect-square" />
          <div className="grid">
            <div className="ak-ink-90 text-sm font-medium">John Smith</div>
            <div className="ak-ink-60 text-xs">john@example.com</div>
          </div>
        </div>
        <div className="base:ak-option_idle grid gap-2 grid-cols-[2rem_auto] items-center">
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
        <div className="base:ak-option_idle grid gap-2 grid-cols-[2rem_auto] items-center">
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
