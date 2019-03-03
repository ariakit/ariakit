import * as React from "react";
import * as ReactDOM from "react-dom";
import { transform } from "buble";
import reakitPaths from "./__reakit";

console.log(reakitPaths);

function importToRequire(code: string) {
  return code
    .replace(/{([^}]+) as ([^}]+)}/g, "{$1: $2}")
    .replace(/import {([^}]+)} from ([^\s;]+);?/g, "const {$1} = require($2);")
    .replace(
      /import (.+) from ([^\s;]+);?/g,
      "const $1 = require($2).default || require($2);"
    );
}

function compileComponent(code: string) {
  const { code: compiledCode } = transform(importToRequire(code), {
    objectAssign: "Object.assign"
  });
  const require = (path: string) => {
    if (path in reakitPaths) {
      return reakitPaths[path];
    }
    return undefined;
  };
  const fn = new Function("require", "React", compiledCode);
  return fn(require, React);
}

// class ErrorBoundary extends React.Component {
//   state = {
//     error: null
//   };

//   static getDerivedStateFromError(e) {
//     return { error: `dsadsa${e.toString()}` };
//   }

//   componentDidCatch(e) {
//     this.props.onError(e);
//   }

//   render() {
//     if (this.state.error) {
//       return (
//         <pre style={{ fontSize: 14, color: "red" }}>{this.state.error}</pre>
//       );
//     }
//     return this.props.children;
//   }
// }

export function Preview(props: any) {
  const ref = React.useRef<HTMLDivElement | null>(null);
  const [rendered, setRendered] = React.useState<JSX.Element | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  const handleError = e => {
    setError(e.toString());
    console.error(e); // eslint-disable-line no-console
  };

  const unmount = () => {
    if (ref.current) {
      ReactDOM.unmountComponentAtNode(ref.current);
    }
  };

  React.useEffect(() => {
    if (!props.code) return undefined;

    const timer = setTimeout(() => {
      setError(null);
      try {
        const exampleComponent = compileComponent(props.code);
        unmount();
        ReactDOM.render(exampleComponent, ref.current);
      } catch (e) {
        unmount();
        handleError(e);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [props.code]);

  return (
    <React.Fragment>
      {error && <pre style={{ fontSize: 14, color: "red" }}>{error}</pre>}
      <div ref={ref} />
    </React.Fragment>
  );
}
