import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error", error, errorInfo);
    this.setState({ errorInfo });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-4 bg-slate-900 text-white min-h-screen font-mono text-sm overflow-auto">
          <h1 className="text-xl text-red-500 font-bold mb-4">Something went wrong.</h1>
          <div className="mb-4">
            <h2 className="text-lg font-semibold">Error:</h2>
            <pre className="text-red-300 whitespace-pre-wrap">{this.state.error && this.state.error.toString()}</pre>
          </div>
          <div>
            <h2 className="text-lg font-semibold">Component Stack:</h2>
            <pre className="text-slate-400 whitespace-pre-wrap">{this.state.errorInfo && this.state.errorInfo.componentStack}</pre>
          </div>
          <button 
            onClick={() => window.location.reload()}
            className="mt-6 px-4 py-2 bg-blue-600 rounded hover:bg-blue-500"
          >
            Refresh Page
          </button>
        </div>
      );
    }

    return this.props.children; 
  }
}

export default ErrorBoundary;
