import React from "react";
import as from "../../../reakit/src";

const Component = as("div")(({ as: T }) => <T width={50} display="block" />);

export default () => <Component />;
