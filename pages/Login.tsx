import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { Link } from 'react-router-dom';
import { Triad3Logo } from '../components/Triad3Logo';

export const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, loginSuperAdmin } = useData();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Tenta o login de admin primeiro
    const adminResult = await loginSuperAdmin(email, password);
    if (adminResult.success) {
      // O sucesso irá disparar o redirecionamento no App.tsx
      return;
    }
    
    // Se o login de admin falhar, tenta o de organizador
    const organizerResult = await login(email, password);
    if (organizerResult.success) {
      // O sucesso irá disparar o redirecionamento no App.tsx
      return;
    }

    // Se ambos falharem
    setError('E-mail ou senha inválidos.');
    setLoading(false);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-light-background dark:bg-dark-background px-4">
      <div className="w-full max-w-md">
        <div className="bg-light-card dark:bg-dark-card p-8 rounded-lg shadow-xl text-center">
            <Triad3Logo className="w-48 mx-auto mb-6" />
            <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-light-primary to-light-secondary dark:from-dark-primary dark:to-dark-secondary mb-2">Acesso Restrito</h1>
            <p className="text-gray-500 dark:text-gray-400 mb-6">Login para Administradores e Organizadores.</p>
            <form onSubmit={handleSubmit} className="space-y-6 text-left">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-light-text dark:text-dark-text">E-mail</label>
                <input 
                  type="email" 
                  id="email" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                  required 
                  className="mt-1 block w-full px-3 py-2 bg-light-background dark:bg-dark-background border border-light-border dark:border-dark-border rounded-md shadow-sm focus:outline-none focus:ring-light-primary focus:border-light-primary dark:focus:ring-dark-primary dark:focus:border-dark-primary sm:text-sm" 
                />
              </div>
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-light-text dark:text-dark-text">Senha</label>
                <input 
                  type="password" 
                  id="password" 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                  required 
                  className="mt-1 block w-full px-3 py-2 bg-light-background dark:bg-dark-background border border-light-border dark:border-dark-border rounded-md shadow-sm focus:outline-none focus:ring-light-primary focus:border-light-primary dark:focus:ring-dark-primary dark:focus:border-dark-primary sm:text-sm" 
                />
              </div>
               {error && <p className="text-sm text-red-500 text-center">{error}</p>}
              <div>
                <button type="submit" disabled={loading} className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-light-primary hover:opacity-90 dark:bg-gradient-to-r dark:from-dark-primary dark:to-dark-secondary dark:hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-light-primary dark:focus:ring-dark-primary disabled:bg-gray-400 dark:disabled:from-gray-500 dark:disabled:to-gray-600 transition-opacity">
                  {loading ? 'Entrando...' : 'Entrar'}
                </button>
              </div>
            </form>
        </div>
        <div className="text-center mt-4">
            <Link to="/" className="text-sm text-light-primary dark:text-dark-primary hover:underline">
                &larr; Voltar para Check-in de Colaboradores
            </Link>
        </div>
      </div>
    </div>
  );
};