
import React from 'react';
import { useData } from '../context/DataContext';

export const Painel: React.FC = () => {
  const { participants, selectedEvent } = useData();

  return (
    <div className="container mx-auto p-4 md:p-8">
      <h2 className="text-3xl font-bold text-light-text dark:text-dark-text mb-6 text-center">
        Painel de Participantes
      </h2>
      {selectedEvent ? (
        <>
        <p className="text-center text-gray-500 dark:text-gray-400 mb-6 -mt-4">
          Evento: <span className="font-semibold text-light-primary dark:text-dark-primary">{selectedEvent.name}</span>
        </p>
        <div className="bg-light-card dark:bg-dark-card shadow-xl rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-light-border dark:divide-dark-border">
              <thead className="bg-light-card dark:bg-dark-card">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-light-text dark:text-dark-text uppercase tracking-wider">Nome</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-light-text dark:text-dark-text uppercase tracking-wider">Telefone</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-light-text dark:text-dark-text uppercase tracking-wider">E-mail</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-light-text dark:text-dark-text uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="bg-light-background dark:bg-dark-background divide-y divide-light-border dark:divide-dark-border">
                {participants.map((participant) => (
                  <tr key={participant.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-light-text dark:text-dark-text">{participant.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{participant.phone}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{participant.email}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {participant.isWinner ? (
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                          Sorteado
                        </span>
                      ) : (
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                          Aguardando
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
         {participants.length === 0 && (
            <p className="text-center text-gray-500 dark:text-gray-400 mt-8">Nenhum participante cadastrado para este evento.</p>
        )}
        </>
      ) : (
        <p className="text-center text-gray-500 dark:text-gray-400 mt-8">Nenhum evento selecionado. Crie ou selecione um evento no Dashboard.</p>
      )}
    </div>
  );
};