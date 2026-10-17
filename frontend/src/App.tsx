import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { DashboardPage } from './pages/DashboardPage';
import { PlaygroundPage } from './pages/PlaygroundPage';
import { DatasetsPage } from './pages/DatasetsPage';
import { FeatureMapPage } from './pages/FeatureMapPage';
import { KernelAnalysisPage } from './pages/KernelAnalysisPage';
import { ExperimentHistoryPage } from './pages/ExperimentHistoryPage';
import { ResearchReportPage } from './pages/ResearchReportPage';
import { EducationalPage } from './pages/EducationalPage';
import { ProfilePage } from './pages/ProfilePage';
import { AIAgentChat } from './components/AIAgentChat';
import { apiAuth } from './services/api';
import { User } from './types';

export function App() {
  const [user, setUser] = useState<User | null>(null);
  const [authView, setAuthView] = useState<'login' | 'register'>('login');
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const [targetExperimentId, setTargetExperimentId] = useState<number | null>(null);
  const [aiChatOpen, setAiChatOpen] = useState<boolean>(false);
  const [aiChatExpId, setAiChatExpId] = useState<number | null>(null);

  useEffect(() => {
    // Check local session
    if (apiAuth.isAuthenticated()) {
      const stored = apiAuth.getStoredUser();
      if (stored) {
        setUser(stored);
      } else {
        apiAuth.getMe()
          .then(setUser)
          .catch(() => apiAuth.logout());
      }
    }
  }, []);

  const handleLoginSuccess = (authenticatedUser: User) => {
    setUser(authenticatedUser);
    setActiveTab('dashboard');
  };

  const handleLogout = () => {
    apiAuth.logout();
    setUser(null);
    setAuthView('login');
  };

  const handleNavigate = (tab: string, experimentId?: number) => {
    if (experimentId !== undefined) {
      setTargetExperimentId(experimentId);
    }
    setActiveTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // If not logged in, render authentication screens
  if (!user) {
    if (authView === 'register') {
      return (
        <RegisterPage
          onRegisterSuccess={handleLoginSuccess}
          onNavigateToLogin={() => setAuthView('login')}
        />
      );
    }
    return (
      <LoginPage
        onLoginSuccess={handleLoginSuccess}
        onNavigateToRegister={() => setAuthView('register')}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#060913] text-slate-100 flex flex-col font-sans selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* Top Navbar */}
      <Navbar
        user={user}
        onLogout={handleLogout}
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
        activeTab={activeTab}
        onToggleAIChat={() => setAiChatOpen((prev) => !prev)}
      />

      <div className="flex flex-1 relative">
        {/* Sidebar */}
        <Sidebar
          activeTab={activeTab}
          setActiveTab={(tab) => handleNavigate(tab)}
          mobileMenuOpen={mobileMenuOpen}
          setMobileMenuOpen={setMobileMenuOpen}
        />

        {/* Main Content Area */}
        <main className="flex-1 lg:pl-64 w-full min-h-[calc(100vh-4rem)] p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto overflow-y-auto">
          {activeTab === 'dashboard' && (
            <DashboardPage
              user={user}
              onNavigate={(tab, expId) => handleNavigate(tab, expId)}
            />
          )}

          {activeTab === 'playground' && (
            <PlaygroundPage
              onNavigateToReport={(expId) => handleNavigate('report', expId)}
              onOpenAIChat={(expId) => {
                if (expId) setAiChatExpId(expId);
                setAiChatOpen(true);
              }}
            />
          )}

          {activeTab === 'datasets' && <DatasetsPage />}

          {activeTab === 'feature-map' && <FeatureMapPage />}

          {activeTab === 'kernel-analysis' && <KernelAnalysisPage />}

          {activeTab === 'history' && (
            <ExperimentHistoryPage
              onNavigateToReport={(expId) => handleNavigate('report', expId)}
            />
          )}

          {activeTab === 'report' && (
            <ResearchReportPage initialExperimentId={targetExperimentId} />
          )}

          {activeTab === 'education' && <EducationalPage />}

          {activeTab === 'profile' && (
            <ProfilePage user={user} onLogout={handleLogout} />
          )}
        </main>
      </div>

      {/* Floating Q-Copilot AI Agent Window */}
      <AIAgentChat
        isOpen={aiChatOpen}
        onClose={() => setAiChatOpen(false)}
        activeExperimentId={aiChatExpId ?? targetExperimentId}
      />
    </div>
  );
}

export default App;
