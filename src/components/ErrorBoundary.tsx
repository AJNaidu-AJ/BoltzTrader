import React, { Component, ReactNode } from "react";

type State = { hasError: boolean; error?: any; info?: any };

export class ErrorBoundary extends Component<{ children: ReactNode }, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(error: any) {
    return { hasError: true, error };
  }

  componentDidCatch(error: any, info: any) {
    console.error("ErrorBoundary caught:", { error, info });
    try {
      const payload = {
        time: new Date().toISOString(),
        url: window.location.href,
        message: error?.message,
        stack: error?.stack,
        componentStack: info?.componentStack,
      };
      console.groupCollapsed("🧩 ErrorBoundary Debug Payload");
      console.log(JSON.stringify(payload, null, 2));
      console.groupEnd();
    } catch (e) {
      console.error("Failed to stringify boundary payload", e);
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="m-4 p-4 border rounded bg-red-50">
          <h3 className="text-red-700 font-semibold">⚠️ Something went wrong</h3>
          <p className="text-sm text-red-600 mb-2">
            Please refresh the page or try again.
          </p>
          <details className="bg-white rounded p-2">
            <summary className="text-xs cursor-pointer">Show error details</summary>
            <pre className="text-xs max-h-[300px] overflow-auto">
              {this.state.error?.message}
              {"\n\n"}
              {this.state.error?.stack}
            </pre>
          </details>
          <button
            onClick={() => location.reload()}
            className="mt-3 px-3 py-1 bg-red-600 text-white rounded"
          >
            Try Again
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}