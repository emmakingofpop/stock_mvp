import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// --- Types based on your Backend Schemas ---

export interface Supplier {
  id: number;
  name: string;
  contact_person: string;
  email: string;
  phone: string;
  category: string;
  linked_products_count: number;
  address: string;
  user_id: number;
}

// SupplierCreate matches your backend (no user_id needed in body)
export interface SupplierCreate {
  name: string;
  contact_person: string;
  email: string;
  phone: string;
  category: string;
  linked_products_count: number;
  address: string;
}

// --- Auth Helper ---

const getAuthHeader = () => {
  const token = localStorage.getItem('token_stock'); 
  return {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  };
};

// --- CRUD Operations ---

export const SuppliersService = {
  /**
   * Fetch all suppliers for the authenticated user
   */
  getAll: async (): Promise<Supplier[]> => {
    const response = await axios.get(`${API_URL}/suppliers/`, getAuthHeader());
    return response.data;
  },

  /**
   * Get a single supplier by ID
   */
  getOne: async (id: number): Promise<Supplier> => {
    const response = await axios.get(`${API_URL}/suppliers/${id}`, getAuthHeader());
    return response.data;
  },

  /**
   * Create a new supplier
   */
  create: async (data: SupplierCreate): Promise<Supplier> => {
    const response = await axios.post(`${API_URL}/suppliers/`, data, getAuthHeader());
    return response.data;
  },

  /**
   * Update an existing supplier
   */
  update: async (id: number, data: SupplierCreate): Promise<Supplier> => {
    const response = await axios.put(`${API_URL}/suppliers/${id}`, data, getAuthHeader());
    return response.data;
  },

  /**
   * Delete a supplier
   */
  delete: async (id: number): Promise<void> => {
    await axios.delete(`${API_URL}/suppliers/${id}`, getAuthHeader());
  }
};