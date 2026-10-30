import { Button } from "@ariakit/ui/components/button.ariakit.react";
import { Frame } from "@ariakit/ui/components/frame.ariakit.react";
import {
  RadioCard,
  RadioCardContent,
  RadioCardDescription,
  RadioCardGrid,
  RadioCardLabel,
  RadioCardSlot,
  RadioGroup,
} from "@ariakit/ui/components/radio.ariakit.react";
import { Tooltip } from "@ariakit/ui/components/tooltip.ariakit.react";
import { useState } from "react";

const colors = [
  { value: "sage", label: "Sage", color: "#8fa889" },
  { value: "navy", label: "Navy", color: "#2c3e66" },
  { value: "rust", label: "Rust", color: "#b5552f" },
];

const sizes = [
  { value: "s", label: "S" },
  { value: "m", label: "M" },
  { value: "l", label: "L" },
  { value: "xl", label: "XL", soldOut: true },
];

// The shapes of the jacket drawing. The sleeves and the body take the picked
// color, and dark and white layers draw the shade, the seams, and the zipper.
const leftSleeve =
  "M64 34C46 40 38 52 34 72L16 166C15 173 19 178 26 179L42 181C48 182 52 178 53 172L66 96Z";
const rightSleeve =
  "M136 34C154 40 162 52 166 72L184 166C185 173 181 178 174 179L158 181C152 182 148 178 147 172L134 96Z";
const body =
  "M64 34L84 24C90 32 110 32 116 24L136 34C142 56 144 76 144 100L146 196C146 203 141 208 134 208L66 208C59 208 54 203 54 196L56 100C56 76 58 56 64 34Z";
const collar =
  "M84 24C84 12 92 6 100 6C108 6 116 12 116 24C110 32 90 32 84 24Z";
const neck =
  "M89 21C93 27 107 27 111 21C109 15 105 11 100 11C95 11 91 15 89 21Z";
const hem =
  "M54 190L146 190L146 196C146 203 141 208 134 208L66 208C59 208 54 203 54 196Z";

interface JacketProps {
  color?: string;
}

function Jacket({ color }: JacketProps) {
  return (
    <svg
      viewBox="0 0 200 214"
      className="w-44 max-w-full drop-shadow-lg"
      style={{ color }}
    >
      <g fill="currentColor">
        <path d={leftSleeve} />
        <path d={rightSleeve} />
        <path d={body} />
        <path d={collar} />
      </g>
      <g fill="black" fillOpacity={0.14}>
        <path d={leftSleeve} />
        <path d={rightSleeve} />
        <path d={hem} />
      </g>
      <path d={neck} fill="black" fillOpacity={0.3} />
      <g
        fill="none"
        stroke="black"
        strokeLinecap="round"
        strokeOpacity={0.3}
        strokeWidth={2}
      >
        <path d="M100 30V208" />
        <path d="M66 96L64 34M134 96L136 34" />
        <path d="M18 158L54 164M182 158L146 164" />
        <path d="M70 150L84 128M130 150L116 128" strokeWidth={3} />
      </g>
      <rect x={96.5} y={42} width={7} height={13} rx={2} fill="white" />
    </svg>
  );
}

export default function Example() {
  const [color, setColor] = useState<string | number | null>("sage");
  const [size, setSize] = useState<string | number | null>(null);
  const currentColor = colors.find((item) => item.value === color);
  const currentSize = sizes.find((item) => item.value === size);
  return (
    // The layout follows the width of the example, not the page, so it changes
    // when the preview is resized. Two columns start where each column fits
    // the four sizes in one row.
    <div className="@container/product w-[40rem] max-w-full">
      <div className="grid gap-6 @xl/product:grid-cols-2">
        {/* A drawing of the jacket in the picked color. */}
        <Frame
          aria-hidden
          $rounded="2xl"
          $p={6}
          className="grid place-items-center"
        >
          <Jacket color={currentColor?.color} />
        </Frame>
        <div className="grid content-start gap-5">
          <div>
            <p className="text-lg font-semibold">Trail Jacket</p>
            <p className="ak-ink-70">$180</p>
          </div>
          <RadioGroup
            // The label shows the picked color as text, and it takes a full row
            // above the swatches.
            label={{
              className: "w-full",
              children: (
                <>
                  Color:{" "}
                  <span className="font-normal">{currentColor?.label}</span>
                </>
              ),
            }}
            value={color}
            setValue={setColor}
            className="flex flex-wrap gap-2"
          >
            {colors.map((item) => (
              <RadioCard
                key={item.value}
                value={item.value}
                aria-label={item.label}
                $rounded="full"
                $p={1}
              >
                {/* The slot paints the color as a layer. Its border keeps a
                    light or dark color visible on the card. */}
                <RadioCardSlot
                  $layer={item.color}
                  $border
                  $rounded="full"
                  $size="xl"
                />
              </RadioCard>
            ))}
          </RadioGroup>
          {/* The width fits four columns, so the sizes fill the row. */}
          <RadioCardGrid
            label="Size"
            value={size}
            setValue={setSize}
            $minItemSize="3.5rem"
            className="max-w-80"
          >
            {sizes.map((item) => (
              <RadioCard
                key={item.value}
                value={item.value}
                disabled={item.soldOut}
                $p={2}
              >
                {item.soldOut ? (
                  // The line through the size shows that it is not available.
                  // Screen readers get the same text as the tooltip from the
                  // description. The anchor stays out of the Tab order, so the
                  // group keeps one Tab stop.
                  <Tooltip content="Sold out. Back on 20 November.">
                    <RadioCardContent
                      tabIndex={-1}
                      className="items-center text-center"
                    >
                      <RadioCardLabel className="line-through">
                        {item.label}
                      </RadioCardLabel>
                      <RadioCardDescription className="sr-only">
                        Sold out. Back on 20 November.
                      </RadioCardDescription>
                    </RadioCardContent>
                  </Tooltip>
                ) : (
                  <RadioCardContent className="items-center text-center">
                    <RadioCardLabel>{item.label}</RadioCardLabel>
                  </RadioCardContent>
                )}
              </RadioCard>
            ))}
          </RadioCardGrid>
          <Button
            $kind="bevel"
            $layer="brand"
            disabled={!currentSize}
            className="justify-self-start"
          >
            {currentSize
              ? `Add ${currentColor?.label} jacket, size ${currentSize.label}`
              : "Select a size"}
          </Button>
        </div>
      </div>
    </div>
  );
}
