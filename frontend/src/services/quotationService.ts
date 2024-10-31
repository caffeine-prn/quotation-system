import api from './api';

export interface QuotationItem {
  price_table_id: number;
  quantity: number;
  unit_price: number;
  discount_amount?: number;
}

export interface QuotationData {
  customer_id: number;
  project_description: string;
  valid_until: string;
  discount_amount?: number;
  items: QuotationItem[];
}

export const quotationService = {
  getQuotations: async (skip = 0, limit = 10) => {
    const response = await api.get(`/quotations?skip=${skip}&limit=${limit}`);
    return response.data;
  },

  getQuotation: async (id: number) => {
    const response = await api.get(`/quotations/${id}`);
    return response.data;
  },

  createQuotation: async (data: QuotationData) => {
    const response = await api.post('/quotations', data);
    return response.data;
  },

  updateQuotation: async (id: number, data: Partial<QuotationData>) => {
    const response = await api.put(`/quotations/${id}`, data);
    return response.data;
  },

  deleteQuotation: async (id: number) => {
    const response = await api.delete(`/quotations/${id}`);
    return response.data;
  },

  getQuotationVersions: async (quoteNumber: string) => {
    const response = await api.get(`/quotations/versions/${quoteNumber}`);
    return response.data;
  },

  updateQuotationStatus: async (id: number, status: string) => {
    const response = await api.put(`/quotations/${id}/status?status=${status}`);
    return response.data;
  },

  exportToExcel: async (id: number) => {
    const response = await api.get(`/quotations/${id}/export/excel`, {
      responseType: 'blob'
    });
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `quotation_${id}.xlsx`);
    document.body.appendChild(link);
    link.click();
    link.parentNode?.removeChild(link);
  },

  exportToPDF: async (id: number) => {
    const response = await api.get(`/quotations/${id}/export/pdf`, {
      responseType: 'blob'
    });
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `quotation_${id}.pdf`);
    document.body.appendChild(link);
    link.click();
    link.parentNode?.removeChild(link);
  },
};