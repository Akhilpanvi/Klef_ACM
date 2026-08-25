import { useContext, useState } from 'react';
import { Outlet, NavLink, useNavigate, Link } from 'react-router-dom';
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
  ShieldCheck 
} from 'lucide-react';
import { AuthContext } from '../App';
import { api } from '../services/api';

export default function AdminLayout() {
  const { auth, setAuth } = useContext(AuthContext);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      if (window.confirm('Are you sure you want to log out?')) {
        await api.logout();
        setAuth({ authenticated: false, user: null, loading: false });
        navigate('/admin/login');
      }
    } catch (err) {
      console.error('Logout failed:', err);
    }
  };

  const navItems = [
    { path: '/admin', label: 'Dashboard', icon: <LayoutDashboard size={18} />, end: true },
    { path: '/admin/home/edit', label: 'Home Page', icon: <Home size={18} /> },
    { path: '/admin/events/edit', label: 'Events', icon: <Calendar size={18} /> },
    { path: '/admin/gallery/edit', label: 'Gallery', icon: <Image size={18} /> },
    { path: '/admin/members/edit', label: 'Members', icon: <Users size={18} /> },
    { path: '/admin/about-acm/edit', label: 'About ACM', icon: <BookOpen size={18} /> },
    { path: '/admin/about-klef-acm/edit', label: 'About KLEF ACM', icon: <Info size={18} /> },
    { path: '/admin/contact/edit', label: 'Contact', icon: <Phone size={18} /> },
    { path: '/admin/audit-logs', label: 'Audit Logs', icon: <History size={18} /> },
  ];

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: 'var(--bg-main)' }}>
      {/* Sidebar - Desktop */}
      <aside
        style={{
          width: '260px',
          backgroundColor: 'var(--bg-sidebar)',
          color: 'var(--text-light)',
          display: 'flex',
          flexDirection: 'column',
          flexShrink: 0,
          borderRight: '1px solid rgba(255,255,255,0.05)',
        }}
        className="admin-sidebar-desktop"
      >
        {/* Sidebar Header */}
        <div
          style={{
            height: '72px',
            display: 'flex',
            alignItems: 'center',
            padding: '0 24px',
            backgroundColor: 'var(--bg-admin-dark)',
            gap: '12px',
          }}
        >
          <ShieldCheck size={26} className="text-primary" style={{ color: 'var(--accent)' }} />
          <div style={{ fontWeight: '700', fontSize: '1.05rem', fontFamily: 'var(--font-heading)' }}>
            ACM CMS Panel
          </div>
        </div>

        {/* User Info */}
        <div style={{ padding: '16px 24px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
          <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', fontWeight: '600' }}>
            Logged in as
          </div>
          <div style={{ fontWeight: '600', fontSize: '0.95rem', color: '#fff' }}>
            {auth.user?.username || 'Administrator'}
          </div>
        </div>

        {/* Sidebar Menu */}
        <nav style={{ flex: 1, padding: '24px 16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.end}
              style={({ isActive }) => ({
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '10px 16px',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.9rem',
                fontWeight: '500',
                color: isActive ? '#fff' : 'rgba(255,255,255,0.65)',
                backgroundColor: isActive ? 'var(--primary)' : 'transparent',
                transition: 'all 0.15s ease',
              })}
              className="admin-nav-link"
            >
              {item.icon}
              <span>{item.label}</span>
            </NavLink>
          ))}

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '10px 16px',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.9rem',
              fontWeight: '500',
              color: 'hsl(350, 80%, 75%)',
              textAlign: 'left',
              marginTop: 'auto',
              width: '100%',
            }}
            className="admin-logout-btn"
          >
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        </nav>
      </aside>

      {/* Main Content Pane */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflowX: 'hidden' }}>
        {/* Admin Header (Mobile menu trigger & Title) */}
        <header
          style={{
            height: '72px',
            backgroundColor: 'var(--bg-card)',
            borderBottom: '1px solid var(--border)',
            display: 'flex',
            alignItems: 'center',
            padding: '0 32px',
            justifyContent: 'space-between',
          }}
        >
          {/* Mobile menu trigger */}
          <button
            onClick={() => setSidebarOpen(true)}
            style={{ display: 'none' }}
            className="admin-mobile-trigger"
          >
            <Menu size={24} />
          </button>

          <div style={{ fontWeight: '600', fontSize: '1.15rem', color: 'var(--secondary)' }}>
            KLEF ACM Chapter Administration Portal
          </div>

          <Link
            to="/"
            target="_blank"
            style={{ fontSize: '0.85rem', color: 'var(--primary)', fontWeight: '500' }}
          >
            View Live Chapter Site
          </Link>
        </header>

        {/* Content Outlet */}
        <main style={{ flex: 1, padding: '32px', overflowY: 'auto' }}>
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
            backgroundColor: 'rgba(15, 23, 42, 0.6)',
            backdropFilter: 'blur(2px)',
            zIndex: 999,
          }}
          onClick={() => setSidebarOpen(false)}
        >
          <div
            style={{
              width: '260px',
              height: '100%',
              backgroundColor: 'var(--bg-sidebar)',
              color: 'var(--text-light)',
              display: 'flex',
              flexDirection: 'column',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                height: '72px',
                display: 'flex',
                alignItems: 'center',
                padding: '0 24px',
                backgroundColor: 'var(--bg-admin-dark)',
                justifyContent: 'space-between',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <ShieldCheck size={26} className="text-primary" style={{ color: 'var(--accent)' }} />
                <div style={{ fontWeight: '700', fontSize: '1.05rem' }}>ACM CMS Panel</div>
              </div>
              <button onClick={() => setSidebarOpen(false)} style={{ color: '#fff' }}>
                <X size={24} />
              </button>
            </div>

            <div style={{ padding: '16px 24px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
              <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', fontWeight: '600' }}>
                Logged in as
              </div>
              <div style={{ fontWeight: '600', fontSize: '0.95rem', color: '#fff' }}>
                {auth.user?.username || 'Administrator'}
              </div>
            </div>

            <nav style={{ flex: 1, padding: '24px 16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {navItems.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.end}
                  style={({ isActive }) => ({
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '10px 16px',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '0.9rem',
                    fontWeight: '500',
                    color: isActive ? '#fff' : 'rgba(255,255,255,0.65)',
                    backgroundColor: isActive ? 'var(--primary)' : 'transparent',
                  })}
                  onClick={() => setSidebarOpen(false)}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </NavLink>
              ))}

              <button
                onClick={handleLogout}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '10px 16px',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.9rem',
                  fontWeight: '500',
                  color: 'hsl(350, 80%, 75%)',
                  textAlign: 'left',
                  marginTop: 'auto',
                  width: '100%',
                }}
              >
                <LogOut size={18} />
                <span>Logout</span>
              </button>
            </nav>
          </div>
        </div>
      )}

      {/* Inject custom mobile styles locally */}
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
