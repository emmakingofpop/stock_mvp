"use client";

import React, { useState, useEffect, ReactNode, FormEvent } from 'react';
import { 
  Plus, Mail, Phone, MapPin, Package, 
  ArrowLeft, Save, Globe, User, Tag,
  Search, MoreVertical, Edit3, Trash2, Loader2, AlertCircle, X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sidebar } from '@/components/Sidebar'; 
import { Header } from '@/components/Header';
import { SuppliersService, Supplier, SupplierCreate } from '@/services/suppliers_service';
import { toast, Toaster } from 'react-hot-toast';

// --- Explicit Interfaces ---

interface FormFieldProps {
  label: string;
  icon: ReactNode;
  placeholder: string;
  name: keyof SupplierCreate;
  defaultValue?: string | number;
  type?: string;
  isSelect?: boolean;
  required?: boolean;
}

interface SupplierCardProps {
  supplier: Supplier;
  onEdit: (supplier: Supplier) => void;
  onDelete: (id: number) => void;
}

interface DeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  itemName: string;
}

export default function SuppliersPage() {
  const [mounted, setMounted] = useState<boolean>(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
  const [view, setView] = useState<'list' | 'form'>('list');
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [deleteTarget, setDeleteTarget] = useState<Supplier | null>(null);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);

  useEffect(() => {
    setMounted(true);
    fetchSuppliers();
  }, []);

  const fetchSuppliers = async () => {
    setIsLoading(true);
    try {
      const data = await SuppliersService.getAll();
      setSuppliers(data);
    } catch (err) {
      toast.error("Network error: Could not load suppliers");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (supplier: Supplier) => {
    setEditingSupplier(supplier);
    setView('form');
  };

  const handleAddNew = () => {
    setEditingSupplier(null);
    setView('form');
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await SuppliersService.delete(deleteTarget.id);
      setSuppliers(prev => prev.filter(s => s.id !== deleteTarget.id));
      toast.success(`${deleteTarget.name} removed successfully`);
    } catch (err) {
      toast.error("Operation failed");
    } finally {
      setDeleteTarget(null);
    }
  };

  const filteredSuppliers = suppliers.filter(s => 
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    s.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!mounted) return null;

  return (
    <div className="flex h-screen bg-[#F8FAFC] overflow-hidden text-black">
      <Toaster position="top-right" />
      <Sidebar isOpen={isSidebarOpen} toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        <Header onOpenSidebar={() => setIsSidebarOpen(true)} />

        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="max-w-7xl mx-auto">
            <AnimatePresence mode="wait">
              {view === 'list' ? (
                <motion.div key="list" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                      <h1 className="text-2xl font-bold text-black">Suppliers</h1>
                      <p className="text-slate-500 text-sm font-medium">Managing {suppliers.length} active partners</p>
                    </div>
                    <button onClick={handleAddNew} className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition-all">
                      <Plus size={18} /> Add Supplier
                    </button>
                  </div>

                  <div className="relative max-w-md group">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input 
                      type="text" 
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Filter by name or industry..." 
                      className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-black outline-none focus:ring-2 ring-indigo-500/10 transition-all"
                    />
                  </div>

                  {isLoading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {[1,2,3].map(i => <div key={i} className="h-64 bg-slate-200/50 animate-pulse rounded-[24px]" />)}
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {filteredSuppliers.map((s) => (
                        <SupplierCard key={s.id} supplier={s} onEdit={handleEdit} onDelete={() => setDeleteTarget(s)} />
                      ))}
                    </div>
                  )}
                </motion.div>
              ) : (
                <SupplierForm 
                  initialData={editingSupplier} 
                  onCancel={() => setView('list')} 
                  onSuccess={() => { setView('list'); fetchSuppliers(); }} 
                />
              )}
            </AnimatePresence>
          </div>
        </main>
      </div>

      <DeleteConfirmationModal 
        isOpen={!!deleteTarget} 
        onClose={() => setDeleteTarget(null)} 
        onConfirm={confirmDelete}
        itemName={deleteTarget?.name || ""}
      />
    </div>
  );
}

// --- Card Component ---

function SupplierCard({ supplier, onEdit, onDelete }: SupplierCardProps) {
  return (
    <motion.div layout whileHover={{ y: -4 }} className="bg-white border border-slate-200 rounded-[24px] p-6 shadow-sm group">
      <div className="flex justify-between items-start mb-4">
        <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600"><Globe size={24} /></div>
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button onClick={() => onEdit(supplier)} className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg"><Edit3 size={18} /></button>
          <button onClick={() => onDelete(supplier.id)} className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg"><Trash2 size={18} /></button>
        </div>
      </div>
      <h3 className="text-lg font-bold text-black">{supplier.name}</h3>
      <span className="inline-block px-2 py-0.5 bg-slate-100 text-slate-500 rounded text-[10px] font-bold uppercase mt-1 mb-6">{supplier.category}</span>
      <div className="space-y-3">
        <div className="flex items-center gap-3 text-sm text-black font-semibold"><User size={16} className="text-slate-400"/> {supplier.contact_person}</div>
        <div className="flex items-center gap-3 text-sm text-slate-600"><Mail size={16} className="text-slate-400"/> {supplier.email}</div>
      </div>
    </motion.div>
  );
}

