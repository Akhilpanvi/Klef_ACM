import React, { createContext, useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// Services
import { api } from './services/api';

// Layouts & Components
import PublicLayout from './layouts/PublicLayout';
import AdminLayout from './layouts/AdminLayout';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import Home from './pages/Home';
import Events from './pages/Events';
import Gallery from './pages/Gallery';
import Members from './pages/Members';
import AboutAcm from './pages/AboutAcm';
import AboutKlefAcm from './pages/AboutKlefAcm';
import Contact from './pages/Contact';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import AdminEditPage from './pages/AdminEditPage';

// Context Definitions
export const AuthContext = createContext(null);
export const SiteDataContext = createContext(null);

export default function App() {
  const [auth, setAuth] = useState({
    authenticated: false,
    user: null,
    loading: true,
  });

  const [siteData, setSiteData] = useState({
    events: [],
    members: [],
    pages: {},
    gallery: [],
    contact: {},
  });
  const [siteDataLoading, setSiteDataLoading] = useState(true);

  // Verifies the administrator session on mount
  const checkAuth = async () => {
    try {
      const data = await api.checkSession();
      if (data && data.authenticated) {
        setAuth({
          authenticated: true,
          user: data.user,
          loading: false,
        });
      } else {
        setAuth({
          authenticated: false,
          user: null,
          loading: false,
        });
      }
    } catch (err) {
      console.error('Session validation exception:', err);
      setAuth({
        authenticated: false,
        user: null,
        loading: false,
      });
    }
  };

  // Fetches all public content at once (High Performance)
  const triggerDataRefresh = async () => {
    try {
      setSiteDataLoading(true);
      const data = await api.getPublicData('all');
      setSiteData({
        events: data.events || [],
        members: data.members || [],
        pages: data.pages || {},
        gallery: data.gallery || [],
        contact: data.contact || {},
      });
    } catch (err) {
      console.error('Failed to load public site data:', err);
    } finally {
      setSiteDataLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
    triggerDataRefresh();
  }, []);

  return (
    <AuthContext.Provider value={{ auth, setAuth, checkAuth }}>
      <SiteDataContext.Provider value={{ siteData, siteDataLoading, triggerDataRefresh }}>
        <BrowserRouter basename="/KLEF-ACM-SC">
          <Routes>
            {/* PUBLIC WEBSITE ROUTES */}
            <Route element={<PublicLayout />}>
              <Route path="/" element={<Home />} />
              <Route path="/events" element={<Events />} />
              <Route path="/gallery" element={<Gallery />} />
              <Route path="/members" element={<Members />} />
              <Route path="/about-acm" element={<AboutAcm />} />
              <Route path="/about-klef-acm" element={<AboutKlefAcm />} />
              <Route path="/contact" element={<Contact />} />
            </Route>

            {/* ADMIN LOGIN */}
            <Route path="/admin/login" element={<AdminLogin />} />

            {/* ADMIN BASE REDIRECT (admin -> admin/login if unauthenticated) */}
            <Route path="/admin" element={<Navigate to="/admin/login" replace />} />

            {/* PROTECTED ADMIN ROUTE OUTLET */}
            <Route
              path="/admin/*"
              element={
                <ProtectedRoute>
                  <Routes>
                    <Route element={<AdminLayout />}>
                      <Route path="/" element={<AdminDashboard />} />
                      <Route path="/:section" element={<AdminEditPage />} />
                      <Route path="/:section/edit" element={<AdminEditPage />} />
                    </Route>
                    {/* Catch-all to direct back to dashboard */}
                    <Route path="*" element={<Navigate to="/admin" replace />} />
                  </Routes>
                </ProtectedRoute>
              }
            />

            {/* GLOBAL 404 CATCH-ALL */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </SiteDataContext.Provider>
    </AuthContext.Provider>
  );
}
