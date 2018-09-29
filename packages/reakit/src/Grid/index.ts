import Grid from "./Grid";
import GridItem from "./GridItem";

export * from "./GridItem";
export * from "./Grid";

export default Object.assign(Grid, {
  Item: GridItem
});
