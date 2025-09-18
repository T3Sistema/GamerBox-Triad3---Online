import React, { useState, useEffect, useRef } from 'react';
import { Company } from '../../types';
import { XIcon } from '../icons/XIcon';
import { UploadIcon } from '../icons/UploadIcon';

interface CompanyFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (company: Omit<Company, 'id' | 'eventId'>, id?: string) => void;
  company: Company | null;
}

const ToggleSwitch: React.FC<{ label: string, enabled: boolean, onChange: (enabled: boolean) => void }> = ({ label, enabled, onChange }) => (
    <label htmlFor={`toggle-${label}`} className="flex items-center justify-between cursor-pointer">
        <span className="text-sm font-medium text-light-text dark:text-dark-text">{label}</span>
        <div className="relative">
            <input id={`toggle-${label}`} type="checkbox" className="sr-only" checked={enabled} onChange={e => onChange(e.target.checked)} />
            <div className={`block w-14 h-8 rounded-full transition-colors ${enabled ? 'bg-light-primary dark:bg-dark-primary' : 'bg-gray-300 dark:bg-gray-600'}`}></div>
            <div className={`dot absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform ${enabled ? 'translate-x-6' : 'translate-x-0'}`}></div>
        </div>
    </label>
);


export const CompanyFormModal: React.FC<CompanyFormModalProps> = ({ isOpen, onClose, onSave, company }) => {
    const [formData, setFormData] = useState({
        name: '',
        responsibleName: '',
        email: '',
        phone: '',
        logoUrl: '' as string | File,
        code: '',
        hasSorteio: true,
        hasRoleta: false,
    });
    const [logoPreview, setLogoPreview] = useState('');
    const logoInputRef = useRef<HTMLInputElement>(null);
    const isEditing = !!company;

    useEffect(() => {
        if (isOpen) {
            if (isEditing && company) {
                setFormData({
                    name: company.name,
                    responsibleName: company.responsibleName,
                    email: company.email,
                    phone: company.phone,
                    logoUrl: company.logoUrl || '',
                    code: company.code || '',
                    hasSorteio: company.hasSorteio,
                    hasRoleta: company.hasRoleta,
                });
                setLogoPreview(company.logoUrl || '');
            } else {
                 setFormData({ name: '', responsibleName: '', email: '', phone: '', logoUrl: '', code: '', hasSorteio: true, hasRoleta: false });
                 setLogoPreview('');
            }
        }
    }, [company, isEditing, isOpen]);
    
     useEffect(() => {
        // Cleanup object URL
        return () => {
            if (logoPreview && logoPreview.startsWith('blob:')) {
                URL.revokeObjectURL(logoPreview);
            }
        };
    }, [logoPreview]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        if (name === 'code') {
          setFormData(prev => ({ ...prev, [name]: value.toUpperCase() }));
        } else {
          setFormData(prev => ({ ...prev, [name]: value }));
        }
    };
    
    const handleToggleChange = (field: 'hasSorteio' | 'hasRoleta', value: boolean) => {
        setFormData(prev => ({...prev, [field]: value }));
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setFormData(prev => ({ ...prev, logoUrl: file }));

            if (logoPreview && logoPreview.startsWith('blob:')) {
                URL.revokeObjectURL(logoPreview);
            }
            setLogoPreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // FIX: Cast form data to 'any' to resolve a type mismatch. The 'logoUrl' property can be a File object, which is handled by the underlying data context implementation but is not compatible with the strictly-typed 'onSave' prop.
        onSave(formData as any, company?.id);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 animate-fadeIn p-4" onClick={onClose}>
            <div className="bg-light-card dark:bg-dark-card w-full max-w-lg p-6 rounded-lg shadow-2xl border border-light-border dark:border-dark-border max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-light-text dark:text-dark-text">{isEditing ? 'Editar Expositor' : 'Adicionar Expositor'}</h2>
                    <button onClick={onClose} className="p-1 rounded-full text-gray-500 dark:text-gray-400 hover:bg-light-border dark:hover:bg-dark-border"><XIcon className="h-6 w-6" /></button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                     <input type="text" name="name" placeholder="Nome da Empresa" value={formData.name} onChange={handleChange} required className="input-style" />
                     <input type="text" name="responsibleName" placeholder="Nome do Responsável" value={formData.responsibleName} onChange={handleChange} required className="input-style" />
                     <input type="text" name="code" placeholder="Código do Estande" value={formData.code} onChange={handleChange} required className="input-style uppercase" />
                     <input type="email" name="email" placeholder="E-mail" value={formData.email} onChange={handleChange} required className="input-style" />
                     <input type="tel" name="phone" placeholder="Telefone" value={formData.phone} onChange={handleChange} required className="input-style" />
                    <div>
                        <label className="block text-sm font-medium text-light-text dark:text-dark-text">Logo da Empresa</label>
                        <div className="mt-1 flex items-center gap-4">
                            <img src={logoPreview || 'https://via.placeholder.com/56x56?text=Logo'} alt="Preview" className="h-14 w-14 object-cover rounded-md bg-light-background dark:bg-dark-background" />
                            <input type="file" accept="image/*" onChange={handleFileChange} ref={logoInputRef} className="hidden" />
                            <button type="button" onClick={() => logoInputRef.current?.click()} className="btn-secondary flex items-center gap-2"><UploadIcon className="h-4 w-4"/>Alterar</button>
                        </div>
                    </div>
                    
                    <div className="space-y-4 pt-4 border-t border-light-border dark:border-dark-border">
                        <h3 className="font-semibold text-light-text dark:text-dark-text">Sistemas de Sorteio</h3>
                         <ToggleSwitch label="GamerBox Triad3" enabled={formData.hasSorteio} onChange={(val) => handleToggleChange('hasSorteio', val)} />
                         <ToggleSwitch label="Roleta de Prêmios" enabled={formData.hasRoleta} onChange={(val) => handleToggleChange('hasRoleta', val)} />
                    </div>

                    <div className="flex justify-end gap-4 pt-4">
                        <button type="button" onClick={onClose} className="btn-secondary">Cancelar</button>
                        <button type="submit" className="btn-primary">Salvar</button>
                    </div>
                </form>
                 <style>{`
                    .input-style { display: block; width: 100%; padding: 0.75rem; background-color: var(--color-background-light, #f9fafb); border: 1px solid var(--color-border-light, #e5e7eb); border-radius: 0.375rem; color: var(--color-text-light, #111827); }
                    .dark .input-style { background-color: var(--color-background-dark, #1a202c); border-color: var(--color-border-dark, #4a5568); color: var(--color-text-dark, #f7fafc); }
                    .input-style:focus { outline: none; border-color: var(--color-primary-light, #3b82f6); }
                    .dark .input-style:focus { border-color: var(--color-primary-dark, #00d1ff); }
                    .btn-primary { padding: 0.5rem 1.5rem; border-radius: 0.375rem; font-weight: 600; color: white; background-color: var(--color-primary-light, #3b82f6); transition: opacity 0.2s; }
                    .dark .btn-primary { background-color: var(--color-primary-dark, #00d1ff); }
                    .btn-primary:hover { opacity: 0.9; }
                    .btn-secondary { padding: 0.5rem 1.5rem; border-radius: 0.375rem; font-weight: 600; color: var(--color-text-light, #111827); background-color: var(--color-card-light, #ffffff); border: 1px solid var(--color-border-light, #e5e7eb); transition: background-color 0.2s; }
                    .dark .btn-secondary { color: var(--color-text-dark, #f7fafc); background-color: var(--color-card-dark, #2d3748); border-color: var(--color-border-dark, #4a5568); }
                    .btn-secondary:hover { background-color: var(--color-border-light, #e5e7eb); }
                    .dark .btn-secondary:hover { background-color: var(--color-border-dark, #4a5568); }
                `}</style>
            </div>
        </div>
    );
};