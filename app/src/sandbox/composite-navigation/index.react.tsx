import * as Ariakit from "@ariakit/react";
import type { ElementRef } from "react";
import { forwardRef } from "react";

interface GridProps extends Ariakit.CompositeProps {
  focusShift?: boolean;
}

const Grid = forwardRef<ElementRef<typeof Ariakit.Composite>, GridProps>(
  function Grid({ focusShift, ...props }, ref) {
    return (
      <Ariakit.CompositeProvider focusShift={focusShift}>
        <Ariakit.Composite role="grid" {...props} ref={ref} />
      </Ariakit.CompositeProvider>
    );
  },
);

const Row = forwardRef<
  ElementRef<typeof Ariakit.CompositeRow>,
  Ariakit.CompositeRowProps
>(function Row(props, ref) {
  return <Ariakit.CompositeRow role="row" {...props} ref={ref} />;
});

const GridCell = forwardRef<
  ElementRef<typeof Ariakit.CompositeItem>,
  Ariakit.CompositeItemProps
>(function GridCell(props, ref) {
  return <Ariakit.CompositeItem role="gridcell" {...props} ref={ref} />;
});

function BasicComposite() {
  return (
    <Ariakit.CompositeProvider>
      <Ariakit.Composite aria-label="Fruits">
        <Ariakit.CompositeItem>Apple</Ariakit.CompositeItem>
        <Ariakit.CompositeItem>Grape</Ariakit.CompositeItem>
        <Ariakit.CompositeItem>Orange</Ariakit.CompositeItem>
      </Ariakit.Composite>
    </Ariakit.CompositeProvider>
  );
}

function FocusShiftGrid({
  prefix,
  focusShift,
}: {
  prefix: string;
  focusShift?: boolean;
}) {
  return (
    <Grid aria-label={`${prefix} grid`} focusShift={focusShift}>
      <Row>
        <GridCell>{prefix}A1</GridCell>
        <GridCell>{prefix}A2</GridCell>
        <GridCell>{prefix}A3</GridCell>
      </Row>
      <Row>
        <GridCell>{prefix}B1</GridCell>
        <GridCell>{prefix}B2</GridCell>
      </Row>
      <Row>
        <GridCell>{prefix}C1</GridCell>
        <GridCell>{prefix}C2</GridCell>
        <GridCell>{prefix}C3</GridCell>
      </Row>
    </Grid>
  );
}

/**
 * Items far enough apart that reaching one with the keyboard can only be seen
 * by the page scrolling to reveal it.
 */
function DistantComposite() {
  return (
    <Ariakit.CompositeProvider>
      <Ariakit.Composite aria-label="Distant fruits">
        <Ariakit.CompositeItem>Near fruit</Ariakit.CompositeItem>
        <div style={{ height: 900 }} />
        <Ariakit.CompositeItem>Distant fruit</Ariakit.CompositeItem>
      </Ariakit.Composite>
    </Ariakit.CompositeProvider>
  );
}

export default function Example() {
  return (
    <main>
      <h1>Composite navigation</h1>
      <BasicComposite />
      <FocusShiftGrid prefix="0" />
      <FocusShiftGrid prefix="1" focusShift />
      {/* Kept last so the first tab stop on the page stays in the basic
      composite, which the existing navigation tests rely on. */}
      <DistantComposite />
    </main>
  );
}
