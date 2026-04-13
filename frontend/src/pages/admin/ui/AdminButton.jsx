import React from 'react';

const AdminButton = ({ children, variant = 'primary', className = '', ...props }) => {
  const base = 'rounded-lg px-4 py-2 text-sm font-medium transition';
  const byVariant =
    variant === 'secondary'
      ? 'admin-secondary-btn hover:bg-gray-50'
      : 'admin-primary-btn';
  return (
    <button className={`${base} ${byVariant} ${className}`} {...props}>
      {children}
    </button>
  );
};

export default AdminButton;
