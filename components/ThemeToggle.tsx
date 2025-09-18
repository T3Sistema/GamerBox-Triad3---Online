
import React from 'react';
import { useTheme } from '../context/ThemeContext';
import { SunIcon } from './icons/SunIcon';
import { MoonIcon } from './icons/MoonIcon';

export const ThemeToggle: React.FC = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-full bg-light-card dark:bg-dark-card text-light-text dark:text-dark-text hover:bg-light-border dark:hover:bg-dark-border transition-colors duration-300"
      aria-label="Toggle theme"
    >
      {theme === 'light' ? <MoonIcon className="w-5 h-5" /> : <SunIcon className="w-5 h-5" />}
    </button>
  );
};
