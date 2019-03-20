import * as React from "react";
import { ErrorMessage } from "./ErrorMessage";

type ErrorBoundaryState = {
  error: Error | null;
};

export class ErrorBoundary extends React.Component<{}, ErrorBoundaryState> {
  state: ErrorBoundaryState = {
    error: null
  };

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  componentDidCatch(_: Error) {
    // do nothing
  }

  render() {
    if (this.state.error) {
      return <ErrorMessage error={this.state.error} />;
    }
    return this.props.children;
  }
}
