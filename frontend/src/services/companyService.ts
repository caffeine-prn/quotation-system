import api from './api';

export interface Company {
  id: number;
  name: string;
  description?: string;
  contact_person?: string;
  contact_email?: string;
  contact_phone?: string;
  is_active: boolean;
  products: Product[];
  media_types: MediaType[];
}

export interface Product {
  id: number;
  name: string;
  description?: string;
  is_active: boolean;
  company_id: number;
}

export interface MediaType {
  id: number;
  name: string;
  description?: string;
  is_active: boolean;
  company_id: number;
}

export const companyService = {
  // Company APIs
  getCompanies: async (params?: {
    skip?: number;
    limit?: number;
    include_inactive?: boolean;
  }) => {
    const response = await api.get('/companies', { params });
    return response.data;
  },

  getCompany: async (id: number) => {
    const response = await api.get(`/companies/${id}`);
    return response.data;
  },

  createCompany: async (data: Omit<Company, 'id' | 'products' | 'media_types'>) => {
    const response = await api.post('/companies', data);
    return response.data;
  },

  updateCompany: async (id: number, data: Partial<Company>) => {
    const response = await api.put(`/companies/${id}`, data);
    return response.data;
  },

  deleteCompany: async (id: number) => {
    const response = await api.delete(`/companies/${id}`);
    return response.data;
  },

  // Product APIs
  getProducts: async (companyId: number, params?: {
    skip?: number;
    limit?: number;
    include_inactive?: boolean;
  }) => {
    const response = await api.get(`/companies/${companyId}/products`, { params });
    return response.data;
  },

  createProduct: async (companyId: number, data: Omit<Product, 'id' | 'company_id'>) => {
    const response = await api.post(`/companies/${companyId}/products`, data);
    return response.data;
  },

  updateProduct: async (id: number, data: Partial<Product>) => {
    const response = await api.put(`/companies/products/${id}`, data);
    return response.data;
  },

  deleteProduct: async (id: number) => {
    const response = await api.delete(`/companies/products/${id}`);
    return response.data;
  },

  // Media Type APIs
  getMediaTypes: async (companyId: number, params?: {
    skip?: number;
    limit?: number;
    include_inactive?: boolean;
  }) => {
    const response = await api.get(`/companies/${companyId}/media-types`, { params });
    return response.data;
  },

  createMediaType: async (companyId: number, data: Omit<MediaType, 'id' | 'company_id'>) => {
    const response = await api.post(`/companies/${companyId}/media-types`, data);
    return response.data;
  },

  updateMediaType: async (id: number, data: Partial<MediaType>) => {
    const response = await api.put(`/companies/media-types/${id}`, data);
    return response.data;
  },

  deleteMediaType: async (id: number) => {
    const response = await api.delete(`/companies/media-types/${id}`);
    return response.data;
  },

  // Product Assignment APIs
  assignProducts: async (userId: number, productIds: number[]) => {
    const response = await api.post('/companies/products/assign', {
      user_id: userId,
      product_ids: productIds,
    });
    return response.data;
  },

  getUserProducts: async (userId: number, params?: {
    skip?: number;
    limit?: number;
  }) => {
    const response = await api.get(`/companies/users/${userId}/products`, { params });
    return response.data;
  },
};