import React from 'react';
import { useData } from '../context/DataContext';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';


export const Historico: React.FC = () => {
  const { winners, selectedEvent } = useData();

  const handleDownloadCSV = () => {
    if (winners.length === 0) return;

    const headers = ['Nome do Ganhador', 'Telefone', 'Data do Sorteio'];
    const csvContent = [
      headers.join(','),
      ...[...winners].reverse().map(w => [
        `"${w.name}"`,
        `"${w.phone}"`,
        `"${new Date(w.drawnAt).toLocaleString('pt-BR')}"`
      ].join(','))
    ].join('\n');

    const blob = new Blob([`\uFEFF${csvContent}`], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `historico_${selectedEvent?.name.replace(/\s+/g, '_') || 'sorteio'}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDownloadPDF = () => {
      if (winners.length === 0) return;

      const doc = new jsPDF();
      
      autoTable(doc, {
        head: [['Nome do Ganhador', 'Telefone', 'Data do Sorteio']],
        body: [...winners].reverse().map(w => [
          w.name,
          w.phone,
          new Date(w.drawnAt).toLocaleString('pt-BR')
        ]),
        startY: 20,
        didDrawPage: (data) => {
            doc.setFontSize(20);
            doc.setTextColor(40);
            doc.text(`Histórico - ${selectedEvent?.name || 'Sorteios'}`, data.settings.margin.left, 15);
        }
      });

      doc.save(`historico_${selectedEvent?.name.replace(/\s+/g, '_') || 'sorteio'}.pdf`);
  };


  return (
    <div className="container mx-auto p-4 md:p-8">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-2 gap-4">
        <h2 className="text-3xl font-bold text-light-text dark:text-dark-text text-center">Histórico de Sorteios</h2>
        <div className="flex space-x-2">
            <button 
              onClick={handleDownloadCSV}
              disabled={winners.length === 0}
              className="px-4 py-2 text-sm font-medium text-light-primary dark:text-dark-primary border border-light-primary dark:border-dark-primary rounded-md shadow-sm hover:bg-light-primary/10 dark:hover:bg-dark-primary/10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Download CSV
            </button>
            <button 
              onClick={handleDownloadPDF}
              disabled={winners.length === 0}
              className="px-4 py-2 text-sm font-medium text-white bg-light-primary dark:bg-dark-primary rounded-md shadow-sm hover:bg-opacity-80 dark:hover:bg-opacity-80 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Download PDF
            </button>
        </div>
      </div>
      {selectedEvent ? (
        <>
          <p className="text-center sm:text-left text-gray-500 dark:text-gray-400 mb-6">
            Evento: <span className="font-semibold text-light-primary dark:text-dark-primary">{selectedEvent.name}</span>
          </p>
          <div className="bg-light-card dark:bg-dark-card shadow-xl rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-light-border dark:divide-dark-border">
                <thead className="bg-light-card dark:bg-dark-card">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-light-text dark:text-dark-text uppercase tracking-wider">Nome do Ganhador</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-light-text dark:text-dark-text uppercase tracking-wider">Telefone</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-light-text dark:text-dark-text uppercase tracking-wider">Data do Sorteio</th>
                  </tr>
                </thead>
                <tbody className="bg-light-background dark:bg-dark-background divide-y divide-light-border dark:divide-dark-border">
                  {[...winners].reverse().map((winner) => (
                    <tr key={winner.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-light-text dark:text-dark-text">{winner.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{winner.phone}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{new Date(winner.drawnAt).toLocaleString('pt-BR')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          {winners.length === 0 && (
              <p className="text-center text-gray-500 dark:text-gray-400 mt-8">Nenhum sorteio foi realizado para este evento ainda.</p>
          )}
        </>
      ) : (
         <p className="text-center text-gray-500 dark:text-gray-400 mt-8">Nenhum evento selecionado. Crie ou selecione um evento no Dashboard.</p>
      )}
    </div>
  );
};