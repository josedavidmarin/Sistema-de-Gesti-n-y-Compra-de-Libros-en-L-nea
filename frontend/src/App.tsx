import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { HomePage } from './pages/HomePage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { ProfilePage } from './pages/ProfilePage';
import { AdminPage } from './pages/AdminPage';

const AppContent: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<string>('home');
  const { role } = useAuth();

  const handleNavigate = (page: string) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleAuthSuccess = () => {
    if (role === 'ROOT') {
      setCurrentPage('admin');
    } else {
      setCurrentPage('profile');
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      <Navbar currentPage={currentPage} onNavigate={handleNavigate} />

      <main className="flex-1">
        {currentPage === 'home' && <HomePage onNavigate={handleNavigate} />}
        {currentPage === 'login' && (
          <LoginPage
            onSuccess={handleAuthSuccess}
            onGoToRegister={() => handleNavigate('register')}
          />
        )}
        {currentPage === 'register' && (
          <RegisterPage
            onSuccess={handleAuthSuccess}
            onGoToLogin={() => handleNavigate('login')}
          />
        )}
        {currentPage === 'profile' && <ProfilePage />}
        {currentPage === 'admin' && <AdminPage />}
      </main>

      <footer className="bg-white border-t border-slate-200 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div>
            <strong>IS873 – Laboratorio de Software (2026-2)</strong> • Universidad Tecnológica de Pereira
          </div>
          <div>
            Equipo: Jose David Marin • Edwin Osorio • Maicol Londoño
          </div>
        </div>
      </footer>
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};

export default App;
