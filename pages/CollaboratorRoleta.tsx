import React, { useState, useRef, useEffect } from 'react';
import { useData } from '../context/DataContext';
import { Prize } from '../types';
import { Link } from 'react-router-dom';
import { PlusIcon } from '../components/icons/PlusIcon';
import { EditIcon } from '../components/icons/EditIcon';
import { TrashIcon } from '../components/icons/TrashIcon';
import { PrizeFormModal } from '../components/collaborator/PrizeFormModal';
import { ConfirmationModal } from '../components/collaborator/ConfirmationModal';
import { Notification } from '../components/Notification';
import { RoletaWheel } from '../components/collaborator/RoletaWheel';
import { WinnerModal } from '../components/collaborator/WinnerModal';
import { QRCodeModal } from '../components/collaborator/QRCodeModal';
import QRCode from 'qrcode';

export const CollaboratorRoleta: React.FC = () => {
    const { loggedInCollaboratorCompany, companyPrizes, savePrize, deletePrize, updateCompanySettings } = useData();

    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
    const [isWinnerModalOpen, setIsWinnerModalOpen] = useState(false);
    const [isQrModalOpen, setIsQrModalOpen] = useState(false);
    
    const [editingPrize, setEditingPrize] = useState<Prize | null>(null);
    const [prizeToDelete, setPrizeToDelete] = useState<Prize | null>(null);
    const [winner, setWinner] = useState<Prize | null>(null);
    const [qrCodeData, setQrCodeData] = useState({ dataUrl: '', cleanUrl: '' });
    const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

    // State for the new roulette wheel
    const [isSpinning, setIsSpinning] = useState(false);
    const [winningPrizeId, setWinningPrizeId] = useState<string | null>(null);
    
    const [colors, setColors] = useState(loggedInCollaboratorCompany?.roletaColors || ['#00D1FF', '#FFFFFF']);

    useEffect(() => {
        if (loggedInCollaboratorCompany?.roletaColors) {
            setColors(loggedInCollaboratorCompany.roletaColors);
        }
    }, [loggedInCollaboratorCompany]);

    if (!loggedInCollaboratorCompany) {
        return <div className="text-center p-8">Carregando dados do estande...</div>;
    }

    const prizes = companyPrizes(loggedInCollaboratorCompany.id);

    const handleSpin = () => {
        if (isSpinning || prizes.length < 2) return;

        const winnerIndex = Math.floor(Math.random() * prizes.length);
        const winnerData = prizes[winnerIndex];
        
        setWinner(winnerData);
        setWinningPrizeId(winnerData.id);
        setIsSpinning(true);

        const spinDurationMs = 5000; // Must match the duration in the wheel component

        setTimeout(() => {
            setIsSpinning(false);
            setIsWinnerModalOpen(true);
        }, spinDurationMs);
    };
    
    const handleOpenFormModal = (prize: Prize | null = null) => {
        setEditingPrize(prize);
        setIsFormModalOpen(true);
    };

    const handleSave = (prizeData: Omit<Prize, 'id' | 'companyId'>, id?: string) => {
        savePrize(loggedInCollaboratorCompany.id, prizeData, id);
        setIsFormModalOpen(false);
        setEditingPrize(null);
        setNotification({ message: `Prêmio ${id ? 'atualizado' : 'adicionado'} com sucesso!`, type: 'success' });
    };

    const handleDeleteClick = (prize: Prize) => {
        setPrizeToDelete(prize);
        setIsConfirmModalOpen(true);
    };

    const handleConfirmDelete = () => {
        if (prizeToDelete) {
            deletePrize(prizeToDelete.id);
            setNotification({ message: 'Prêmio excluído com sucesso!', type: 'success' });
        }
        setIsConfirmModalOpen(false);
        setPrizeToDelete(null);
    };

    const handleColorChange = (index: number, color: string) => {
        const newColors = [...colors];
        newColors[index] = color;
        setColors(newColors);
    };

    const handleSaveColors = () => {
        updateCompanySettings(loggedInCollaboratorCompany.id, { roletaColors: colors });
        setNotification({ message: 'Cores salvas com sucesso!', type: 'success' });
    };
    
    const handleGenerateQrCode = async () => {
        try {
          const baseUrl = `${window.location.origin}${window.location.pathname}`;
          const participationUrl = `${baseUrl}#/roleta/${loggedInCollaboratorCompany.id}`;
          const dataUrl = await QRCode.toDataURL(participationUrl, { width: 256, margin: 2 });
          setQrCodeData({ dataUrl, cleanUrl: participationUrl });
          setIsQrModalOpen(true);
        } catch (err) {
          console.error('Failed to generate QR code', err);
          setNotification({ message: 'Falha ao gerar QR Code.', type: 'error' });
        }
    };

    return (
        <>
            {notification && <Notification {...notification} onClose={() => setNotification(null)} />}
            <PrizeFormModal isOpen={isFormModalOpen} onClose={() => setIsFormModalOpen(false)} onSave={handleSave} prize={editingPrize} />
            <ConfirmationModal isOpen={isConfirmModalOpen} onClose={() => setIsConfirmModalOpen(false)} onConfirm={handleConfirmDelete} title="Excluir Prêmio" message={`Você tem certeza que deseja excluir o prêmio "${prizeToDelete?.name}"? Esta ação não pode ser desfeita.`} />
            <WinnerModal isOpen={isWinnerModalOpen} onClose={() => setIsWinnerModalOpen(false)} winner={winner} />
            <QRCodeModal isOpen={isQrModalOpen} onClose={() => setIsQrModalOpen(false)} dataUrl={qrCodeData.dataUrl} cleanUrl={qrCodeData.cleanUrl} companyName={loggedInCollaboratorCompany.name} />
            
            <div className="container mx-auto p-4 md:p-8">
                <div className="text-left mb-6">
                    <Link to="/collaborator-dashboard" className="text-sm font-semibold text-light-primary dark:text-dark-primary hover:underline">
                        &larr; Voltar ao Painel
                    </Link>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Coluna da Roleta */}
                    <div className="lg:col-span-2 bg-light-card dark:bg-dark-card shadow-lg rounded-lg p-6 flex flex-col items-center justify-center">
                       <h2 className="text-3xl font-bold text-light-text dark:text-dark-text mb-4">Roleta de Prêmios</h2>
                       <RoletaWheel 
                         prizes={prizes}
                         isSpinning={isSpinning}
                         winningPrizeId={winningPrizeId}
                         companyLogoUrl={loggedInCollaboratorCompany.logoUrl}
                         segmentColorsOverride={colors}
                       />
                       <button 
                         onClick={handleSpin} 
                         disabled={prizes.length < 2 || isSpinning}
                         className="mt-6 px-12 py-4 text-xl font-bold text-white bg-gradient-to-r from-light-primary to-light-secondary dark:from-dark-primary dark:to-dark-secondary rounded-lg shadow-lg hover:scale-105 active:scale-100 transition-all duration-300 disabled:from-gray-500 disabled:to-gray-600 disabled:cursor-not-allowed disabled:transform-none"
                        >
                           {isSpinning ? 'Girando...' : 'Girar Roleta'}
                        </button>
                         {prizes.length < 2 && <p className="text-xs text-red-500 mt-2">É necessário ter pelo menos 2 prêmios para girar a roleta.</p>}
                    </div>

                    {/* Coluna de Gerenciamento */}
                    <div className="bg-light-card dark:bg-dark-card shadow-lg rounded-lg p-6 flex flex-col">
                        <div className="flex justify-between items-center mb-4">
                           <h3 className="text-xl font-bold text-light-text dark:text-dark-text">Prêmios Cadastrados</h3>
                           <button onClick={() => handleOpenFormModal()} className="flex items-center gap-1 text-sm px-3 py-1.5 bg-light-primary text-white dark:bg-dark-primary rounded-md font-bold hover:opacity-90 transition-opacity">
                                <PlusIcon className="h-4 w-4" />
                                Adicionar
                            </button>
                        </div>
                        <div className="max-h-64 overflow-y-auto pr-2 space-y-2 flex-grow">
                             {prizes.length > 0 ? (
                                prizes.map(prize => (
                                    <div key={prize.id} className="flex justify-between items-center p-3 bg-light-background dark:bg-dark-background rounded-md animate-fadeIn">
                                        <span className="font-semibold text-light-text dark:text-dark-text">{prize.name}</span>
                                        <div className="flex gap-2 text-gray-500 dark:text-gray-400 flex-shrink-0">
                                            <button onClick={() => handleOpenFormModal(prize)} className="p-1.5 hover:text-light-primary dark:hover:text-dark-primary"><EditIcon className="h-4 w-4" /></button>
                                            <button onClick={() => handleDeleteClick(prize)} className="p-1.5 hover:text-red-500"><TrashIcon className="h-4 w-4" /></button>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-10">
                                    <p className="text-gray-500">Nenhum Prêmio Cadastrado.</p>
                                </div>
                            )}
                        </div>
                        <div className="mt-auto pt-6 space-y-4">
                            <div className="border-t border-light-border dark:border-dark-border pt-6">
                                <h4 className="text-lg font-bold text-light-text dark:text-dark-text mb-3">Personalizar Cores</h4>
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="flex-1">
                                        <label className="text-xs text-gray-500 dark:text-gray-400">Cor 1</label>
                                        <input type="color" value={colors[0] || '#00D1FF'} onChange={(e) => handleColorChange(0, e.target.value)} className="w-full h-10 p-0 m-0 bg-transparent border-none rounded cursor-pointer" style={{'--color': colors[0] || '#00D1FF'} as React.CSSProperties} />
                                    </div>
                                    <div className="flex-1">
                                        <label className="text-xs text-gray-500 dark:text-gray-400">Cor 2</label>
                                        <input type="color" value={colors[1] || '#FFFFFF'} onChange={(e) => handleColorChange(1, e.target.value)} className="w-full h-10 p-0 m-0 bg-transparent border-none rounded cursor-pointer" style={{'--color': colors[1] || '#FFFFFF'} as React.CSSProperties} />
                                    </div>
                                </div>
                                <button onClick={handleSaveColors} className="w-full text-center py-2 px-4 text-sm font-semibold text-light-primary dark:text-dark-primary border border-light-primary dark:border-dark-primary rounded-lg hover:bg-light-primary/10 dark:hover:bg-dark-primary/20 transition-colors">
                                    Salvar Cores
                                </button>
                            </div>
                            <button onClick={handleGenerateQrCode} className="w-full text-center py-3 px-4 font-semibold text-cyan-800 dark:text-cyan-300 bg-cyan-100 dark:bg-cyan-500/20 hover:bg-cyan-200 dark:hover:bg-cyan-500/30 rounded-lg transition-colors">
                                Gerar QR Code para Participantes
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            <style>{`
                input[type="color"]::-webkit-color-swatch-wrapper {
                    padding: 0;
                }
                input[type="color"]::-webkit-color-swatch {
                    border: 2px solid #4a5568;
                    border-radius: 0.375rem;
                }
                 input[type="color"] {
                     -webkit-appearance: none;
                     border: none;
                     width: 100%;
                     height: 2.5rem;
                     border-radius: 0.375rem;
                     background-color: var(--color);
                 }
            `}</style>
        </>
    );
};