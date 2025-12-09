import { BrowserRouter as Router, Routes, Route, useLocation, useNavigate, Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import axios from 'axios';
import Dashboard from './pages/dashboard';
import { OrphansList, OrphansCreate, OrphansEdit, OrphansShow } from './pages/orphans/index';
import { GuardiansList, GuardiansCreate, GuardiansEdit, GuardiansShow } from './pages/guardians/index';
import { SponsorsList, SponsorsCreate, SponsorsEdit, SponsorsShow } from './pages/sponsors';
import { SponsorshipsList, SponsorshipsCreate, SponsorshipsEdit, SponsorshipsShow } from './pages/sponsorships';
import { VisitsList, VisitsCreate, VisitsEdit, VisitsShow } from './pages/visits';
import { DocumentsList, DocumentsCreate, DocumentsShow } from './pages/documents';
import Reports from './pages/reports';
import { UsersList, UsersCreate, UsersEdit, UsersShow } from './pages/users';
import Settings from './pages/settings';
import Login from './pages/auth.login';
import { MarketingOrganizationsList, MarketingOrganizationsCreate, MarketingOrganizationsEdit, MarketingOrganizationsShow } from './pages/marketing.organizations';
import { SponsorOrganizationsList, SponsorOrganizationsCreate, SponsorOrganizationsEdit, SponsorOrganizationsShow } from './pages/sponsor.organizations';
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

import { ConfigProvider } from 'antd';
import arEG from 'antd/locale/ar_EG';

export default function App() {
  return (
    <ConfigProvider direction="rtl" locale={arEG}>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<PrivateRoute><Layout><Dashboard /></Layout></PrivateRoute>} />
          <Route path="/orphans" element={<PrivateRoute><Layout><OrphansList /></Layout></PrivateRoute>} />
          <Route path="/orphans/create" element={<PrivateRoute><Layout><OrphansCreate /></Layout></PrivateRoute>} />
          <Route path="/orphans/:id" element={<PrivateRoute><Layout><OrphansShow /></Layout></PrivateRoute>} />
          <Route path="/orphans/:id/edit" element={<PrivateRoute><Layout><OrphansEdit /></Layout></PrivateRoute>} />

          <Route path="/guardians" element={<PrivateRoute><Layout><GuardiansList /></Layout></PrivateRoute>} />
          <Route path="/guardians/:id" element={<PrivateRoute><Layout><GuardiansShow /></Layout></PrivateRoute>} />
          <Route path="/guardians/:id/edit" element={<PrivateRoute><Layout><GuardiansEdit /></Layout></PrivateRoute>} />

          <Route path="/sponsors" element={<PrivateRoute><Layout><SponsorsList /></Layout></PrivateRoute>} />
          <Route path="/sponsors/create" element={<PrivateRoute><Layout><SponsorsCreate /></Layout></PrivateRoute>} />
          <Route path="/sponsors/:id" element={<PrivateRoute><Layout><SponsorsShow /></Layout></PrivateRoute>} />
          <Route path="/sponsors/:id/edit" element={<PrivateRoute><Layout><SponsorsEdit /></Layout></PrivateRoute>} />

          <Route path="/sponsors/:id/edit" element={<PrivateRoute><Layout><SponsorsEdit /></Layout></PrivateRoute>} />

          <Route path="/sponsorships" element={<PrivateRoute><Layout><SponsorshipsList /></Layout></PrivateRoute>} />
          <Route path="/sponsorships/create" element={<PrivateRoute><Layout><SponsorshipsCreate /></Layout></PrivateRoute>} />
          <Route path="/sponsorships/:id" element={<PrivateRoute><Layout><SponsorshipsShow /></Layout></PrivateRoute>} />
          <Route path="/sponsorships/:id/edit" element={<PrivateRoute><Layout><SponsorshipsEdit /></Layout></PrivateRoute>} />

          <Route path="/visits" element={<PrivateRoute><Layout><VisitsList /></Layout></PrivateRoute>} />
          <Route path="/visits/create" element={<PrivateRoute><Layout><VisitsCreate /></Layout></PrivateRoute>} />
          <Route path="/visits/:id" element={<PrivateRoute><Layout><VisitsShow /></Layout></PrivateRoute>} />
          <Route path="/visits/:id/edit" element={<PrivateRoute><Layout><VisitsEdit /></Layout></PrivateRoute>} />
          <Route path="/visits/:id/edit" element={<PrivateRoute><Layout><VisitsEdit /></Layout></PrivateRoute>} />

          <Route path="/documents" element={<PrivateRoute><Layout><DocumentsList /></Layout></PrivateRoute>} />
          <Route path="/documents/create" element={<PrivateRoute><Layout><DocumentsCreate /></Layout></PrivateRoute>} />
          <Route path="/documents/:id" element={<PrivateRoute><Layout><DocumentsShow /></Layout></PrivateRoute>} />

          <Route path="/reports" element={<PrivateRoute><Layout><Reports /></Layout></PrivateRoute>} />
          <Route path="/sponsor-organizations" element={<PrivateRoute><Layout><SponsorOrganizationsList /></Layout></PrivateRoute>} />
          <Route path="/sponsor-organizations/create" element={<PrivateRoute><Layout><SponsorOrganizationsCreate /></Layout></PrivateRoute>} />
          <Route path="/sponsor-organizations/:id" element={<PrivateRoute><Layout><SponsorOrganizationsShow /></Layout></PrivateRoute>} />
          <Route path="/sponsor-organizations/:id/edit" element={<PrivateRoute><Layout><SponsorOrganizationsEdit /></Layout></PrivateRoute>} />

          <Route path="/marketing-organizations" element={<PrivateRoute><Layout><MarketingOrganizationsList /></Layout></PrivateRoute>} />
          <Route path="/marketing-organizations/create" element={<PrivateRoute><Layout><MarketingOrganizationsCreate /></Layout></PrivateRoute>} />
          <Route path="/marketing-organizations/:id" element={<PrivateRoute><Layout><MarketingOrganizationsShow /></Layout></PrivateRoute>} />
          <Route path="/marketing-organizations/:id/edit" element={<PrivateRoute><Layout><MarketingOrganizationsEdit /></Layout></PrivateRoute>} />

          <Route path="/users" element={<PrivateRoute><Layout><UsersList /></Layout></PrivateRoute>} />
          <Route path="/users/create" element={<PrivateRoute><Layout><UsersCreate /></Layout></PrivateRoute>} />
          <Route path="/users/:id" element={<PrivateRoute><Layout><UsersShow /></Layout></PrivateRoute>} />
          <Route path="/users/:id/edit" element={<PrivateRoute><Layout><UsersEdit /></Layout></PrivateRoute>} />
          <Route path="/settings" element={<PrivateRoute><Layout><Settings /></Layout></PrivateRoute>} />
        </Routes>
      </Router>
    </ConfigProvider>
  );
}