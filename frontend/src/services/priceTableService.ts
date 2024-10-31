import api from './api';

export interface PriceTableItem {
  id: number;
  name: string;
  unit: string;
  unit_price: number;
  description?: string;
  notes?: string;
  valid_from: string;
  valid_until?: string;
}

export const priceTableService = {
  getPriceTables: async (companyId: number, params?: {
    skip?: number;
    limit?: number;
    valid_date?: string;
  }) => {
    const response = await api.get(`/price-tables/${companyId}`, { params });
    return response.data;
  },

  createPriceTable: async (companyId: number, data: Omit<PriceTableItem, 'id'>) => {
    const response = await api.post(`/price-tables/${companyId}`, data);
    return response.data;
  },

  updatePriceTable: async (id: number, data: Partial<PriceTableItem>) => {
    const response = await api.put(`/price-tables/${id}`, data);
    return response.data;
  },

  deletePriceTable: async (id: number) => {
    const response = await api.delete(`/price-tables/${id}`);
    return response.data;
  },

  importPriceTables: async (companyId: number, file: File, validFrom: string, validUntil?: string) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('valid_from', validFrom);
    if (validUntil) {
      formData.append('valid_until', validUntil);
    }

    const response = await api.post(
      `/price-tables/${companyId}/import`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data;
  },

  previewImport: async (companyId: number, file: File) => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await api.post(
      `/price-tables/${companyId}/import/preview`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data;
  },

  exportPriceTables: async (
    companyId: number,
    startDate?: string,
    endDate?: string
  ) => {
    const response = await api.get(
      `/price-tables/${companyId}/export`,
      {
        params: {
          start_date: startDate,
          end_date: endDate,
        },
        responseType: 'blob',
      }
    );
    
    // 파일 다운로드 처리
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute(
      'download',
      `price_tables_${companyId}_${new Date().toISOString().split('T')[0]}.xlsx`
    );
    document.body.appendChild(link);
    link.click();
    link.remove();
  },
};