/* eslint-disable */
import { as } from "reakit";
import { Component } from "react";

const ButtonDiv = as("div")(Button);

const ButtonDiv = Button.as("div");

const ButtonLinkDiv = as([Link, "div"])(Button);

const ButtonLinkDiv = Button.as([Link, "div"]);

{
	<div>
		<Button as="div" />
		<Button as={[Link, "div"]} />
	</div>
}
