/* eslint-disable */
import { Button, Grid } from "reakit";

function Component() {
  return (
    <div>
      <Button as="div" />
      <Button as={[Link, "div"]} />
      <Grid
        areas="a b c"
        columns="1fr 60px auto"
        rows="auto"
      />
    </div>
  );
}
