import React from 'react';
import { useData } from '../../context/DataContext';

export const ImpersonationBar: React.FC = () => {
  const { loggedInOrganizer, stopImpersonating, impersonatingFromAdmin } = useData();

  if (!impersonatingFromAdmin || !loggedInOrganizer) return null;

  return (
    <div className="bg-yellow-500 text-black py-2 px-4 text-center text-sm sticky top-0 z-50">
      Você está visualizando como{' '}
      <span className="font-bold">{loggedInOrganizer.name} ({loggedInOrganizer.responsibleName})</span>.
      <button 
        onClick={stopImpersonating}
        className="ml-4 font-bold underline hover:text-yellow-800"
      >
        Retornar ao Painel de Admin
      </button>
    </div>
  );
};
