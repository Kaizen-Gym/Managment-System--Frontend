import propTypes from 'prop-types';

export const Button = ({ variant = 'primary', children, ...props }) => {
  const styles = {
    primary: 'bg-blue-600 hover:bg-blue-700 text-white',
    secondary: 'bg-gray-200 hover:bg-gray-300 text-gray-700',
    danger: 'bg-red-600 hover:bg-red-700 text-white'
  };

  return (
    <button
      className={`px-4 py-2 rounded-lg font-medium transition-colors duration-200 ${styles[variant]}`}
      {...props}
    >
      {children}
    </button>
  );
  
  propTypes: {
    variant: propTypes.oneOf(['primary', 'secondary', 'danger']),
    children: propTypes.node.isRequired,
  };
};

export const Card = ({ children, className = '', ...props }) => (
  <div
    className={`bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 ${className}`}
    {...props}
  >
    {children}
  </div>
  
  propTypes: {
    children: propTypes.node.isRequired,
  };
);

export const Input = ({ ...props }) => (
  <input
    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
    {...props}
  />
  
  propTypes: {
    children: propTypes.node.isRequired,
  };
);

export const Select = ({ options, ...props }) => (
  <select
    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
    {...props}
  >
    {options.map((option) => (
      <option key={option.value} value={option.value}>
        {option.label}
      </option>
    ))}
  </select>
  
  propTypes: {}
);
