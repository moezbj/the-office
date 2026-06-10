import React, { Component, ErrorInfo, ReactNode } from 'react';
import toast from 'react-hot-toast';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log the error to console (in production, send this to Sentry/LogRocket)
    console.error('Uncaught error caught by ErrorBoundary:', error, errorInfo);
    
    // Notify the user gracefully
    toast.error('An unexpected error occurred. Please try refreshing.');
  }

  handleReset = () => {
    // Reset the error state and redirect to home or reload
    this.setState({ hasError: false, error: null });
    window.location.href = '/'; 
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center h-full min-h-[400px] p-8 text-center bg-gray-50 rounded-lg border border-red-200 shadow-sm">
          <div className="text-red-500 mb-4">
            <svg 
              className="w-16 h-16 mx-auto" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24" 
              xmlns="http://www.w3.org/2000/svg"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" 
              />
            </svg>
          </div>
          
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Something went wrong</h2>
          
          <p className="text-gray-600 mb-6 max-w-md text-sm">
            {this.state.error?.message || 'An unexpected error occurred while rendering this part of the application.'}
          </p>
          
          <button 
            onClick={this.handleReset} 
            className="px-6 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Return to Dashboard
          </button>
        </div>
      );
    }

    // If there's no error, render the children normally
    return this.props.children;
  }
}