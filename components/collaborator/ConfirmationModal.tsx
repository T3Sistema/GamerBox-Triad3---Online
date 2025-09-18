import React from 'react';
import { XIcon } from '../icons/XIcon';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({ isOpen, onClose, onConfirm, title, message }) => {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 animate-fadeIn"
      onClick={onClose}
    >
      <div 
        className="bg-light-card dark:bg-dark-card w-full max-w-md p-8 rounded-lg shadow-2xl border border-light-border dark:border-dark-border"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-red-500">{title}</h2>
          <button onClick={onClose} className="p-1 rounded-full text-gray-400 hover:bg-light-border dark:hover:bg-dark-border hover:text-white">
            <XIcon className="h-6 w-6" />
          </button>
        </div>
        <p className="text-gray-600 dark:text-gray-300 mb-8">{message}</p>
        <div className="flex justify-end gap-4">
          <button
            onClick={onClose}
            className="py-2 px-6 bg-gray-200 dark:bg-dark-border text-light-text dark:text-dark-text font-semibold rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            className="py-2 px-6 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-colors"
          >
            Confirmar Exclusão
          </button>
        </div>
      </div>
    </div>
  );
};
