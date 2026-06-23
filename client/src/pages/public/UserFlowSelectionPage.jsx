import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { UserPlus, UserCheck, ArrowLeft } from 'lucide-react';

export default function UserFlowSelectionPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden bg-bg">
      <div className="absolute inset-0 z-0 bg-bg-surface opacity-80" />

      <div className="relative z-10 max-w-4xl w-full">
        <button 
          onClick={() => navigate('/')}
          className="absolute -top-16 left-0 flex items-center gap-2 text-text-muted hover:text-white transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="font-outfit text-lg">Back</span>
        </button>

        <div className="text-center mb-12">
          <motion.h1 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="font-outfit text-4xl md:text-5xl font-bold tracking-tight text-white mb-4"
          >
            Choose User Type
          </motion.h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            whileHover={{ scale: 1.03 }}
            onClick={() => navigate('/user/limited')}
            className="glass-panel p-8 flex flex-col items-center text-center cursor-pointer hover:border-neon-primary/50 transition-all duration-300 bg-gradient-to-br from-white/5 to-transparent"
          >
            <UserPlus className="w-16 h-16 text-neon-primary mb-6" />
            <h2 className="font-outfit text-3xl font-semibold text-white mb-3">Walk-in User</h2>
            <p className="text-text-muted font-inter">Play as a guest. Proceed to the counter for PC assignment.</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            whileHover={{ scale: 1.03 }}
            onClick={() => navigate('/user/member-login')}
            className="glass-panel p-8 flex flex-col items-center text-center cursor-pointer hover:border-neon-secondary/50 transition-all duration-300 bg-gradient-to-bl from-white/5 to-transparent"
          >
            <UserCheck className="w-16 h-16 text-neon-secondary mb-6" />
            <h2 className="font-outfit text-3xl font-semibold text-white mb-3">Member</h2>
            <p className="text-text-muted font-inter">Log in to your account, manage wallet, and start sessions directly.</p>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
