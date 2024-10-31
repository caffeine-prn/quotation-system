import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import {
  Company,
  Product,
  MediaType,
  CompanyFilter,
  ProductFilter,
  MediaTypeFilter,
} from '../types/company';
import axios from 'axios';

interface CompanyState {
  companies: Company[];
  products: Product[];
  mediaTypes: MediaType[];
  currentCompany: Company | null;
  currentProduct: Product | null;
  currentMediaType: MediaType | null;
  loading: boolean;
  error: string | null;
  companyFilter: CompanyFilter;
  productFilter: ProductFilter;
  mediaTypeFilter: MediaTypeFilter;
  pagination: {
    page: number;
    pageSize: number;
    total: number;
  };
}

const initialState: CompanyState = {
  companies: [],
  products: [],
  mediaTypes: [],
  currentCompany: null,
  currentProduct: null,
  currentMediaType: null,
  loading: false,
  error: null,
  companyFilter: {},
  productFilter: {},
  mediaTypeFilter: {},
  pagination: {
    page: 1,
    pageSize: 10,
    total: 0,
  },
};

// Companies
export const fetchCompanies = createAsyncThunk(
  'company/fetchCompanies',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get('/api/companies');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch companies');
    }
  }
);

export const createCompany = createAsyncThunk(
  'company/createCompany',
  async (company: Partial<Company>, { rejectWithValue }) => {
    try {
      const response = await axios.post('/api/companies', company);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create company');
    }
  }
);

export const updateCompany = createAsyncThunk(
  'company/updateCompany',
  async ({ id, data }: { id: string; data: Partial<Company> }, { rejectWithValue }) => {
    try {
      const response = await axios.put(`/api/companies/${id}`, data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update company');
    }
  }
);

export const deleteCompany = createAsyncThunk(
  'company/deleteCompany',
  async (id: string, { rejectWithValue }) => {
    try {
      await axios.delete(`/api/companies/${id}`);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete company');
    }
  }
);

// Products
export const fetchProducts = createAsyncThunk(
  'company/fetchProducts',
  async (companyId?: string, { rejectWithValue }) => {
    try {
      const url = companyId ? `/api/companies/${companyId}/products` : '/api/products';
      const response = await axios.get(url);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch products');
    }
  }
);

export const createProduct = createAsyncThunk(
  'company/createProduct',
  async (product: Partial<Product>, { rejectWithValue }) => {
    try {
      const response = await axios.post('/api/products', product);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create product');
    }
  }
);

export const updateProduct = createAsyncThunk(
  'company/updateProduct',
  async ({ id, data }: { id: string; data: Partial<Product> }, { rejectWithValue }) => {
    try {
      const response = await axios.put(`/api/products/${id}`, data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update product');
    }
  }
);

export const deleteProduct = createAsyncThunk(
  'company/deleteProduct',
  async (id: string, { rejectWithValue }) => {
    try {
      await axios.delete(`/api/products/${id}`);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete product');
    }
  }
);

// Media Types
export const fetchMediaTypes = createAsyncThunk(
  'company/fetchMediaTypes',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get('/api/media-types');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch media types');
    }
  }
);

export const createMediaType = createAsyncThunk(
  'company/createMediaType',
  async (mediaType: Partial<MediaType>, { rejectWithValue }) => {
    try {
      const response = await axios.post('/api/media-types', mediaType);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create media type');
    }
  }
);

export const updateMediaType = createAsyncThunk(
  'company/updateMediaType',
  async ({ id, data }: { id: string; data: Partial<MediaType> }, { rejectWithValue }) => {
    try {
      const response = await axios.put(`/api/media-types/${id}`, data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update media type');
    }
  }
);

export const deleteMediaType = createAsyncThunk(
  'company/deleteMediaType',
  async (id: string, { rejectWithValue }) => {
    try {
      await axios.delete(`/api/media-types/${id}`);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete media type');
    }
  }
);

const companySlice = createSlice({
  name: 'company',
  initialState,
  reducers: {
    setCompanyFilter: (state, action: PayloadAction<CompanyFilter>) => {
      state.companyFilter = action.payload;
      state.pagination.page = 1;
    },
    setProductFilter: (state, action: PayloadAction<ProductFilter>) => {
      state.productFilter = action.payload;
      state.pagination.page = 1;
    },
    setMediaTypeFilter: (state, action: PayloadAction<MediaTypeFilter>) => {
      state.mediaTypeFilter = action.payload;
      state.pagination.page = 1;
    },
    setPage: (state, action: PayloadAction<number>) => {
      state.pagination.page = action.payload;
    },
    clearCurrentItems: (state) => {
      state.currentCompany = null;
      state.currentProduct = null;
      state.currentMediaType = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Companies
      .addCase(fetchCompanies.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCompanies.fulfilled, (state, action) => {
        state.loading = false;
        state.companies = action.payload.companies;
        state.pagination.total = action.payload.total;
      })
      .addCase(fetchCompanies.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(createCompany.fulfilled, (state, action) => {
        state.companies.unshift(action.payload);
      })
      .addCase(updateCompany.fulfilled, (state, action) => {
        const index = state.companies.findIndex((c) => c.id === action.payload.id);
        if (index !== -1) {
          state.companies[index] = action.payload;
        }
      })
      .addCase(deleteCompany.fulfilled, (state, action) => {
        state.companies = state.companies.filter((c) => c.id !== action.payload);
      })
      // Products
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.products = action.payload.products;
      })
      .addCase(createProduct.fulfilled, (state, action) => {
        state.products.unshift(action.payload);
      })
      .addCase(updateProduct.fulfilled, (state, action) => {
        const index = state.products.findIndex((p) => p.id === action.payload.id);
        if (index !== -1) {
          state.products[index] = action.payload;
        }
      })
      .addCase(deleteProduct.fulfilled, (state, action) => {
        state.products = state.products.filter((p) => p.id !== action.payload);
      })
      // Media Types
      .addCase(fetchMediaTypes.fulfilled, (state, action) => {
        state.mediaTypes = action.payload.mediaTypes;
      })
      .addCase(createMediaType.fulfilled, (state, action) => {
        state.mediaTypes.unshift(action.payload);
      })
      .addCase(updateMediaType.fulfilled, (state, action) => {
        const index = state.mediaTypes.findIndex((m) => m.id === action.payload.id);
        if (index !== -1) {
          state.mediaTypes[index] = action.payload;
        }
      })
      .addCase(deleteMediaType.fulfilled, (state, action) => {
        state.mediaTypes = state.mediaTypes.filter((m) => m.id !== action.payload);
      });
  },
});

export const {
  setCompanyFilter,
  setProductFilter,
  setMediaTypeFilter,
  setPage,
  clearCurrentItems,
} = companySlice.actions;

export default companySlice.reducer;