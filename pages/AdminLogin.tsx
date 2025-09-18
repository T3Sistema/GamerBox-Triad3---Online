import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { Link } from 'react-router-dom';
import { Triad3Logo } from '../components/Triad3Logo';

export const AdminLogin: React.FC = () => {
  const [email, setEmail] = useState('triad3@triad3.io');
  const [password, setPassword] = useState('123');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { loginSuperAdmin } = useData();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const result = await loginSuperAdmin(email, password);
    if (!result.success) {
      setError(result.message);
      setLoading(false);
    }
    // On success, the App component will handle the redirect.
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-dark-background px-4">
      <div className="w-full max-w-md">
        <div className="bg-dark-card p-8 rounded-lg shadow-xl text-center">
            <Triad3Logo className="w-48 mx-auto mb-6" />
            <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-dark-primary to-dark-secondary mb-2">Login de Administrador</h1>
            <p className="text-gray-400 mb-6">Acesso restrito ao painel de controle.</p>
            <form onSubmit={handleSubmit} className="space-y-6 text-left">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-dark-text">E-mail</label>
                <input 
                  type="email" 
                  id="email" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                  required 
                  className="mt-1 block w-full px-3 py-2 bg-dark-background border border-dark-border rounded-md shadow-sm focus:outline-none focus:ring-dark-primary focus:border-dark-primary sm:text-sm" 
                />
              </div>
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-dark-text">Senha</label>
                <input 
                  type="password" 
                  id="password" 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                  required 
                  className="mt-1 block w-full px-3 py-2 bg-dark-background border border-dark-border rounded-md shadow-sm focus:outline-none focus:ring-dark-primary focus:border-dark-primary sm:text-sm" 
                />
              </div>
               {error && <p className="text-sm text-red-500 text-center">{error}</p>}
              <div>
                <button type="submit" disabled={loading} className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gradient-to-r from-dark-primary to-dark-secondary hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-dark-primary disabled:from-gray-500 disabled:to-gray-600 transition-opacity">
                  {loading ? 'Entrando...' : 'Entrar'}
                </button>
              </div>
            </form>
        </div>
        <div className="text-center mt-4">
            <Link to="/login" className="text-sm text-dark-primary hover:underline">
                É um organizador? Faça Login &rarr;
            </Link>
        </div>
      </div>
    </div>
  );
};
