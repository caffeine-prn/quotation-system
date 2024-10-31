import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './store';

// Auth
import ProtectedRoute from './components/auth/ProtectedRoute';
import UnauthorizedPage from './pages/auth/UnauthorizedPage';

// Quotation
import QuotationList from './components/quotation/QuotationList';
import QuotationEdit from './pages/quotation/QuotationEdit';

// Company/Product
import CompanyPage from './pages/company/CompanyPage';
import CompanyEditPage from './pages/company/CompanyEditPage';
import ProductEditPage from './pages/company/ProductEditPage';

// Price Table
import PriceTableList from './components/priceTable/PriceTableList';
import PriceTableEditPage from './pages/priceTable/PriceTableEditPage';
import PriceTableImportPage from './pages/priceTable/PriceTableImportPage';

function App() {
  return (
    <Provider store={store}>
      <Router>
        <Routes>
          {/* Auth Routes */}
          <Route path="/unauthorized" element={<UnauthorizedPage />} />

          {/* Quotation Routes */}
          <Route
            path="/quotations"
            element={
              <ProtectedRoute action="read" resource="quotation">
                <QuotationList />
              </ProtectedRoute>
            }
          />
          <Route
            path="/quotations/new"
            element={
              <ProtectedRoute action="create" resource="quotation">
                <QuotationEdit />
              </ProtectedRoute>
            }
          />
          <Route
            path="/quotations/:id/edit"
            element={
              <ProtectedRoute action="update" resource="quotation">
                <QuotationEdit />
              </ProtectedRoute>
            }
          />

          {/* Company Routes */}
          <Route
            path="/companies"
            element={
              <ProtectedRoute action="read" resource="company">
                <CompanyPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/companies/new"
            element={
              <ProtectedRoute action="create" resource="company">
                <CompanyEditPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/companies/:id/edit"
            element={
              <ProtectedRoute action="update" resource="company">
                <CompanyEditPage />
              </ProtectedRoute>
            }
          />

          {/* Product Routes */}
          <Route
            path="/products"
            element={
              <ProtectedRoute action="read" resource="product">
                <CompanyPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/products/new"
            element={
              <ProtectedRoute action="create" resource="product">
                <ProductEditPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/products/:id/edit"
            element={
              <ProtectedRoute action="update" resource="product">
                <ProductEditPage />
              </ProtectedRoute>
            }
          />

          {/* Price Table Routes */}
          <Route
            path="/price-tables"
            element={
              <ProtectedRoute action="read" resource="price_table">
                <PriceTableList />
              </ProtectedRoute>
            }
          />
          <Route
            path="/price-tables/new"
            element={
              <ProtectedRoute action="create" resource="price_table">
                <PriceTableEditPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/price-tables/:id/edit"
            element={
              <ProtectedRoute action="update" resource="price_table">
                <PriceTableEditPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/price-tables/import"
            element={
              <ProtectedRoute action="create" resource="price_table">
                <PriceTableImportPage />
              </ProtectedRoute>
            }
          />
        </Routes>
      </Router>
    </Provider>
  );
}

export default App;