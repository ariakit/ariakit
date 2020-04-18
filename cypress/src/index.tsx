import * as React from "react";
import ReactDOM from "react-dom";
import { Provider } from "reakit";
import * as system from "reakit-system-bootstrap";
import { getExample } from "./getExamples";

const name = new URL(window.location.href).searchParams.get("name");

function App() {
  if (!name) {
    return (
      <h1>Specify an example in the &quot;name&quot; querystring parameter.</h1>
    );
  }

  const CurrentExample = getExample(name);

  if (typeof CurrentExample === "undefined") {
    return <h1>Example &quot;{name}&quot; not found.</h1>;
  }

  return (
    <React.Suspense fallback="Loading...">
      <Provider unstable_system={system}>
        <CurrentExample />
      </Provider>
    </React.Suspense>
  );
}

ReactDOM.render(<App />, document.getElementById("root"));
