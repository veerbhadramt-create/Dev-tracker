import React, { useState } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { AppSidebar } from '../components/AppSidebar';
import { Menu, X } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { useAuth } from '../hooks/useAuth';

export const AppLayout: React.FC = () => {
  const { user, loading } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  if (loading) {
    return (
      <div className="w-full h-screen flex flex-col justify-center items-center space-y-4 bg-background">
        <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
        <span className="text-xs text-muted-foreground uppercase font-bold tracking-widest font-mono">Loading module...</span>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-background">
      {/* Desktop Sidebar (hidden on mobile <= 640px) */}
      <div className="hidden sm:block">
        <AppSidebar />
      </div>

      {/* Mobile Sidebar Slide-over Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 bg-black z-40 sm:hidden"
            />
            {/* Slide-in sidebar drawer */}
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'tween', duration: 0.25 }}
              className="fixed top-0 bottom-0 left-0 z-50 w-64 bg-sidebar sm:hidden shadow-2xl"
            >
              <div className="absolute right-4 top-4 z-50">
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1 rounded-lg bg-sidebar-accent text-sidebar-accent-foreground border border-sidebar-border/30"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <AppSidebar />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main Content Viewport */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Mobile Navbar Header */}
        <header className="sm:hidden flex items-center justify-between px-6 py-4 bg-sidebar border-b border-sidebar-border/35 text-foreground shrink-0 z-30">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="p-1.5 rounded-lg bg-secondary hover:bg-secondary/90 border border-border/40"
              aria-label="Open menu"
            >
              <Menu className="w-5 h-5" />
            </button>
            <span className="font-extrabold tracking-tight text-sm text-foreground">
              DevTracker
            </span>
          </div>
        </header>

        {/* Scrollable page body */}
        <main className="flex-1 overflow-y-auto px-4 py-6 sm:p-8 no-scrollbar bg-background/50">
          <div className="max-w-7xl mx-auto h-full">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};
