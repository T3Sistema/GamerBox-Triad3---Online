// FIX: Provided full content for the Header component.

import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { ThemeToggle } from './ThemeToggle';
import { LogoutIcon } from './icons/LogoutIcon';
import { Triad3Logo } from './Triad3Logo';

export const Header: React.FC = () => {
  const { logout, loggedInOrganizer } = useData();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navLinkClasses = ({ isActive }: { isActive: boolean }) =>
    `px-3 py-2 rounded-md text-sm font-medium transition-colors ${
      isActive
        ? 'bg-light-primary/10 text-light-primary dark:bg-dark-primary/20 dark:text-dark-primary'
        : 'text-light-text hover:bg-light-border dark:text-dark-text dark:hover:bg-dark-border'
    }`;

  return (
    <header className="bg-light-card dark:bg-dark-card shadow-md sticky top-0 z-10">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Triad3Logo className="h-10 w-auto mr-4"/>
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-4">
                <NavLink to="/dashboard" className={navLinkClasses}>
                  Sorteio
                </NavLink>
                <NavLink to="/gerenciar" className={navLinkClasses}>
                  Gerenciar
                </NavLink>
                <NavLink to="/cadastro" className={navLinkClasses}>
                  Cadastro
                </NavLink>
                <NavLink to="/painel" className={navLinkClasses}>
                  Painel
                </NavLink>
                <NavLink to="/historico" className={navLinkClasses}>
                  Histórico
                </NavLink>
                 <NavLink to="/expositores" className={navLinkClasses}>
                  Expositores
                </NavLink>
              </div>
            </div>
          </div>
          <div className="flex items-center">
             <div className="text-right mr-4">
                <p className="text-sm font-medium text-light-text dark:text-dark-text">{loggedInOrganizer?.responsibleName}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{loggedInOrganizer?.name}</p>
             </div>
            <ThemeToggle />
            <button
              onClick={handleLogout}
              className="ml-4 p-2 rounded-full bg-light-card dark:bg-dark-card text-light-text dark:text-dark-text hover:bg-light-border dark:hover:bg-dark-border transition-colors duration-300"
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
