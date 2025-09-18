// FIX: Provided full content for OrganizerFormModal component.

import React, { useState, useEffect, useRef } from 'react';
import { Organizer } from '../../types';
import { XIcon } from '../icons/XIcon';
import { UploadIcon } from '../icons/UploadIcon';

interface OrganizerFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (organizer: Omit<Organizer, 'id'>, id?: string) => Promise<{ success: boolean; message: string; }>;
  organizer: Organizer | null;
}

export const OrganizerFormModal: React.FC<OrganizerFormModalProps> = ({ isOpen, onClose, onSave, organizer }) => {
    const [formData, setFormData] = useState({
        name: '',
        responsibleName: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: '',
        organizerCode: '',
        photoUrl: '' as string | File,
    });
    const [photoPreview, setPhotoPreview] = useState('');
    const [error, setError] = useState<string>('');
    const photoInputRef = useRef<HTMLInputElement>(null);
    const isEditing = !!organizer;

    useEffect(() => {
        if (isOpen) {
            setError('');
            if (isEditing && organizer) {
                setFormData({
                    name: organizer.name,
                    responsibleName: organizer.responsibleName,
                    email: organizer.email,
                    phone: organizer.phone,
                    organizerCode: organizer.organizerCode,
                    photoUrl: organizer.photoUrl || '',
                    password: '',
                    confirmPassword: '',
                });
                setPhotoPreview(organizer.photoUrl || '');
            } else {
                setFormData({
                    name: '', responsibleName: '', email: '', phone: '',
                    password: '', confirmPassword: '', organizerCode: '', photoUrl: ''
                });
                setPhotoPreview('');
            }
        }
    }, [organizer, isEditing, isOpen]);

    useEffect(() => {
        // Cleanup object URL
        return () => {
            if (photoPreview && photoPreview.startsWith('blob:')) {
                URL.revokeObjectURL(photoPreview);
            }
        };
    }, [photoPreview]);
    
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setFormData(prev => ({ ...prev, photoUrl: file }));
            
            if (photoPreview && photoPreview.startsWith('blob:')) {
                URL.revokeObjectURL(photoPreview);
            }
            setPhotoPreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (formData.password !== formData.confirmPassword) {
            setError('As senhas não coincidem.');
            return;
        }
        if (!isEditing && !formData.password) {
            setError('A senha é obrigatória para novos organizadores.');
            return;
        }

        const { confirmPassword, ...organizerData } = formData;
        
        // FIX: Cast form data to 'any' to resolve type mismatches. The form data includes a 'photoUrl' that can be a File object and a 'password' field, both of which are handled by the data context's implementation but are not compatible with the strictly-typed 'onSave' prop.
        const result = await onSave(organizerData as any, organizer?.id);
        if(!result.success){
            setError(result.message);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 animate-fadeIn" onClick={onClose}>
            <div className="bg-dark-card w-full max-w-lg p-8 rounded-lg shadow-2xl border border-dark-border max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-dark-primary">{isEditing ? 'Editar Organizador' : 'Adicionar Novo Organizador'}</h2>
                    <button onClick={onClose} className="p-1 rounded-full text-gray-400 hover:bg-dark-border hover:text-white"><XIcon className="h-6 w-6" /></button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input type="text" name="name" placeholder="Nome da Empresa" value={formData.name} onChange={handleChange} required className="input-style" />
                        <input type="text" name="responsibleName" placeholder="Nome do Responsável" value={formData.responsibleName} onChange={handleChange} required className="input-style" />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input type="email" name="email" placeholder="E-mail de Login" value={formData.email} onChange={handleChange} required className="input-style" />
                        <input type="tel" name="phone" placeholder="Telefone" value={formData.phone} onChange={handleChange} required className="input-style" />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input type="password" name="password" placeholder={isEditing ? "Nova Senha (opcional)" : "Senha"} value={formData.password} onChange={handleChange} className="input-style" />
                        <input type="password" name="confirmPassword" placeholder="Confirmar Senha" value={formData.confirmPassword} onChange={handleChange} className="input-style" />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input type="text" name="organizerCode" placeholder="Código do Organizador (3 letras)" value={formData.organizerCode} onChange={handleChange} required maxLength={3} className="input-style uppercase" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-300">Foto do Responsável</label>
                        <div className="mt-1 flex items-center gap-4">
                            <img src={photoPreview || 'https://via.placeholder.com/56x56?text=Foto'} alt="Preview" className="h-14 w-14 object-cover rounded-full bg-dark-background" />
                            <input type="file" accept="image/*" onChange={handleFileChange} ref={photoInputRef} className="hidden" />
                            <button type="button" onClick={() => photoInputRef.current?.click()} className="btn-secondary flex items-center gap-2"><UploadIcon className="h-4 w-4"/>Alterar</button>
                        </div>
                    </div>

                    {error && <p className="text-sm text-red-400 text-center bg-red-900/50 p-2 rounded">{error}</p>}
                    
                    <div className="flex justify-end gap-4 pt-4">
                        <button type="button" onClick={onClose} className="btn-secondary">Cancelar</button>
                        <button type="submit" className="btn-primary">Salvar</button>
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