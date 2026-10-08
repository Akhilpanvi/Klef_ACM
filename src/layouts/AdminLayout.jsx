import { useContext, useState } from 'react';
import { Outlet, NavLink, useNavigate, Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Home,
  Calendar,
  Image,
  Users,
  BookOpen,
  Info,
  Phone,
  History,
  LogOut,
  Menu,
  X,
  ShieldCheck,
  ExternalLink,
  Radio,
  FileText,
  Sparkles,
  Layers,
  Database
} from 'lucide-react';
import { AuthContext } from '../App';
import { api } from '../services/api';

export default function AdminLayout() {
  const { auth, setAuth } = useContext(AuthContext);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    try {
      if (window.confirm('Are you sure you want to log out of the CMS portal?')) {
        await api.logout();
        setAuth({ authenticated: false, user: null, loading: false });
        navigate('/admin/login');
      }
    } catch (err) {
      console.error('Logout failed:', err);
    }
  };

  const navGroups = [
    {
      group: 'Overview',
      items: [
        { path: '/admin', label: 'Dashboard', icon: <LayoutDashboard size={18} />, end: true }
      ]
    },
    {
      group: 'Content & Pages',
      items: [
        { path: '/admin/home/edit', label: 'Home Page', icon: <Home size={18} /> },
        { path: '/admin/about-acm/edit', label: 'About Global ACM', icon: <BookOpen size={18} /> },
        { path: '/admin/about-klef-acm/edit', label: 'About KLEF ACM', icon: <Info size={18} /> },
        { path: '/admin/contact/edit', label: 'Contact Desk', icon: <Phone size={18} /> }
      ]
    },
    {
      group: 'Activities & Media',
      items: [
        { path: '/admin/events/edit', label: 'Events & Workshops', icon: <Calendar size={18} /> },
        { path: '/admin/gallery/edit', label: 'Gallery & Albums', icon: <Image size={18} /> }
      ]
    },
    {
      group: 'Leadership & People',
      items: [
        { path: '/admin/members/edit', label: 'Committee & Faculty', icon: <Users size={18} /> }
      ]
    },
    {
      group: 'System & Security',
      items: [
        { path: '/admin/audit-logs', label: 'Audit Trail', icon: <History size={18} /> }
      ]
    }
  ];

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f1f5f9', color: '#1e293b' }}>

      {/* Sidebar - Desktop */}
      <aside
        style={{
          width: '270px',
          backgroundColor: '#0f172a',
          color: '#f8fafc',
          display: 'flex',
          flexDirection: 'column',
          flexShrink: 0,
          borderRight: '1px solid #1e293b',
          zIndex: 40,
        }}
        className="admin-sidebar-desktop"
      >
        {/* Sidebar Brand Header */}
        <div
          style={{
            height: '76px',
            display: 'flex',
            alignItems: 'center',
            padding: '0 24px',
            backgroundColor: '#090d16',
            borderBottom: '1px solid #1e293b',
            gap: '12px',
          }}
        >
          <div style={{ width: '38px', height: '38px', borderRadius: '8px', backgroundColor: '#0085CA', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
            <ShieldCheck size={22} />
          </div>
          <div>
            <div style={{ fontWeight: '800', fontSize: '1.05rem', letterSpacing: '-0.02em', color: '#fff' }}>
              KLEF ACM CMS
            </div>
            <div style={{ fontSize: '0.7rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Portal Administration
            </div>
          </div>
        </div>

        {/* Live Database Sync Status Bar */}
        <div style={{ padding: '12px 20px', backgroundColor: '#131e32', borderBottom: '1px solid #1e293b', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.78rem', color: '#38bdf8' }}>
            <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#10b981', boxShadow: '0 0 8px #10b981' }} />
            <span>Database Live</span>
          </div>
          <span style={{ fontSize: '0.7rem', padding: '2px 8px', borderRadius: '4px', backgroundColor: 'rgba(56, 189, 248, 0.1)', color: '#38bdf8', fontWeight: 'bold' }}>
            v2.4 Live Sync
          </span>
        </div>

        {/* Navigation Menu */}
        <nav style={{ flex: 1, padding: '20px 16px', display: 'flex', flexDirection: 'column', gap: '20px', overflowY: 'auto' }}>
          {navGroups.map((group, gIdx) => (
            <div key={gIdx}>
              <div style={{ fontSize: '0.68rem', fontWeight: '700', textTransform: 'uppercase', color: '#64748b', letterSpacing: '0.08em', padding: '0 12px 8px 12px' }}>
                {group.group}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {group.items.map((item) => (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    end={item.end}
                    style={({ isActive }) => ({
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '10px 14px',
                      borderRadius: '8px',
                      fontSize: '0.88rem',
                      fontWeight: isActive ? '600' : '500',
                      color: isActive ? '#ffffff' : '#94a3b8',
                      backgroundColor: isActive ? '#0085CA' : 'transparent',
                      textDecoration: 'none',
                      transition: 'all 0.15s ease',
                    })}
                  >
                    {item.icon}
                    <span>{item.label}</span>
                  </NavLink>
                ))}
              </div>
            </div>
          ))}
        </nav>

        {/* User Card & Logout Footer */}
        <div style={{ padding: '16px 20px', borderTop: '1px solid #1e293b', backgroundColor: '#090d16', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ overflow: 'hidden', maxWidth: '160px' }}>
            <div style={{ fontSize: '0.7rem', color: '#64748b', textTransform: 'uppercase', fontWeight: '700' }}>Admin Account</div>
            <div style={{ fontSize: '0.85rem', color: '#f8fafc', fontWeight: '600', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
              {auth.user?.username || 'Bhaanugali@gmail.com'}
            </div>
          </div>
          <button
            onClick={handleLogout}
            title="Logout of CMS"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '36px',
              height: '36px',
              borderRadius: '8px',
              backgroundColor: 'rgba(239, 68, 68, 0.1)',
              color: '#f87171',
              border: 'none',
              cursor: 'pointer',
              transition: 'background-color 0.2s',
            }}
          >
            <LogOut size={16} />
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, overflowX: 'hidden' }}>

        {/* Top Header Bar */}
        <header
          style={{
            height: '76px',
            backgroundColor: '#ffffff',
            borderBottom: '1px solid #e2e8f0',
            display: 'flex',
            alignItems: 'center',
            padding: '0 32px',
            justifyContent: 'space-between',
            position: 'sticky',
            top: 0,
            zIndex: 30,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <button
              onClick={() => setSidebarOpen(true)}
              style={{ display: 'none', background: 'none', border: 'none', color: '#0f172a', cursor: 'pointer', padding: 0 }}
              className="admin-mobile-trigger"
            >
              <Menu size={24} />
            </button>
            <div>
              <div style={{ fontWeight: '700', fontSize: '1.15rem', color: '#0f172a', letterSpacing: '-0.02em' }}>
                KLEF ACM Chapter Management Portal
              </div>
              <div style={{ fontSize: '0.78rem', color: '#64748b' }}>
                Changes made here persist directly to the PostgreSQL database & broadcast live to visitors
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <Link
              to="/"
              target="_blank"
              rel="noreferrer"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 16px',
                borderRadius: '6px',
                backgroundColor: '#f8fafc',
                border: '1px solid #cbd5e1',
                color: '#0085CA',
                fontSize: '0.85rem',
                fontWeight: '600',
                textDecoration: 'none',
                transition: 'all 0.2s ease',
              }}
            >
              <span>View Public Website</span>
              <ExternalLink size={14} />
            </Link>
          </div>
        </header>

        {/* Content Outlet */}
        <main style={{ flex: 1, padding: '32px', maxWidth: '1280px', width: '100%', margin: '0 auto' }}>
          <Outlet />
        </main>
      </div>

      {/* Mobile Drawer Sidebar */}
      {sidebarOpen && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.7)',
            backdropFilter: 'blur(3px)',
            zIndex: 100,
          }}
          onClick={() => setSidebarOpen(false)}
        >
          <div
            style={{
              width: '280px',
              height: '100%',
              backgroundColor: '#0f172a',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '4px 0 24px rgba(0,0,0,0.4)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ padding: '20px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #1e293b' }}>
              <div style={{ fontWeight: '800', color: '#fff', fontSize: '1.1rem' }}>KLEF ACM CMS</div>
              <button onClick={() => setSidebarOpen(false)} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}>
                <X size={22} />
              </button>
            </div>

            <nav style={{ flex: 1, padding: '16px', display: 'flex', flexDirection: 'column', gap: '16px', overflowY: 'auto' }}>
              {navGroups.map((group, gIdx) => (
                <div key={gIdx}>
                  <div style={{ fontSize: '0.7rem', fontWeight: '700', textTransform: 'uppercase', color: '#64748b', padding: '0 8px 6px 8px' }}>
                    {group.group}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    {group.items.map((item) => (
                      <NavLink
                        key={item.path}
                        to={item.path}
                        end={item.end}
                        style={({ isActive }) => ({
                          display: 'flex',
                          alignItems: 'center',
                          gap: '12px',
                          padding: '10px 12px',
                          borderRadius: '6px',
                          fontSize: '0.9rem',
                          color: isActive ? '#fff' : '#94a3b8',
                          backgroundColor: isActive ? '#0085CA' : 'transparent',
                          textDecoration: 'none',
                        })}
                        onClick={() => setSidebarOpen(false)}
                      >
                        {item.icon}
                        <span>{item.label}</span>
                      </NavLink>
                    ))}
                  </div>
                </div>
              ))}
            </nav>
          </div>
        </div>
      )}

      {/* Responsive Style */}
      <style>{`
        @media (max-width: 900px) {
          .admin-sidebar-desktop {
            display: none !important;
          }
          .admin-mobile-trigger {
            display: block !important;
          }
        }
      `}</style>
    </div>
  );
}
