"use client";

import React, { useState, useEffect, useMemo, ReactNode, ChangeEvent } from 'react';
import { 
  ArrowDownLeft, ArrowUpRight, Search, 
  Calendar, Download, History, Loader2,
  Inbox, TrendingUp, TrendingDown, AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sidebar } from '@/components/Sidebar'; 
import { Header } from '@/components/Header';
// Import the service and its types
import { ProductsService, Product } from '@/services/products_service';

// --- Interfaces ---

interface FilterButtonProps {
  label: string;
  active: boolean;
  onClick: () => void;
}

interface StatCardProps {
  title: string;
  value: number;
  icon: ReactNode;
  color: 'emerald' | 'rose';
}

export default function StockMovementsPage() {
  const [mounted, setMounted] = useState<boolean>(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // Data State
  const [products, setProducts] = useState<Product[]>([]);
  
  // Filter States
  const [typeFilter, setTypeFilter] = useState<'ALL' | 'IN' | 'OUT'>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<string>('');

  useEffect(() => {
    setMounted(true);
    loadData();
  }, []);

  const loadData = async (): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      // Fetching real products from the database
      const data = await ProductsService.getAll();
      setProducts(data);
    } catch (err) {
      setError("Failed to synchronize movement data.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Logic: Filtered Data based on Product Service
  const filteredData = useMemo(() => {
    return products.filter((p) => {
      const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                           p.sku.toLowerCase().includes(searchQuery.toLowerCase());
      
      // Since 'Products' represent current state, we simulate the movement 
      // check here. In a real app, you'd fetch from a MovementsService.
      const matchesType = typeFilter === 'ALL' || 
                         (typeFilter === 'IN' && p.quantity > 0) || 
                         (typeFilter === 'OUT' && p.status === 'Out');

      return matchesSearch && matchesType;
    });
  }, [products, searchQuery, typeFilter]);

  const stats = useMemo(() => {
    const totalStock = products.reduce((acc, curr) => acc + curr.quantity, 0);
    const lowStockCount = products.filter(p => p.status === 'Low').length;
    return { totalStock, lowStockCount };
  }, [products]);

  if (!mounted) return null;

  return (
    <div className="flex h-screen bg-[#F8FAFC] overflow-hidden">
      <Sidebar isOpen={isSidebarOpen} toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative text-slate-900">
        <Header onOpenSidebar={() => setIsSidebarOpen(true)} />

        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="max-w-7xl mx-auto space-y-6">
            
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h1 className="text-2xl font-bold flex items-center gap-2">
                  <History className="text-indigo-600" size={24} /> Movement Logs
                </h1>
                <p className="text-slate-500 text-sm font-medium">Real-time data from Products Service</p>
              </div>
              <button 
                onClick={loadData}
                className="flex items-center gap-2 px-5 py-2.5 bg-white border border-slate-200 text-slate-600 rounded-xl text-sm font-bold hover:bg-slate-50 transition-all shadow-sm"
              >
                Refresh Data
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
               <StatCard title="Total Inventory" value={stats.totalStock} icon={<TrendingUp size={20}/>} color="emerald" />
               <StatCard title="Low Stock Items" value={stats.lowStockCount} icon={<AlertCircle size={20}/>} color="rose" />
            </div>

            <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex flex-col lg:flex-row gap-4 justify-between items-center">
                
                <div className="flex bg-slate-100 p-1 rounded-2xl w-full lg:w-auto">
                  <FilterButton label="Active Items" active={typeFilter === 'ALL'} onClick={() => setTypeFilter('ALL')} />
                  <FilterButton label="Stock In" active={typeFilter === 'IN'} onClick={() => setTypeFilter('IN')} />
                  <FilterButton label="Out of Stock" active={typeFilter === 'OUT'} onClick={() => setTypeFilter('OUT')} />
                </div>

                <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
                  <div className="relative flex-1 sm:w-80">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input 
                      type="text" 
                      value={searchQuery}
                      onChange={(e: ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
                      placeholder="Search items by SKU or Name..." 
                      className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm outline-none focus:ring-4 ring-indigo-500/5 transition-all"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-[32px] border border-slate-200 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-100 text-slate-400 text-[11px] font-bold uppercase tracking-widest">
                      <th className="px-8 py-5">Status</th>
                      <th className="px-6 py-5">Product Info</th>
                      <th className="px-6 py-5 text-center">Current Qty</th>
                      <th className="px-6 py-5">Price</th>
                      <th className="px-6 py-5">Last Updated</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {loading ? (
                      <tr>
                        <td colSpan={5} className="py-24 text-center">
                          <Loader2 className="animate-spin text-indigo-500 mx-auto" size={32} />
                        </td>
                      </tr>
                    ) : error ? (
                      <tr>
                        <td colSpan={5} className="py-24 text-center text-rose-500 font-bold italic">{error}</td>
                      </tr>
                    ) : filteredData.length > 0 ? (
                      filteredData.map((product) => (
                        <tr key={product.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="px-8 py-5">
                             <StatusBadge status={product.status} />
                          </td>
                          <td className="px-6 py-5">
                            <div className="flex flex-col">
                              <span className="text-sm font-bold text-slate-900">{product.name}</span>
                              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{product.sku}</span>
                            </div>
                          </td>
                          <td className="px-6 py-5 text-center font-bold text-slate-700">
                             {product.quantity}
                          </td>
                          <td className="px-6 py-5 text-sm text-slate-900 font-bold">${product.price.toFixed(2)}</td>
                          <td className="px-6 py-5 text-xs text-slate-500 font-bold">Today</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={5} className="py-24 text-center text-slate-400">
                          <Inbox className="mx-auto mb-2 opacity-20" size={48} />
                          <p>No products found in service records.</p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

// --- Helper Components ---

function StatCard({ title, value, icon, color }: StatCardProps) {
  const styles = {
    emerald: 'text-emerald-600 bg-emerald-50 border-emerald-100',
    rose: 'text-rose-600 bg-rose-50 border-rose-100'
  };
  return (
    <div className="bg-white p-6 rounded-3xl border border-slate-200 flex items-center justify-between">
      <div>
        <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">{title}</p>
        <h4 className="text-2xl font-black">{value}</h4>
      </div>
      <div className={`p-4 rounded-2xl border ${styles[color]}`}>{icon}</div>
    </div>
  );
}

function FilterButton({ label, active, onClick }: FilterButtonProps) {
  return (
    <button 
      onClick={onClick}
      className={`px-6 py-2.5 text-xs font-bold rounded-xl transition-all ${
        active ? 'bg-white text-indigo-600 shadow-md' : 'text-slate-500 hover:text-slate-900'
      }`}
    >
      {label}
    </button>
  );
}

function StatusBadge({ status }: { status: Product['status'] }) {
  const styles = {
    'In Stock': 'bg-emerald-50 text-emerald-600 border-emerald-100',
    'Low': 'bg-amber-50 text-amber-600 border-amber-100',
    'Out': 'bg-rose-50 text-rose-600 border-rose-100',
  };
  return <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border ${styles[status]}`}>{status}</span>;
}