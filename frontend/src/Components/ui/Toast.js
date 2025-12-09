import React from 'react';
import { CheckCircle, AlertCircle, Info } from 'lucide-react';

const Toast = ({ message, type }) => (
  <div className={`fixed top-4 right-4 z-[9999] p-4 rounded-lg shadow-lg ${
    type === 'success' ? 'bg-green-600' : type === 'info' ? 'bg-blue-600' : 'bg-red-600'
  } text-white flex items-center gap-2 transform transition-all duration-300 ease-in-out animate-slide-in`}>
    {type === 'success' ? (
      <CheckCircle className="w-5 h-5" />
    ) : type === 'info' ? (
      <Info className="w-5 h-5" />
    ) : (
      <AlertCircle className="w-5 h-5" />
    )}
    <span className="font-medium">{message}</span>
  </div>
);

export default Toast;