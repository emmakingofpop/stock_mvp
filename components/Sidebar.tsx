"use client";

import React from 'react';
import { 
  LayoutDashboard, Package, ArrowLeftRight, 
  Users, BarChart3, Settings, TrendingUp, X 
} from 'lucide-react';
import { NavItem, SidebarProps } from '../types/types';

const NAV_ITEMS: NavItem[] = [
  { name: 'Dashboard', icon: LayoutDashboard, href: '/' },
  { name: 'Products', icon: Package, href: '/products' },
  { name: 'Stock Movements', icon: ArrowLeftRight, href: '/stock' },
  { name: 'Suppliers', icon: Users, href: '/suppliers' },
  { name: 'Reports', icon: BarChart3, href: '/reports' },
  { name: 'Settings', icon: Settings, href: '/settings' },
];

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, toggleSidebar }) => {
  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 md:hidden"
          onClick={toggleSidebar}
        />
      )}

      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-slate-200 
        transform transition-transform duration-300 ease-in-out
        md:relative md:translate-x-0
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex items-center justify-between h-16 px-6 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center shadow-indigo-100 shadow-lg">
              <TrendingUp size={18} className="text-white" />
            </div>
            <span className="text-lg font-bold text-slate-900">VortexSaaS</span>
          </div>
          <button onClick={toggleSidebar} className="md:hidden p-1 text-slate-400">
            <X size={20} />
          </button>
        </div>

        <nav className="mt-6 px-4 space-y-1">
          {NAV_ITEMS.map((item) => (
            <a
              key={item.name}
              href={item.href}
              className="flex items-center px-4 py-3 text-sm font-semibold text-slate-600 hover:bg-slate-50 hover:text-indigo-600 rounded-xl transition-all group"
            >
              <item.icon size={20} className="mr-3 text-slate-400 group-hover:text-indigo-600" />
              {item.name}
            </a>
          ))}
        </nav>
      </aside>
    </>
  );
};