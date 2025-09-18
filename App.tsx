// FIX: Provided full content for the App component.

import React from 'react';
import { HashRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { DataProvider, useData } from './context/DataContext';

import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { ImpersonationBar } from './components/admin/ImpersonationBar';
import { CollaboratorHeader } from './components/collaborator/CollaboratorHeader';

import { Checkin } from './pages/Checkin';
import { Login } from './pages/Login';
import { Participar } from './pages/Participar';

import { Dashboard } from './pages/Dashboard';
import { Cadastro } from './pages/Cadastro';
import { Painel } from './pages/Painel';
import { Historico } from './pages/Historico';
import { GerenciarSorteios } from './pages/GerenciarSorteios';
import { Expositores } from './pages/Expositores';
import { CollaboratorDashboard } from './pages/CollaboratorDashboard';
import { CollaboratorSorteio } from './pages/CollaboratorSorteio';
import { CollaboratorRoleta } from './pages/CollaboratorRoleta';
import { PublicRoleta } from './pages/PublicRoleta';


import { Admin } from './pages/Admin';
import { AdminDashboard } from './pages/AdminDashboard';


const OrganizerLayout: React.FC = () => {
    const { loggedInOrganizer } = useData();
    if (!loggedInOrganizer) {
        return <Navigate to="/login" replace />;
    }
    return (
        <div className="flex flex-col min-h-screen bg-light-background dark:bg-dark-background">
            <ImpersonationBar />
            <Header />
            <main className="flex-grow">
                <Outlet />
            </main>
            <Footer />
        </div>
    );
};

const CollaboratorLayout: React.FC = () => {
    const { loggedInCollaborator } = useData();
    if (!loggedInCollaborator) {
        return <Navigate to="/" replace />;
    }
    return (
        <div className="flex flex-col min-h-screen bg-light-background dark:bg-dark-background">
            <CollaboratorHeader />
            <main className="flex-grow">
                <Outlet />
            </main>
            <Footer />
        </div>
    );
};


const AppRoutes: React.FC = () => {
  const { loggedInOrganizer, isSuperAdmin, loggedInCollaborator } = useData();

  return (
    <Routes>
      <Route path="/" element={ isSuperAdmin ? <Navigate to="/admin" /> : loggedInOrganizer ? <Navigate to="/dashboard" /> : loggedInCollaborator ? <Navigate to="/collaborator-dashboard" /> : <Checkin /> } />
      <Route path="/login" element={ isSuperAdmin ? <Navigate to="/admin" /> : loggedInOrganizer ? <Navigate to="/dashboard" /> : loggedInCollaborator ? <Navigate to="/collaborator-dashboard" /> : <Login /> } />
      <Route path="/participar" element={<Participar />} />
      <Route path="/roleta/:companyId" element={<PublicRoleta />} />


      {/* Organizer Protected Routes */}
      <Route element={<OrganizerLayout />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/cadastro" element={<Cadastro />} />
        <Route path="/painel" element={<Painel />} />
        <Route path="/historico" element={<Historico />} />
        <Route path="/gerenciar" element={<GerenciarSorteios />} />
        <Route path="/expositores" element={<Expositores />} />
      </Route>
      
      {/* Collaborator Protected Routes */}
      <Route element={<CollaboratorLayout />}>
        <Route path="/collaborator-dashboard" element={<CollaboratorDashboard />} />
        <Route path="/collaborator-sorteio" element={<CollaboratorSorteio />} />
        <Route path="/collaborator-roleta" element={<CollaboratorRoleta />} />
      </Route>

      {/* Admin Protected Routes */}
      <Route path="/admin" element={<Admin />}>
          <Route index element={<AdminDashboard />} />
      </Route>

      <Route path="*" element={<Navigate to={isSuperAdmin ? "/admin" : loggedInOrganizer ? "/dashboard" : loggedInCollaborator ? "/collaborator-dashboard" : "/"} replace />} />
    </Routes>
  );
};


const App: React.FC = () => {
  return (
    <ThemeProvider>
      <DataProvider>
        <HashRouter>
          <AppRoutes />
        </HashRouter>
      </DataProvider>
    </ThemeProvider>
  );
};

export default App;