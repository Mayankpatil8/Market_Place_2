import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AuthProvider, useAuth } from './context/AuthContext';

// Public layout
import PublicLayout from './components/layout/PublicLayout';
import './components/layout/PublicLayout.css';

// App layout (sidebar)
import Layout from './components/layout/Layout';

// Public pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Services from './pages/public/Services';
import About from './pages/public/About';

// Customer pages
import CustomerDashboard from './pages/customer/Dashboard';
import ProductList from './pages/customer/ProductList';
import ProductDetail from './pages/customer/ProductDetail';
import Cart from './pages/customer/Cart';
import MyOrders from './pages/customer/MyOrders';
import Suggestions from './pages/customer/Suggestions';
import DealBoard from './pages/customer/DealBoard';

// Supplier pages
import SupplierDashboard from './pages/supplier/Dashboard';
import ManageProducts from './pages/supplier/ManageProducts';
import ManageDeals from './pages/supplier/ManageDeals';
import SupplierOrders from './pages/supplier/Orders';
import SupplierAnalytics from './pages/supplier/Analytics';

// Admin pages
import AdminDashboard from './pages/admin/Dashboard';
import AdminUsers from './pages/admin/Users';
import AdminOrders from './pages/admin/Orders';
import AdminDeals from './pages/admin/Deals';
import AdminProducts from './pages/admin/Products';
import ProfitLoss from './pages/admin/ProfitLoss';
import AdminCertifications from './pages/admin/AdminCertifications';

// Consulting module (Module C)
import ConsultingCatalogue from './pages/consulting/ConsultingCatalogue';
import ConsultingDetail from './pages/consulting/ConsultingDetail';
import MyConsulting from './pages/consulting/MyConsulting';
import AdminConsulting from './pages/admin/AdminConsulting';

// Certification module (Module B)
import CertificationCatalogue from './pages/certifications/CertificationCatalogue';
import CertificationDetail from './pages/certifications/CertificationDetail';
import MyCertifications from './pages/certifications/MyCertifications';

const PrivateRoute = ({ children, roles }) => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/" replace />;
  return children;
};

// Routes that need the dashboard Layout (sidebar)
const AppRoute = ({ children, roles }) => (
  <PrivateRoute roles={roles}>
    <Layout>{children}</Layout>
  </PrivateRoute>
);

function AppRoutes() {
  const { user } = useAuth();
  return (
    <Routes>

      
<Route element={<PublicLayout />}>
  <Route path="/" element={<Home />} />
  <Route path="/services" element={<Services />} />
  <Route path="/about" element={<About />} />

  {/* ✅ PUBLIC */}
  <Route path="/certifications" element={<CertificationCatalogue />} />
  <Route path="/certifications/:id" element={<CertificationDetail />} />

  {/* ✅ PUBLIC */}
  <Route path="/consulting" element={<ConsultingCatalogue />} />
  <Route path="/consulting/:id" element={<ConsultingDetail />} />

  <Route
    path="/login"
    element={
      user
        ? <Navigate to={user.role === 'admin' ? '/admin/dashboard' : user.role === 'supplier' ? '/supplier/dashboard' : '/dashboard'} replace />
        : <Login />
    }
  />
  <Route path="/register" element={user ? <Navigate to="/" replace /> : <Register />} />
</Route>

      {/* ── DASHBOARD ROUTES (sidebar Layout) ── */}

      {/* Products — accessible to all (no role restriction) */}
      <Route path="/products" element={<Layout />}>
        <Route index element={<ProductList />} />
        <Route path=":id" element={<ProductDetail />} />
      </Route>



      {/* Customer routes */}
      <Route path="/dashboard" element={<PrivateRoute roles={['customer']}><Layout /></PrivateRoute>}>
        <Route index element={<CustomerDashboard />} />
      </Route>
      <Route path="/cart" element={<PrivateRoute roles={['customer']}><Layout /></PrivateRoute>}>
        <Route index element={<Cart />} />
      </Route>
      <Route path="/my-orders" element={<PrivateRoute roles={['customer']}><Layout /></PrivateRoute>}>
        <Route index element={<MyOrders />} />
      </Route>
      <Route path="/suggestions" element={<PrivateRoute roles={['customer']}><Layout /></PrivateRoute>}>
        <Route index element={<Suggestions />} />
      </Route>
      <Route path="/deal-board" element={<PrivateRoute roles={['customer']}><Layout /></PrivateRoute>}>
        <Route index element={<DealBoard />} />
      </Route>

      {/* Supplier routes */}
      <Route path="/supplier/dashboard" element={<PrivateRoute roles={['supplier']}><Layout /></PrivateRoute>}>
        <Route index element={<SupplierDashboard />} />
      </Route>
      <Route path="/supplier/products" element={<PrivateRoute roles={['supplier']}><Layout /></PrivateRoute>}>
        <Route index element={<ManageProducts />} />
      </Route>
      <Route path="/supplier/deals" element={<PrivateRoute roles={['supplier']}><Layout /></PrivateRoute>}>
        <Route index element={<ManageDeals />} />
      </Route>
      <Route path="/supplier/orders" element={<PrivateRoute roles={['supplier']}><Layout /></PrivateRoute>}>
        <Route index element={<SupplierOrders />} />
      </Route>
      <Route path="/supplier/analytics" element={<PrivateRoute roles={['supplier']}><Layout /></PrivateRoute>}>
        <Route index element={<SupplierAnalytics />} />
      </Route>

      {/* Admin routes */}
      <Route path="/admin/dashboard" element={<PrivateRoute roles={['admin']}><Layout /></PrivateRoute>}>
        <Route index element={<AdminDashboard />} />
      </Route>
      <Route path="/admin/users" element={<PrivateRoute roles={['admin']}><Layout /></PrivateRoute>}>
        <Route index element={<AdminUsers />} />
      </Route>
      <Route path="/admin/orders" element={<PrivateRoute roles={['admin']}><Layout /></PrivateRoute>}>
        <Route index element={<AdminOrders />} />
      </Route>
      <Route path="/admin/deals" element={<PrivateRoute roles={['admin']}><Layout /></PrivateRoute>}>
        <Route index element={<AdminDeals />} />
      </Route>
      <Route path="/admin/profit-loss" element={<PrivateRoute roles={['admin']}><Layout /></PrivateRoute>}>
        <Route index element={<ProfitLoss />} />
      </Route>
      <Route path="/admin/products" element={<PrivateRoute roles={['admin']}><Layout /></PrivateRoute>}>
        <Route index element={<AdminProducts />} />
      </Route>
      <Route path="/admin/certifications" element={<PrivateRoute roles={['admin']}><Layout /></PrivateRoute>}>
        <Route index element={<AdminCertifications />} />
      </Route>
      <Route path="/admin/consulting" element={<PrivateRoute roles={['admin']}><Layout /></PrivateRoute>}>
        <Route index element={<AdminConsulting />} />
      </Route>



      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
        <ToastContainer
          position="top-right"
          autoClose={3500}
          theme="dark"
          toastStyle={{
            background: '#0d1120',
            border: '1px solid rgba(201,168,76,0.2)',
            borderRadius: '4px',
            fontSize: '13.5px',
            fontFamily: "'DM Sans', sans-serif",
            color: '#e8e8e2',
          }}
        />
      </BrowserRouter>
    </AuthProvider>
  );
}
