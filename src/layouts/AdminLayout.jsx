import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/common/Sidebar';

const adminMenu = [
  { path: '/admin',                   label: 'Dashboard',          icon: '🏠', end: true },
  { path: '/admin/staff',             label: 'Staff Management',   icon: '👥' },
  { path: '/admin/parts',             label: 'Parts Inventory',    icon: '🔧' },
  { path: '/admin/vendors',           label: 'Vendors',            icon: '🏪' },
  { path: '/admin/purchase-invoices', label: 'Purchase Invoices',  icon: '🧾' },
  { path: '/admin/reports',           label: 'Financial Reports',  icon: '📊' },
  { path: '/admin/notifications',     label: 'Notifications',      icon: '🔔' },
  { path: '/admin/reviews',           label: 'Customer Reviews',   icon: '⭐' },
  { path: '/admin/chat',              label: 'Team Chat',          icon: '💬' },
];

const AdminLayout = () => (
  <div className="app-layout">
    <Sidebar menuItems={adminMenu} />
    <main className="main-content">
      <Outlet />
    </main>
  </div>
);

export default AdminLayout;
