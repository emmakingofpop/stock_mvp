"use client";

import React, { useState, useEffect, ReactNode, ChangeEvent } from 'react';
import { 
  Plus, ArrowLeft, Save, CheckCircle2, 
  AlertCircle, Package, Hash, DollarSign, 
  Layers, ImageIcon, Edit2, Trash2, Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sidebar } from '@/components/Sidebar'; 
import { Header } from '@/components/Header';
import { ProductsService, Product, ProductCreate, ProductUpdate } from '@/services/products_service';
import { SuppliersService, Supplier } from '@/services/suppliers_service';

// --- Interfaces ---

interface DeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  itemName: string;
}

interface ToastState {
  show: boolean;
  msg: string;
  type: 'success' | 'error';
}

interface ProductFormProps {
  initialData: Product | null;
  suppliers: Supplier[];
  onCancel: () => void;
  onSave: (formData: ProductCreate | ProductUpdate) => Promise<void>;
}

interface FormFieldProps {
  label: string;
  icon: ReactNode;
  value: string;
  onChange: (val: string) => void;
  type?: string;
}

// --- Main Page Component ---

export default function ProductsPage() {
  const [mounted, setMounted] = useState<boolean>(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
  const [view, setView] = useState<'table' | 'form'>('table');
  
  const [products, setProducts] = useState<Product[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  
  const [toast, setToast] = useState<ToastState>({ show: false, msg: '', type: 'success' });

  useEffect(() => {
    setMounted(true);
    fetchInitialData();
  }, []);

  const fetchInitialData = async (): Promise<void> => {
    try {
      setLoading(true);
      const [prodData, suppData] = await Promise.all([
        ProductsService.getAll(),
        SuppliersService.getAll()
      ]);
      setProducts(prodData);
      setSuppliers(suppData);
    } catch (err) {
      triggerToast("Failed to sync inventory", "error");
    } finally {
      setLoading(false);
    }
  };

  const triggerToast = (msg: string, type: ToastState['type'] = 'success'): void => {
    setToast({ show: true, msg, type });
    setTimeout(() => setToast(prev => ({ ...prev, show: false })), 3000);
  };

  const handleSave = async (formData: ProductCreate | ProductUpdate): Promise<void> => {
    try {
      if (selectedProduct) {
        await ProductsService.update(selectedProduct.id, formData);
        triggerToast("Product updated successfully");
      } else {
        await ProductsService.create(formData as ProductCreate);
        triggerToast("New product cataloged");
      }
      await fetchInitialData();
      setView('table');
      setSelectedProduct(null);
    } catch (err) {
      triggerToast("Save failed. Check SKU uniqueness.", "error");
    }
  };

  const confirmDelete = async (): Promise<void> => {
    if (!productToDelete) return;
    try {
      await ProductsService.delete(productToDelete.id);
      setProducts(prev => prev.filter(p => p.id !== productToDelete.id));
      triggerToast("Product removed");
      setProductToDelete(null);
    } catch (err) {
      triggerToast("Error deleting item", "error");
    }
  };

  if (!mounted) return null;

  return (
    <div className="flex h-screen bg-[#F8FAFC] overflow-hidden">
      <Sidebar isOpen={isSidebarOpen} toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        <Header onOpenSidebar={() => setIsSidebarOpen(true)} />

        <DeleteConfirmationModal 
          isOpen={!!productToDelete}
          onClose={() => setProductToDelete(null)}
          onConfirm={confirmDelete}
          itemName={productToDelete?.name || ''}
        />

        <AnimatePresence>
          {toast.show && (
            <motion.div 
              initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}
              className={`fixed top-20 right-8 z-[110] px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3 text-white ${
                toast.type === 'success' ? 'bg-emerald-500' : 'bg-rose-500'
              }`}
            >
              {toast.type === 'success' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
              <span className="font-bold text-sm">{toast.msg}</span>
            </motion.div>
          )}
        </AnimatePresence>

        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="max-w-7xl mx-auto space-y-6">
            {view === 'table' ? (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Products</h1>
                  <button 
                    onClick={() => { setSelectedProduct(null); setView('form'); }}
                    className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-95"
                  >
                    <Plus size={18} /> Add Product
                  </button>
                </div>

                <div className="bg-white rounded-[32px] border border-slate-200 shadow-sm overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-100 text-slate-400 text-[11px] font-bold uppercase tracking-widest">
                          <th className="px-6 py-5">Item</th>
                          <th className="px-6 py-5">SKU</th>
                          <th className="px-6 py-5">Stock</th>
                          <th className="px-6 py-5">Status</th>
                          <th className="px-6 py-5 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50">
                        {loading ? (
                          <tr>
                            <td colSpan={5} className="py-20 text-center text-slate-400 font-medium">
                              <Loader2 className="animate-spin mx-auto mb-2" size={24} />
                              Syncing inventory...
                            </td>
                          </tr>
                        ) : products.map((product) => (
                          <tr key={product.id} className="group hover:bg-slate-50/50 transition-colors">
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 border border-slate-200"><ImageIcon size={20} /></div>
                                <span className="text-sm font-bold text-slate-900">{product.name}</span>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-sm font-medium text-slate-500">{product.sku}</td>
                            <td className="px-6 py-4 text-sm font-bold text-slate-700">{product.quantity}</td>
                            <td className="px-6 py-4"><StatusBadge status={product.status} /></td>
                            <td className="px-6 py-4">
                              <div className="flex justify-end gap-1">
                                <button onClick={() => { setSelectedProduct(product); setView('form'); }} className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"><Edit2 size={16} /></button>
                                <button onClick={() => setProductToDelete(product)} className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"><Trash2 size={16} /></button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            ) : (
              <ProductForm 
                initialData={selectedProduct} 
                suppliers={suppliers}
                onCancel={() => setView('table')} 
                onSave={handleSave} 
              />
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

// --- Internal Components ---

function ProductForm({ initialData, suppliers, onCancel, onSave }: ProductFormProps) {
  const [form, setForm] = useState<ProductCreate>({
    name: initialData?.name || '',
    sku: initialData?.sku || '',
    price: initialData?.price || 0,
    quantity: initialData?.quantity || 0,
    supplier_id: initialData?.supplier_id || 0,
    status: initialData?.status || 'In Stock'
  });

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    await onSave(form);
    setIsSubmitting(false);
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 pb-24">
      <div className="flex items-center gap-4">
        <button onClick={onCancel} className="p-2 hover:bg-white border border-transparent hover:border-slate-200 rounded-xl transition-all">
          <ArrowLeft size={20} className="text-slate-600" />
        </button>
        <h1 className="text-2xl font-bold text-slate-900">{initialData ? 'Edit Product' : 'Add New Item'}</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white p-8 rounded-[32px] border border-slate-200 shadow-sm space-y-6">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2"><Package size={14} /> Basic Details</h3>
            <div className="space-y-4">
              <FormField label="Product Name" icon={<Package size={18}/>} value={form.name} onChange={(v) => setForm({...form, name: v})} />
              <div className="grid grid-cols-2 gap-4">
                <FormField label="SKU" icon={<Hash size={18}/>} value={form.sku} onChange={(v) => setForm({...form, sku: v})} />
                
                {/* SUPPLIER SELECT WITH COLOR DYNAMICS */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 ml-1">Supplier</label>
                  <div className="relative group">
                    <select 
                      value={form.supplier_id}
                      onChange={(e) => setForm({...form, supplier_id: parseInt(e.target.value)})}
                      className={`w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm outline-none focus:bg-white focus:ring-4 ring-indigo-500/5 transition-all appearance-none cursor-pointer ${
                        form.supplier_id === 0 ? 'text-slate-400' : 'text-black font-medium'
                      }`}
                    >
                      <option value={0}>Select Supplier...</option>
                      {suppliers.map((s) => (
                        <option key={s.id} value={s.id} className="text-black">{s.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white p-8 rounded-[32px] border border-slate-200 shadow-sm space-y-6">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2"><DollarSign size={14} /> Inventory</h3>
            <div className="grid grid-cols-2 gap-4">
              <FormField label="Price ($)" type="number" icon={<DollarSign size={18}/>} value={form.price.toString()} onChange={(v) => setForm({...form, price: parseFloat(v) || 0})} />
              <FormField label="Stock" type="number" icon={<Layers size={18}/>} value={form.quantity.toString()} onChange={(v) => setForm({...form, quantity: parseInt(v) || 0})} />
            </div>
          </div>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 md:left-64 bg-white/80 backdrop-blur-md border-t border-slate-100 p-4 z-40">
        <div className="max-w-4xl mx-auto flex justify-end gap-3">
          <button onClick={onCancel} className="px-6 py-3 text-slate-500 rounded-xl text-sm font-bold hover:bg-slate-50 transition-all">Cancel</button>
          <button 
            disabled={isSubmitting || form.supplier_id === 0}
            onClick={handleSubmit} 
            className="flex items-center gap-2 px-8 py-3 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition-all active:scale-95 disabled:opacity-50"
          >
            {isSubmitting ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
            {initialData ? 'Update Item' : 'Save Product'}
          </button>
        </div>
      </div>
    </motion.div>
  );
}

function DeleteConfirmationModal({ isOpen, onClose, onConfirm, itemName }: DeleteModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" />
          <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="relative bg-white rounded-[40px] p-10 max-w-sm w-full shadow-2xl text-center">
            <div className="w-16 h-16 bg-rose-50 rounded-3xl flex items-center justify-center text-rose-600 mb-6 mx-auto"><AlertCircle size={32} /></div>
            <h2 className="text-2xl font-black text-slate-900 mb-2">Delete Item?</h2>
            <p className="text-slate-500 text-sm leading-relaxed mb-10">Are you sure you want to remove <span className="font-bold text-slate-900">{itemName}</span>? This cannot be undone.</p>
            <div className="flex gap-4">
              <button onClick={onClose} className="flex-1 py-4 font-bold text-slate-500 rounded-2xl hover:bg-slate-50 transition-all">Keep</button>
              <button onClick={onConfirm} className="flex-1 py-4 bg-rose-600 text-white font-bold rounded-2xl hover:bg-rose-700 shadow-lg shadow-rose-200 transition-all">Delete</button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

function FormField({ label, icon, value, onChange, type = "text" }: FormFieldProps) {
  return (
    <div className="space-y-1.5 w-full">
      <label className="text-xs font-bold text-slate-700 ml-1">{label}</label>
      <div className="relative group">
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors">{icon}</div>
        <input 
          type={type} value={value} 
          onChange={(e: ChangeEvent<HTMLInputElement>) => onChange(e.target.value)}
          className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm outline-none text-black focus:bg-white focus:ring-4 ring-indigo-500/5 transition-all"
        />
      </div>
    </div>
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