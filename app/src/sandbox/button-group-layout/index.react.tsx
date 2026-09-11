import { Button } from "@ariakit/react";
import { button, buttonGlider, buttonGroup } from "@ariakit/ui/styles/button";

const groups = [
  { title: "Glider", $layout: "horizontal", $gap: "none", $p: "none" },
  {
    title: "Independent",
    $layout: "horizontal",
    $gap: "none",
    $p: "none",
    $joined: false,
  },
  {
    title: "Joined vertical",
    $layout: "vertical",
    $gap: "auto",
    $p: "none",
    $joined: true,
  },
  { title: "Horizontal", $layout: "horizontal", $gap: "auto", $p: "none" },
  { title: "Stretched", $layout: "stretch", $gap: "none", $p: "none" },
  { title: "Padded", $layout: "horizontal", $gap: "none", $p: 2 },
  { title: "Spaced", $layout: "horizontal", $gap: "md", $p: "none" },
  { title: "Vertical", $layout: "vertical", $gap: "auto", $p: "none" },
  { title: "Wrapped", $layout: "wrap", $gap: "auto", $p: "none" },
  // All of these lengths resolve to the same padding as "none".
  { title: "Numeric zero", $layout: "horizontal", $gap: "auto", $p: 0 },
  { title: "Pixel zero", $layout: "horizontal", $gap: "auto", $p: "0px" },
  { title: "Rem zero", $layout: "horizontal", $gap: "auto", $p: "0rem" },
  {
    title: "Calculated zero",
    $layout: "horizontal",
    $gap: "auto",
    $p: "calc(0px)",
  },
] as const;

export default function Example() {
  return (
    <div className="grid w-80 max-w-full gap-4">
      {groups.map(({ title, ...variants }) => (
        <section key={title}>
          <h2>{title}</h2>
          <div
            role="group"
            aria-label={title}
            {...buttonGroup.jsx({
              $border: 2,
              className: title === "Wrapped" ? "w-32" : undefined,
              ...variants,
            })}
          >
            {["Day", "Week", "Month"].map((label) => (
              <Button
                key={label}
                aria-current={
                  title === "Glider" && label === "Week" ? "true" : undefined
                }
                {...button.jsx({ $border: 2, $borderType: "border" })}
              >
                {label}
              </Button>
            ))}
            {title === "Glider" && (
              <div
                {...buttonGlider.jsx({ $state: "selected", $layer: "blue" })}
              />
            )}
          </div>
        </section>
      ))}
    </div>
  );
}
