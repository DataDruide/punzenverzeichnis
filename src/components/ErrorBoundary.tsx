import React, { Component, ReactNode } from "react";
import { AlertCircle, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: {
    componentStack: string;
  } | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Error caught by boundary:", error, errorInfo);
    
    this.setState({
      error,
      errorInfo: {
        componentStack: errorInfo.componentStack,
      },
    });

    // Optional: Send to error tracking service (Sentry, etc.)
    if (process.env.NODE_ENV === "production") {
      // Send error to monitoring service
      // logErrorToService(error, errorInfo);
    }
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-red-50 to-red-100">
          <div className="max-w-md w-full mx-4 bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 rounded-full mb-4">
              <AlertCircle className="w-6 h-6 text-red-600" />
            </div>
            
            <h1 className="text-2xl font-bold text-center text-gray-900 mb-2">
              Etwas ist schief gelaufen
            </h1>
            
            <p className="text-center text-gray-600 mb-4">
              Die Anwendung hat einen unerwarteten Fehler verursacht.
            </p>

            {process.env.NODE_ENV === "development" && this.state.error && (
              <div className="mb-6 p-4 bg-gray-100 rounded text-sm overflow-auto">
                <p className="font-mono text-red-700 whitespace-pre-wrap break-words">
                  {this.state.error.toString()}
                </p>
                {this.state.errorInfo && (
                  <p className="font-mono text-gray-700 text-xs mt-2 whitespace-pre-wrap break-words">
                    {this.state.errorInfo.componentStack}
                  </p>
                )}
              </div>
            )}

            <div className="flex gap-3">
              <Button
                onClick={this.handleReset}
                className="flex-1 flex items-center justify-center gap-2"
                variant="default"
              >
                <RotateCcw className="w-4 h-4" />
                Erneut versuchen
              </Button>
              
              <Button
                onClick={() => (window.location.href = "/")}
                variant="outline"
                className="flex-1"
              >
                Zur Startseite
              </Button>
            </div>

            {process.env.NODE_ENV === "production" && (
              <p className="text-xs text-gray-500 text-center mt-4">
                Error ID: {Date.now()}
              </p>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
