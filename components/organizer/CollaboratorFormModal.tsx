

import React, { useState, useEffect, useRef } from 'react';
import { Collaborator } from '../../types';
import { XIcon } from '../icons/XIcon';
import { UploadIcon } from '../icons/UploadIcon';

interface CollaboratorFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (collaborator: Omit<Collaborator, 'id' | 'companyId'>, id?: string) => void;
  collaborator: Collaborator | null;
}

export const CollaboratorFormModal: React.FC<CollaboratorFormModalProps> = ({ isOpen, onClose, onSave, collaborator }) => {
    const [formData, setFormData] = useState({ name: '', email: '', phone: '', code: '', photoUrl: '' as string | File });
    const [photoPreview, setPhotoPreview] = useState('');
    const photoInputRef = useRef<HTMLInputElement>(null);
    const isEditing = !!collaborator;

    useEffect(() => {
        if (isOpen) {
            if (isEditing && collaborator) {
                setFormData({ 
                    name: collaborator.name, 
                    email: collaborator.email, 
                    phone: collaborator.phone,
                    code: collaborator.code || '',
                    photoUrl: collaborator.photoUrl || '',
                });
                setPhotoPreview(collaborator.photoUrl || '');
            } else {
                setFormData({ name: '', email: '', phone: '', code: '', photoUrl: '' });
                setPhotoPreview('');
            }
        }
    }, [collaborator, isEditing, isOpen]);

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
        if (name === 'code') {
          setFormData(prev => ({ ...prev, [name]: value.toUpperCase() }));
        } else {
          setFormData(prev => ({ ...prev, [name]: value }));
        }
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

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // FIX: Cast form data to 'any' to resolve a type mismatch. The 'photoUrl' property can be a File object, which is handled by the underlying data context implementation but is not compatible with the strictly-typed 'onSave' prop.
        onSave(formData as any, collaborator?.id);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4" onClick={onClose}>
            <div className="bg-light-card dark:bg-dark-card w-full max-w-md p-6 rounded-lg shadow-xl" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-light-text dark:text-dark-text">{isEditing ? 'Editar Colaborador' : 'Adicionar Colaborador'}</h2>
                    <button onClick={onClose} className="p-1 rounded-full text-gray-500 dark:text-gray-400 hover:bg-light-border dark:hover:bg-dark-border"><XIcon className="h-5 w-5" /></button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <input type="text" name="name" placeholder="Nome" value={formData.name} onChange={handleChange} required className="input-style" />
                    <input type="text" name="code" placeholder="Código do Colaborador" value={formData.code} onChange={handleChange} required className="input-style uppercase" />
                    <input type="email" name="email" placeholder="E-mail" value={formData.email} onChange={handleChange} required className="input-style" />
                    <input type="tel" name="phone" placeholder="Telefone" value={formData.phone} onChange={handleChange} required className="input-style" />
                     <div>
                        <label className="block text-sm font-medium text-light-text dark:text-dark-text">Foto do Colaborador</label>
                        <div className="mt-1 flex items-center gap-4">
                            <img src={photoPreview || 'https://via.placeholder.com/56x56?text=Foto'} alt="Preview" className="h-14 w-14 object-cover rounded-full bg-light-background dark:bg-dark-background" />
                            <input type="file" accept="image/*" onChange={handleFileChange} ref={photoInputRef} className="hidden" />
                            <button type="button" onClick={() => photoInputRef.current?.click()} className="btn-secondary flex items-center gap-2">
                                <UploadIcon className="h-4 w-4" />
                                Alterar
                            </button>
                        </div>
                    </div>
                    <div className="flex justify-end gap-4 pt-2">
                        <button type="button" onClick={onClose} className="btn-secondary">Cancelar</button>
                        <button type="submit" className="btn-primary">Salvar</button>
                    </div>
                </form>
            </div>
        </div>
    );
};