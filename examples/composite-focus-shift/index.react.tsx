import * as Ariakit from "@ariakit/react";
import clsx from "clsx";
import type { ElementRef } from "react";
import { forwardRef } from "react";

interface GridProps extends Ariakit.CompositeProps {
  focusShift?: boolean;
}

const Grid = forwardRef<ElementRef<typeof Ariakit.Composite>, GridProps>(
  function Grid({ focusShift, ...props }, ref) {
    return (
      <Ariakit.CompositeProvider focusShift={focusShift}>
        <Ariakit.Composite
          role="grid"
          {...props}
          ref={ref}
          className={clsx(props.className, "flex flex-col gap-2")}
        />
      </Ariakit.CompositeProvider>
    );
  },
);

const Row = forwardRef<
  ElementRef<typeof Ariakit.CompositeRow>,
  Ariakit.CompositeRowProps
>(function Row(props, ref) {
  return (
    <Ariakit.CompositeRow
      role="row"
      {...props}
      ref={ref}
      className={clsx(props.className, "flex gap-[inherit]")}
    />
  );
});

const GridCell = forwardRef<
  ElementRef<typeof Ariakit.CompositeItem>,
  Ariakit.CompositeItemProps
>(function Item(props, ref) {
  return <Ariakit.CompositeItem role="gridcell" {...props} ref={ref} />;
});

export default function Example() {
  return (
    <div className="flex flex-col gap-4">
      <Grid aria-label="Without focusShift">
        <Row>
          <GridCell>0A1</GridCell>
          <GridCell>0A2</GridCell>
          <GridCell>0A3</GridCell>
        </Row>
        <Row>
          <GridCell>0B1</GridCell>
          <GridCell>0B2</GridCell>
        </Row>
        <Row>
          <GridCell>0C1</GridCell>
          <GridCell>0C2</GridCell>
          <GridCell>0C3</GridCell>
        </Row>
      </Grid>
      <Grid aria-label="With focusShift" focusShift>
        <Row>
          <GridCell>1A1</GridCell>
          <GridCell>1A2</GridCell>
          <GridCell>1A3</GridCell>
        </Row>
        <Row>
          <GridCell>1B1</GridCell>
          <GridCell>1B2</GridCell>
        </Row>
        <Row>
          <GridCell>1C1</GridCell>
          <GridCell>1C2</GridCell>
          <GridCell>1C3</GridCell>
        </Row>
      </Grid>
    </div>
  );
}
