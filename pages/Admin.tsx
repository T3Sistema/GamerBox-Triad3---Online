// FIX: Provided full content for the Admin layout component.

import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { Triad3Logo } from '../components/Triad3Logo';

export const Admin: React.FC = () => {
    const { isSuperAdmin, logoutSuperAdmin } = useData();

    if (!isSuperAdmin) {
        return <Navigate to="/admin-login" replace />;
    }

    return (
        <div className="bg-dark-background text-dark-text min-h-screen">
            <header className="bg-dark-card border-b border-dark-border p-4 flex justify-between items-center sticky top-0 z-20">
                <div className="flex items-center gap-4">
                    <Triad3Logo className="h-10 w-auto" />
                    <h1 className="text-xl font-bold text-dark-primary">Painel de Administração</h1>
                </div>
                <button onClick={logoutSuperAdmin} className="font-semibold text-dark-primary hover:underline">Sair</button>
            </header>
            <main>
                <Outlet />
            </main>
        </div>
    );
};
