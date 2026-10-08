import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Calendar, 
  Users, 
  Image, 
  Shield, 
  Activity, 
  PlusCircle, 
  Edit3, 
  CheckCircle, 
  Clock, 
  ArrowRight,
  Database,
  Radio,
  FileText,
  Mail,
  ExternalLink
} from 'lucide-react';
import { api } from '../services/api';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalEvents: 0,
    publishedEvents: 0,
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

      // Fetch live tables from database
      const [events, members, gallery, auditLogs] = await Promise.all([
        api.getTable('events').catch(() => []),
        api.getTable('members').catch(() => []),
        api.getTable('gallery_images').catch(() => []),
        api.getTable('audit_logs').catch(() => []),
      ]);

      if (events.error === 'Unauthorized') {
        setError('Your session has expired. Please log in again.');
        setLoading(false);
        return;
      }

      const eventsList = Array.isArray(events) ? events : [];
      const membersList = Array.isArray(members) ? members : [];
      const galleryList = Array.isArray(gallery) ? gallery : [];
      const logsList = Array.isArray(auditLogs) ? auditLogs : [];

      const published = eventsList.filter(e => e.is_published).length;
      const activeM = membersList.filter(m => m.is_active).length;

      setStats({
        totalEvents: eventsList.length,
        publishedEvents: published,
        activeMembers: activeM,
        galleryImages: galleryList.length,
      });

      setLogs(logsList.slice(0, 8));
    } catch (err) {
      console.error('Error loading dashboard data:', err);
      setError('Could not retrieve live database statistics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const quickLinks = [
    {
      title: 'Home Page CMS',
      desc: 'Edit hero banner, announcements, stats counters & community blocks',
      path: '/admin/home/edit',
      icon: FileText,
      color: '#0284c7',
      bg: '#e0f2fe'
    },
    {
      title: 'Events & Workshops',
      desc: 'Create new coding competitions, workshops & publish event details',
      path: '/admin/events/edit',
      icon: Calendar,
      color: '#7c3aed',
      bg: '#ede9fe'
    },
    {
      title: 'Committee & Members',
      desc: 'Add faculty coordinators, executive student leads & manage roles',
      path: '/admin/members/edit',
      icon: Users,
      color: '#059669',
      bg: '#d1fae5'
    },
    {
      title: 'Photo Gallery & Albums',
      desc: 'Upload high-res event pictures & organize campus media albums',
      path: '/admin/gallery/edit',
      icon: Image,
      color: '#d97706',
      bg: '#fef3c7'
    },
    {
      title: 'About KLEF ACM',
      desc: 'Update chapter vision, mission statements, SIGs & achievements',
      path: '/admin/about-klef-acm/edit',
      icon: Activity,
      color: '#db2777',
      bg: '#fce7f3'
    },
    {
      title: 'Contact Desk Settings',
      desc: 'Manage campus location, official enquiry emails & phone numbers',
      path: '/admin/contact/edit',
      icon: Mail,
      color: '#4f46e5',
      bg: '#e0e7ff'
    }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      
      {/* Welcome Banner */}
      <div 
        style={{ 
          backgroundColor: '#ffffff', 
          border: '1px solid #e2e8f0', 
          borderRadius: '12px', 
          padding: '28px 32px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '20px'
        }}
      >
        <div>
          <span style={{ fontSize: '0.75rem', fontWeight: '700', color: '#0085CA', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: '6px' }}>
            Content Management Overview
          </span>
          <h1 style={{ fontSize: '1.6rem', fontWeight: '800', color: '#0f172a', margin: '0 0 6px 0', letterSpacing: '-0.02em' }}>
            Welcome to KLEF ACM Chapter CMS
          </h1>
          <p style={{ color: '#64748b', fontSize: '0.92rem', margin: 0, maxWidth: '650px', lineHeight: '1.5' }}>
            All modifications made within this portal update the online PostgreSQL database and automatically broadcast in real-time to active visitors.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <button 
            onClick={loadDashboardData} 
            className="btn btn-secondary"
            style={{ fontSize: '0.85rem', padding: '8px 16px', display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <Clock size={15} />
            <span>Refresh Stats</span>
          </button>
          <Link 
            to="/admin/events/edit" 
            className="btn btn-primary"
            style={{ fontSize: '0.85rem', padding: '8px 18px', display: 'flex', alignItems: 'center', gap: '6px', textDecoration: 'none' }}
          >
            <PlusCircle size={16} />
            <span>New Event</span>
          </Link>
        </div>
      </div>

      {error && (
        <div style={{ padding: '16px 20px', backgroundColor: '#fee2e2', border: '1px solid #fca5a5', borderRadius: '8px', color: '#991b1b', fontSize: '0.9rem' }}>
          {error}
        </div>
      )}

      {/* Metrics Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px' }}>
        
        {/* Metric 1: Events */}
        <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <span style={{ fontSize: '0.82rem', fontWeight: '700', color: '#64748b', textTransform: 'uppercase' }}>Chapter Events</span>
            <div style={{ width: '36px', height: '36px', borderRadius: '8px', backgroundColor: '#f3e8ff', color: '#7c3aed', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Calendar size={18} />
            </div>
          </div>
          <div style={{ fontSize: '1.9rem', fontWeight: '800', color: '#0f172a', lineHeight: '1' }}>
            {loading ? '—' : stats.totalEvents}
          </div>
          <div style={{ fontSize: '0.78rem', color: '#10b981', marginTop: '6px', fontWeight: '600' }}>
            {stats.publishedEvents} Published & Live
          </div>
        </div>

        {/* Metric 2: Members */}
        <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <span style={{ fontSize: '0.82rem', fontWeight: '700', color: '#64748b', textTransform: 'uppercase' }}>Committee Leads</span>
            <div style={{ width: '36px', height: '36px', borderRadius: '8px', backgroundColor: '#ecfdf5', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Users size={18} />
            </div>
          </div>
          <div style={{ fontSize: '1.9rem', fontWeight: '800', color: '#0f172a', lineHeight: '1' }}>
            {loading ? '—' : stats.activeMembers}
          </div>
          <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '6px' }}>
            Active Coordinators Listed
          </div>
        </div>

        {/* Metric 3: Gallery Photos */}
        <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <span style={{ fontSize: '0.82rem', fontWeight: '700', color: '#64748b', textTransform: 'uppercase' }}>Gallery Photos</span>
            <div style={{ width: '36px', height: '36px', borderRadius: '8px', backgroundColor: '#fffbeb', color: '#d97706', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Image size={18} />
            </div>
          </div>
          <div style={{ fontSize: '1.9rem', fontWeight: '800', color: '#0f172a', lineHeight: '1' }}>
            {loading ? '—' : stats.galleryImages}
          </div>
          <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '6px' }}>
            Stored in Object Storage
          </div>
        </div>

        {/* Metric 4: System Health */}
        <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <span style={{ fontSize: '0.82rem', fontWeight: '700', color: '#64748b', textTransform: 'uppercase' }}>Realtime Sync</span>
            <div style={{ width: '36px', height: '36px', borderRadius: '8px', backgroundColor: '#e0f2fe', color: '#0284c7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Radio size={18} />
            </div>
          </div>
          <div style={{ fontSize: '1.1rem', fontWeight: '800', color: '#10b981', lineHeight: '1.4' }}>
            Active & Synced
          </div>
          <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '4px' }}>
            WebSockets Broadcast Ready
          </div>
        </div>

      </div>

      {/* Quick Action Navigation Grid */}
      <div>
        <h2 style={{ fontSize: '1.15rem', fontWeight: '700', color: '#0f172a', marginBottom: '16px' }}>
          CMS Page & Resource Editors
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px' }}>
          {quickLinks.map((item, idx) => {
            const Icon = item.icon;
            return (
              <Link
                key={idx}
                to={item.path}
                style={{
                  backgroundColor: '#ffffff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '10px',
                  padding: '20px',
                  textDecoration: 'none',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '16px',
                  transition: 'transform 0.15s ease, box-shadow 0.15s ease, border-color 0.15s ease',
                  boxShadow: '0 1px 2px rgba(0,0,0,0.02)',
                }}
                className="cms-quick-card"
              >
                <div style={{ width: '44px', height: '44px', borderRadius: '10px', backgroundColor: item.bg, color: item.color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Icon size={22} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: '700', fontSize: '1rem', color: '#0f172a', marginBottom: '4px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span>{item.title}</span>
                    <ArrowRight size={16} style={{ color: '#94a3b8' }} />
                  </div>
                  <p style={{ fontSize: '0.85rem', color: '#64748b', margin: 0, lineHeight: '1.5' }}>
                    {item.desc}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Recent Activity Stream */}
      <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', paddingBottom: '12px', borderBottom: '1px solid #f1f5f9' }}>
          <div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: '700', color: '#0f172a', margin: '0 0 2px 0' }}>
              Recent Audit Log & CMS Changes
            </h3>
            <p style={{ fontSize: '0.78rem', color: '#64748b', margin: 0 }}>
              Chronological log of administrator mutations recorded in the database
            </p>
          </div>
          <Link to="/admin/audit-logs" style={{ fontSize: '0.82rem', color: '#0085CA', fontWeight: '600', textDecoration: 'none' }}>
            View Complete Log →
          </Link>
        </div>

        {logs.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '32px 0', color: '#94a3b8', fontSize: '0.9rem' }}>
            No recent audit events recorded yet.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {logs.map((log, idx) => (
              <div 
                key={idx} 
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'space-between', 
                  padding: '10px 14px', 
                  backgroundColor: '#f8fafc', 
                  borderRadius: '6px', 
                  fontSize: '0.85rem' 
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#0085CA' }} />
                  <strong style={{ color: '#0f172a' }}>{log.admin_username || 'Admin'}</strong>
                  <span style={{ color: '#64748b' }}>{log.details || log.action}</span>
                </div>
                <span style={{ color: '#94a3b8', fontSize: '0.78rem' }}>
                  {log.timestamp ? new Date(log.timestamp).toLocaleString('en-IN') : 'Just now'}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      <style>{`
        .cms-quick-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0,0,0,0.06) !important;
          border-color: #cbd5e1 !important;
        }
      `}</style>
    </div>
  );
}
