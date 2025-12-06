import { BrowserRouter as Router, Routes, Route, useLocation, useNavigate, Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import axios from 'axios';
import Dashboard from './pages/Dashboard';
import Orphans from './pages/Orphans';
import Guardians from './pages/Guardians';
import Sponsors from './pages/Sponsors';
import Sponsorships from './pages/Sponsorships';
import Visits from './pages/Visits';
import Documents from './pages/Documents';
import Reports from './pages/Reports';
import Users from './pages/Users';
import Settings from './pages/Settings';
import Login from './pages/Login';
import SponsorOrganizations from './pages/SponsorOrganizations';
import MarketingOrganizations from './pages/MarketingOrganizations';
import './App.css';

// Setup axios defaults
const token = localStorage.getItem('token');
if (token) {
  axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
}

const navItems = [
  { path: '/', label: 'لوحة التحكم' },
  { path: '/orphans', label: 'بيانات الأيتام' },
  { path: '/guardians', label: 'المعيلين' },
  { path: '/sponsor-organizations', label: 'الجهات الكافلة' },
  { path: '/marketing-organizations', label: 'جهات التسويق' },
  { path: '/sponsors', label: 'كفالات قديمة' },
  { path: '/sponsorships', label: 'إدارة الكفالات' },
  { path: '/visits', label: 'المتابعة الميدانية' },
  { path: '/documents', label: 'إدارة الوثائق' },
  { path: '/reports', label: 'التقارير' },
  { path: '/users', label: 'المستخدمين' },
  { path: '/settings', label: 'الإعدادات' },
];

function Sidebar() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  return (
    <aside className="sidebar">
      <div className="logo">
        <span className="dot" />
        <div>
          <div>OrphanCare</div>
          <small style={{ color: 'var(--muted)' }}>نظام رعاية الأيتام</small>
        </div>
      </div>
      <div className="nav">
        {navItems.map((item) => (
          <button
            key={item.path}
            onClick={() => navigate(item.path)}
            className={pathname === item.path ? 'active' : ''}
          >
            {item.label}
          </button>
        ))}
      </div>
    </aside>
  );
}

function Topbar() {
  const navigate = useNavigate();
  const handleLogout = () => {
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
    navigate('/login');
  };

  return (
    <div className="topbar">
      <div>
        <h1 style={{ margin: 0, fontSize: 24 }}>نظام إدارة الأيتام</h1>
        <div className="small">نظام متكامل لإدارة بيانات الأيتام والكفالات والمتابعة الميدانية</div>
      </div>
      <div className="top-actions">
        <span className="badge">مدير النظام</span>
        <button className="button secondary" onClick={handleLogout}>تسجيل خروج</button>
        <button className="button">+ إضافة جديد</button>
      </div>
    </div>
  );
}

function PrivateRoute({ children }) {
  const token = localStorage.getItem('token');
  return token ? children : <Navigate to="/login" />;
}

function Layout({ children }) {
  return (
    <div className="app-shell" dir="rtl">
      <Sidebar />
      <div className="content">
        <Topbar />
        {children}
      </div>
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<PrivateRoute><Layout><Dashboard /></Layout></PrivateRoute>} />
        <Route path="/orphans" element={<PrivateRoute><Layout><Orphans /></Layout></PrivateRoute>} />
        <Route path="/guardians" element={<PrivateRoute><Layout><Guardians /></Layout></PrivateRoute>} />
        <Route path="/sponsors" element={<PrivateRoute><Layout><Sponsors /></Layout></PrivateRoute>} />
        <Route path="/sponsorships" element={<PrivateRoute><Layout><Sponsorships /></Layout></PrivateRoute>} />
        <Route path="/visits" element={<PrivateRoute><Layout><Visits /></Layout></PrivateRoute>} />
        <Route path="/documents" element={<PrivateRoute><Layout><Documents /></Layout></PrivateRoute>} />
        <Route path="/reports" element={<PrivateRoute><Layout><Reports /></Layout></PrivateRoute>} />
        <Route path="/sponsor-organizations" element={<PrivateRoute><Layout><SponsorOrganizations /></Layout></PrivateRoute>} />
        <Route path="/marketing-organizations" element={<PrivateRoute><Layout><MarketingOrganizations /></Layout></PrivateRoute>} />
        <Route path="/users" element={<PrivateRoute><Layout><Users /></Layout></PrivateRoute>} />
        <Route path="/settings" element={<PrivateRoute><Layout><Settings /></Layout></PrivateRoute>} />
      </Routes>
    </Router>
  );
}