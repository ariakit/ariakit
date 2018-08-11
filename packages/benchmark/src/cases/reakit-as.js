import React from "react";
import { as } from "reakit";

const Component = as("div")(({ as: T }) => <T />);

export default () => <Component />;
