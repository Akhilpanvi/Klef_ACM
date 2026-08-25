import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Users, Image, Shield, AlertTriangle } from 'lucide-react';
import { api } from '../services/api';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalEvents: 0,
    upcomingEvents: 0,
    activeMembers: 0,
    galleryImages: 0,
  });
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError('');

      // Fetch tables parallelly
      const [events, members, gallery, auditLogs] = await Promise.all([
        api.getTable('events'),
        api.getTable('members'),
        api.getTable('gallery_images'),
        api.getTable('audit_logs'),
      ]);

      // Check for auth failure
      if (events.error === 'Unauthorized' || members.error === 'Unauthorized' || gallery.error === 'Unauthorized' || auditLogs.error === 'Unauthorized') {
        setError('Unauthorized access. Please login.');
        setLoading(false);
        return;
      }

      const now = new Date();
      const upcoming = events.filter(e => new Date(e.date) >= now && e.is_published).length;
      const activeM = members.filter(m => m.is_active).length;

      setStats({
        totalEvents: events.length,
        upcomingEvents: upcoming,
        activeMembers: activeM,
        galleryImages: gallery.length,
      });

      // Show top 10 logs
      setLogs(auditLogs.slice(0, 10));
    } catch (err) {
      console.error('Error loading dashboard data:', err);
      setError('Could not connect to database. Make sure your schema is initialized and environment variables are set.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '50vh' }}>
        <div style={{ width: '32px', height: '32px', border: '3px solid var(--border)', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 1s linear infinite', marginBottom: '12px' }} />
        <p style={{ color: 'var(--text-muted)' }}>Fetching database stats & logs...</p>
      </div>
    );
  }

  return (
    <div>
      {/* DB Connection Alert or warning */}
      {error && (
        <div className="alert alert-danger" style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
          <AlertTriangle size={24} style={{ flexShrink: 0 }} />
          <div>
            <h4 style={{ fontWeight: '600', color: 'var(--danger)', marginBottom: '4px' }}>System Alert</h4>
            <p style={{ fontSize: '0.85rem' }}>{error}</p>
          </div>
        </div>
      )}

      {/* Welcome Banner */}
      <div className="card" style={{ marginBottom: '32px', padding: '24px 32px', background: 'linear-gradient(90deg, var(--bg-card) 0%, var(--primary-light) 100%)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
        <div>
          <h2 style={{ fontSize: '1.4rem', color: 'var(--secondary)' }}>Dashboard Overview</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Welcome to the Content Management System. Real-time updates push directly to public chapter routes.</p>
        </div>
        <button onClick={loadDashboardData} className="btn btn-secondary btn-sm">
          Refresh Statistics
        </button>
      </div>

      {/* Stats Widgets */}
      <div className="grid-4" style={{ marginBottom: '40px' }}>
        <div className="card" style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
          <div style={{ padding: '12px', borderRadius: '8px', backgroundColor: 'var(--primary-light)', color: 'var(--primary)' }}>
            <Calendar size={28} />
          </div>
          <div>
            <div style={{ fontSize: '1.8rem', fontWeight: '700', color: 'var(--secondary)', lineHeight: '1.1' }}>{stats.totalEvents}</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: '600', textTransform: 'uppercase', marginTop: '4px' }}>Total Events</div>
          </div>
        </div>

        <div className="card" style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
          <div style={{ padding: '12px', borderRadius: '8px', backgroundColor: 'hsl(142, 70%, 95%)', color: 'var(--success)' }}>
            <Calendar size={28} />
          </div>
          <div>
            <div style={{ fontSize: '1.8rem', fontWeight: '700', color: 'var(--secondary)', lineHeight: '1.1' }}>{stats.upcomingEvents}</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: '600', textTransform: 'uppercase', marginTop: '4px' }}>Upcoming Scheduled</div>
          </div>
        </div>

        <div className="card" style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
          <div style={{ padding: '12px', borderRadius: '8px', backgroundColor: 'var(--primary-light)', color: 'var(--primary)' }}>
            <Users size={28} />
          </div>
          <div>
            <div style={{ fontSize: '1.8rem', fontWeight: '700', color: 'var(--secondary)', lineHeight: '1.1' }}>{stats.activeMembers}</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: '600', textTransform: 'uppercase', marginTop: '4px' }}>Active Members</div>
          </div>
        </div>

        <div className="card" style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
          <div style={{ padding: '12px', borderRadius: '8px', backgroundColor: 'hsl(38, 90%, 95%)', color: 'var(--warning)' }}>
            <Image size={28} />
          </div>
          <div>
            <div style={{ fontSize: '1.8rem', fontWeight: '700', color: 'var(--secondary)', lineHeight: '1.1' }}>{stats.galleryImages}</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: '600', textTransform: 'uppercase', marginTop: '4px' }}>Gallery Items</div>
          </div>
        </div>
      </div>

      {/* Audit Logs Table */}
      <h3 style={{ fontSize: '1.2rem', color: 'var(--secondary)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <Shield size={18} className="text-primary" style={{ color: 'var(--primary)' }} />
        Security Audit Logs
      </h3>

      <div className="table-container">
        {logs.length === 0 ? (
          <div style={{ padding: '32px', textAlign: 'center', color: 'var(--text-muted)' }}>
            No administrative operations recorded yet.
          </div>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Admin User</th>
                <th>Operation</th>
                <th>Target Resource</th>
                <th>Resource ID / Details</th>
                <th>Timestamp</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log.id}>
                  <td style={{ fontWeight: '600' }}>{log.admin_username || 'System/Guest'}</td>
                  <td>
                    <span 
                      className={`badge ${
                        log.action === 'create' ? 'badge-primary' : 
                        log.action === 'delete' ? 'badge-danger' : 
                        log.action === 'login' ? 'badge-success' : 
                        'badge-warning'
                      }`}
                    >
                      {log.action}
                    </span>
                  </td>
                  <td style={{ textTransform: 'capitalize' }}>{log.resource}</td>
                  <td style={{ fontSize: '0.85rem', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '300px' }}>
                    {log.details || `ID: ${log.resource_id}`}
                  </td>
                  <td style={{ fontSize: '0.85rem' }}>
                    {new Date(log.timestamp).toLocaleString('en-US', { dateStyle: 'short', timeStyle: 'short' })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
