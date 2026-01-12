'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import authService from '@/services/authService';
import { userProfile } from '@/types/types';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, LogIn, UserPlus, Loader2, CheckCircle2 } from 'lucide-react';

export default function AuthPage() {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [user, setUser] = useState<userProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token_stock');
    if (token) fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const userData = await authService.getMe();
      setUser(userData);
      router.push('/'); 
    } catch (err) {
      authService.logout();
      setUser(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return; // Guard clause to prevent double submission

    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      if (isLogin) {
        await authService.login(email, password);
      } else {
        await authService.register(email, password);
        setSuccess(true); 
        await authService.login(email, password);
      }

      await fetchProfile();
      
      setTimeout(() => {
        router.push('/'); 
      }, 800);

    } catch (err: unknown) {
      setSuccess(false);
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.detail || 'Authentication failed');
      } else {
        setError('An unexpected error occurred');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-100 to-blue-50 p-4 font-sans">
      <motion.div 
        layout
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-white shadow-2xl rounded-3xl overflow-hidden border border-gray-100"
      >
        <div className="p-8">
          <div className="text-center mb-10">
            <motion.h2 
              key={isLogin ? 'login-h' : 'reg-h'}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-3xl font-black text-gray-900 tracking-tight"
            >
              {isLogin ? 'Sign In' : 'Create Account'}
            </motion.h2>
            <p className="text-gray-500 mt-2 font-medium">
              {isLogin ? 'Access your stock dashboard' : 'Sign up for instant access'}
            </p>
          </div>

          <AnimatePresence mode="wait">
            {error && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-6 p-4 bg-red-50 text-red-700 text-sm rounded-xl border border-red-100 flex items-center gap-2"
              >
                <span className="font-medium">{error}</span>
              </motion.div>
            )}

            {success && (
              <motion.div 
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="mb-6 p-4 bg-green-50 text-green-700 text-sm rounded-xl border border-green-100 flex items-center gap-2"
              >
                <CheckCircle2 size={18} className="text-green-600" />
                <span className="font-medium">Account created! Redirecting...</span>
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="email"
                  disabled={loading}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-black placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:bg-white focus:border-transparent transition-all outline-none shadow-sm disabled:opacity-60"
                  placeholder="name@company.com"
                  required
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="password"
                  disabled={loading}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-black placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:bg-white focus:border-transparent transition-all outline-none shadow-sm disabled:opacity-60"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <motion.button
              whileHover={!loading ? { scale: 1.02 } : {}}
              whileTap={!loading ? { scale: 0.98 } : {}}
              type="submit"
              disabled={loading}
              className={`
                w-full py-4 rounded-xl font-bold text-lg shadow-lg transition-all 
                flex items-center justify-center gap-2 mt-2
                ${loading 
                  ? 'bg-blue-400 cursor-not-allowed opacity-80' 
                  : 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-200'
                }
              `}
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" size={22} />
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  {isLogin ? <LogIn size={20} /> : <UserPlus size={20} />}
                  {isLogin ? 'Sign In' : 'Get Started'}
                </>
              )}
            </motion.button>
          </form>

          <div className="mt-8 pt-6 border-t border-gray-100 text-center">
            <button 
              type="button"
              disabled={loading}
              onClick={() => { setIsLogin(!isLogin); setError(''); setSuccess(false); }}
              className="text-sm font-medium text-gray-500 hover:text-blue-600 transition-colors group disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLogin ? "New to the platform? " : "Already have an account? "}
              <span className="text-blue-600 font-bold group-hover:underline underline-offset-4">
                {isLogin ? 'Create an account' : 'Log in here'}
              </span>
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}