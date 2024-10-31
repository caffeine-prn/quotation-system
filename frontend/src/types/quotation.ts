export type QuotationStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface QuotationItem {
  id: string;
  mediaType: string;
  unitPrice: number;
  quantity: number;
  discount: number;
  totalPrice: number;
}

export interface Quotation {
  id: string;
  quoteNumber: string;
  date: string;
  validUntil: string;
  customer: string;
  projectDescription: string;
  status: QuotationStatus;
  author: {
    id: string;
    name: string;
  };
  totalAmount: number;
  items: QuotationItem[];
  createdAt: string;
  updatedAt: string;
}

export interface QuotationFilter {
  search?: string;
  dateRange?: {
    start: string;
    end: string;
  };
  status?: QuotationStatus;
  author?: string;
}

export interface QuotationSort {
  field: 'date' | 'quoteNumber' | 'totalAmount';
  direction: 'asc' | 'desc';
}

export interface QuotationPagination {
  page: number;
  pageSize: number;
  total: number;
}

export interface QuotationListResponse {
  quotations: Quotation[];
  pagination: QuotationPagination;
}