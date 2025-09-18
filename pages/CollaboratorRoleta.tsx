import React, { useState, useRef, useEffect, useMemo } from 'react';
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
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';


export const CollaboratorRoleta: React.FC = () => {
    const { loggedInCollaboratorCompany, companyPrizes, savePrize, deletePrize, updateCompanySettings, roletaParticipants } = useData();

    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
    const [isWinnerModalOpen, setIsWinnerModalOpen] = useState(false);
    const [isQrModalOpen, setIsQrModalOpen] = useState(false);
    
    const [editingPrize, setEditingPrize] = useState<Prize | null>(null);
    const [prizeToDelete, setPrizeToDelete] = useState<Prize | null>(null);
    const [winner, setWinner] = useState<Prize | null>(null);
    const [qrCodeData, setQrCodeData] = useState({ dataUrl: '', cleanUrl: '' });
    const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
    const [activeTab, setActiveTab] = useState<'spun' | 'registered'>('spun');

    // State for the new roulette wheel
    const [isSpinning, setIsSpinning] = useState(false);
    const [winningPrizeId, setWinningPrizeId] = useState<string | null>(null);
    
    const [colors, setColors] = useState(loggedInCollaboratorCompany?.roletaColors || ['#00D1FF', '#FFFFFF']);

    useEffect(() => {
        if (loggedInCollaboratorCompany?.roletaColors) {
            setColors(loggedInCollaboratorCompany.roletaColors);
        }
    }, [loggedInCollaboratorCompany]);

    const spunParticipants = useMemo(() => 
        roletaParticipants.filter(p => p.spunAt), 
    [roletaParticipants]);

    const registeredOnlyParticipants = useMemo(() => 
        roletaParticipants.filter(p => !p.spunAt), 
    [roletaParticipants]);


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

    const tabClasses = (isActive: boolean) => 
        `px-4 py-2 text-sm font-medium rounded-t-lg transition-colors focus:outline-none ${
        isActive
            ? 'border-b-2 border-light-primary dark:border-dark-primary text-light-primary dark:text-dark-primary'
            : 'text-gray-500 hover:text-light-text dark:hover:text-dark-text'
    }`;

     const handleDownloadCSV = () => {
        const isSpunTab = activeTab === 'spun';
        const participantsToExport = isSpunTab ? spunParticipants : registeredOnlyParticipants;

        if (participantsToExport.length === 0) {
            setNotification({ message: 'Não há dados para exportar.', type: 'error' });
            return;
        }

        const headers = isSpunTab
            ? ['Nome', 'Email', 'Telefone', 'Prêmio', 'Data/Hora Sorteio']
            : ['Nome', 'Email', 'Telefone', 'Data/Hora Cadastro'];

        const csvContent = [
            headers.join(','),
            ...participantsToExport.map(p => {
                const commonData = [
                    `"${p.name.replace(/"/g, '""')}"`,
                    `"${p.email}"`,
                    `"${p.phone}"`
                ];
                if (isSpunTab) {
                    return [
                        ...commonData,
                        `"${(p.prizeName || '').replace(/"/g, '""')}"`,
                        `"${p.spunAt ? new Date(p.spunAt).toLocaleString('pt-BR') : ''}"`
                    ].join(',');
                } else {
                    return [
                        ...commonData,
                        `"${new Date(p.createdAt).toLocaleString('pt-BR')}"`
                    ].join(',');
                }
            })
        ].join('\n');

        const blob = new Blob([`\uFEFF${csvContent}`], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        const filename = `participantes_roleta_${activeTab}_${loggedInCollaboratorCompany.name.replace(/\s+/g, '_')}.csv`;
        link.setAttribute('href', url);
        link.setAttribute('download', filename);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleDownloadPDF = () => {
        const isSpunTab = activeTab === 'spun';
        const participantsToExport = isSpunTab ? spunParticipants : registeredOnlyParticipants;

        if (participantsToExport.length === 0) {
            setNotification({ message: 'Não há dados para exportar.', type: 'error' });
            return;
        }
        
        const doc = new jsPDF();
        const head = isSpunTab
            ? [['Nome', 'Contato', 'Prêmio', 'Data/Hora Sorteio']]
            : [['Nome', 'Contato', 'Data/Hora Cadastro']];

        const body = participantsToExport.map(p => {
            const commonData = [
                p.name,
                `${p.email}\n${p.phone}`
            ];
            if (isSpunTab) {
                return [
                    ...commonData,
                    p.prizeName || '',
                    p.spunAt ? new Date(p.spunAt).toLocaleString('pt-BR') : ''
                ];
            } else {
                return [
                    ...commonData,
                    new Date(p.createdAt).toLocaleString('pt-BR')
                ];
            }
        });

        autoTable(doc, {
            head,
            body,
            startY: 20,
            didDrawPage: (data) => {
                doc.setFontSize(18);
                doc.setTextColor(40);
                const title = `Participantes - ${isSpunTab ? 'Sorteados' : 'Cadastrados'}`;
                doc.text(title, data.settings.margin.left, 15);
            }
        });

        const filename = `participantes_roleta_${activeTab}_${loggedInCollaboratorCompany.name.replace(/\s+/g, '_')}.pdf`;
        doc.save(filename);
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

                <div className="mt-12 bg-light-card dark:bg-dark-card shadow-lg rounded-lg p-6">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4">
                        <h3 className="text-2xl font-bold text-light-text dark:text-dark-text">Painel de Participantes</h3>
                        <div className="flex items-center gap-2 flex-shrink-0">
                            <button 
                                onClick={handleDownloadCSV}
                                className="px-3 py-1.5 text-xs font-medium text-light-primary dark:text-dark-primary border border-light-primary dark:border-dark-primary rounded-md shadow-sm hover:bg-light-primary/10 dark:hover:bg-dark-primary/10 transition-colors"
                            >
                                Download CSV
                            </button>
                            <button 
                                onClick={handleDownloadPDF}
                                className="px-3 py-1.5 text-xs font-medium text-white bg-light-primary dark:bg-dark-primary rounded-md shadow-sm hover:bg-opacity-80 dark:hover:bg-opacity-80 transition-colors"
                            >
                                Download PDF
                            </button>
                        </div>
                    </div>

                    <div className="border-b border-light-border dark:border-dark-border">
                        <nav className="-mb-px flex space-x-6" aria-label="Tabs">
                            <button onClick={() => setActiveTab('spun')} className={tabClasses(activeTab === 'spun')}>
                                Sorteados ({spunParticipants.length})
                            </button>
                            <button onClick={() => setActiveTab('registered')} className={tabClasses(activeTab === 'registered')}>
                                Apenas Cadastrados ({registeredOnlyParticipants.length})
                            </button>
                        </nav>
                    </div>

                    <div className="mt-6 overflow-x-auto">
                        {activeTab === 'spun' && (
                             <table className="min-w-full divide-y divide-light-border dark:divide-dark-border">
                                <thead className="bg-light-background dark:bg-dark-background/50">
                                    <tr>
                                        <th className="px-4 py-2 text-left text-xs font-medium uppercase">Nome</th>
                                        <th className="px-4 py-2 text-left text-xs font-medium uppercase">Contato</th>
                                        <th className="px-4 py-2 text-left text-xs font-medium uppercase">Prêmio</th>
                                        <th className="px-4 py-2 text-left text-xs font-medium uppercase">Data/Hora Sorteio</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-light-border dark:divide-dark-border">
                                    {spunParticipants.map(p => (
                                        <tr key={p.id}>
                                            <td className="px-4 py-3 whitespace-nowrap text-sm font-medium">{p.name}</td>
                                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{p.email}<br/>{p.phone}</td>
                                            <td className="px-4 py-3 whitespace-nowrap text-sm font-semibold">{p.prizeName}</td>
                                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{p.spunAt ? new Date(p.spunAt).toLocaleString('pt-BR') : '-'}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                         {activeTab === 'registered' && (
                             <table className="min-w-full divide-y divide-light-border dark:divide-dark-border">
                                <thead className="bg-light-background dark:bg-dark-background/50">
                                    <tr>
                                        <th className="px-4 py-2 text-left text-xs font-medium uppercase">Nome</th>
                                        <th className="px-4 py-2 text-left text-xs font-medium uppercase">Contato</th>
                                        <th className="px-4 py-2 text-left text-xs font-medium uppercase">Data/Hora Cadastro</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-light-border dark:divide-dark-border">
                                    {registeredOnlyParticipants.map(p => (
                                        <tr key={p.id}>
                                            <td className="px-4 py-3 whitespace-nowrap text-sm font-medium">{p.name}</td>
                                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{p.email}<br/>{p.phone}</td>
                                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{new Date(p.createdAt).toLocaleString('pt-BR')}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                        {(roletaParticipants.length === 0) && <p className="text-center py-8 text-gray-500">Nenhum participante registrado ainda.</p>}
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