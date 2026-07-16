import * as Ariakit from "@ariakit/react";
import "./style.css";

const tools = ["Tool 1", "Tool 2", "Tool 3"];

interface TooltipButtonOptions {
  tooltip: string;
}

function TooltipButton({
  tooltip,
  ...props
}: Ariakit.ButtonProps & TooltipButtonOptions) {
  return (
    <Ariakit.TooltipProvider>
      <Ariakit.Tooltip className="tooltip">{tooltip}</Ariakit.Tooltip>
      <Ariakit.TooltipAnchor render={<Ariakit.Button {...props} />} />
    </Ariakit.TooltipProvider>
  );
}

function ToolbarButton(props: Ariakit.ButtonProps) {
  return <Ariakit.ToolbarItem render={<Ariakit.Button {...props} />} />;
}

function IndependentTooltipToolbar() {
  const label = "Independent tooltips";
  return (
    <section>
      <h2>{label}</h2>
      <Ariakit.ToolbarProvider>
        <Ariakit.Toolbar aria-label={label} className="toolbar">
          {tools.map((tool) => (
            <Ariakit.ToolbarItem
              key={tool}
              className="toolbar-item"
              render={<TooltipButton tooltip={`${label}: ${tool}`} />}
            >
              {tool}
            </Ariakit.ToolbarItem>
          ))}
        </Ariakit.Toolbar>
      </Ariakit.ToolbarProvider>
    </section>
  );
}

function SharedTooltip() {
  const store = Ariakit.useTooltipContext();
  const anchorElement = Ariakit.useStoreState(store, "anchorElement");
  return (
    <Ariakit.Tooltip className="tooltip" portal={false}>
      {anchorElement?.dataset.tooltip}
    </Ariakit.Tooltip>
  );
}

function SharedTooltipToolbar() {
  const label = "Shared tooltip";
  return (
    <section>
      <h2>{label}</h2>
      <Ariakit.TooltipProvider>
        <Ariakit.ToolbarProvider>
          <Ariakit.Toolbar aria-label={label} className="toolbar">
            {tools.map((tool) => (
              <Ariakit.TooltipAnchor
                key={tool}
                data-tooltip={`${label}: ${tool}`}
                render={<ToolbarButton className="toolbar-item" />}
              >
                {tool}
              </Ariakit.TooltipAnchor>
            ))}
          </Ariakit.Toolbar>
        </Ariakit.ToolbarProvider>
        <SharedTooltip />
      </Ariakit.TooltipProvider>
    </section>
  );
}

function ToolbarWithoutTooltips() {
  const label = "No tooltips";
  return (
    <section>
      <h2>{label}</h2>
      <Ariakit.ToolbarProvider>
        <Ariakit.Toolbar aria-label={label} className="toolbar">
          {tools.map((tool) => (
            <ToolbarButton key={tool} className="toolbar-item">
              {tool}
            </ToolbarButton>
          ))}
        </Ariakit.Toolbar>
      </Ariakit.ToolbarProvider>
    </section>
  );
}

export default function Example() {
  return (
    <main className="root">
      <h1>Tooltip performance</h1>
      <IndependentTooltipToolbar />
      <SharedTooltipToolbar />
      <ToolbarWithoutTooltips />
    </main>
  );
}
