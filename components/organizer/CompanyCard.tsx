import React from 'react';
import { Company } from '../../types';
import { EditIcon } from '../icons/EditIcon';
import { TrashIcon } from '../icons/TrashIcon';
import { UsersIcon } from '../icons/UsersIcon';

interface CompanyCardProps {
  company: Company;
  collaboratorCount: number;
  onEdit: () => void;
  onDelete: () => void;
  onManageCollaborators: () => void;
}

const SystemBadge: React.FC<{ name: string; active: boolean }> = ({ name, active }) => (
    <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${ active ? 'bg-green-200 text-green-800 dark:bg-green-700 dark:text-green-100' : 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300'}`}>
        {name}
    </span>
);

export const CompanyCard: React.FC<CompanyCardProps> = ({ company, collaboratorCount, onEdit, onDelete, onManageCollaborators }) => {
  return (
    <div className="bg-light-card dark:bg-dark-card rounded-lg shadow-lg overflow-hidden border border-light-border dark:border-dark-border/50 transition-all duration-300 hover:shadow-xl hover:border-light-primary/50 dark:hover:border-dark-primary/50 flex flex-col">
      <div className="p-5 flex-grow flex flex-col">
        <div className="flex items-start gap-4">
          <img src={company.logoUrl || 'https://via.placeholder.com/64?text=Logo'} alt={company.name} className="h-16 w-16 rounded-md object-cover border-2 border-light-border dark:border-dark-border" />
          <div className="flex-1 min-w-0">
            <h3 className="text-xl font-bold text-light-text dark:text-dark-text truncate">{company.name}</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{company.responsibleName}</p>
            <span className="mt-1 inline-block font-mono text-xs bg-light-border dark:bg-dark-border/50 px-2 py-1 rounded-full">{company.code}</span>
          </div>
        </div>
        
        <div className="mt-4 pt-4 border-t border-light-border dark:border-dark-border/50 space-y-2 text-sm">
          <p className="text-gray-600 dark:text-gray-400 truncate"><span className="font-semibold text-light-text dark:text-gray-300">Email:</span> {company.email}</p>
          <p className="text-gray-600 dark:text-gray-400 truncate"><span className="font-semibold text-light-text dark:text-gray-300">Tel:</span> {company.phone}</p>
        </div>

        <div className="mt-4 pt-4 border-t border-light-border dark:border-dark-border/50">
            <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-2">Sistemas Ativos</h4>
            <div className="flex items-center gap-2">
                <SystemBadge name="GamerBox Triad3" active={company.hasSorteio} />
                <SystemBadge name="Roleta" active={company.hasRoleta} />
            </div>
        </div>

        <div className="mt-auto pt-4 flex justify-between items-center">
          <button
            onClick={onManageCollaborators}
            className="flex items-center gap-2 text-sm font-semibold text-light-primary dark:text-dark-primary hover:underline"
          >
            <UsersIcon className="h-5 w-5" />
            <span>{collaboratorCount} Colaborador(es)</span>
          </button>
          <div className="flex gap-2">
            <button
              onClick={onEdit}
              className="p-2 text-gray-500 dark:text-gray-400 hover:text-light-primary dark:hover:text-dark-primary hover:bg-light-border dark:hover:bg-dark-border/50 rounded-full transition-colors"
              aria-label={`Editar ${company.name}`}
            >
              <EditIcon className="h-5 w-5" />
            </button>
            <button
              onClick={onDelete}
              className="p-2 text-gray-500 dark:text-gray-400 hover:text-red-500 hover:bg-red-500/10 rounded-full transition-colors"
              aria-label={`Excluir ${company.name}`}
            >
              <TrashIcon className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};