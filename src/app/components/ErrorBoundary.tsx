import { Component, type ErrorInfo, type ReactNode } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("Nalar Labs site crashed:", error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-[#fafaf8] px-6 text-center">
          <div>
            <h1 className="font-['Instrument_Serif',serif] text-3xl mb-3 text-foreground">
              Something went wrong
            </h1>
            <p className="text-muted-foreground text-sm mb-6">
              Please refresh the page. If the problem continues, email{" "}
              <a href="mailto:hello@nalarlabs.com" className="underline">
                hello@nalarlabs.com
              </a>
              .
            </p>
            <button
              onClick={() => window.location.reload()}
              className="bg-foreground text-background px-6 py-3 text-sm font-semibold uppercase tracking-widest"
            >
              Reload
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
