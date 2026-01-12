import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// --- Types based on your Backend Schemas ---

export interface Product {
  id: number;
  name: string;
  sku: string;
  image: string | null;
  quantity: number;
  price: number;
  status: 'In Stock' | 'Low' | 'Out';
  supplier_id: number;
  user_id: number;
}

export interface ProductCreate {
  name: string;
  sku: string;
  image?: string | null;
  quantity: number;
  price: number;
  status: string;
  supplier_id: number;
}

// ProductUpdate allows partial fields for PATCH requests
export type ProductUpdate = Partial<ProductCreate>;

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

export const ProductsService = {
  /**
   * Fetch all products for the authenticated user
   */
  getAll: async (): Promise<Product[]> => {
    const response = await axios.get(`${API_URL}/products/`, getAuthHeader());
    return response.data;
  },

  /**
   * Get a single product by ID
   */
  getOne: async (id: number): Promise<Product> => {
    const response = await axios.get(`${API_URL}/products/${id}`, getAuthHeader());
    return response.data;
  },

  /**
   * Create a new product
   */
  create: async (data: ProductCreate): Promise<Product> => {
    const response = await axios.post(`${API_URL}/products/`, data, getAuthHeader());
    return response.data;
  },

  /**
   * Update an existing product (PATCH)
   */
  update: async (id: number, data: ProductUpdate): Promise<Product> => {
    const response = await axios.patch(`${API_URL}/products/${id}`, data, getAuthHeader());
    return response.data;
  },

  /**
   * Delete a product
   */
  delete: async (id: number): Promise<void> => {
    await axios.delete(`${API_URL}/products/${id}`, getAuthHeader());
  }
};