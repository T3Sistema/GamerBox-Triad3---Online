
import React, { useState, useEffect, useCallback } from 'react';
import { useData } from '../context/DataContext';
import { Participant } from '../types';
import { TrophyIcon } from '../components/icons/TrophyIcon';

const CountdownDisplay: React.FC<{ count: number }> = ({ count }) => (
  <div key={count} className="animate-pop text-9xl font-black text-transparent bg-clip-text bg-gradient-to-r from-dark-primary to-dark-secondary">
    {count}
  </div>
);

const maskPhone = (phone: string): string => {
    if (!phone) return phone;
    // Masks the middle numbers of a phone string, keeping formatting.
    // e.g. (11) 98765-4321 -> (11) 9****-4321
    // e.g. (21) 1234-5678  -> (21) ****-5678
    const parts = phone.split('-');
    if (parts.length !== 2) return phone; // Not in the expected X-Y format

    const firstPart = parts[0];
    const lastPart = parts[1];

    const areaCodeMatch = firstPart.match(/\(\d{2}\)\s*/);
    const areaCode = areaCodeMatch ? areaCodeMatch[0] : '';
    
    const numberWithoutAreaCode = firstPart.substring(areaCode.length).trim();

    if (numberWithoutAreaCode.length === 5) { // 9XXXX format
        const masked = numberWithoutAreaCode.charAt(0) + '****';
        return `${areaCode}${masked}-${lastPart}`;
    } else if (numberWithoutAreaCode.length === 4) { // XXXX format
        const masked = '****';
        return `${areaCode}${masked}-${lastPart}`;
    }

    return phone; // Return original if format is unexpected
}

const WinnerDisplay: React.FC<{ winner: Participant }> = ({ winner }) => (
  <div className="animate-fadeIn text-center bg-light-card dark:bg-dark-card p-8 rounded-lg shadow-2xl border border-light-border dark:border-dark-border shadow-primary/30 dark:shadow-primary/20">
    <TrophyIcon className="w-24 h-24 mx-auto text-yellow-400 mb-4" />
    <h3 className="text-2xl font-semibold text-gray-500 dark:text-gray-400">O Ganhador é:</h3>
    <p className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-light-primary to-light-secondary dark:from-dark-primary dark:to-dark-secondary my-2">{winner.name}</p>
    <p className="text-2xl text-light-text dark:text-dark-text">{maskPhone(winner.phone)}</p>
  </div>
);

export const Sorteio: React.FC = () => {
  const [isDrawing, setIsDrawing] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [winner, setWinner] = useState<Participant | null>(null);
  const [noEligible, setNoEligible] = useState(false);
  
  const { drawWinner, getEligibleParticipantCount, selectedEvent } = useData();
  
  const eligibleCount = getEligibleParticipantCount();

  // Reset winner when event changes
  useEffect(() => {
    setWinner(null);
    setNoEligible(false);
    setIsDrawing(false);
    setCountdown(null);
  }, [selectedEvent]);


  useEffect(() => {
    if (countdown === null || countdown === 0) return;

    const timer = setTimeout(() => {
      setCountdown(countdown - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [countdown]);
  
  const handleDraw = useCallback(async () => {
    if (eligibleCount === 0) {
      setNoEligible(true);
      return;
    }

    setIsDrawing(true);
    setWinner(null);
    setNoEligible(false);
    setCountdown(5);

    const countdownTimer = setInterval(() => {
        setCountdown(prev => (prev !== null && prev > 1 ? prev - 1 : 0));
    }, 1000);

    setTimeout(async () => {
      clearInterval(countdownTimer);
      setCountdown(null);
      const drawnWinner = await drawWinner();
      setWinner(drawnWinner);
      setIsDrawing(false);
    }, 5000);
  }, [drawWinner, eligibleCount]);

  const renderContent = () => {
    if (!selectedEvent) {
        return <p className="text-2xl text-center text-gray-500">Você não tem um evento associado. Por favor, contate o administrador.</p>;
    }
    if (isDrawing && countdown !== null) {
      return <CountdownDisplay count={countdown} />;
    }
    if (winner) {
      return <WinnerDisplay winner={winner} />;
    }
    if (noEligible) {
        return <p className="text-2xl text-center text-red-500">Todos os participantes deste evento já foram sorteados!</p>
    }
    return (
        <div className="text-center">
            <h2 className="text-4xl font-bold text-light-text dark:text-dark-text mb-4">Sorteio para <span className="text-transparent bg-clip-text bg-gradient-to-r from-light-primary to-light-secondary dark:from-dark-primary dark:to-dark-secondary">{selectedEvent.name}</span></h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
                Total de {eligibleCount} participante{eligibleCount !== 1 ? 's' : ''} habilitado(s) para sorteio!
            </p>
        </div>
    );
  };

  return (
    <div className="container mx-auto p-4 md:p-8 flex flex-col items-center justify-center min-h-[calc(100vh-128px)]">
      <div className="w-full max-w-2xl mb-8 flex items-center justify-center min-h-[250px]">
        {renderContent()}
      </div>
      <button
        onClick={handleDraw}
        disabled={isDrawing || eligibleCount === 0 || !selectedEvent}
        className="px-12 py-6 text-2xl font-bold text-white bg-gradient-to-r from-light-primary to-light-secondary dark:from-dark-primary dark:to-dark-secondary rounded-lg shadow-lg hover:scale-105 active:scale-100 transition-all duration-300 disabled:from-gray-500 disabled:to-gray-600 disabled:cursor-not-allowed disabled:transform-none animate-pulse disabled:animate-none"
      >
        {winner ? 'Sortear Novamente' : 'Sortear!'}
      </button>
    </div>
  );
};