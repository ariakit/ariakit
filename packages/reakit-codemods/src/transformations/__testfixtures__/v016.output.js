/* eslint-disable */
import { use, Button, Grid } from "reakit";
import { Component } from "react";

const ButtonDiv = use(Button, "div");

const ButtonDiv = use(Button, "div");

const ButtonLinkDiv = use(Button, Link, "div");

const ButtonLinkDiv = use(Button, Link, "div");

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
