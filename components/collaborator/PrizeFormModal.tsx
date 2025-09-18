import React, { useState, useEffect } from 'react';
import { Prize } from '../../types';
import { XIcon } from '../icons/XIcon';

interface PrizeFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (prize: Omit<Prize, 'id' | 'companyId'>, id?: string) => void;
  prize: Prize | null;
}

export const PrizeFormModal: React.FC<PrizeFormModalProps> = ({ isOpen, onClose, onSave, prize }) => {
    const [name, setName] = useState('');
    const isEditing = !!prize;

    useEffect(() => {
        if (isOpen) {
            setName(isEditing ? prize.name : '');
        }
    }, [prize, isEditing, isOpen]);
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) return;
        onSave({ name }, prize?.id);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 animate-fadeIn p-4" onClick={onClose}>
            <div className="bg-light-card dark:bg-dark-card w-full max-w-md p-6 rounded-lg shadow-xl" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-light-text dark:text-dark-text">{isEditing ? 'Editar Prêmio' : 'Adicionar Prêmio'}</h2>
                    <button onClick={onClose} className="p-1 rounded-full text-gray-500 dark:text-gray-400 hover:bg-light-border dark:hover:bg-dark-border"><XIcon className="h-5 w-5" /></button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="prize-name" className="block text-sm font-medium text-light-text dark:text-dark-text mb-1">Nome do Prêmio</label>
                        <input 
                            id="prize-name"
                            type="text" 
                            placeholder="Ex: Headset Gamer" 
                            value={name} 
                            onChange={(e) => setName(e.target.value)} 
                            required 
                            className="input-style"
                            autoFocus
                        />
                    </div>
                    <div className="flex justify-end gap-4 pt-2">
                        <button type="button" onClick={onClose} className="btn-secondary">Cancelar</button>
                        <button type="submit" className="btn-primary">Salvar</button>
                    </div>
                </form>
            </div>
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
    );
};
