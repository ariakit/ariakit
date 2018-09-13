import Grid from "./Grid";
import GridItem from "./GridItem";

export interface GridComponents {
  Item: typeof GridItem;
}

const G = Grid as typeof Grid & GridComponents;

G.Item = GridItem;

export * from "./GridItem";

export default G;
