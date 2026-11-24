import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error caught by ErrorBoundary:', error, errorInfo);
  }

  public handleReload = () => {
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#f4f6fa] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl p-6 sm:p-8 max-w-md w-full text-center">
            <div className="w-14 h-14 rounded-2xl bg-amber-50 border border-amber-200 text-[#dfaf27] flex items-center justify-center mx-auto mb-4 font-bold text-2xl">
              ⚠️
            </div>
            <h2 className="text-lg font-black text-slate-900 mb-2">
              Something went wrong / काहीतरी त्रुटी आली
            </h2>
            <p className="text-xs text-slate-600 mb-6 leading-relaxed">
              {this.state.error?.message || 'An unexpected error occurred. Please reload the page.'}
            </p>
            <button
              onClick={this.handleReload}
              className="w-full bg-[#233d76] hover:bg-[#1b2f5c] text-white font-bold py-2.5 px-4 rounded-xl text-xs transition-colors cursor-pointer shadow-xs"
            >
              Reload App / रीलोड करा
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
