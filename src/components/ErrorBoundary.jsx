import { Component } from 'react';

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Erreur critique interceptée :", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-8 text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-2">Oups ! Une erreur est survenue.</h2>
          <p className="text-gray-600">Veuillez rafraîchir la page.</p>
        </div>
      );
    }
    return this.props.children;
  }
}