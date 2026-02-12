import React from "react";
import { AlertTriangle, RotateCcw, Dumbbell } from "lucide-react";

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
        <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6">
          <div className="w-full max-w-sm text-center space-y-5">
            {/* Branded icon */}
            <div className="w-20 h-20 mx-auto rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
              <AlertTriangle size={36} className="text-red-400" />
            </div>

            <div>
              <h1 className="text-xl font-bold text-white mb-2">
                Something Went Wrong
              </h1>
              <p className="text-sm text-slate-400 leading-relaxed">
                An unexpected error occurred. Don't worry — your workout data is safely stored.
              </p>
            </div>

            {/* Error detail (collapsible) */}
            <details className="text-left bg-slate-900 rounded-xl border border-slate-800 overflow-hidden">
              <summary className="p-3 text-xs text-slate-500 cursor-pointer hover:text-slate-400 transition-colors">
                Technical Details
              </summary>
              <pre className="p-3 text-[11px] text-red-300 whitespace-pre-wrap border-t border-slate-800 max-h-32 overflow-auto">
                {this.state.error && this.state.error.toString()}
              </pre>
            </details>

            <button
              onClick={() => window.location.reload()}
              className="inline-flex items-center gap-2 bg-neon-blue text-slate-950 px-6 py-3 rounded-xl text-sm font-bold hover:bg-neon-blue/90 active:scale-95 transition-all shadow-lg shadow-neon-blue/20"
            >
              <RotateCcw size={16} />
              Reload App
            </button>

            <p className="text-[11px] text-slate-600 flex items-center justify-center gap-1">
              <Dumbbell size={10} />
              GymTracker
            </p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
