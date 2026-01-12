"use client";

import React, { useEffect, useState } from 'react';
import { Menu, Search, Bell, ChevronDown, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import authService from '@/services/authService';
import { userProfile } from '@/types/types';

interface HeaderProps {
  onOpenSidebar: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenSidebar }) => {
  const router = useRouter();
  const [user, setUser] = useState<userProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Helper to get initials from name (e.g., "John Doe" -> "JD")
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const userData = await authService.getMe();
      setUser(userData);
    } catch (err) {
      await authService.logout();
      router.push('/auth');
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('token_stock');
    if (token) {
      fetchProfile();
    } else {
      router.push('/auth');
    }
  }, []);

  return (
    <header className="h-16 bg-white/70 backdrop-blur-md border-b border-slate-200 px-4 md:px-8 flex items-center justify-between flex-shrink-0 z-30">
      <div className="flex items-center gap-4 flex-1">
        {/* Mobile Menu Toggle */}
        <button
          onClick={onOpenSidebar}
          className="md:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
          aria-label="Open Menu"
        >
          <Menu size={22} />
        </button>

        {/* Desktop Search */}
        <div className="hidden md:flex items-center gap-2 bg-slate-100/80 border border-slate-200 px-3.5 py-1.5 rounded-xl w-full max-w-sm focus-within:ring-2 ring-indigo-500/10 transition-all">
          <Search size={16} className="text-slate-400" />
          <input
            className="bg-transparent border-none outline-none text-sm w-full font-medium"
            placeholder="Search items, SKU, or movements..."
          />
        </div>
      </div>

      <div className="flex items-center gap-2 md:gap-4">
        {/* Notifications */}
        <button className="p-2 text-slate-500 hover:bg-slate-100 rounded-xl relative transition-colors">
          <Bell size={20} />
          <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-rose-500 rounded-full border-2 border-white" />
        </button>

        <div className="h-8 w-px bg-slate-200 mx-1 hidden sm:block" />

        {/* User Profile Dropdown */}
        <div 
          onClick={() => {/* Potential Profile Menu Toggle */}}
          className="flex items-center gap-3 p-1 pr-2 hover:bg-slate-100 rounded-xl cursor-pointer transition-colors group"
        >
          <div className="hidden sm:flex flex-col items-end">
            <span className="text-xs font-bold text-slate-900 leading-none">
              {loading ? "Loading..." : user?.email || "Guest User"}
            </span>
            <span className="text-[10px] font-medium text-slate-500">
              {"Member"}
            </span>
          </div>

          <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-bold text-xs shadow-lg shadow-indigo-100">
            {loading ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              getInitials(user?.email || "GU")
            )}
          </div>
          
          <ChevronDown size={14} className="text-slate-400 group-hover:text-slate-600 transition-colors" />
        </div>
      </div>
    </header>
  );
};