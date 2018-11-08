/* eslint-disable */
import { Button, Grid } from "reakit";

function Component() {
  return (
    <div>
      <Button use="div" />
      <Button use={[Link, "div"]} />
      <Grid
        templateAreas="a b c"
        templateColumns="1fr 60px auto"
        templateRows="auto"
      />
    </div>
  );
}
