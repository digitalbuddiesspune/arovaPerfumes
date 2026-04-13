import React from 'react';

const AdminTable = ({ children, className = '' }) => {
  return (
    <div className={`overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm ${className}`}>
      <table className="min-w-full text-sm">{children}</table>
    </div>
  );
};

export default AdminTable;
