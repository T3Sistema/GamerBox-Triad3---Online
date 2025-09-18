// FIX: Provided full content for the AdminDashboard component.

import React, { useState, useMemo } from 'react';
import { useData } from '../context/DataContext';
import { Event, Organizer } from '../types';
import { PlusIcon } from '../components/icons/PlusIcon';
import { EventCard } from '../components/admin/EventCard';
import { OrganizerCard } from '../components/admin/OrganizerCard';
import { EventFormModal } from '../components/admin/EventFormModal';
import { OrganizerFormModal } from '../components/admin/OrganizerFormModal';
import { ConfirmationModal } from '../components/admin/ConfirmationModal';
import { Notification } from '../components/Notification';
import { useNavigate } from 'react-router-dom';


export const AdminDashboard: React.FC = () => {
    const { organizers, events, viewAsOrganizer, saveOrganizer, deleteOrganizer, saveEvent, deleteEvent } = useData();
    const navigate = useNavigate();

    const [activeTab, setActiveTab] = useState<'events' | 'organizers'>('events');
    const [searchTerm, setSearchTerm] = useState('');

    // Modal States
    const [isEventModalOpen, setIsEventModalOpen] = useState(false);
    const [isOrganizerModalOpen, setIsOrganizerModalOpen] = useState(false);
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);

    // Data for Modals
    const [editingEvent, setEditingEvent] = useState<Event | null>(null);
    const [editingOrganizer, setEditingOrganizer] = useState<Organizer | null>(null);
    const [itemToDelete, setItemToDelete] = useState<{ type: 'event' | 'organizer', item: Event | Organizer } | null>(null);
    
    const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

    const handleOpenEventModal = (event: Event | null = null) => {
        setEditingEvent(event);
        setIsEventModalOpen(true);
    };

    const handleOpenOrganizerModal = (organizer: Organizer | null = null) => {
        setEditingOrganizer(organizer);
        setIsOrganizerModalOpen(true);
    };

    const handleDeleteClick = (type: 'event' | 'organizer', item: Event | Organizer) => {
        setItemToDelete({ type, item });
        setIsConfirmModalOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (!itemToDelete) return;
        const result = itemToDelete.type === 'event' 
            ? await deleteEvent(itemToDelete.item.id)
            : await deleteOrganizer(itemToDelete.item.id);

        // FIX: The result from the data context has a different shape than the notification state. This converts the result to the correct format { message: string, type: 'success' | 'error' }.
        setNotification({ message: result.message, type: result.success ? 'success' : 'error' });
        setIsConfirmModalOpen(false);
        setItemToDelete(null);
    };

    const handleSaveEvent = async (formData: any, eventId?: string) => {
        const result = await saveEvent(formData, eventId);
        // FIX: The result from the data context has a different shape than the notification state. This converts the result to the correct format { message: string, type: 'success' | 'error' }.
        setNotification({ message: result.message, type: result.success ? 'success' : 'error' });
        if (result.success) setIsEventModalOpen(false);
        return result;
    };

    const handleSaveOrganizer = async (organizer: Omit<Organizer, 'id'>, organizerId?: string) => {
        const result = await saveOrganizer(organizer, organizerId);
        // FIX: The result from the data context has a different shape than the notification state. This converts the result to the correct format { message: string, type: 'success' | 'error' }.
        setNotification({ message: result.message, type: result.success ? 'success' : 'error' });
        if (result.success) setIsOrganizerModalOpen(false);
        return result;
    };
    
    const handleViewAs = (organizerId: string, eventId: string) => {
        viewAsOrganizer(organizerId, eventId);
        navigate('/dashboard');
    };

    const filteredEvents = useMemo(() =>
        events.filter(event =>
            event.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            organizers.find(o => o.id === event.organizerId)?.name.toLowerCase().includes(searchTerm.toLowerCase())
        ).sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
        [events, organizers, searchTerm]
    );

    const filteredOrganizers = useMemo(() =>
        organizers.filter(organizer =>
            organizer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            organizer.responsibleName.toLowerCase().includes(searchTerm.toLowerCase())
        ),
        [organizers, searchTerm]
    );
    
    const renderContent = () => {
        if (activeTab === 'events') {
            return (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredEvents.map(event => (
                        <EventCard 
                            key={event.id}
                            event={event}
                            organizer={organizers.find(o => o.id === event.organizerId)}
                            onEdit={() => handleOpenEventModal(event)}
                            onDelete={() => handleDeleteClick('event', event)}
                            onViewAs={() => handleViewAs(event.organizerId, event.id)}
                        />
                    ))}
                </div>
            );
        }
        if (activeTab === 'organizers') {
            return (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredOrganizers.map(organizer => (
                        <OrganizerCard 
                            key={organizer.id}
                            organizer={organizer}
                            onEdit={() => handleOpenOrganizerModal(organizer)}
                            onDelete={() => handleDeleteClick('organizer', organizer)}
                        />
                    ))}
                </div>
            );
        }
        return null;
    };

    return (
        <div className="p-4 md:p-8">
            {notification && <Notification {...notification} onClose={() => setNotification(null)} />}
            
            <EventFormModal 
                isOpen={isEventModalOpen}
                onClose={() => setIsEventModalOpen(false)}
                onSave={handleSaveEvent}
                event={editingEvent}
                organizers={organizers}
            />
            
            <OrganizerFormModal 
                 isOpen={isOrganizerModalOpen}
                 onClose={() => setIsOrganizerModalOpen(false)}
                 onSave={handleSaveOrganizer}
                 organizer={editingOrganizer}
            />

            <ConfirmationModal
                isOpen={isConfirmModalOpen}
                onClose={() => setIsConfirmModalOpen(false)}
                onConfirm={handleConfirmDelete}
                title={`Excluir ${itemToDelete?.type === 'event' ? 'Evento' : 'Organizador'}`}
                message={`Você tem certeza que deseja excluir "${itemToDelete?.item.name}"? Esta ação não pode ser desfeita e excluirá todos os dados associados.`}
            />
            
            <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                <div>
                    <div className="flex border-b border-dark-border">
                        <button onClick={() => setActiveTab('events')} className={`px-6 py-2 font-semibold ${activeTab === 'events' ? 'text-dark-primary border-b-2 border-dark-primary' : 'text-gray-400'}`}>Eventos ({events.length})</button>
                        <button onClick={() => setActiveTab('organizers')} className={`px-6 py-2 font-semibold ${activeTab === 'organizers' ? 'text-dark-primary border-b-2 border-dark-primary' : 'text-gray-400'}`}>Organizadores ({organizers.length})</button>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <input 
                        type="text"
                        placeholder="Buscar..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="px-4 py-2 bg-dark-card border border-dark-border rounded-lg focus:outline-none focus:ring-2 focus:ring-dark-primary"
                    />
                    <button onClick={() => activeTab === 'events' ? handleOpenEventModal() : handleOpenOrganizerModal()} className="flex items-center gap-2 px-4 py-2 bg-dark-primary text-white font-bold rounded-lg hover:opacity-90 transition-opacity">
                        <PlusIcon className="h-5 w-5" />
                        Adicionar Novo
                    </button>
                </div>
            </div>

            {renderContent()}
        </div>
    );
};