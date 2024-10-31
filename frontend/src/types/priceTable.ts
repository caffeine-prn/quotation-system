export interface PriceTableItem {
  id: string;
  name: string;
  unit: string;
  unitPrice: number;
  description?: string;
  note?: string;
  category: string;
  mediaType: string;
}

export interface PriceTable {
  id: string;
  name: string;
  version: string;
  effectiveDate: string;
  items: PriceTableItem[];
  createdAt: string;
  updatedAt: string;
}

export interface ImportPreview {
  headers: string[];
  rows: string[][];
  mappings: {
    [key: string]: string;  // Excel column -> PriceTableItem field
  };
  validationErrors?: {
    row: number;
    column: string;
    message: string;
  }[];
}

export interface ImportResult {
  success: boolean;
  totalRows: number;
  importedRows: number;
  errors?: {
    row: number;
    message: string;
  }[];
}