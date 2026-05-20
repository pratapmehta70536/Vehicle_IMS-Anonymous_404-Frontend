import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/common/Sidebar';

const customerMenu = [
  { path: '/customer',              label: 'Dashboard',       icon: '🏠', end: true },
  { path: '/customer/profile',      label: 'My Profile',      icon: '👤' },
  { path: '/customer/vehicles',     label: 'My Vehicles',     icon: '🚗' },
  { path: '/customer/appointments', label: 'Appointments',    icon: '📅' },
  { path: '/customer/parts',        label: 'Available Parts', icon: '🔧' },
  { path: '/customer/history',      label: 'Purchase History',icon: '🧾' },
  { path: '/customer/requests',     label: 'Part Requests',   icon: '📦' },
  { path: '/customer/reviews',      label: 'Reviews',         icon: '⭐' },
  { path: '/customer/change-password', label: 'Change Password', icon: '🔑' },
];

const CustomerLayout = () => (
  <div className="app-layout">
    <Sidebar menuItems={customerMenu} />
    <main className="main-content">
      <Outlet />
    </main>
  </div>
);

export default CustomerLayout;