// --- Form Component (Handles Create & Update) ---

function SupplierForm({ initialData, onCancel, onSuccess }: { initialData: Supplier | null, onCancel: () => void, onSuccess: () => void }) {
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    const formData = new FormData(e.currentTarget);
    
    const payload: SupplierCreate = {
      name: String(formData.get('name')),
      contact_person: String(formData.get('contact_person')),
      email: String(formData.get('email')),
      phone: String(formData.get('phone')),
      category: String(formData.get('category')),
      linked_products_count: Number(formData.get('linked_products_count')),
      address: String(formData.get('address')),
    };

    try {
      if (initialData) {
        await SuppliersService.update(initialData.id, payload);
        toast.success("Supplier updated successfully");
      } else {
        await SuppliersService.create(payload);
        toast.success("New supplier profile created");
      }
      onSuccess();
    } catch {
      toast.error("Operation failed. Check your data.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.form onSubmit={handleSubmit} initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="space-y-8">
      <div className="flex items-center gap-4">
        {/* BACK BUTTON IN SOLID BLACK */}
        <button type="button" onClick={onCancel} className="p-2 hover:bg-slate-100 rounded-xl transition-colors">
          <ArrowLeft size={24} className="text-black stroke-[3px]" />
        </button>
        {/* TITLE IN SOLID BLACK */}
        <div>
          <h1 className="text-2xl font-black text-black uppercase tracking-tight">
            {initialData ? "Edit Supplier Profile" : "New Supplier Profile"}
          </h1>
          <p className="text-slate-500 text-sm font-medium">Fill in the details below</p>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-[32px] p-8 grid grid-cols-1 md:grid-cols-2 gap-6 shadow-sm">
        <FormField label="Company Name" name="name" defaultValue={initialData?.name} icon={<Globe size={18}/>} placeholder="Legal Entity Name" required />
        <FormField label="Industry Category" name="category" defaultValue={initialData?.category} icon={<Tag size={18}/>} placeholder="Select Category" isSelect required />
        <div className="md:col-span-2"><FormField label="Office Address" name="address" defaultValue={initialData?.address} icon={<MapPin size={18}/>} placeholder="Full physical address" required /></div>
        <FormField label="Primary Contact" name="contact_person" defaultValue={initialData?.contact_person} icon={<User size={18}/>} placeholder="Full Name" required />
        <FormField label="Email" name="email" defaultValue={initialData?.email} type="email" icon={<Mail size={18}/>} placeholder="contact@company.com" required />
        <FormField label="Phone" name="phone" defaultValue={initialData?.phone} icon={<Phone size={18}/>} placeholder="+1..." required />
      </div>

      <div className="flex justify-end gap-3">
        <button type="button" onClick={onCancel} className="px-6 py-3 font-bold text-slate-600 hover:text-black transition-colors">Cancel</button>
        <button disabled={isSubmitting} className="px-8 py-3 bg-black text-white rounded-2xl font-bold flex items-center gap-2 hover:bg-slate-800 transition-all disabled:bg-slate-400">
          {isSubmitting ? <Loader2 className="animate-spin" size={18}/> : <Save size={18}/>}
          {isSubmitting ? "Saving..." : initialData ? "Update Supplier" : "Create Supplier"}
        </button>
      </div>
    </motion.form>
  );
}

function FormField({ label, icon, placeholder, name, defaultValue, type = "text", isSelect = false, required = false }: FormFieldProps) {
  return (
    <div className="space-y-1.5">
      <label className="text-[11px] font-bold text-slate-500 uppercase ml-1 tracking-wider">{label}</label>
      <div className="relative">
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">{icon}</div>
        {isSelect ? (
          <select name={name} defaultValue={defaultValue} required={required} className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm text-black outline-none focus:bg-white focus:ring-2 ring-black/5 transition-all appearance-none font-medium">
            <option value="Electronics">Electronics</option>
            <option value="Office">Office</option>
            <option value="Hardware">Hardware</option>
            <option value="Food & Beverage">Food & Beverage</option>
          </select>
        ) : (
          <input name={name} type={type} defaultValue={defaultValue} placeholder={placeholder} required={required} className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm text-black outline-none focus:bg-white focus:ring-2 ring-black/5 transition-all font-medium" />
        )}
      </div>
    </div>
  );
}

function DeleteConfirmationModal({ isOpen, onClose, onConfirm, itemName }: DeleteModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
          <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="relative bg-white rounded-[32px] p-8 max-w-sm w-full shadow-2xl">
            <div className="w-12 h-12 bg-rose-50 rounded-2xl flex items-center justify-center text-rose-600 mb-6"><AlertCircle size={28} /></div>
            <h2 className="text-xl font-bold text-black mb-2">Delete Supplier?</h2>
            <p className="text-slate-500 text-sm leading-relaxed mb-8">Are you sure you want to remove <span className="font-bold text-black">{itemName}</span>? This action cannot be undone.</p>
            <div className="flex gap-3">
              <button onClick={onClose} className="flex-1 py-3 font-bold text-slate-600 rounded-xl hover:bg-slate-50 transition-colors">Keep</button>
              <button onClick={onConfirm} className="flex-1 py-3 bg-black text-white font-bold rounded-xl hover:bg-slate-800 transition-colors">Delete</button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}