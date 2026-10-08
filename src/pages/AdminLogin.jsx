import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, RefreshCw, KeyRound, User, CircleAlert } from 'lucide-react';
import { AuthContext } from '../App';
import { api } from '../services/api';
import CaptchaSvg from '../components/CaptchaSvg';

export default function AdminLogin() {
  const { auth, setAuth, checkAuth } = useContext(AuthContext);
  const navigate = useNavigate();

  // Form Fields
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [captchaAnswer, setCaptchaAnswer] = useState('');

  // CAPTCHA State
  const [captchaToken, setCaptchaToken] = useState('');
  const [captchaSvg, setCaptchaSvg] = useState('');

  // Status States
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [locked, setLocked] = useState(false);

  // Fetch CAPTCHA on mount or refresh
  const loadCaptcha = async () => {
    try {
      setError('');
      setCaptchaAnswer('');
      const data = await api.getCaptcha();
      if (data && data.token && data.svg) {
        setCaptchaToken(data.token);
        setCaptchaSvg(data.svg);
      } else {
        throw new Error('Invalid CAPTCHA response');
      }
    } catch (err) {
      console.warn('API CAPTCHA unavailable, generating client fallback:', err.message);
      // Generate client-side fallback SVG
      const chars = 'ACMHUB7KLEF9'.split('');
      const randomCode = Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
      const fallbackSvg = `<svg width="240" height="75" viewBox="0 0 240 75" xmlns="http://www.w3.org/2000/svg" style="background:#f8fafc; border-radius:6px; border:1px solid #cbd5e1; user-select:none;"><line x1="10" y1="20" x2="230" y2="55" stroke="#93c5fd" stroke-width="2" /><line x1="20" y1="60" x2="220" y2="15" stroke="#bfdbfe" stroke-width="2" /><text x="35" y="48" font-size="30" font-family="monospace, Courier New" font-weight="bold" fill="#0085CA" letter-spacing="8">${randomCode}</text></svg>`;
      setCaptchaToken(`local-${randomCode}`);
      setCaptchaSvg(fallbackSvg);
    }
  };

  useEffect(() => {
    // If already logged in, redirect straight to dashboard
    if (auth.authenticated) {
      navigate('/Admin/Home');
      return;
    }
    loadCaptcha();
  }, [auth.authenticated]);

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    if (!username || !password || !captchaAnswer) {
      setError('Please fill in all credentials and CAPTCHA details.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const data = await api.login(username, password, captchaToken, captchaAnswer);
      
      if (data && data.success) {
        // Successful login, refresh global auth context
        setAuth({
          authenticated: true,
          user: data.user,
          loading: false
        });
        navigate('/Admin/Home');
      } else {
        throw new Error(data?.error || 'Invalid credentials or CAPTCHA.');
      }
    } catch (err) {
      console.error('Login error:', err);
      
      // Enforce rate limiting message
      if (err.message?.includes('locked') || err.message?.includes('Too many') || err.status === 429) {
        setLocked(true);
        setError('Access locked: Too many failed attempts. Please wait 15 minutes.');
      } else {
        setError(err.message || 'Invalid username, password, or CAPTCHA answer.');
        // Refresh captcha on failure
        loadCaptcha();
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

          {/* CAPTCHA section */}
          <div className="form-group" style={{ marginBottom: '28px' }}>
            <label className="form-label" style={{ fontSize: '0.8rem' }}>CAPTCHA Verification</label>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '12px' }}>
              <CaptchaSvg svg={captchaSvg} />
              <button
                type="button"
                onClick={loadCaptcha}
                disabled={locked || loading}
                className="btn btn-secondary btn-sm"
                style={{ padding: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                aria-label="Refresh Captcha"
              >
                <RefreshCw size={16} />
              </button>
            </div>
            <input
              type="text"
              required
              disabled={locked || loading}
              className="form-control"
              placeholder="Case-sensitive CAPTCHA answer"
              value={captchaAnswer}
              onChange={(e) => setCaptchaAnswer(e.target.value)}
            />
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
