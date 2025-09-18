import React from 'react';
import { Event, Organizer } from '../../types';
import { EditIcon } from '../icons/EditIcon';
import { TrashIcon } from '../icons/TrashIcon';

interface EventCardProps {
  event: Event;
  organizer?: Organizer;
  onEdit: (event: Event) => void;
  onDelete: (event: Event) => void;
  onViewAs: () => void;
}

export const EventCard: React.FC<EventCardProps> = ({ event, organizer, onEdit, onDelete, onViewAs }) => {
  return (
    <div className="bg-dark-card rounded-lg shadow-xl overflow-hidden border border-dark-border/50 transition-all duration-300 hover:border-dark-primary/50 hover:shadow-dark-primary/20 flex flex-col">
      <div 
        className="h-40 bg-cover bg-center cursor-pointer group relative" 
        style={{ backgroundImage: `url(${event.bannerUrl || 'https://via.placeholder.com/400x150?text=Sem+Banner'})` }}
        onClick={onViewAs}
      >
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <p className="text-white font-bold">Visualizar como Organizador</p>
          </div>
      </div>
      <div className="p-6 flex-grow flex flex-col">
        <h3 className="text-2xl font-bold text-white truncate">{event.name}</h3>
        <p className="text-sm text-gray-400 mb-4">{new Date(event.date).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}</p>
        
        {organizer && (
            <div className="mb-4 p-3 bg-dark-background rounded-lg">
                <p className="text-xs text-gray-500">Organizador</p>
                <div className="flex items-center gap-3 mt-1">
                    <img src={organizer.photoUrl || 'https://via.placeholder.com/40'} alt={organizer.name} className="h-10 w-10 rounded-full object-cover" />
                    <div>
                        <p className="font-semibold text-white truncate">{organizer.name}</p>
                        <p className="text-xs text-gray-400 truncate">{organizer.responsibleName}</p>
                    </div>
                </div>
            </div>
        )}
        
        <div className="mt-auto pt-4 border-t border-dark-border flex justify-end gap-3">
          <button
            onClick={() => onEdit(event)}
            className="p-2 text-gray-400 hover:text-white hover:bg-dark-primary/20 rounded-full transition-colors"
            aria-label={`Editar ${event.name}`}
          >
            <EditIcon className="h-5 w-5" />
          </button>
          <button
            onClick={() => onDelete(event)}
            className="p-2 text-gray-400 hover:text-white hover:bg-red-500/20 rounded-full transition-colors"
            aria-label={`Excluir ${event.name}`}
          >
            <TrashIcon className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
};