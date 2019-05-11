import * as React from "react";
import { globalHistory } from "@reach/router";

function useLocation() {
  const [location, setLocation] = React.useState(globalHistory.location);

  React.useEffect(
    () => globalHistory.listen(params => setLocation(params.location)),
    [setLocation]
  );

  return location;
}

export default useLocation;
