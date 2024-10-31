export interface Company {
  id: string;
  name: string;
  code: string;
  businessNumber: string;
  address: string;
  contact: string;
  email: string;
  status: 'ACTIVE' | 'INACTIVE';
  createdAt: string;
  updatedAt: string;
}

export interface Product {
  id: string;
  companyId: string;
  name: string;
  code: string;
  category: string;
  description?: string;
  status: 'ACTIVE' | 'INACTIVE';
  createdAt: string;
  updatedAt: string;
}

export interface MediaType {
  id: string;
  name: string;
  code: string;
  description?: string;
  status: 'ACTIVE' | 'INACTIVE';
  createdAt: string;
  updatedAt: string;
}

export interface CompanyFilter {
  search?: string;
  status?: 'ACTIVE' | 'INACTIVE';
}

export interface ProductFilter {
  search?: string;
  companyId?: string;
  category?: string;
  status?: 'ACTIVE' | 'INACTIVE';
}

export interface MediaTypeFilter {
  search?: string;
  status?: 'ACTIVE' | 'INACTIVE';
}