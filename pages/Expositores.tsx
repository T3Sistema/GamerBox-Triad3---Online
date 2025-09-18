
import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { Company } from '../types';
import { PlusIcon } from '../components/icons/PlusIcon';
import { CompanyCard } from '../components/organizer/CompanyCard';
import { CompanyFormModal } from '../components/organizer/CompanyFormModal';
import { CollaboratorManagementModal } from '../components/organizer/CollaboratorManagementModal';

export const Expositores: React.FC = () => {
  const { eventCompanies, saveCompany, deleteCompany, companyCollaborators, selectedEvent } = useData();
  
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isCollabModalOpen, setIsCollabModalOpen] = useState(false);
  
  const [editingCompany, setEditingCompany] = useState<Company | null>(null);
  const [managingCompany, setManagingCompany] = useState<Company | null>(null);

  const handleOpenFormModal = (company: Company | null = null) => {
    setEditingCompany(company);
    setIsFormModalOpen(true);
  };

  const handleOpenCollabModal = (company: Company) => {
    setManagingCompany(company);
    setIsCollabModalOpen(true);
  };

  const handleSave = (companyData: Omit<Company, 'id' | 'eventId'>, id?: string) => {
    saveCompany(companyData, id);
    setIsFormModalOpen(false);
    setEditingCompany(null);
  };
  
  const handleDelete = (companyId: string) => {
    if (window.confirm('Tem certeza que deseja excluir este expositor e todos os seus colaboradores?')) {
        deleteCompany(companyId);
    }
  };

  if (!selectedEvent) {
    return (
      <div className="container mx-auto p-4 md:p-8 text-center">
        <p className="text-gray-500 dark:text-gray-400 mt-8 text-xl">
          Por favor, selecione um evento na tela de "Gerenciar" para ver os expositores.
        </p>
      </div>
    );
  }

  return (
    <>
      <CompanyFormModal 
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        onSave={handleSave}
        company={editingCompany}
      />
      <CollaboratorManagementModal
        isOpen={isCollabModalOpen}
        onClose={() => setIsCollabModalOpen(false)}
        company={managingCompany}
      />

      <div className="container mx-auto p-4 md:p-8">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
          <div>
            <h2 className="text-3xl font-bold text-light-text dark:text-dark-text">Expositores</h2>
            <p className="text-gray-500 dark:text-gray-400">
              Gerencie os expositores para o evento: <span className="font-semibold text-light-primary dark:text-dark-primary">{selectedEvent.name}</span>
            </p>
          </div>
          <button onClick={() => handleOpenFormModal()} className="flex items-center gap-2 px-4 py-2 bg-light-primary text-white dark:bg-dark-primary rounded-lg font-bold hover:opacity-90 transition-opacity">
            <PlusIcon className="h-5 w-5" />
            Adicionar Expositor
          </button>
        </div>

        {eventCompanies.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {eventCompanies.map(company => (
              <CompanyCard 
                key={company.id}
                company={company}
                collaboratorCount={companyCollaborators(company.id).length}
                onEdit={() => handleOpenFormModal(company)}
                onDelete={() => handleDelete(company.id)}
                onManageCollaborators={() => handleOpenCollabModal(company)}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 border-2 border-dashed border-light-border dark:border-dark-border rounded-lg">
            <h3 className="text-xl font-semibold text-gray-500">Nenhum Expositor Cadastrado</h3>
            <p className="text-gray-400 mt-2">Clique em "Adicionar Expositor" para começar.</p>
          </div>
        )}
      </div>
    </>
  );
};
