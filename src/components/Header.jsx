import { useState } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { Menu, X } from 'lucide-react';

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const navItems = [
    { path: '/', label: 'Home' },
    { path: '/events', label: 'Events' },
    { path: '/gallery', label: 'Gallery' },
    { path: '/members', label: 'Members' },
    { path: '/about-acm', label: 'About ACM' },
    { path: '/about-klef-acm', label: 'About KLU ACM' },
    { path: '/contact', label: 'Contact' },
  ];

  return (
    <header className="header-wrapper">
      <div className="container header-container">
        {/* Logo Section */}
        <Link to="/" className="logo-container" style={{ textDecoration: 'none' }}>
          <div style={{
            borderLeft: '3px solid var(--primary)',
            paddingLeft: '10px',
            display: 'flex',
            flexDirection: 'column',
            lineHeight: '1.15'
          }}>
            <span style={{ fontSize: '1.25rem', fontWeight: '800', color: 'var(--secondary)', letterSpacing: '-0.02em', textTransform: 'uppercase' }}>KLU ACM</span>
            <span style={{ fontSize: '0.65rem', fontWeight: '600', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Student Chapter</span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="nav-menu">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* Mobile Menu Toggle Button */}
        <button
          className="mobile-menu-btn"
          onClick={toggleMobileMenu}
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? <X size={26} /> : <Menu size={26} />}
        </button>
      </div>

      {/* Mobile Navigation Dropdown */}
      <div
        style={{
          position: 'absolute',
          top: 'var(--header-height)',
          left: 0,
          right: 0,
          backgroundColor: 'var(--bg-card)',
          borderBottom: '1px solid var(--border)',
          zIndex: 99,
          display: 'flex',
          flexDirection: 'column',
          padding: mobileMenuOpen ? '16px 24px' : '0 24px',
          gap: '16px',
          maxHeight: mobileMenuOpen ? '400px' : '0px',
          opacity: mobileMenuOpen ? 1 : 0,
          overflow: 'hidden',
          transition: 'max-height 0.4s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.3s ease, padding 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
          pointerEvents: mobileMenuOpen ? 'auto' : 'none'
        }}
      >
        {navItems.map((item, idx) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
            style={{ 
              padding: '8px 0', 
              borderBottom: 'none',
              transform: mobileMenuOpen ? 'translateY(0)' : 'translateY(-10px)',
              opacity: mobileMenuOpen ? 1 : 0,
              transition: `transform 0.4s cubic-bezier(0.16, 1, 0.3, 1) ${idx * 40}ms, opacity 0.4s ease ${idx * 40}ms`
            }}
            onClick={() => setMobileMenuOpen(false)}
          >
            {item.label}
          </NavLink>
        ))}
      </div>
    </header>
  );
}
