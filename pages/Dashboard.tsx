
import React, { useState, useEffect, useCallback } from 'react';
import { useData } from '../context/DataContext';
import { Participant, Raffle } from '../types';
import { TrophyIcon } from '../components/icons/TrophyIcon';

const CountdownDisplay: React.FC<{ count: number }> = ({ count }) => (
  <div key={count} className="animate-pop text-9xl font-black text-transparent bg-clip-text bg-gradient-to-r from-dark-primary to-dark-secondary">
    {count}
  </div>
);

const maskPhone = (phone: string): string => {
    if (!phone) return phone;
    const parts = phone.split('-');
    if (parts.length !== 2) return phone;
    const firstPart = parts[0];
    const lastPart = parts[1];
    const areaCodeMatch = firstPart.match(/\(\d{2}\)\s*/);
    const areaCode = areaCodeMatch ? areaCodeMatch[0] : '';
    const numberWithoutAreaCode = firstPart.substring(areaCode.length).trim();
    if (numberWithoutAreaCode.length === 5) {
        const masked = numberWithoutAreaCode.charAt(0) + '****';
        return `${areaCode}${masked}-${lastPart}`;
    } else if (numberWithoutAreaCode.length === 4) {
        const masked = '****';
        return `${areaCode}${masked}-${lastPart}`;
    }
    return phone;
}

const WinnerDisplay: React.FC<{ winner: Participant, raffle: Raffle | null }> = ({ winner, raffle }) => (
  <div className="animate-fadeIn text-center bg-light-card dark:bg-dark-card p-8 rounded-lg shadow-2xl border border-light-border dark:border-dark-border shadow-primary/30 dark:shadow-primary/20">
    <TrophyIcon className="w-24 h-24 mx-auto text-yellow-400 mb-4" />
    <h3 className="text-2xl font-semibold text-gray-500 dark:text-gray-400">Ganhador do Sorteio <span className="text-yellow-400">{raffle?.name}</span>:</h3>
    <p className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-light-primary to-light-secondary dark:from-dark-primary dark:to-dark-secondary my-2">{winner.name}</p>
    <p className="text-2xl text-light-text dark:text-dark-text">{maskPhone(winner.phone)}</p>
  </div>
);

const EventSelector: React.FC = () => {
    const { organizerEvents, selectedEvent, setSelectedEventId, setSelectedRaffleId } = useData();

    if (organizerEvents.length <= 1) return null;

    const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedEventId(e.target.value);
        setSelectedRaffleId(null); // Reset raffle selection when event changes
    }

    return (
        <div className="absolute top-4 left-4">
            <label htmlFor="event-select" className="sr-only">Selecionar Evento</label>
            <select
                id="event-select"
                value={selectedEvent?.id || ''}
                onChange={handleChange}
                className="bg-light-card dark:bg-dark-card border border-light-border dark:border-dark-border rounded-md shadow-sm p-2 focus:outline-none focus:ring-light-primary focus:border-light-primary dark:focus:ring-dark-primary dark:focus:border-dark-primary"
            >
                {organizerEvents.map(event => (
                    <option key={event.id} value={event.id}>
                        {event.name}
                    </option>
                ))}
            </select>
        </div>
    );
};

const RaffleSelector: React.FC = () => {
    const { selectedEventRaffles, selectedRaffle, setSelectedRaffleId } = useData();

    if (selectedEventRaffles.length === 0) return null;

    return (
        <div className="absolute top-4 right-4">
            <label htmlFor="raffle-select" className="sr-only">Selecionar Sorteio</label>
            <select
                id="raffle-select"
                value={selectedRaffle?.id || ''}
                onChange={(e) => setSelectedRaffleId(e.target.value)}
                className="bg-light-card dark:bg-dark-card border border-light-border dark:border-dark-border rounded-md shadow-sm p-2 focus:outline-none focus:ring-light-primary focus:border-light-primary dark:focus:ring-dark-primary dark:focus:border-dark-primary"
            >
                <option value="">-- Selecione o Sorteio --</option>
                {selectedEventRaffles.map(raffle => (
                    <option key={raffle.id} value={raffle.id}>
                        {raffle.name}
                    </option>
                ))}
            </select>
        </div>
    );
};

export const Dashboard: React.FC = () => {
  const [isDrawing, setIsDrawing] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [winner, setWinner] = useState<Participant | null>(null);
  const [noEligible, setNoEligible] = useState(false);
  
  const { drawWinner, getEligibleParticipantCount, selectedEvent, selectedRaffle, setSelectedRaffleId } = useData();
  
  const eligibleCount = getEligibleParticipantCount();

  useEffect(() => {
    setWinner(null);
    setNoEligible(false);
    setIsDrawing(false);
    setCountdown(null);
  }, [selectedEvent, selectedRaffle]);

  useEffect(() => {
    if (countdown === null || countdown === 0) return;
    const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
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

    setTimeout(async () => {
      setCountdown(null);
      const drawnWinner = await drawWinner();
      setWinner(drawnWinner);
      setIsDrawing(false);
    }, 5000);
  }, [drawWinner, eligibleCount]);

  const renderContent = () => {
    if (!selectedEvent) {
        return <p className="text-2xl text-center text-gray-500">Nenhum evento selecionado. Vá para a tela "Gerenciar" para criar seu primeiro evento e sorteio.</p>;
    }
    if (!selectedRaffle) {
        return <p className="text-2xl text-center text-gray-500">Selecione um sorteio no canto superior direito para começar.</p>;
    }
    if (isDrawing && countdown !== null) {
      return <CountdownDisplay count={countdown} />;
    }
    if (winner) {
      return <WinnerDisplay winner={winner} raffle={selectedRaffle} />;
    }
    if (noEligible) {
        return <p className="text-2xl text-center text-red-500">Todos os participantes para <span className="font-bold">{selectedRaffle.name}</span> já foram sorteados!</p>
    }
    return (
        <div className="text-center">
            <h2 className="text-4xl font-bold text-light-text dark:text-dark-text mb-4">Sorteio para <span className="text-transparent bg-clip-text bg-gradient-to-r from-light-primary to-light-secondary dark:from-dark-primary dark:to-dark-secondary">{selectedRaffle.name}</span></h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
                Total de {eligibleCount} participante{eligibleCount !== 1 ? 's' : ''} habilitado(s) para este sorteio!
            </p>
        </div>
    );
  };

  return (
    <div className="relative container mx-auto p-4 md:p-8 flex flex-col items-center justify-center min-h-[calc(100vh-128px)]">
      <EventSelector />
      {selectedEvent && <RaffleSelector />}
      <div className="w-full max-w-2xl mb-8 flex items-center justify-center min-h-[250px]">
        {renderContent()}
      </div>
      <button
        onClick={handleDraw}
        disabled={isDrawing || eligibleCount === 0 || !selectedEvent || !selectedRaffle}
        className="px-12 py-6 text-2xl font-bold text-white bg-gradient-to-r from-light-primary to-light-secondary dark:from-dark-primary dark:to-dark-secondary rounded-lg shadow-lg hover:scale-105 active:scale-100 transition-all duration-300 disabled:from-gray-500 disabled:to-gray-600 disabled:cursor-not-allowed disabled:transform-none animate-pulse disabled:animate-none"
      >
        {winner ? 'Sortear Novamente' : 'Sortear!'}
      </button>
    </div>
  );
};