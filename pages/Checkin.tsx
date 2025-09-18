import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { Link, useNavigate } from 'react-router-dom';
import { Triad3Logo } from '../components/Triad3Logo';

export const Checkin: React.FC = () => {
  const [companyCode, setCompanyCode] = useState('');
  const [personalCode, setPersonalCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { validateCollaborator } = useData();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const result = await validateCollaborator(companyCode, personalCode);
    if (result.success) {
      navigate('/collaborator-dashboard');
    } else {
      setError(result.message);
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-dark-background px-4">
      <div className="w-full max-w-md">
        <div className="bg-dark-card p-8 rounded-lg shadow-xl text-center">
            <Triad3Logo className="w-48 mx-auto mb-6" />
            <h1 className="text-3xl font-bold text-dark-primary mb-2">GamerBox Triad3</h1>
            <p className="text-gray-400 mb-6">Acesso da Equipe e Colaboradores</p>
            <form onSubmit={handleSubmit} className="space-y-6 text-left">
              <div>
                <label htmlFor="companyCode" className="block text-sm font-medium text-dark-text">Código da Empresa / Estande</label>
                <input 
                  type="text" 
                  id="companyCode" 
                  value={companyCode} 
                  onChange={(e) => setCompanyCode(e.target.value.toUpperCase())} 
                  required 
                  className="mt-1 block w-full px-3 py-2 bg-dark-background border border-dark-border rounded-md shadow-sm focus:outline-none focus:ring-dark-primary focus:border-dark-primary sm:text-sm uppercase" 
                />
              </div>
              <div>
                <label htmlFor="personalCode" className="block text-sm font-medium text-dark-text">Seu Código Pessoal</label>
                <input 
                  type="text" 
                  id="personalCode" 
                  value={personalCode} 
                  onChange={(e) => setPersonalCode(e.target.value.toUpperCase())} 
                  required 
                  className="mt-1 block w-full px-3 py-2 bg-dark-background border border-dark-border rounded-md shadow-sm focus:outline-none focus:ring-dark-primary focus:border-dark-primary sm:text-sm uppercase" 
                />
              </div>
               {error && <p className="text-sm text-red-500 text-center">{error}</p>}
              <div>
                <button type="submit" disabled={loading} className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-black bg-dark-primary hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-dark-primary disabled:bg-gray-400 disabled:from-gray-500 disabled:to-gray-600 transition-opacity">
                  {loading ? 'Verificando...' : 'Entrar'}
                </button>
              </div>
            </form>
        </div>
        <div className="text-center mt-4">
            <Link to="/login" className="text-sm text-dark-primary hover:underline">
                Acesso Restrito (Admin/Organizador)
            </Link>
        </div>
      </div>
    </div>
  );
};