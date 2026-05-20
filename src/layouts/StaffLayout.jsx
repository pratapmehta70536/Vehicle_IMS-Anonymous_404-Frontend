import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/common/Sidebar';

const staffMenu = [
  { path: '/staff',                    label: 'Dashboard',           icon: '🏠', end: true },
  { path: '/staff/register-customer',  label: 'Register Customer',   icon: '➕' },
  { path: '/staff/appointments',        label: 'Appointments',        icon: '📅' },
  { path: '/staff/parts',              label: 'Available Parts',     icon: '📦' },
  { path: '/staff/part-requests',      label: 'Part Requests',       icon: '🔧' },
  { path: '/staff/customers',          label: 'Customer Search',     icon: '🔍' },
  { path: '/staff/sales',              label: 'Sales Invoices',      icon: '🧾' },
  { path: '/staff/reports',            label: 'Customer Reports',    icon: '📋' },
  { path: '/staff/chat',               label: 'Team Chat',           icon: '💬' },
  { path: '/staff/change-password',    label: 'Change Password',     icon: '🔑' },
];

const StaffLayout = () => (
  <div className="app-layout">
    <Sidebar menuItems={staffMenu} />
    <main className="main-content">
      <Outlet />
    </main>
  </div>
);

export default StaffLayout;
