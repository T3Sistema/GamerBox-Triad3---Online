
import React, { useState } from 'react';
import { useData } from '../context/DataContext';

export const Cadastro: React.FC = () => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const { addParticipant, selectedEvent, selectedRaffle, selectedEventRaffles, setSelectedRaffleId } = useData();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone || !email || !selectedRaffle) {
      setMessage({ type: 'error', text: 'Por favor, preencha todos os campos e selecione um sorteio.' });
      return;
    }
    setLoading(true);
    setMessage(null);
    const result = await addParticipant({ name, phone, email, raffleId: selectedRaffle.id });
    setLoading(false);

    if(result.success) {
        setMessage({ type: 'success', text: result.message });
        setName('');
        setPhone('');
        setEmail('');
    } else {
        setMessage({ type: 'error', text: result.message });
    }
  };

  return (
    <div className="container mx-auto p-4 md:p-8">
      <div className="max-w-lg mx-auto bg-light-card dark:bg-dark-card p-8 rounded-lg shadow-xl">
        <h2 className="text-3xl font-bold text-center text-light-text dark:text-dark-text mb-2">Cadastrar Participante (Manual)</h2>
        {selectedEvent ? (
            <p className="text-center text-gray-500 dark:text-gray-400 mb-6">Para o evento: <span className="font-semibold text-light-primary dark:text-dark-primary">{selectedEvent.name}</span></p>
        ) : (
            <p className="text-center text-yellow-500 mb-6">Nenhum evento selecionado. Crie ou selecione um evento na tela "Gerenciar".</p>
        )}
        <form onSubmit={handleSubmit} className="space-y-6">
           <div>
              <label htmlFor="raffle-select" className="block text-sm font-medium text-light-text dark:text-dark-text">Sorteio</label>
              <select
                id="raffle-select"
                value={selectedRaffle?.id || ''}
                onChange={(e) => setSelectedRaffleId(e.target.value || null)}
                disabled={!selectedEvent || loading}
                className="mt-1 block w-full px-3 py-2 bg-light-background dark:bg-dark-background border border-light-border dark:border-dark-border rounded-md shadow-sm focus:outline-none focus:ring-light-primary focus:border-light-primary dark:focus:ring-dark-primary dark:focus:border-dark-primary sm:text-sm disabled:opacity-50"
              >
                <option value="">-- Selecione um Sorteio --</option>
                {selectedEventRaffles.map(raffle => (
                    <option key={raffle.id} value={raffle.id}>
                        {raffle.name}
                    </option>
                ))}
              </select>
            </div>
          <fieldset disabled={!selectedRaffle || loading}>
            <div className="space-y-6">
                <div>
                <label htmlFor="name" className="block text-sm font-medium text-light-text dark:text-dark-text">Nome</label>
                <input type="text" id="name" value={name} onChange={(e) => setName(e.target.value)} className="mt-1 block w-full px-3 py-2 bg-light-background dark:bg-dark-background border border-light-border dark:border-dark-border rounded-md shadow-sm focus:outline-none focus:ring-light-primary focus:border-light-primary dark:focus:ring-dark-primary dark:focus:border-dark-primary sm:text-sm disabled:opacity-50" />
                </div>
                <div>
                <label htmlFor="phone" className="block text-sm font-medium text-light-text dark:text-dark-text">Telefone</label>
                <input type="tel" id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} className="mt-1 block w-full px-3 py-2 bg-light-background dark:bg-dark-background border border-light-border dark:border-dark-border rounded-md shadow-sm focus:outline-none focus:ring-light-primary focus:border-light-primary dark:focus:ring-dark-primary dark:focus:border-dark-primary sm:text-sm disabled:opacity-50" />
                </div>
                <div>
                <label htmlFor="email" className="block text-sm font-medium text-light-text dark:text-dark-text">E-mail</label>
                <input type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1 block w-full px-3 py-2 bg-light-background dark:bg-dark-background border border-light-border dark:border-dark-border rounded-md shadow-sm focus:outline-none focus:ring-light-primary focus:border-light-primary dark:focus:ring-dark-primary dark:focus:border-dark-primary sm:text-sm disabled:opacity-50" />
                </div>
                <div>
                <button type="submit" className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-light-primary hover:bg-opacity-80 dark:bg-dark-primary dark:hover:bg-opacity-80 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-light-primary dark:focus:ring-dark-primary disabled:bg-gray-400 dark:disabled:bg-gray-600 transition-colors">
                    {loading ? 'Cadastrando...' : 'Cadastrar'}
                </button>
                </div>
            </div>
          </fieldset>
        </form>
        {message && (
          <div className={`mt-4 p-3 rounded-md text-center ${message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
            {message.text}
          </div>
        )}
      </div>
    </div>
  );
};
