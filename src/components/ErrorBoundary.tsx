import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.setState({
      error,
      errorInfo,
    });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
          <div className="max-w-2xl w-full bg-white rounded-lg shadow-lg p-8">
            <h1 className="text-2xl font-bold text-red-600 mb-4">
              Упс! Что-то пошло не так
            </h1>
            <p className="text-slate-700 mb-4">
              Произошла ошибка при загрузке приложения. Попробуйте обновить страницу.
            </p>
            
            <details className="mb-4">
              <summary className="cursor-pointer text-sm font-medium text-slate-600 mb-2">
                Подробности ошибки
              </summary>
              <div className="bg-slate-100 p-4 rounded text-xs font-mono overflow-auto">
                <p className="text-red-600 font-bold mb-2">{this.state.error?.toString()}</p>
                <pre className="whitespace-pre-wrap text-slate-700">
                  {this.state.errorInfo?.componentStack}
                </pre>
              </div>
            </details>

            <button
              onClick={() => window.location.reload()}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Обновить страницу
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
