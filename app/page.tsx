"use client";

import React, { useState, useEffect, ReactNode, useMemo } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid 
} from 'recharts';
import { 
  Package, Box, AlertTriangle, ArrowUpDown, 
  PlusCircle, MinusCircle, History, Download, Loader2
} from 'lucide-react';
import { motion } from 'framer-motion';
import * as XLSX from 'xlsx'; // Import Excel library
import { Sidebar } from '@/components/Sidebar'; 
import { Header } from '@/components/Header';
import { ProductsService, Product } from '@/services/products_service';

// --- Interfaces ---
interface StatCardProps {
  title: string;
  value: string | number;
  change: string;
  type: 'success' | 'warning' | 'danger' | 'primary';
  icon: ReactNode;
}

interface ActivityRowProps {
  product: string;
  action: 'In' | 'Out';
  quantity: string;
  time: string;
}

export default function InventoryDashboard() {
  const [mounted, setMounted] = useState<boolean>(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    setMounted(true);
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const data = await ProductsService.getAll();
      setProducts(data);
    } catch (error) {
      console.error("Dashboard Sync Error:", error);
    } finally {
      setLoading(false);
    }
  };

  // --- Logic: Dashboard Calculations ---
  const stats = useMemo(() => {
    const totalItems = products.length;
    const totalValue = products.reduce((acc, p) => acc + (p.price * p.quantity), 0);
    const lowStock = products.filter(p => p.status === 'Low' || p.status === 'Out').length;
    const totalInStock = products.reduce((acc, p) => acc + p.quantity, 0);

    return {
      totalItems,
      totalValue: new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(totalValue),
      lowStock,
      totalInStock
    };
  }, [products]);

  // --- Logic: Export to Excel ---
  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(products);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Inventory Report");
    
    // Generate buffer and trigger download
    XLSX.writeFile(workbook, `Inventory_Report_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  if (!mounted) return null;

  return (
    <div className="flex h-screen bg-[#F8FAFC] overflow-hidden">
      <Sidebar isOpen={isSidebarOpen} toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden text-slate-900">
        <Header onOpenSidebar={() => setIsSidebarOpen(true)} />

        <main className="flex-1 overflow-y-auto p-4 md:p-8 space-y-8">
          
          {/* Header Section */}
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-black tracking-tight">Inventory Overview</h1>
              <p className="text-slate-500 text-sm">Real-time product analytics</p>
            </div>
            <button 
              onClick={exportToExcel}
              className="flex items-center gap-2 px-5 py-3 bg-white border border-slate-200 text-slate-700 rounded-2xl text-sm font-bold hover:bg-slate-50 shadow-sm transition-all active:scale-95"
            >
              <Download size={18} className="text-indigo-600" />
              Export to Excel
            </button>
          </div>

          {/* Section: KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {loading ? (
              <div className="col-span-full py-10 flex justify-center"><Loader2 className="animate-spin text-indigo-600" /></div>
            ) : (
              <>
                <StatCard title="Total Products" value={stats.totalItems} change="+2 new" type="primary" icon={<Package size={20}/>} />
                <StatCard title="Total Stock Value" value={stats.totalValue} change="+3.2%" type="success" icon={<Box size={20}/>} />
                <StatCard title="Low Stock Items" value={stats.lowStock} change="Critical" type="danger" icon={<AlertTriangle size={20}/>} />
                <StatCard title="Stock Units" value={stats.totalInStock} change="Live" type="warning" icon={<ArrowUpDown size={20}/>} />
              </>
            )}
          </div>

          <div className="grid grid-cols-12 gap-8">
            {/* Stock Movement Chart (Placeholder Logic) */}
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="col-span-12 lg:col-span-8 bg-white border border-slate-200 rounded-[32px] shadow-sm p-8">
              <h2 className="text-lg font-bold mb-10">Stock Distribution (Top 5 Items)</h2>
              <div className="h-[350px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={products.slice(0, 7)}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                    <XAxis dataKey="sku" axisLine={false} tickLine={false} tick={{fill: '#94A3B8', fontSize: 10}} dy={12} />
                    <YAxis axisLine={false} tickLine={false} tick={{fill: '#94A3B8', fontSize: 11}} />
                    <Tooltip cursor={{fill: '#F8FAFC'}} contentStyle={{ border: 'none', borderRadius: '12px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }} />
                    <Bar dataKey="quantity" fill="#4F46E5" radius={[6, 6, 0, 0]} barSize={30} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </motion.div>

            {/* Activity List: Dynamically derived from products */}
            <div className="col-span-12 lg:col-span-4">
              <div className="bg-white border border-slate-200 rounded-[32px] shadow-sm p-8 flex flex-col h-full">
                <h2 className="text-lg font-bold flex items-center gap-2 mb-6">
                  <History size={18} className="text-slate-400" /> Inventory Summary
                </h2>
                <div className="flex-1 space-y-1 overflow-y-auto max-h-[400px]">
                  {products.slice(0, 6).map((product) => (
                    <ActivityRow 
                      key={product.id}
                      product={product.name} 
                      action={product.quantity > 10 ? 'In' : 'Out'} 
                      quantity={`${product.quantity} units`} 
                      time={product.status} 
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

// --- Sub-components ---

const StatCard: React.FC<StatCardProps> = ({ title, value, change, type, icon }) => {
  const styles = {
    success: 'text-emerald-600 bg-emerald-50 border-emerald-100',
    warning: 'text-amber-600 bg-amber-50 border-amber-100',
    danger: 'text-rose-600 bg-rose-50 border-rose-100',
    primary: 'text-indigo-600 bg-indigo-50 border-indigo-100'
  };

  return (
    <motion.div whileHover={{ y: -4 }} className="bg-white border border-slate-200 p-6 rounded-[24px] shadow-sm">
      <div className="flex justify-between items-start mb-4">
        <div className={`p-3 rounded-2xl border ${styles[type]}`}>{icon}</div>
        <span className={`text-[10px] font-black px-2.5 py-1 rounded-lg uppercase tracking-wider ${styles[type]}`}>{change}</span>
      </div>
      <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">{title}</p>
      <h3 className="text-2xl font-black mt-1 text-slate-900">{value}</h3>
    </motion.div>
  );
};

const ActivityRow: React.FC<ActivityRowProps> = ({ product, action, quantity, time }) => (
  <div className="flex justify-between items-center p-4 hover:bg-slate-50 rounded-2xl transition-all border border-transparent hover:border-slate-100">
    <div className="flex items-center gap-4">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${action === 'In' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
        {action === 'In' ? <PlusCircle size={18}/> : <MinusCircle size={18}/>}
      </div>
      <div className="min-w-0">
        <p className="text-sm font-bold text-slate-900 truncate w-32">{product}</p>
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{time}</p>
      </div>
    </div>
    <div className="text-right">
      <p className={`text-sm font-black ${action === 'In' ? 'text-emerald-600' : 'text-rose-600'}`}>{quantity}</p>
    </div>
  </div>
);