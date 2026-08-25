import { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../App';

export default function ProtectedRoute({ children }) {
  const { auth } = useContext(AuthContext);

  if (auth.loading) {
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '80vh',
          fontFamily: 'var(--font-heading)',
        }}
      >
        <div
          style={{
            width: '40px',
            height: '40px',
            border: '3px solid var(--border)',
            borderTopColor: 'var(--primary)',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            marginBottom: '16px',
          }}
        />
        <p style={{ color: 'var(--text-muted)' }}>Verifying administrative session...</p>
        <style>
          {`
            @keyframes spin {
              to { transform: rotate(360deg); }
            }
          `}
        </style>
      </div>
    );
  }

  if (!auth.authenticated) {
    return <Navigate to="/admin/login" replace />;
  }

  return children;
}
