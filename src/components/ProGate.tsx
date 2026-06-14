import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { Sparkles, Check, Lock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ProGateProps {
  children: React.ReactNode;
}

export const ProGate: React.FC<ProGateProps> = ({ children }) => {
  const { profile, updateProfile } = useAuth();
  const [upgrading, setUpgrading] = useState(false);

  const isPro = profile?.plan === 'pro';

  const handleUpgrade = async () => {
    setUpgrading(true);
    try {
      // Simulate Stripe checkout delay
      await new Promise((resolve) => setTimeout(resolve, 1500));
      await updateProfile({ plan: 'pro' });
    } catch (e) {
      console.error(e);
    } finally {
      setUpgrading(false);
    }
  };

  if (isPro) {
    return <>{children}</>;
  }

  return (
    <div className="relative min-h-[400px] flex items-center justify-center p-6">
      {/* Blurred preview background */}
      <div className="absolute inset-0 select-none pointer-events-none opacity-20 filter blur-[3px]">
        {children}
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative max-w-md w-full glass-card p-8 text-center border-primary/20 bg-card/80 z-10"
      >
        <div className="inline-flex p-3 rounded-full bg-primary/10 text-primary mb-4 animate-bounce">
          <Lock className="w-6 h-6" />
        </div>
        
        <h2 className="text-2xl font-bold tracking-tight mb-2 text-foreground">
          Unlock Pro Features
        </h2>
        
        <p className="text-muted-foreground text-sm mb-6">
          Access the AI Coach, Resume Analyzer, GitHub Insights, and Job Readiness breakdowns.
        </p>

        <div className="space-y-3 text-left mb-8">
          <div className="flex items-start text-sm">
            <Check className="w-4 h-4 text-primary shrink-0 mr-3 mt-0.5" />
            <span className="text-foreground/95"><strong>AI Coach:</strong> Unlimited code review & career questions.</span>
          </div>
          <div className="flex items-start text-sm">
            <Check className="w-4 h-4 text-primary shrink-0 mr-3 mt-0.5" />
            <span className="text-foreground/95"><strong>Resume Analyzer:</strong> Score & fix CV with Gemini Pro.</span>
          </div>
          <div className="flex items-start text-sm">
            <Check className="w-4 h-4 text-primary shrink-0 mr-3 mt-0.5" />
            <span className="text-foreground/95"><strong>GitHub Insights:</strong> Code contribution visualizer.</span>
          </div>
        </div>

        <button
          onClick={handleUpgrade}
          disabled={upgrading}
          className="w-full flex items-center justify-center gap-2 bg-primary hover:bg-primary/95 text-primary-foreground font-semibold py-3 px-4 rounded-lg shadow-lg hover:shadow-primary/20 transition-all active:scale-[0.98] disabled:opacity-70"
        >
          {upgrading ? (
            <>
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Processing Mock Checkout...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              Upgrade to Pro — $9/mo
            </>
          )}
        </button>

        <p className="text-[10px] text-muted-foreground mt-4">
          Stripe billing implementation is scaffolded. Clicking upgrade simulates a successful payment instantly.
        </p>
      </motion.div>
    </div>
  );
};
