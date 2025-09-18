import React from 'react';

interface QRCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  dataUrl: string;
  cleanUrl: string;
  companyName: string;
}

export const QRCodeModal: React.FC<QRCodeModalProps> = ({ isOpen, onClose, dataUrl, cleanUrl, companyName }) => {
  if (!isOpen) return null;
  
  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = `qrcode_roleta_${companyName.replace(/\s+/g, '_')}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 animate-fadeIn p-4" onClick={onClose}>
      <div className="bg-dark-card p-8 rounded-lg shadow-2xl text-center border border-dark-primary" onClick={e => e.stopPropagation()}>
        <h3 className="text-2xl font-bold text-dark-primary mb-2">QR Code da Roleta</h3>
        <p className="text-xl text-dark-text mb-4">{companyName}</p>
        <div className="bg-white p-2 rounded-lg inline-block">
            <img src={dataUrl} alt={`QR Code for Roleta de ${companyName}`} className="mx-auto" />
        </div>
        <p className="text-xs text-gray-400 mt-4 break-all max-w-xs">{cleanUrl}</p> 
        <div className="flex flex-col sm:flex-row gap-4 mt-6">
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