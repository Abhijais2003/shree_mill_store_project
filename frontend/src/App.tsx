import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import ProductList from './pages/ProductList';
import ProductForm from './pages/ProductForm';
import BillScanner from './pages/BillScanner';
import ActivityLogPage from './pages/ActivityLog';
import Settings from './pages/Settings';

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/products" element={<ProductList />} />
        <Route path="/products/new" element={<ProductForm />} />
        <Route path="/products/:id/edit" element={<ProductForm />} />
        <Route path="/scan" element={<BillScanner />} />
        <Route path="/activity" element={<ActivityLogPage />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}
