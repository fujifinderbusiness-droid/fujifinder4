import React, { useEffect } from 'react';
import { DataProvider, useData } from './context/DataContext';
import { PluginProvider } from './plugins/PluginContext';
import { BuilderProvider } from './builder/BuilderContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { SearchModal } from './components/SearchModal';
import { LandingPage } from './views/LandingPage';
import { CamerasPage } from './views/CamerasPage';
import { CameraDetailPage } from './views/CameraDetailPage';
import { BlogPage } from './views/BlogPage';
import { ArticleDetailPage } from './views/ArticleDetailPage';
import { ComparisonsPage } from './views/ComparisonsPage';
import { AdminCMS } from './views/AdminCMS';
import { AdminLogin } from './views/AdminLogin';
import { UnsubscribePage } from './views/UnsubscribePage';
import { ConfirmSubscriptionPage } from './views/ConfirmSubscriptionPage';

const MainLayout: React.FC = () => {
  const { currentView, navigateTo, isAdminLoggedIn } = useData();

  // Route listener for email tokens in URL (?token= or #unsubscribe or #confirm-subscription)
  useEffect(() => {
    const handleUrlRouting = () => {
      const path = window.location.pathname;
      const search = window.location.search;
      const hash = window.location.hash;

      if (path.includes('unsubscribe') || search.includes('action=unsubscribe') || hash.includes('unsubscribe')) {
        navigateTo('unsubscribe');
      } else if (
        path.includes('confirm') || 
        path.includes('verify') || 
        search.includes('action=confirm') || 
        search.includes('action=verify') || 
        hash.includes('confirm-subscription') || 
        hash.includes('verify-email')
      ) {
        navigateTo('confirm-subscription');
      }
    };

    handleUrlRouting();
    window.addEventListener('hashchange', handleUrlRouting);
    return () => window.removeEventListener('hashchange', handleUrlRouting);
  }, [navigateTo]);

  // Scroll to top whenever the view changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentView]);

  if (currentView === 'admin') {
    if (!isAdminLoggedIn) {
      return (
        <div className="min-h-screen bg-[#0E0E0E] text-white">
          <AdminLogin />
          <SearchModal />
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-[#FDFCFB] text-[#1A1A1A]">
        <AdminCMS />
        <SearchModal />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDFCFB] text-[#1A1A1A] flex flex-col selection:bg-[#1A1A1A] selection:text-white font-sans antialiased">
      {/* Global Editorial Navigation */}
      <Navbar />

      {/* Dynamic View Switcher */}
      <main className="flex-1 w-full">
        {currentView === 'landing' && <LandingPage />}
        {currentView === 'cameras' && <CamerasPage />}
        {currentView === 'camera-detail' && <CameraDetailPage />}
        {currentView === 'blog' && <BlogPage />}
        {currentView === 'article-detail' && <ArticleDetailPage />}
        {currentView === 'comparisons' && <ComparisonsPage />}
        {currentView === 'unsubscribe' && <UnsubscribePage />}
        {currentView === 'confirm-subscription' && <ConfirmSubscriptionPage />}
      </main>

      {/* Global Editorial Footer */}
      <Footer />

      {/* Universal Search Modal (Cmd+K) */}
      <SearchModal />
    </div>
  );
};

export default function App() {
  return (
    <DataProvider>
      <PluginProvider>
        <BuilderProvider>
          <MainLayout />
        </BuilderProvider>
      </PluginProvider>
    </DataProvider>
  );
}
