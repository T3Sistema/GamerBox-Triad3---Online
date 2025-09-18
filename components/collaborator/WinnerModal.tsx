import React from 'react';
import { Prize } from '../../types';
import { TrophyIcon } from '../icons/TrophyIcon';

interface WinnerModalProps {
  isOpen: boolean;
  onClose: () => void;
  winner: Prize | null;
}

export const WinnerModal: React.FC<WinnerModalProps> = ({ isOpen, onClose, winner }) => {
  if (!isOpen || !winner) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 animate-fadeIn"
      onClick={onClose}
    >
      <div 
        className="bg-light-card dark:bg-dark-card w-full max-w-lg p-8 rounded-lg shadow-2xl border border-light-primary dark:border-dark-primary text-center relative"
        onClick={e => e.stopPropagation()}
      >
        <TrophyIcon className="w-24 h-24 mx-auto text-yellow-400 mb-4 animate-pop" />
        <h2 className="text-2xl font-semibold text-gray-500 dark:text-gray-400">Parabéns! O prêmio é:</h2>
        <p className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-light-primary to-light-secondary dark:from-dark-primary dark:to-dark-secondary my-4">
          {winner.name}
        </p>
        <button
            onClick={onClose}
            className="mt-6 py-2 px-8 bg-light-primary dark:bg-dark-primary text-white font-semibold rounded-lg hover:opacity-80 transition-opacity"
          >
            Fechar
        </button>
      </div>
    </div>
  );
};