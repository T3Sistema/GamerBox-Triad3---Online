import React from 'react';
import { useData } from '../context/DataContext';
import { GamepadIcon } from '../components/icons/GamepadIcon';
import { TicketIcon } from '../components/icons/TicketIcon';
import { Link } from 'react-router-dom';

const SystemCard: React.FC<{ title: string; description: string; enabled: boolean; icon: React.ReactNode; to: string; }> = ({ title, description, enabled, icon, to }) => {
    
    const content = (
         <div className={`
            p-6 rounded-lg shadow-lg border transition-all duration-300 transform
            ${enabled ? 'bg-light-card dark:bg-dark-card border-light-border dark:border-dark-border cursor-pointer hover:-translate-y-1 hover:shadow-xl hover:border-light-primary dark:hover:border-dark-primary' : 'bg-gray-100 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 opacity-60'}
        `}>
            <div className="flex items-center gap-4">
                <div className={`p-3 rounded-full ${enabled ? 'bg-light-primary/10 dark:bg-dark-primary/20 text-light-primary dark:text-dark-primary' : 'bg-gray-300 dark:bg-gray-600 text-gray-500'}`}>
                    {icon}
                </div>
                <div>
                    <h3 className="text-xl font-bold text-light-text dark:text-dark-text">{title}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{description}</p>
                </div>
            </div>
            {!enabled && (
                <p className="mt-4 text-xs text-center text-gray-500 dark:text-gray-500 bg-gray-200 dark:bg-gray-700/50 py-1 rounded-full">Sistema indisponível para este estande</p>
            )}
        </div>
    );
    
    if (enabled) {
        return <Link to={to}>{content}</Link>;
    }

    return content;
};


export const CollaboratorDashboard: React.FC = () => {
    const { loggedInCollaborator, loggedInCollaboratorCompany } = useData();

    if (!loggedInCollaborator || !loggedInCollaboratorCompany) {
        return <div className="text-center p-8">Carregando...</div>;
    }
    
    return (
        <div className="container mx-auto p-4 md:p-8 animate-fadeIn">
            <div className="text-center mb-12">
                <img 
                    src={loggedInCollaborator.photoUrl || `https://i.pravatar.cc/150?u=${loggedInCollaborator.id}`} 
                    alt={loggedInCollaborator.name}
                    className="w-32 h-32 rounded-full object-cover mx-auto mb-4 border-4 border-light-primary dark:border-dark-primary shadow-lg"
                />
                <h1 className="text-4xl font-bold text-light-text dark:text-dark-text">Bem-vindo(a), {loggedInCollaborator.name.split(' ')[0]}!</h1>
                <p className="text-lg text-gray-500 dark:text-gray-400">Você está logado no estande <span className="font-semibold text-light-primary dark:text-dark-primary">{loggedInCollaboratorCompany.name}</span>.</p>
            </div>
            
            <div className="max-w-3xl mx-auto">
                 <h2 className="text-2xl font-semibold text-light-text dark:text-dark-text mb-6 text-center">Sistemas Disponíveis</h2>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <SystemCard 
                        title="GamerBox Triad3"
                        description="Sistema de sorteio para eventos"
                        enabled={loggedInCollaboratorCompany.hasSorteio}
                        icon={<TicketIcon className="w-6 h-6" />}
                        to="/collaborator-sorteio"
                    />
                     <SystemCard 
                        title="Roleta de Prêmios"
                        description="Roleta interativa para prêmios"
                        enabled={loggedInCollaboratorCompany.hasRoleta}
                        icon={<GamepadIcon className="w-6 h-6" />}
                        to="/collaborator-roleta"
                    />
                 </div>
            </div>
        </div>
    );
};