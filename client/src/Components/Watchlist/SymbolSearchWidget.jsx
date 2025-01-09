import React from 'react';

function SymbolSearchWidget() {
  return (
    <div className="mt-4">
      <input
        type="text"
        placeholder="Search stocks & index"
        className="w-full p-2 bg-white border border-gray-300 rounded-2xl mt-1 md:mt-2 lg:mt-4 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      />
    </div>
  );
}

export default SymbolSearchWidget;
