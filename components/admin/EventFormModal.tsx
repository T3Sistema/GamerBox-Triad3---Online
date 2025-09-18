import React, { useState, useEffect, useRef } from 'react';
import { Event, Organizer } from '../../types';
import { XIcon } from '../icons/XIcon';
import { UploadIcon } from '../icons/UploadIcon';

type FormData = {
    eventName: string;
    eventDate: string;
    eventDetails: string;
    eventBannerUrl: string | File;
    organizerType: 'existing' | 'new';
    existingOrganizerId: string;
    newOrganizerName: string;
    newOrganizerResponsible: string;
    newOrganizerEmail: string;
    newOrganizerPhone: string;
    newOrganizerPassword: '';
    newOrganizerConfirmPassword: '';
    newOrganizerPhotoUrl: string | File;
};

interface EventFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (formData: any, eventId?: string) => Promise<{ success: boolean; message: string; }>; // Adjusted for async feedback
  event: Event | null;
  organizers: Organizer[];
}

export const EventFormModal: React.FC<EventFormModalProps> = ({ isOpen, onClose, onSave, event, organizers }) => {
    const [formData, setFormData] = useState<FormData>({
        eventName: '', eventDate: '', eventDetails: '', eventBannerUrl: '',
        organizerType: 'existing', existingOrganizerId: '',
        newOrganizerName: '', newOrganizerResponsible: '', newOrganizerEmail: '', newOrganizerPhone: '',
        newOrganizerPassword: '', newOrganizerConfirmPassword: '', newOrganizerPhotoUrl: '',
    });
    const [bannerPreview, setBannerPreview] = useState('');
    const [photoPreview, setPhotoPreview] = useState('');
    const [error, setError] = useState<string>('');
    const bannerInputRef = useRef<HTMLInputElement>(null);
    const photoInputRef = useRef<HTMLInputElement>(null);

    const isEditing = !!event;

    useEffect(() => {
        if (isOpen) {
            setError('');
            if (isEditing && event) {
                setFormData({
                    eventName: event.name,
                    eventDate: event.date,
                    eventDetails: event.details,
                    eventBannerUrl: event.bannerUrl || '',
                    organizerType: 'existing',
                    existingOrganizerId: event.organizerId,
                    newOrganizerName: '', newOrganizerResponsible: '', newOrganizerEmail: '', newOrganizerPhone: '',
                    newOrganizerPassword: '', newOrganizerConfirmPassword: '', newOrganizerPhotoUrl: '',
                });
                setBannerPreview(event.bannerUrl || '');
                setPhotoPreview('');
            } else {
                setFormData({
                    eventName: '', eventDate: '', eventDetails: '', eventBannerUrl: '',
                    organizerType: organizers.length > 0 ? 'existing' : 'new', 
                    existingOrganizerId: organizers.length > 0 ? organizers[0].id : '',
                    newOrganizerName: '', newOrganizerResponsible: '', newOrganizerEmail: '', newOrganizerPhone: '',
                    newOrganizerPassword: '', newOrganizerConfirmPassword: '', newOrganizerPhotoUrl: '',
                });
                setBannerPreview('');
                setPhotoPreview('');
            }
        }
    }, [event, isEditing, isOpen, organizers]);

    useEffect(() => {
        // Cleanup object URLs
        return () => {
            if (bannerPreview && bannerPreview.startsWith('blob:')) URL.revokeObjectURL(bannerPreview);
            if (photoPreview && photoPreview.startsWith('blob:')) URL.revokeObjectURL(photoPreview);
        };
    }, [bannerPreview, photoPreview]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, field: 'eventBannerUrl' | 'newOrganizerPhotoUrl') => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setFormData(prev => ({ ...prev, [field]: file }));

            const objectUrl = URL.createObjectURL(file);
            if (field === 'eventBannerUrl') {
                if (bannerPreview && bannerPreview.startsWith('blob:')) URL.revokeObjectURL(bannerPreview);
                setBannerPreview(objectUrl);
            } else {
                if (photoPreview && photoPreview.startsWith('blob:')) URL.revokeObjectURL(photoPreview);
                setPhotoPreview(objectUrl);
            }
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        
        if (formData.organizerType === 'new') {
            if (formData.newOrganizerPassword !== formData.newOrganizerConfirmPassword) {
                setError('As senhas não coincidem.');
                return;
            }
            if (!formData.newOrganizerPassword) {
                setError('A senha é obrigatória para novos organizadores.');
                return;
            }
        }
        
        const result = await onSave(formData, event?.id);
        if (!result.success) {
            setError(result.message);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 animate-fadeIn" onClick={onClose}>
            <div className="bg-dark-card w-full max-w-2xl p-8 rounded-lg shadow-2xl border border-dark-border max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-dark-primary">{isEditing ? 'Editar Evento' : 'Adicionar Novo Evento'}</h2>
                    <button onClick={onClose} className="p-1 rounded-full text-gray-400 hover:bg-dark-border hover:text-white"><XIcon className="h-6 w-6" /></button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <section className="space-y-4 p-4 border border-dark-border/50 rounded-lg">
                        <h3 className="font-semibold text-lg text-dark-primary">Detalhes do Evento</h3>
                        <div>
                            <label htmlFor="eventName" className="block text-sm font-medium text-gray-300">Nome do Evento</label>
                            <input type="text" name="eventName" id="eventName" value={formData.eventName} onChange={handleChange} required className="w-full input-style mt-1" />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                             <div>
                                <label htmlFor="eventDate" className="block text-sm font-medium text-gray-300">Data do Evento</label>
                                <input type="date" name="eventDate" id="eventDate" value={formData.eventDate} onChange={handleChange} required className="w-full input-style mt-1" />
                            </div>
                             <div>
                                <label className="block text-sm font-medium text-gray-300">Banner do Evento</label>
                                <div className="mt-1 flex items-center gap-4">
                                    <img src={bannerPreview || 'https://via.placeholder.com/100x56?text=Banner'} alt="Preview do banner" className="h-14 w-24 object-cover rounded bg-dark-background" />
                                    <input type="file" accept="image/*" onChange={e => handleFileChange(e, 'eventBannerUrl')} ref={bannerInputRef} className="hidden" />
                                    <button type="button" onClick={() => bannerInputRef.current?.click()} className="btn-secondary flex items-center gap-2"><UploadIcon className="h-4 w-4"/>Alterar</button>
                                </div>
                            </div>
                        </div>
                        <div>
                            <label htmlFor="eventDetails" className="block text-sm font-medium text-gray-300">Detalhes</label>
                            <textarea name="eventDetails" id="eventDetails" value={formData.eventDetails} onChange={handleChange} rows={3} className="w-full input-style mt-1" />
                        </div>
                    </section>
                    
                    <section className="space-y-4 p-4 border border-dark-border/50 rounded-lg">
                         <h3 className="font-semibold text-lg text-dark-primary">Organizador do Evento</h3>
                        {!isEditing && (
                            <div className="flex gap-4">
                                <label className="flex items-center gap-2">
                                    <input type="radio" name="organizerType" value="existing" checked={formData.organizerType === 'existing'} onChange={handleChange} disabled={organizers.length === 0} /> Existente
                                </label>
                                <label className="flex items-center gap-2">
                                    <input type="radio" name="organizerType" value="new" checked={formData.organizerType === 'new'} onChange={handleChange} /> Novo
                                </label>
                            </div>
                        )}
                        {formData.organizerType === 'existing' ? (
                            <div>
                                <label htmlFor="existingOrganizerId" className="block text-sm font-medium text-gray-300">Selecione o Organizador</label>
                                <select name="existingOrganizerId" id="existingOrganizerId" value={formData.existingOrganizerId} onChange={handleChange} required className="w-full input-style mt-1" disabled={isEditing}>
                                    {organizers.map(org => <option key={org.id} value={org.id}>{org.name} - {org.responsibleName}</option>)}
                                </select>
                            </div>
                        ) : (
                            <div className="space-y-4 animate-fadeIn">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <input type="text" name="newOrganizerName" placeholder="Nome da Empresa" value={formData.newOrganizerName} onChange={handleChange} required className="input-style" />
                                    <input type="text" name="newOrganizerResponsible" placeholder="Nome do Responsável" value={formData.newOrganizerResponsible} onChange={handleChange} required className="input-style" />
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <input type="email" name="newOrganizerEmail" placeholder="E-mail de Login" value={formData.newOrganizerEmail} onChange={handleChange} required className="input-style" />
                                    <input type="tel" name="newOrganizerPhone" placeholder="Telefone" value={formData.newOrganizerPhone} onChange={handleChange} required className="input-style" />
                                </div>
                                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <input type="password" name="newOrganizerPassword" placeholder="Senha" value={formData.newOrganizerPassword} onChange={handleChange} required className="input-style" />
                                    <input type="password" name="newOrganizerConfirmPassword" placeholder="Confirmar Senha" value={formData.newOrganizerConfirmPassword} onChange={handleChange} required className="input-style" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-300">Foto do Responsável</label>
                                    <div className="mt-1 flex items-center gap-4">
                                        <img src={photoPreview || 'https://via.placeholder.com/56x56?text=Foto'} alt="Preview da foto" className="h-14 w-14 object-cover rounded-full bg-dark-background" />
                                        <input type="file" accept="image/*" onChange={e => handleFileChange(e, 'newOrganizerPhotoUrl')} ref={photoInputRef} className="hidden" />
                                        <button type="button" onClick={() => photoInputRef.current?.click()} className="btn-secondary flex items-center gap-2"><UploadIcon className="h-4 w-4"/>Alterar</button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </section>

                    {error && <p className="text-sm text-red-400 text-center bg-red-900/50 p-2 rounded">{error}</p>}
                    
                    <div className="flex justify-end gap-4 pt-4">
                        <button type="button" onClick={onClose} className="btn-secondary">Cancelar</button>
                        <button type="submit" className="btn-primary">Salvar Evento</button>
                    </div>
                </form>
                 <style>{`
                    .input-style { display: block; width: 100%; padding: 0.75rem; background-color: #05080F; border: 1px solid #1A202C; border-radius: 0.375rem; color: #E0E0E0; }
                    .input-style:focus { outline: none; border-color: #00D1FF; }
                    .btn-primary { padding: 0.5rem 1.5rem; border-radius: 0.375rem; font-weight: 600; color: white; background-color: #00D1FF; transition: opacity 0.2s; }
                    .btn-primary:hover { opacity: 0.9; }
                    .btn-secondary { padding: 0.5rem 1.5rem; border-radius: 0.375rem; font-weight: 600; color: #E0E0E0; background-color: #1A202C; transition: background-color 0.2s; }
                    .btn-secondary:hover { background-color: #2D3748; }
                `}</style>
            </div>
        </div>
    );
};
