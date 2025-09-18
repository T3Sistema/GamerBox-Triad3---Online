import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../../context/DataContext';
import { ThemeToggle } from '../ThemeToggle';
import { LogoutIcon } from '../icons/LogoutIcon';
import { Triad3Logo } from '../Triad3Logo';

export const CollaboratorHeader: React.FC = () => {
  const { logoutCollaborator, loggedInCollaborator, loggedInCollaboratorCompany } = useData();
  const navigate = useNavigate();

  const handleLogout = () => {
    logoutCollaborator();
    navigate('/');
  };

  if (!loggedInCollaborator || !loggedInCollaboratorCompany) return null;

  return (
    <header className="bg-light-card dark:bg-dark-card shadow-md sticky top-0 z-10">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Triad3Logo className="h-10 w-auto mr-4"/>
            <div className="hidden md:block">
                <h1 className="text-xl font-bold text-light-text dark:text-dark-text">{loggedInCollaboratorCompany.name}</h1>
            </div>
          </div>
          <div className="flex items-center">
             <div className="text-right mr-3">
                <p className="text-sm font-medium text-light-text dark:text-dark-text">{loggedInCollaborator.name}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Colaborador(a)</p>
             </div>
             <img src={loggedInCollaborator.photoUrl || `https://i.pravatar.cc/150?u=${loggedInCollaborator.id}`} alt={loggedInCollaborator.name} className="h-10 w-10 rounded-full object-cover" />
            <div className="ml-2">
                <ThemeToggle />
            </div>
            <button
              onClick={handleLogout}
              className="ml-2 p-2 rounded-full bg-light-card dark:bg-dark-card text-light-text dark:text-dark-text hover:bg-light-border dark:hover:bg-dark-border transition-colors duration-300"
              aria-label="Logout"
            >
              <LogoutIcon className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};