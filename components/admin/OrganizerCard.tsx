// FIX: Provided full content for OrganizerCard component.

import React from 'react';
import { Organizer } from '../../types';
import { EditIcon } from '../icons/EditIcon';
import { TrashIcon } from '../icons/TrashIcon';

interface OrganizerCardProps {
  organizer: Organizer;
  onEdit: (organizer: Organizer) => void;
  onDelete: (organizer: Organizer) => void;
}

export const OrganizerCard: React.FC<OrganizerCardProps> = ({ organizer, onEdit, onDelete }) => {
  return (
    <div className="bg-dark-card rounded-lg shadow-xl overflow-hidden border border-dark-border/50 transition-all duration-300 hover:border-dark-primary/50 hover:shadow-dark-primary/20 flex flex-col">
      <div className="p-6 flex-grow flex flex-col">
        <div className="flex items-start gap-4">
            <img src={organizer.photoUrl || 'https://via.placeholder.com/64'} alt={organizer.responsibleName} className="h-16 w-16 rounded-full object-cover border-2 border-dark-border" />
            <div className="flex-1">
                <h3 className="text-xl font-bold text-white truncate">{organizer.name}</h3>
                <p className="text-sm text-gray-400">{organizer.responsibleName}</p>
                <p className="text-xs text-gray-500 mt-1 font-mono">{organizer.organizerCode}</p>
            </div>
        </div>
        
        <div className="mt-4 pt-4 border-t border-dark-border/50 space-y-2 text-sm">
            <p className="text-gray-400 truncate"><span className="font-semibold text-gray-300">Email:</span> {organizer.email}</p>
            <p className="text-gray-400 truncate"><span className="font-semibold text-gray-300">Tel:</span> {organizer.phone}</p>
        </div>

        <div className="mt-auto pt-4 flex justify-end gap-3">
          <button
            onClick={() => onEdit(organizer)}
            className="p-2 text-gray-400 hover:text-white hover:bg-dark-primary/20 rounded-full transition-colors"
            aria-label={`Editar ${organizer.name}`}
          >
            <EditIcon className="h-5 w-5" />
          </button>
          <button
            onClick={() => onDelete(organizer)}
            className="p-2 text-gray-400 hover:text-white hover:bg-red-500/20 rounded-full transition-colors"
            aria-label={`Excluir ${organizer.name}`}
          >
            <TrashIcon className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
};
