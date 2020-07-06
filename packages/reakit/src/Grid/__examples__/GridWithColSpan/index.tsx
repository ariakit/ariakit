import * as React from "react";
import { Provider } from "reakit";
import {
  unstable_useGridState as useGridState,
  unstable_Grid as Grid,
  unstable_GridRow as GridRow,
  unstable_GridCell as GridCell,
} from "reakit/Grid";

export default function GridWithColSpan() {
  const grid = useGridState({ wrap: true, loop: true, unstable_angular: true });
  return (
    <Provider>
      <Grid {...grid} aria-label="Grid with col span">
        <GridRow {...grid}>
          <GridCell {...grid} id="cell0">
            cell
          </GridCell>
          <GridCell {...grid} id="cell1">
            cell
          </GridCell>
          <GridCell {...grid} id="cell2">
            cell
          </GridCell>
        </GridRow>
        <GridRow {...grid}>
          <GridCell {...grid} id="cell3" disabled focusable>
            cell
          </GridCell>
          <GridCell {...grid} id="cell4">
            cell
          </GridCell>
          <GridCell {...grid} id="cell5" disabled focusable>
            cell
          </GridCell>
        </GridRow>
        <GridRow {...grid}>
          <GridCell {...grid} id="cell6">
            cell
          </GridCell>
          <GridCell {...grid} id="cell7">
            cell
          </GridCell>
        </GridRow>
        <GridRow {...grid}>
          <GridCell {...grid} id="cell8">
            cell
          </GridCell>
          <GridCell {...grid} id="cell9">
            cell
          </GridCell>
          <GridCell {...grid} id="cell10">
            cell
          </GridCell>
        </GridRow>
        <GridRow {...grid}>
          <GridCell {...grid} id="cell11">
            cell
          </GridCell>
          <GridCell {...grid} id="cell12">
            cell
          </GridCell>
          <GridCell {...grid} id="cell13">
            cell
          </GridCell>
        </GridRow>
        <GridRow {...grid}>
          <GridCell {...grid} id="cell14">
            cell
          </GridCell>
          <GridCell {...grid} id="cell15">
            cell
          </GridCell>
        </GridRow>
        <GridRow {...grid}>
          <GridCell {...grid} id="cell16">
            cell
          </GridCell>
          <GridCell {...grid} id="cell17">
            cell
          </GridCell>
          <GridCell {...grid} id="cell18">
            cell
          </GridCell>
        </GridRow>
        <GridRow {...grid}>
          <GridCell {...grid} id="cell19">
            cell
          </GridCell>
          <GridCell {...grid} id="cell20">
            cell
          </GridCell>
          <GridCell {...grid} id="cell21">
            cell
          </GridCell>
        </GridRow>
        <GridRow {...grid}>
          <GridCell {...grid} id="cell22">
            cell
          </GridCell>
          <GridCell {...grid} id="cell23">
            cell
          </GridCell>
        </GridRow>
        <GridRow {...grid}>
          <GridCell {...grid} id="cell24">
            cell
          </GridCell>
          <GridCell {...grid} id="cell25">
            cell
          </GridCell>
          <GridCell {...grid} id="cell26">
            cell
          </GridCell>
        </GridRow>
        <GridRow {...grid}>
          <GridCell {...grid} id="cell27">
            cell
          </GridCell>
        </GridRow>
        <GridRow {...grid}>
          <GridCell {...grid} id="cell28">
            cell
          </GridCell>
          <GridCell {...grid} id="cell29">
            cell
          </GridCell>
          <GridCell {...grid} id="cell30">
            cell
          </GridCell>
        </GridRow>
        <GridRow {...grid}>
          <GridCell {...grid} id="cell31">
            cell
          </GridCell>
          <GridCell {...grid} id="cell32">
            cell
          </GridCell>
          <GridCell {...grid} id="cell33">
            cell
          </GridCell>
        </GridRow>
        <GridRow {...grid}>
          <GridCell {...grid} id="cell34">
            cell
          </GridCell>
          <GridCell {...grid} id="cell35">
            cell
          </GridCell>
          <GridCell {...grid} id="cell36">
            cell
          </GridCell>
        </GridRow>
        <GridRow {...grid}>
          <GridCell {...grid} id="cell37">
            cell
          </GridCell>
          <GridCell {...grid} id="cell38">
            cell
          </GridCell>
          <GridCell {...grid} id="cell39">
            cell
          </GridCell>
        </GridRow>
        <GridRow {...grid}>
          <GridCell {...grid} id="cell40">
            cell
          </GridCell>
          <GridCell {...grid} id="cell41">
            cell
          </GridCell>
          <GridCell {...grid} id="cell42">
            cell
          </GridCell>
        </GridRow>
        <GridRow {...grid}>
          <GridCell {...grid} id="cell43">
            cell
          </GridCell>
          <GridCell {...grid} id="cell44">
            cell
          </GridCell>
          <GridCell {...grid} id="cell45">
            cell
          </GridCell>
        </GridRow>
        <GridRow {...grid}>
          <GridCell {...grid} id="cell46">
            cell
          </GridCell>
          <GridCell {...grid} id="cell47">
            cell
          </GridCell>
          <GridCell {...grid} id="cell48">
            cell
          </GridCell>
        </GridRow>
        <GridRow {...grid}>
          <GridCell {...grid} id="cell49">
            cell
          </GridCell>
          <GridCell {...grid} id="cell50">
            cell
          </GridCell>
          <GridCell {...grid} id="cell51">
            cell
          </GridCell>
        </GridRow>
        <GridRow {...grid}>
          <GridCell {...grid} id="cell52">
            cell
          </GridCell>
          <GridCell {...grid} id="cell53">
            cell
          </GridCell>
          <GridCell {...grid} id="cell54">
            cell
          </GridCell>
        </GridRow>
        <GridRow {...grid}>
          <GridCell {...grid} id="cell55">
            cell
          </GridCell>
          <GridCell {...grid} id="cell56">
            cell
          </GridCell>
          <GridCell {...grid} id="cell57">
            cell
          </GridCell>
        </GridRow>
        <GridRow {...grid}>
          <GridCell {...grid} id="cell58">
            cell
          </GridCell>
          <GridCell {...grid} id="cell59">
            cell
          </GridCell>
          <GridCell {...grid} id="cell60">
            cell
          </GridCell>
        </GridRow>
        <GridRow {...grid}>
          <GridCell {...grid} id="cell61">
            cell
          </GridCell>
          <GridCell {...grid} id="cell62">
            cell
          </GridCell>
          <GridCell {...grid} id="cell63">
            cell
          </GridCell>
        </GridRow>
        <GridRow {...grid}>
          <GridCell {...grid} id="cell64">
            cell
          </GridCell>
          <GridCell {...grid} id="cell65">
            cell
          </GridCell>
          <GridCell {...grid} id="cell66">
            cell
          </GridCell>
        </GridRow>
        <GridRow {...grid}>
          <GridCell {...grid} id="cell67">
            cell
          </GridCell>
          <GridCell {...grid} id="cell68">
            cell
          </GridCell>
          <GridCell {...grid} id="cell69">
            cell
          </GridCell>
        </GridRow>
        <GridRow {...grid}>
          <GridCell {...grid} id="cell70">
            cell
          </GridCell>
          <GridCell {...grid} id="cell71">
            cell
          </GridCell>
          <GridCell {...grid} id="cell72">
            cell
          </GridCell>
        </GridRow>
        <GridRow {...grid}>
          <GridCell {...grid} id="cell73">
            cell
          </GridCell>
          <GridCell {...grid} id="cell74">
            cell
          </GridCell>
          <GridCell {...grid} id="cell75">
            cell
          </GridCell>
        </GridRow>
        <GridRow {...grid}>
          <GridCell {...grid} id="cell76">
            cell
          </GridCell>
          <GridCell {...grid} id="cell77">
            cell
          </GridCell>
          <GridCell {...grid} id="cell78">
            cell
          </GridCell>
        </GridRow>
        <GridRow {...grid}>
          <GridCell {...grid} id="cell79">
            cell
          </GridCell>
          <GridCell {...grid} id="cell80">
            cell
          </GridCell>
          <GridCell {...grid} id="cell81">
            cell
          </GridCell>
        </GridRow>
        <GridRow {...grid}>
          <GridCell {...grid} id="cell82">
            cell
          </GridCell>
          <GridCell {...grid} id="cell83">
            cell
          </GridCell>
        </GridRow>
      </Grid>
    </Provider>
  );
}
