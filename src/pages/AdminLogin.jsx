import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, KeyRound, User, CircleAlert } from 'lucide-react';
import { AuthContext } from '../App';
import { api } from '../services/api';

export default function AdminLogin() {
  const { auth, setAuth, checkAuth } = useContext(AuthContext);
  const navigate = useNavigate();

  // Form Fields
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  // Status States
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [locked, setLocked] = useState(false);

  useEffect(() => {
    // If already logged in, redirect straight to dashboard
    if (auth.authenticated) {
      navigate('/Admin/Home');
      return;
    }
  }, [auth.authenticated]);

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    if (!username || !password) {
      setError('Please enter your username and password.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const data = await api.login(username, password);
      
      if (data && data.success) {
        // Successful login, refresh global auth context
        setAuth({
          authenticated: true,
          user: data.user,
          loading: false
        });
        navigate('/Admin/Home');
      } else {
        throw new Error(data?.error || 'Invalid username or password.');
      }
    } catch (err) {
      console.error('Login error:', err);
      
      // Enforce rate limiting message
      if (err.message?.includes('locked') || err.message?.includes('Too many') || err.status === 429) {
        setLocked(true);
        setError(err.message || 'Too many failed attempts. Please wait 10 minutes.');
      } else {
        setError(err.message || 'Invalid username or password.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '90vh',
        backgroundColor: 'var(--bg-main)',
        padding: '24px',
      }}
    >
      <div
        className="card"
        style={{
          width: '100%',
          maxWidth: '420px',
          padding: '40px 32px',
          boxShadow: 'var(--shadow-lg)',
        }}
      >
        {/* Panel Header */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '50%',
              backgroundColor: 'var(--primary-light)',
              color: 'var(--primary)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '16px',
            }}
          >
            <ShieldCheck size={28} />
          </div>
          <h1 style={{ fontSize: '1.6rem', color: 'var(--secondary)' }}>KLEF ACM Admin Portal</h1>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            Chapter Administrator Login Portal
          </p>
        </div>

        {/* Error Message banner */}
        {error && (
          <div className="alert alert-danger" style={{ padding: '10px 14px', marginBottom: '20px', fontSize: '0.85rem' }}>
            <CircleAlert size={16} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleLoginSubmit}>
          <div className="form-group">
            <label className="form-label" style={{ fontSize: '0.8rem' }}>Username</label>
            <div style={{ position: 'relative' }}>
              <User size={16} style={{ position: 'absolute', left: '12px', top: '13px', color: 'var(--text-muted)' }} />
              <input
                type="text"
                required
                disabled={locked || loading}
                className="form-control"
                placeholder="Admin username"
                style={{ paddingLeft: '36px' }}
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" style={{ fontSize: '0.8rem' }}>Password</label>
            <div style={{ position: 'relative' }}>
              <KeyRound size={16} style={{ position: 'absolute', left: '12px', top: '13px', color: 'var(--text-muted)' }} />
              <input
                type="password"
                required
                disabled={locked || loading}
                className="form-control"
                placeholder="Session password"
                style={{ paddingLeft: '36px' }}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={locked || loading}
            className="btn btn-primary"
            style={{ width: '100%', justifyContent: 'center', fontWeight: '600' }}
          >
            {loading ? 'Verifying Session...' : 'Establish Session'}
          </button>
        </form>
      </div>
    </div>
  );
}
