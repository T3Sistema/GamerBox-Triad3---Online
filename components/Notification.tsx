import React, { useEffect } from 'react';
import { XIcon } from './icons/XIcon';

interface NotificationProps {
  message: string;
  type: 'success' | 'error';
  onClose: () => void;
}

export const Notification: React.FC<NotificationProps> = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 5000);

    return () => {
      clearTimeout(timer);
    };
  }, [onClose]);

  const baseClasses = 'fixed top-5 right-5 z-50 p-4 rounded-lg shadow-lg flex items-center gap-4 animate-fadeIn';
  const typeClasses = {
    success: 'bg-green-600 text-white',
    error: 'bg-red-600 text-white',
  };

  return (
    <div className={`${baseClasses} ${typeClasses[type]}`}>
      <span>{message}</span>
      <button onClick={onClose} className="p-1 rounded-full hover:bg-white/20">
        <XIcon className="h-4 w-4" />
      </button>
    </div>
  );
};
