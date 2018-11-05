/* eslint-disable */
import { as, Button, Grid } from "reakit";
import { Component } from "react";

const ButtonDiv = as("div")(Button);

const ButtonDiv = Button.as("div");

const ButtonLinkDiv = as([Link, "div"])(Button);

const ButtonLinkDiv = Button.as([Link, "div"]);

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
