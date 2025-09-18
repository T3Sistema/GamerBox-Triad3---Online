
import React, { useState } from 'react';
import { Company, Collaborator } from '../../types';
import { useData } from '../../context/DataContext';
import { XIcon } from '../icons/XIcon';
import { PlusIcon } from '../icons/PlusIcon';
import { EditIcon } from '../icons/EditIcon';
import { TrashIcon } from '../icons/TrashIcon';
import { CollaboratorFormModal } from './CollaboratorFormModal';

interface CollaboratorManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  company: Company | null;
}

export const CollaboratorManagementModal: React.FC<CollaboratorManagementModalProps> = ({ isOpen, onClose, company }) => {
  const { companyCollaborators, addCollaborator, updateCollaborator, deleteCollaborator } = useData();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCollaborator, setEditingCollaborator] = useState<Collaborator | null>(null);

  if (!isOpen || !company) return null;

  const collaborators = companyCollaborators(company.id);

  const handleOpenForm = (collaborator: Collaborator | null = null) => {
    setEditingCollaborator(collaborator);
    setIsFormOpen(true);
  };

  const handleSave = (collaboratorData: Omit<Collaborator, 'id' | 'companyId'>, id?: string) => {
    if (id) {
      updateCollaborator(id, collaboratorData);
    } else {
      addCollaborator(company.id, collaboratorData);
    }
    setIsFormOpen(false);
    setEditingCollaborator(null);
  };
  
  const handleDelete = (collaboratorId: string) => {
      if(window.confirm('Tem certeza que deseja excluir este colaborador?')) {
          deleteCollaborator(collaboratorId);
      }
  }

  return (
    <>
      <CollaboratorFormModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSave={handleSave}
        collaborator={editingCollaborator}
      />
      <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 animate-fadeIn p-4" onClick={onClose}>
        <div className="bg-light-card dark:bg-dark-card w-full max-w-2xl p-6 rounded-lg shadow-2xl border border-light-border dark:border-dark-border max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
          <div className="flex justify-between items-center mb-4 flex-shrink-0">
            <div>
              <h2 className="text-2xl font-bold text-light-text dark:text-dark-text">Gerenciar Colaboradores</h2>
              <p className="text-gray-500 dark:text-gray-400">Expositor: {company.name}</p>
            </div>
            <button onClick={onClose} className="p-1 rounded-full text-gray-500 dark:text-gray-400 hover:bg-light-border dark:hover:bg-dark-border"><XIcon className="h-6 w-6" /></button>
          </div>

          <div className="flex-grow overflow-y-auto pr-2 -mr-2 space-y-3">
            {collaborators.length > 0 ? (
              collaborators.map(collab => (
                <div key={collab.id} className="flex justify-between items-center p-3 bg-light-background dark:bg-dark-background rounded-md">
                  <div className="flex items-center gap-4">
                    <img src={collab.photoUrl || 'https://via.placeholder.com/40x40?text=Foto'} alt={collab.name} className="h-10 w-10 rounded-full object-cover" />
                    <div>
                        <p className="font-semibold text-light-text dark:text-dark-text">{collab.name}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            {collab.email} | <span className="font-mono bg-gray-200 dark:bg-gray-700 px-1.5 py-0.5 rounded-md text-xs">{collab.code}</span>
                        </p>
                    </div>
                  </div>
                  <div className="flex gap-2 text-gray-500 dark:text-gray-400">
                    <button onClick={() => handleOpenForm(collab)} className="p-2 hover:text-light-primary dark:hover:text-dark-primary"><EditIcon className="h-4 w-4" /></button>
                    <button onClick={() => handleDelete(collab.id)} className="p-2 hover:text-red-500"><TrashIcon className="h-4 w-4" /></button>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500">Nenhum colaborador cadastrado.</p>
              </div>
            )}
          </div>

          <div className="mt-6 pt-4 border-t border-light-border dark:border-dark-border flex justify-between items-center flex-shrink-0">
             <p className="text-sm text-gray-500">{collaborators.length} colaborador(es)</p>
             <button onClick={() => handleOpenForm()} className="btn-primary flex items-center gap-2">
                <PlusIcon className="h-5 w-5" />
                Adicionar
            </button>
          </div>
        </div>
        <style>{`
            :root {
                --color-background-light: #f9fafb; --color-border-light: #e5e7eb; --color-text-light: #111827; --color-primary-light: #3b82f6; --color-card-light: #ffffff;
                --color-background-dark: #1a202c; --color-border-dark: #4a5568; --color-text-dark: #f7fafc; --color-primary-dark: #00d1ff; --color-card-dark: #2d3748;
            }
            .input-style { display: block; width: 100%; padding: 0.75rem; background-color: var(--color-background-light); border: 1px solid var(--color-border-light); border-radius: 0.375rem; color: var(--color-text-light); }
            .dark .input-style { background-color: var(--color-background-dark); border-color: var(--color-border-dark); color: var(--color-text-dark); }
            .btn-primary { padding: 0.5rem 1.5rem; border-radius: 0.375rem; font-weight: 600; color: white; background-color: var(--color-primary-light); transition: opacity 0.2s; }
            .dark .btn-primary { background-color: var(--color-primary-dark); }
            .btn-primary:hover { opacity: 0.9; }
            .btn-secondary { padding: 0.5rem 1.5rem; border-radius: 0.375rem; font-weight: 600; color: var(--color-text-light); background-color: var(--color-card-light); border: 1px solid var(--color-border-light); transition: background-color 0.2s; }
            .dark .btn-secondary { color: var(--color-text-dark); background-color: var(--color-card-dark); border-color: var(--color-border-dark); }
            .btn-secondary:hover { background-color: var(--color-border-light); }
            .dark .btn-secondary:hover { background-color: var(--color-border-dark); }
        `}</style>
      </div>
    </>
  );
};