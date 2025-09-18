
import React, { useState, useMemo, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { Prize } from '../types';
import { RoletaWheel } from '../components/collaborator/RoletaWheel';
import { WinnerModal } from '../components/collaborator/WinnerModal';
import { Triad3Logo } from '../components/Triad3Logo';
import { Footer } from '../components/Footer';

export const PublicRoleta: React.FC = () => {
    const { companyId } = useParams<{ companyId: string }>();
    const { companies, companyPrizes, fetchPublicCompanyData } = useData();
    
    const [isLoading, setIsLoading] = useState(true);
    const [step, setStep] = useState<'register' | 'spin'>('register');
    const [participant, setParticipant] = useState({ name: '', email: '', phone: '' });

    const [isWinnerModalOpen, setIsWinnerModalOpen] = useState(false);
    const [winner, setWinner] = useState<Prize | null>(null);
    const [isSpun, setIsSpun] = useState(false);
    const [isSpinning, setIsSpinning] = useState(false);
    const [winningPrizeId, setWinningPrizeId] = useState<string | null>(null);

    useEffect(() => {
        const loadData = async () => {
            setIsLoading(true);
            if (companyId) {
                await fetchPublicCompanyData(companyId);
            }
            setIsLoading(false);
        };
        loadData();
    }, [companyId, fetchPublicCompanyData]);

    const company = useMemo(() => companies.find(c => c.id === companyId), [companies, companyId]);
    const prizes = useMemo(() => companyId ? companyPrizes(companyId) : [], [companyId, companyPrizes]);

    const handleRegisterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setParticipant(prev => ({ ...prev, [name]: value }));
    };

    const handleRegisterSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (participant.name && participant.email && participant.phone) {
            // TODO: No futuro, salvar os dados do participante no banco de dados aqui.
            // Por enquanto, apenas avançando para o sorteio, conforme solicitado.
            setStep('spin');
        }
    };

    const handleSpin = () => {
        if (isSpun || isSpinning || prizes.length < 2) return;
        setIsSpun(true);

        const winnerIndex = Math.floor(Math.random() * prizes.length);
        const winnerData = prizes[winnerIndex];

        setWinner(winnerData);
        setWinningPrizeId(winnerData.id);
        setIsSpinning(true);

        const spinDurationMs = 5000;

        setTimeout(() => {
            setIsSpinning(false);
            setIsWinnerModalOpen(true);
        }, spinDurationMs);
    };

    const handleCloseWinnerModal = () => {
        setIsWinnerModalOpen(false);
    };

    if (isLoading) {
        return <div className="text-center p-8 text-white bg-dark-background min-h-screen flex items-center justify-center">Carregando...</div>;
    }

    if (!company) {
        return <div className="text-center p-8 text-white bg-dark-background min-h-screen flex items-center justify-center">Estande não encontrado.</div>;
    }

    const renderContent = () => {
        if (step === 'register') {
            return (
                <div className="w-full max-w-md bg-light-card dark:bg-dark-card p-8 rounded-lg shadow-xl animate-fadeIn">
                    <h2 className="text-2xl font-bold text-center mb-1">Participe!</h2>
                    <p className="text-gray-500 dark:text-gray-400 text-center mb-6">Preencha seus dados para girar a roleta.</p>
                    <form onSubmit={handleRegisterSubmit} className="space-y-4">
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium">Nome Completo</label>
                            <input type="text" name="name" id="name" value={participant.name} onChange={handleRegisterChange} required className="mt-1 w-full input-style" />
                        </div>
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium">E-mail</label>
                            <input type="email" name="email" id="email" value={participant.email} onChange={handleRegisterChange} required className="mt-1 w-full input-style" />
                        </div>
                        <div>
                            <label htmlFor="phone" className="block text-sm font-medium">Telefone</label>
                            <input type="tel" name="phone" id="phone" value={participant.phone} onChange={handleRegisterChange} required className="mt-1 w-full input-style" />
                        </div>
                        <button type="submit" className="w-full mt-2 px-12 py-3 text-lg font-bold text-white bg-gradient-to-r from-light-primary to-light-secondary dark:from-dark-primary dark:to-dark-secondary rounded-lg shadow-lg hover:scale-105 active:scale-100 transition-all duration-300">
                            Girar a Roleta
                        </button>
                    </form>
                </div>
            );
        }

        return (
            <div className="flex flex-col items-center animate-fadeIn">
                <RoletaWheel
                    prizes={prizes}
                    isSpinning={isSpinning}
                    winningPrizeId={winningPrizeId}
                    companyLogoUrl={company.logoUrl}
                    segmentColorsOverride={company.roletaColors}
                />
                <button 
                    onClick={handleSpin} 
                    disabled={prizes.length < 2 || isSpun}
                    className="mt-8 px-12 py-4 text-xl font-bold text-white bg-gradient-to-r from-light-primary to-light-secondary dark:from-dark-primary dark:to-dark-secondary rounded-lg shadow-lg hover:scale-105 active:scale-100 transition-all duration-300 disabled:from-gray-500 disabled:to-gray-600 disabled:cursor-not-allowed disabled:transform-none"
                >
                    {isSpun ? 'Boa Sorte!' : 'Girar Roleta'}
                </button>
                {prizes.length < 2 && <p className="text-xs text-red-500 mt-2">A roleta está temporariamente indisponível.</p>}
                {isSpinning && <p className="text-sm text-gray-400 mt-2 animate-pulse">Girando...</p>}
                {isSpun && !isSpinning && <p className="text-sm text-green-400 mt-2">Obrigado por participar!</p>}
            </div>
        );
    };

    return (
        <div className="flex flex-col min-h-screen bg-light-background dark:bg-dark-background text-light-text dark:text-dark-text">
            <WinnerModal 
                isOpen={isWinnerModalOpen} 
                onClose={handleCloseWinnerModal} 
                winner={winner}
                participantName={participant.name}
            />
            <header className="py-4">
                <div className="container mx-auto flex flex-col items-center text-center">
                    <img src={company.logoUrl || 'https://via.placeholder.com/80?text=Logo'} alt={company.name} className="h-20 w-20 rounded-md object-cover mb-2" />
                    <h1 className="text-3xl font-bold">{company.name}</h1>
                    <p className="text-lg text-gray-500 dark:text-gray-400">
                        {step === 'register' ? 'Cadastre-se para concorrer a prêmios!' : 'Gire a roleta e boa sorte!'}
                    </p>
                </div>
            </header>

            <main className="flex-grow flex flex-col items-center justify-center p-4">
                {renderContent()}
            </main>
            
            <div className="w-full mt-auto">
                 <Footer />
            </div>
            <div className="fixed bottom-4 right-4">
                <Triad3Logo className="w-20" />
            </div>
             <style>{`
                .input-style { display: block; width: 100%; padding: 0.75rem; background-color: var(--color-background-light, #f9fafb); border: 1px solid var(--color-border-light, #e5e7eb); border-radius: 0.375rem; color: var(--color-text-light, #111827); }
                .dark .input-style { background-color: var(--color-background-dark, #1a202c); border-color: var(--color-border-dark, #4a5568); color: var(--color-text-dark, #f7fafc); }
                .input-style:focus { outline: none; border-color: var(--color-primary-light, #3b82f6); }
                .dark .input-style:focus { border-color: var(--color-primary-dark, #00d1ff); }
            `}</style>
        </div>
    );
};
