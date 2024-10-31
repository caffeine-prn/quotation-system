import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { 
  Quotation, 
  QuotationFilter, 
  QuotationSort, 
  QuotationPagination,
  QuotationListResponse 
} from '../types/quotation';
import { quotationService } from '../services/quotationService';

interface QuotationState {
  quotations: Quotation[];
  loading: boolean;
  error: string | null;
  filter: QuotationFilter;
  sort: QuotationSort;
  pagination: QuotationPagination;
}

const initialState: QuotationState = {
  quotations: [],
  loading: false,
  error: null,
  filter: {},
  sort: {
    field: 'date',
    direction: 'desc'
  },
  pagination: {
    page: 1,
    pageSize: 10,
    total: 0
  }
};

// Async thunks
export const fetchQuotations = createAsyncThunk(
  'quotation/fetchQuotations',
  async (_, { getState, rejectWithValue }) => {
    try {
      const state = getState() as { quotation: QuotationState };
      const { filter, sort, pagination } = state.quotation;
      const response = await quotationService.getQuotations(
        filter,
        sort,
        { page: pagination.page, pageSize: pagination.pageSize }
      );
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch quotations');
    }
  }
);

export const deleteQuotation = createAsyncThunk(
  'quotation/deleteQuotation',
  async (id: string, { rejectWithValue }) => {
    try {
      await quotationService.deleteQuotation(id);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete quotation');
    }
  }
);

const quotationSlice = createSlice({
  name: 'quotation',
  initialState,
  reducers: {
    setFilter: (state, action: PayloadAction<QuotationFilter>) => {
      state.filter = action.payload;
      state.pagination.page = 1; // Reset to first page when filter changes
    },
    setSort: (state, action: PayloadAction<QuotationSort>) => {
      state.sort = action.payload;
    },
    setPage: (state, action: PayloadAction<number>) => {
      state.pagination.page = action.payload;
    },
    setPageSize: (state, action: PayloadAction<number>) => {
      state.pagination.pageSize = action.payload;
      state.pagination.page = 1; // Reset to first page when page size changes
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchQuotations.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchQuotations.fulfilled, (state, action: PayloadAction<QuotationListResponse>) => {
        state.loading = false;
        state.quotations = action.payload.quotations;
        state.pagination.total = action.payload.pagination.total;
      })
      .addCase(fetchQuotations.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(deleteQuotation.fulfilled, (state, action) => {
        state.quotations = state.quotations.filter(q => q.id !== action.payload);
      });
  },
});

export const { setFilter, setSort, setPage, setPageSize } = quotationSlice.actions;
export default quotationSlice.reducer;