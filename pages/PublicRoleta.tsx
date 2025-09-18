
// FIX: Refactored component to use the prop-based API of RoletaWheel, resolving ref-related errors.
import React, { useState, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { Prize } from '../types';
import { RoletaWheel } from '../components/collaborator/RoletaWheel';
import { WinnerModal } from '../components/collaborator/WinnerModal';
import { Triad3Logo } from '../components/Triad3Logo';
import { Footer } from '../components/Footer';

export const PublicRoleta: React.FC = () => {
    const { companyId } = useParams<{ companyId: string }>();
    const { companies, companyPrizes } = useData();

    const [isWinnerModalOpen, setIsWinnerModalOpen] = useState(false);
    const [winner, setWinner] = useState<Prize | null>(null);
    const [isSpun, setIsSpun] = useState(false);
    const [isSpinning, setIsSpinning] = useState(false);
    const [winningPrizeId, setWinningPrizeId] = useState<string | null>(null);

    const company = useMemo(() => companies.find(c => c.id === companyId), [companies, companyId]);
    const prizes = useMemo(() => companyId ? companyPrizes(companyId) : [], [companyId, companyPrizes]);

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
        // Não reseta o isSpun para impedir múltiplos giros, a menos que seja uma regra de negócio.
    };

    if (!company) {
        return <div className="text-center p-8 text-white bg-dark-background min-h-screen flex items-center justify-center">Estande não encontrado.</div>;
    }

    return (
        <div className="flex flex-col min-h-screen bg-light-background dark:bg-dark-background text-light-text dark:text-dark-text">
            <WinnerModal isOpen={isWinnerModalOpen} onClose={handleCloseWinnerModal} winner={winner} />
            <header className="py-4">
                <div className="container mx-auto flex flex-col items-center text-center">
                    <img src={company.logoUrl || 'https://via.placeholder.com/80?text=Logo'} alt={company.name} className="h-20 w-20 rounded-md object-cover mb-2" />
                    <h1 className="text-3xl font-bold">{company.name}</h1>
                    <p className="text-lg text-gray-500 dark:text-gray-400">Gire a roleta e boa sorte!</p>
                </div>
            </header>

            <main className="flex-grow flex flex-col items-center justify-center p-4">
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
            </main>
            
            <div className="w-full mt-auto">
                 <Footer />
            </div>
            <div className="fixed bottom-4 right-4">
                <Triad3Logo className="w-20" />
            </div>
        </div>
    );
};
