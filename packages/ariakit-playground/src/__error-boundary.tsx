import { Component, ReactNode } from "react";
import { ErrorMessage } from "./__error-message";

type ErrorBoundaryProps = { children: ReactNode };
type ErrorBoundaryState = { error: Error | null };

export class ErrorBoundary extends Component<ErrorBoundaryProps> {
  state: ErrorBoundaryState = {
    error: null,
  };

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  render() {
    return (
      <>
        {!this.state.error && this.props.children}
        <ErrorMessage>{this.state.error?.message}</ErrorMessage>
      </>
    );
  }
}
