import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/common/ProtectedRoute';

// ─── Layouts ────────────────────────────────────────────────────────────
import AdminLayout    from './layouts/AdminLayout';
import StaffLayout    from './layouts/StaffLayout';
import CustomerLayout from './layouts/CustomerLayout';

// ─── Auth Pages ─────────────────────────────────────────────────────────
import Login          from './pages/auth/Login';
import Register       from './pages/auth/Register';
import ChangePassword from './pages/auth/ChangePassword';
import Chat           from './pages/common/Chat';

// ─── Admin Pages ─────────────────────────────────────────────────────────
import AdminDashboard    from './pages/admin/AdminDashboard';
import StaffManagement   from './pages/admin/StaffManagement';
import PartsManagement   from './pages/admin/PartsManagement';
import VendorsManagement from './pages/admin/VendorsManagement';
import PurchaseInvoices  from './pages/admin/PurchaseInvoices';
import FinancialReports  from './pages/admin/FinancialReports';
import Notifications     from './pages/admin/Notifications';
import CustomerReviews   from './pages/admin/CustomerReviews';

// ─── Staff Pages ─────────────────────────────────────────────────────────
import StaffDashboard    from './pages/staff/StaffDashboard';
import RegisterCustomer  from './pages/staff/RegisterCustomer';
import SalesInvoices     from './pages/staff/SalesInvoices';
import CustomerSearch    from './pages/staff/CustomerSearch';
import CustomerReports   from './pages/staff/CustomerReports';
import StaffAppointments  from './pages/staff/StaffAppointments';
import AvailableParts     from './pages/staff/AvailableParts';
import StaffPartRequests  from './pages/staff/StaffPartRequests';

// ─── Customer Pages ───────────────────────────────────────────────────────
import CustomerDashboard from './pages/customer/CustomerDashboard';
import Profile           from './pages/customer/Profile';
import Vehicles          from './pages/customer/Vehicles';
import Appointments      from './pages/customer/Appointments';
import History           from './pages/customer/History';
import PartRequests      from './pages/customer/PartRequests';
import Reviews           from './pages/customer/Reviews';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: '#1e293b',
              color: '#f1f5f9',
              border: '1px solid rgba(255,255,255,.1)',
              borderRadius: '10px',
              fontSize: '.9rem',
            },
            success: { iconTheme: { primary: '#10b981', secondary: '#1e293b' } },
            error:   { iconTheme: { primary: '#ef4444', secondary: '#1e293b' } },
          }}
        />
        <Routes>
          {/* Default redirect */}
          <Route path="/" element={<Navigate to="/login" replace />} />

          {/* Public auth routes */}
          <Route path="/login"    element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* ── Admin routes ────────────────────────────────────────── */}
          <Route element={<ProtectedRoute allowedRoles={['Admin']} />}>
            <Route path="/admin" element={<AdminLayout />}>
              <Route index                  element={<AdminDashboard />} />
              <Route path="staff"           element={<StaffManagement />} />
              <Route path="parts"           element={<PartsManagement />} />
              <Route path="vendors"         element={<VendorsManagement />} />
              <Route path="purchase-invoices" element={<PurchaseInvoices />} />
              <Route path="reports"         element={<FinancialReports />} />
              <Route path="notifications"   element={<Notifications />} />
              <Route path="reviews"         element={<CustomerReviews />} />
              <Route path="chat"            element={<Chat />} />
              <Route path="change-password" element={<ChangePassword />} />
            </Route>
          </Route>

          {/* ── Staff routes ─────────────────────────────────────────── */}
          <Route element={<ProtectedRoute allowedRoles={['Staff']} />}>
            <Route path="/staff" element={<StaffLayout />}>
              <Route index                       element={<StaffDashboard />} />
              <Route path="register-customer"    element={<RegisterCustomer />} />
              <Route path="appointments"         element={<StaffAppointments />} />
              <Route path="parts"                element={<AvailableParts />} />
              <Route path="part-requests"        element={<StaffPartRequests />} />
              <Route path="sales"                element={<SalesInvoices />} />
              <Route path="customers"            element={<CustomerSearch />} />
              <Route path="reports"              element={<CustomerReports />} />
              <Route path="chat"                 element={<Chat />} />
              <Route path="change-password"      element={<ChangePassword />} />
            </Route>
          </Route>

          {/* ── Customer routes ───────────────────────────────────────── */}
          <Route element={<ProtectedRoute allowedRoles={['Customer']} />}>
            <Route path="/customer" element={<CustomerLayout />}>
              <Route index                element={<CustomerDashboard />} />
              <Route path="profile"       element={<Profile />} />
              <Route path="vehicles"      element={<Vehicles />} />
              <Route path="appointments"  element={<Appointments />} />
              <Route path="parts"         element={<AvailableParts />} />
              <Route path="history"       element={<History />} />
              <Route path="requests"      element={<PartRequests />} />
              <Route path="reviews"       element={<Reviews />} />
              <Route path="change-password" element={<ChangePassword />} />
            </Route>
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
