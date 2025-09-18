import React, { useState, useEffect } from 'react';
import { useData } from '../context/DataContext';
import { Raffle, Event } from '../types';
import { Link, useSearchParams } from 'react-router-dom';
import { Triad3Logo } from '../components/Triad3Logo';

export const Participar: React.FC = () => {
    const [step, setStep] = useState<'enterCode' | 'register' | 'success'>('enterCode');
    const [raffleCode, setRaffleCode] = useState('');
    const [foundRaffle, setFoundRaffle] = useState<(Raffle & { event: Event }) | null>(null);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
    
    // Form fields
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [email, setEmail] = useState('');

    const { findRaffleByCode, addParticipant } = useData();
    const [searchParams] = useSearchParams();

    const handleCodeSubmit = async (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!raffleCode) return;
        setLoading(true);
        setMessage(null);
        const raffle = await findRaffleByCode(raffleCode);
        setLoading(false);
        if (raffle) {
            setFoundRaffle(raffle);
            setStep('register');
        } else {
            setMessage({ type: 'error', text: 'Código do sorteio não encontrado. Verifique e tente novamente.' });
        }
    };
    
    // Check for URL param on initial render
    useEffect(() => {
        const codeFromUrl = searchParams.get('code');
        if (codeFromUrl) {
            setRaffleCode(codeFromUrl.toUpperCase());
            // Automatically submit if code is in URL
            // Using a temporary variable because state update is async
            const findAndSetRaffle = async (code: string) => {
                 setLoading(true);
                 const raffle = await findRaffleByCode(code);
                 setLoading(false);
                 if (raffle) {
                     setFoundRaffle(raffle);
                     setStep('register');
                 } else {
                     setMessage({ type: 'error', text: 'Código do sorteio da URL é inválido.' });
                 }
            };
            findAndSetRaffle(codeFromUrl);
        }
    }, [searchParams]);

    const handleRegisterSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name || !phone || !email || !foundRaffle) {
            setMessage({ type: 'error', text: 'Por favor, preencha todos os campos.' });
            return;
        }
        setLoading(true);
        setMessage(null);
        const result = await addParticipant({ name, phone, email, raffleId: foundRaffle.id });
        setLoading(false);

        if(result.success) {
            setMessage({ type: 'success', text: result.message + ' Boa sorte!' });
            setStep('success');
        } else {
            setMessage({ type: 'error', text: result.message });
        }
    };

    const resetFlow = () => {
        setStep('enterCode');
        setRaffleCode('');
        setFoundRaffle(null);
        setMessage(null);
        setName('');
        setPhone('');
        setEmail('');
    };

    const renderContent = () => {
        switch (step) {
            case 'enterCode':
                return (
                    <>
                        <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-light-primary to-light-secondary dark:from-dark-primary dark:to-dark-secondary mb-2">Participar de Sorteio</h1>
                        <p className="text-gray-500 dark:text-gray-400 mb-6">Insira o código do sorteio para se cadastrar.</p>
                        <form onSubmit={handleCodeSubmit} className="space-y-6 text-left">
                            <div>
                                <label htmlFor="raffle-code" className="block text-sm font-medium text-light-text dark:text-dark-text">Código do Sorteio</label>
                                <input
                                    type="text"
                                    id="raffle-code"
                                    value={raffleCode}
                                    onChange={e => setRaffleCode(e.target.value.toUpperCase())}
                                    placeholder="EX: TCNFTECH4K"
                                    required
                                    className="mt-1 block w-full px-3 py-2 bg-light-background dark:bg-dark-background border border-light-border dark:border-dark-border rounded-md shadow-sm focus:outline-none focus:ring-light-primary focus:border-light-primary dark:focus:ring-dark-primary dark:focus:border-dark-primary sm:text-sm"
                                />
                            </div>
                            <button type="submit" disabled={loading} className="w-full btn-primary">
                                {loading ? 'Buscando...' : 'Encontrar Sorteio'}
                            </button>
                        </form>
                    </>
                );
            case 'register':
                 if (!foundRaffle) return null;
                 return (
                    <>
                        <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-light-primary to-light-secondary dark:from-dark-primary dark:to-dark-secondary mb-2">Inscrição para <span className="text-yellow-400">{foundRaffle.name}</span></h1>
                        <p className="text-gray-500 dark:text-gray-400 mb-6">Evento: <span className="font-semibold text-dark-text">{foundRaffle.event.name}</span></p>
                         <form onSubmit={handleRegisterSubmit} className="space-y-6 text-left">
                            <div>
                                <label htmlFor="name" className="block text-sm font-medium">Nome</label>
                                <input type="text" id="name" value={name} onChange={e => setName(e.target.value)} required className="mt-1 w-full input-style" />
                            </div>
                             <div>
                                <label htmlFor="phone" className="block text-sm font-medium">Telefone</label>
                                <input type="tel" id="phone" value={phone} onChange={e => setPhone(e.target.value)} required className="mt-1 w-full input-style" />
                            </div>
                             <div>
                                <label htmlFor="email" className="block text-sm font-medium">E-mail</label>
                                <input type="email" id="email" value={email} onChange={e => setEmail(e.target.value)} required className="mt-1 w-full input-style" />
                            </div>
                            <button type="submit" disabled={loading} className="w-full btn-primary">
                                {loading ? 'Cadastrando...' : 'Finalizar Cadastro'}
                            </button>
                         </form>
                    </>
                 );
            case 'success':
                return (
                    <div className="text-center">
                         <h1 className="text-3xl font-bold text-green-400 mb-2">Sucesso!</h1>
                         <p className="text-gray-300 mb-6">{message?.text}</p>
                         <button onClick={resetFlow} className="w-full btn-secondary">
                            Cadastrar em outro sorteio
                         </button>
                    </div>
                );
        }
    };
    
    return (
        <div className="flex items-center justify-center min-h-screen bg-light-background dark:bg-dark-background px-4">
          <div className="w-full max-w-md">
            <div className="bg-light-card dark:bg-dark-card p-8 rounded-lg shadow-xl text-center">
                <Triad3Logo className="w-48 mx-auto mb-6" />
                {renderContent()}
                {message && step !== 'success' && (
                  <div className={`mt-4 p-3 rounded-md text-center text-sm ${message.type === 'success' ? 'bg-green-900/50 text-green-300' : 'bg-red-900/50 text-red-300'}`}>
                    {message.text}
                  </div>
                )}
            </div>
             <div className="text-center mt-4">
                <Link to="/login" className="text-sm text-light-primary dark:text-dark-primary hover:underline">
                    É um organizador? Faça Login &rarr;
                </Link>
            </div>
          </div>
          <style>{`
            .input-style {
                display: block; width: 100%; padding: 0.75rem; background-color: #05080F;
                border: 1px solid #1A202C; border-radius: 0.375rem; color: #E0E0E0;
            }
            .btn-primary {
                padding: 0.75rem 1rem; border-radius: 0.375rem; font-weight: 600; color: white;
                background-image: linear-gradient(to right, #00D1FF, #0052FF);
                transition: opacity 0.2s;
            }
            .btn-primary:hover { opacity: 0.9; }
            .btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }
            .btn-secondary {
                 padding: 0.75rem 1rem; border-radius: 0.375rem; font-weight: 600; color: #E0E0E0;
                background-color: #1A202C; transition: background-color 0.2s;
            }
            .btn-secondary:hover { background-color: #2d2d2d; }
          `}</style>
        </div>
    );
};