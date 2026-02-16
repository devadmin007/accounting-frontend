import { Toaster } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '@/contexts/AuthContext';
import { DataProvider } from '@/contexts/DataContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import Layout from '@/components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Products from './pages/Products';
import AddProduct from './pages/AddProduct';
import EditProduct from './pages/EditProduct';
import Sales from './pages/Sales';
import CreateBill from './pages/CreateBill';
import EditSale from './pages/EditSale';
import Purchases from './pages/Purchases';
import AddPurchase from './pages/AddPurchase';
import EditPurchase from './pages/EditPurchase';
import Accounts from './pages/Accounts';
import NotFound from './pages/NotFound';

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <BrowserRouter>
        <AuthProvider>
          <DataProvider>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/" element={<Navigate to="/dashboard" replace />} />

              <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/products" element={<Products />} />
                <Route path="/products/add" element={<AddProduct />} />
                <Route path="/products/edit/:id" element={<EditProduct />} />
                <Route path="/sales" element={<Sales />} />
                <Route path="/sales/create" element={<CreateBill />} />
                <Route path="/sales/edit/:id" element={<EditSale />} />
                <Route path="/purchases" element={<Purchases />} />
                <Route path="/purchases/add" element={<AddPurchase />} />
                <Route path="/purchases/edit/:id" element={<EditPurchase />} />
                <Route path="/accounts" element={<Accounts />} />
              </Route>

              <Route path="*" element={<NotFound />} />
            </Routes>
          </DataProvider>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;