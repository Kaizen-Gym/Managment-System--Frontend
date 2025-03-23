import { Component } from 'react';
import PropTypes from 'prop-types';
import { resetCsrfToken } from '../utils/csrf';

class CsrfErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: error.response?.status === 403 };
  }

  componentDidCatch(error, errorInfo) {
    if (error.response?.status === 403) {
      // Reset CSRF token
      resetCsrfToken();
      // Call the error handler provided through props
      this.props.onCsrfError?.();
    }
    console.error('CSRF Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      return <div>Something went wrong. Please refresh the page.</div>;
    }

    return this.props.children;
  }
}

CsrfErrorBoundary.propTypes = {
  children: PropTypes.node.isRequired,
  onCsrfError: PropTypes.func,
};

export default CsrfErrorBoundary;