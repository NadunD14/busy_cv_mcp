import React from 'react';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error('Component error:', error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="flex">
                        <div className="flex-shrink-0">
                            <span className="text-red-400">⚠️</span>
                        </div>
                        <div className="ml-3">
                            <h3 className="text-sm font-medium text-red-800">
                                Something went wrong
                            </h3>
                            <p className="text-sm text-red-700 mt-1">
                                {this.state.error?.message || 'An unexpected error occurred'}
                            </p>
                            <button
                                onClick={() => this.setState({ hasError: false, error: null })}
                                className="mt-2 text-sm bg-red-100 hover:bg-red-200 text-red-800 px-3 py-1 rounded"
                            >
                                Try again
                            </button>
                        </div>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
