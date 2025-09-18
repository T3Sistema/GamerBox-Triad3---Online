import React, { useState, useEffect } from 'react';
import { useData } from '../context/DataContext';
import QRCode from 'qrcode';

const QRCodeModal: React.FC<{ 
  dataUrl: string; 
  cleanUrl: string;
  raffleName: string; 
  onClose: () => void 
}> = ({ dataUrl, cleanUrl, raffleName, onClose }) => {

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = `qrcode_${raffleName.replace(/\s+/g, '_')}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 animate-fadeIn" onClick={onClose}>
      <div className="bg-dark-card p-8 rounded-lg shadow-2xl text-center border border-dark-primary" onClick={e => e.stopPropagation()}>
        <h3 className="text-2xl font-bold text-dark-primary mb-2">QR Code para:</h3>
        <p className="text-xl text-dark-text mb-4">{raffleName}</p>
        <img src={dataUrl} alt={`QR Code for ${raffleName}`} className="mx-auto border-4 border-white rounded-lg"/>
        <p className="text-xs text-gray-400 mt-4 break-all max-w-xs">{cleanUrl}</p> 
        <div className="flex gap-4 mt-6">
          <button 
            onClick={handleDownload}
            className="flex-1 py-2 px-6 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors"
          >
            Download PNG
          </button>
          <button 
            onClick={onClose}
            className="flex-1 py-2 px-6 bg-dark-primary text-white font-semibold rounded-lg hover:opacity-80 transition-opacity"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};


export const GerenciarSorteios: React.FC = () => {
  const [eventName, setEventName] = useState('');
  const [raffleName, setRaffleName] = useState('');
  const [raffleQuantity, setRaffleQuantity] = useState(1);
  const [raffleCode, setRaffleCode] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [showRaffles, setShowRaffles] = useState(false);
  
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState('');
  const [qrCodeCleanUrl, setQrCodeCleanUrl] = useState('');
  const [qrRaffleName, setQrRaffleName] = useState('');

  const { 
      createEventWithRaffle, 
      organizerEvents, 
      selectedEvent, 
      setSelectedEventId,
      selectedEventRaffles,
      loggedInOrganizer,
  } = useData();

  useEffect(() => {
      setEventName(selectedEvent ? selectedEvent.name : '');
  }, [selectedEvent]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventName || !raffleName || !raffleCode || raffleQuantity < 1) {
        setMessage({ type: 'error', text: 'Por favor, preencha todos os campos obrigatórios.' });
        return;
    }
    
    setLoading(true);
    setMessage(null);

    const result = await createEventWithRaffle({
        eventName,
        raffleName,
        raffleQuantity,
        raffleCode,
    });
    setLoading(false);

    if (result.success) {
        setMessage({ type: 'success', text: result.message });
        setRaffleName('');
        setRaffleQuantity(1);
        setRaffleCode('');
        setShowRaffles(true);
    } else {
        setMessage({ type: 'error', text: result.message });
    }
  };
  
  const handleGenerateQrCode = async (raffleCode: string, raffleName: string) => {
    try {
      // Constrói a URL pública e absoluta para o QR Code.
      // Isso evita o problema da URL `blob:` que é local e temporária.
      const baseUrl = `${window.location.origin}${window.location.pathname}`;
      const participationUrl = `${baseUrl}#/participar?code=${raffleCode}`;
      
      const dataUrl = await QRCode.toDataURL(participationUrl, { width: 256, margin: 2 });
      setQrCodeDataUrl(dataUrl);
      setQrCodeCleanUrl(participationUrl);
      setQrRaffleName(raffleName);
    } catch (err) {
      console.error('Failed to generate QR code', err);
    }
  };

  return (
    <div className="container mx-auto p-4 md:p-8">
        {qrCodeDataUrl && <QRCodeModal 
            dataUrl={qrCodeDataUrl} 
            cleanUrl={qrCodeCleanUrl}
            raffleName={qrRaffleName} 
            onClose={() => setQrCodeDataUrl('')} 
        />}
        {organizerEvents.length > 0 && (
             <div className="max-w-md mx-auto mb-4">
                <label htmlFor="event-select" className="block text-sm font-medium text-gray-400 mb-1">
                    Gerenciar Evento Existente
                </label>
                <select
                id="event-select"
                value={selectedEvent?.id || ''}
                onChange={(e) => setSelectedEventId(e.target.value || null)}
                className="w-full bg-dark-card border border-dark-border rounded-md shadow-sm p-2 text-dark-text focus:outline-none focus:ring-1 focus:ring-dark-primary focus:border-dark-primary"
                >
                <option value="">-- Criar Novo Evento --</option>
                {organizerEvents.map(event => (
                    <option key={event.id} value={event.id}>
                    {event.name}
                    </option>
                ))}
                </select>
            </div>
        )}
        
       <div className="max-w-md mx-auto bg-dark-card p-8 rounded-2xl shadow-xl border border-cyan-500/30">
        <h2 className="text-2xl font-bold text-center text-cyan-400 uppercase tracking-widest mb-8">{selectedEvent ? 'Adicionar Sorteio' : 'Cadastrar Evento e Sorteio'}</h2>
        
        <form onSubmit={handleSubmit} className="space-y-6">
            <fieldset className="border border-yellow-500/50 rounded-lg p-4">
                <legend className="px-2 text-yellow-500 text-sm font-medium">Nome do Evento</legend>
                <input 
                    type="text" 
                    value={eventName}
                    onChange={(e) => setEventName(e.target.value)}
                    placeholder="Ex: Conferência Anual"
                    className="w-full bg-transparent p-2 text-dark-text focus:outline-none disabled:text-gray-400 disabled:cursor-not-allowed" 
                    required
                    disabled={!!selectedEvent}
                />
            </fieldset>

            <fieldset className="border border-purple-500/50 rounded-lg p-4 space-y-4">
                <legend className="px-2 text-purple-500 text-sm font-medium">Objeto do Sorteio</legend>
                <input 
                    type="text"
                    value={raffleName}
                    onChange={(e) => setRaffleName(e.target.value)}
                    placeholder="Ex: Monitor Gamer"
                    className="w-full bg-transparent p-2 text-dark-text focus:outline-none"
                    required
                />
                <div className="flex items-center space-x-4">
                    <label htmlFor="quantity" className="text-sm text-gray-400">QTD:</label>
                    <input
                        type="number"
                        id="quantity"
                        value={raffleQuantity}
                        onChange={(e) => setRaffleQuantity(parseInt(e.target.value, 10))}
                        min="1"
                        className="w-24 bg-dark-background border border-dark-border rounded-md p-2 text-dark-text focus:outline-none focus:ring-2 focus:ring-purple-500"
                        required
                    />
                </div>
            </fieldset>
            
            <fieldset className="border border-red-500/50 rounded-lg p-4">
                <legend className="px-2 text-red-500 text-sm font-medium">Código do Sorteio</legend>
                 <div className="flex items-center">
                     {loggedInOrganizer?.organizerCode && (
                        <span className="text-gray-400 font-mono">{loggedInOrganizer.organizerCode}</span>
                     )}
                     <input 
                        type="text" 
                        value={raffleCode}
                        onChange={(e) => setRaffleCode(e.target.value.toUpperCase())}
                        placeholder="PROMO4K"
                        className="w-full bg-transparent text-dark-text focus:outline-none" 
                        required
                    />
                 </div>
            </fieldset>
            
            <button 
                type="submit" 
                disabled={loading}
                className="w-full py-3 px-4 font-bold text-white uppercase bg-gradient-to-r from-dark-primary to-dark-secondary rounded-lg shadow-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed">
                {loading ? 'Salvando...' : 'Salvar Sorteio'}
            </button>
        </form>

        {selectedEvent && (
          <div className="mt-6 border-t border-dark-border pt-6">
            <button
              onClick={() => setShowRaffles(!showRaffles)}
              className="w-full text-center py-2 px-4 font-semibold text-cyan-300 bg-cyan-500/10 hover:bg-cyan-500/20 rounded-lg transition-colors"
            >
              {showRaffles ? 'Ocultar Sorteios' : `Visualizar Sorteios Ativos (${selectedEventRaffles.length})`}
            </button>
            {showRaffles && (
              <div className="mt-4 space-y-3 animate-fadeIn">
                {selectedEventRaffles.length > 0 ? (
                  selectedEventRaffles.map(raffle => (
                    <div key={raffle.id} className="bg-dark-background p-3 rounded-md border border-dark-border">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-semibold text-dark-text">{raffle.name}</p>
                          <div className="flex items-center gap-x-4 text-sm text-gray-400">
                            <span>Qtd: {raffle.quantity}</span>
                            <span className="font-mono">Código: {raffle.code}</span>
                          </div>
                        </div>
                        <button 
                            onClick={() => handleGenerateQrCode(raffle.code, raffle.name)}
                            className="text-xs py-1 px-3 bg-dark-primary text-white font-semibold rounded-full hover:opacity-80 transition-opacity"
                        >
                          QR Code
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-center text-sm text-gray-500">Nenhum sorteio cadastrado para este evento.</p>
                )}
              </div>
            )}
          </div>
        )}

        {message && (
          <div className={`mt-4 p-3 rounded-md text-center text-sm ${message.type === 'success' ? 'bg-green-900/50 text-green-300' : 'bg-red-900/50 text-red-300'}`}>
            {message.text}
          </div>
        )}
      </div>
    </div>
  );
};