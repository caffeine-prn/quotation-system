import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { PriceTable, PriceTableItem } from '../types/priceTable';
import axios from 'axios';

interface PriceTableState {
  priceTables: PriceTable[];
  currentPriceTable: PriceTable | null;
  loading: boolean;
  error: string | null;
  filter: {
    search?: string;
    mediaType?: string;
    category?: string;
  };
  pagination: {
    page: number;
    pageSize: number;
    total: number;
  };
}

const initialState: PriceTableState = {
  priceTables: [],
  currentPriceTable: null,
  loading: false,
  error: null,
  filter: {},
  pagination: {
    page: 1,
    pageSize: 10,
    total: 0,
  },
};

// Async Thunks
export const fetchPriceTables = createAsyncThunk(
  'priceTables/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get('/api/price-tables');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch price tables');
    }
  }
);

export const fetchPriceTableById = createAsyncThunk(
  'priceTables/fetchById',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await axios.get(`/api/price-tables/${id}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch price table');
    }
  }
);

export const createPriceTable = createAsyncThunk(
  'priceTables/create',
  async (priceTable: Partial<PriceTable>, { rejectWithValue }) => {
    try {
      const response = await axios.post('/api/price-tables', priceTable);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create price table');
    }
  }
);

export const updatePriceTable = createAsyncThunk(
  'priceTables/update',
  async ({ id, data }: { id: string; data: Partial<PriceTable> }, { rejectWithValue }) => {
    try {
      const response = await axios.put(`/api/price-tables/${id}`, data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update price table');
    }
  }
);

export const deletePriceTable = createAsyncThunk(
  'priceTables/delete',
  async (id: string, { rejectWithValue }) => {
    try {
      await axios.delete(`/api/price-tables/${id}`);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete price table');
    }
  }
);

const priceTableSlice = createSlice({
  name: 'priceTables',
  initialState,
  reducers: {
    setFilter: (state, action: PayloadAction<typeof initialState.filter>) => {
      state.filter = action.payload;
      state.pagination.page = 1;
    },
    setPage: (state, action: PayloadAction<number>) => {
      state.pagination.page = action.payload;
    },
    setPageSize: (state, action: PayloadAction<number>) => {
      state.pagination.pageSize = action.payload;
      state.pagination.page = 1;
    },
    clearCurrentPriceTable: (state) => {
      state.currentPriceTable = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch all price tables
      .addCase(fetchPriceTables.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPriceTables.fulfilled, (state, action) => {
        state.loading = false;
        state.priceTables = action.payload.priceTables;
        state.pagination.total = action.payload.total;
      })
      .addCase(fetchPriceTables.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Fetch single price table
      .addCase(fetchPriceTableById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPriceTableById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentPriceTable = action.payload;
      })
      .addCase(fetchPriceTableById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Create price table
      .addCase(createPriceTable.fulfilled, (state, action) => {
        state.priceTables.unshift(action.payload);
      })
      // Update price table
      .addCase(updatePriceTable.fulfilled, (state, action) => {
        const index = state.priceTables.findIndex((pt) => pt.id === action.payload.id);
        if (index !== -1) {
          state.priceTables[index] = action.payload;
        }
        if (state.currentPriceTable?.id === action.payload.id) {
          state.currentPriceTable = action.payload;
        }
      })
      // Delete price table
      .addCase(deletePriceTable.fulfilled, (state, action) => {
        state.priceTables = state.priceTables.filter((pt) => pt.id !== action.payload);
        if (state.currentPriceTable?.id === action.payload) {
          state.currentPriceTable = null;
        }
      });
  },
});

export const { setFilter, setPage, setPageSize, clearCurrentPriceTable } = priceTableSlice.actions;
export default priceTableSlice.reducer;