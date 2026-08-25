import { useContext, useEffect, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { SiteDataContext } from '../App';

export default function PublicLayout() {
  const { siteData } = useContext(SiteDataContext);
  const location = useLocation();
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const path = location.pathname;
    let title = 'KLU ACM — Student Chapter';
    let description = 'KLU ACM Student Chapter at Koneru Lakshmaiah Education Foundation (Deemed to be University).';

    if (path.endsWith('/events')) {
      title = 'KLU ACM — Events';
      description = 'Explore upcoming coding events, workshops, hackathons, and technical bootcamps organized by KLU ACM.';
    } else if (path.endsWith('/gallery')) {
      title = 'KLU ACM — Gallery';
      description = 'Visual documentation and gallery archives of past KLU ACM hackathons, sessions, and workshops.';
    } else if (path.endsWith('/members')) {
      title = 'KLU ACM — Members';
      description = 'Meet the faculty coordinators and student committee members driving KLU ACM chapter leadership.';
    } else if (path.endsWith('/about-acm')) {
      title = 'KLU ACM — About ACM';
      description = 'Learn about the Association for Computing Machinery (ACM), the world\'s largest scientific computing society.';
    } else if (path.endsWith('/about-klef-acm')) {
      title = 'KLU ACM — About KLU ACM';
      description = 'About the KLU ACM Student Chapter at Koneru Lakshmaiah Education Foundation (Deemed to be University).';
    } else if (path.endsWith('/contact')) {
      title = 'KLU ACM — Contact';
      description = 'Get in touch with the KLU ACM Student Chapter representatives and coordinators.';
    }

    document.title = title;

    // Update or create meta description tag
    let metaDescription = document.querySelector('meta[name="description"]');
    if (!metaDescription) {
      metaDescription = document.createElement('meta');
      metaDescription.name = 'description';
      document.head.appendChild(metaDescription);
    }
    metaDescription.setAttribute('content', description);

    // Scroll to top on navigation
    window.scrollTo(0, 0);
    setScrollProgress(0);
  }, [location]);

  useEffect(() => {
    const handleScroll = () => {
      const totalScroll = document.documentElement.scrollHeight - window.innerHeight;
      if (totalScroll > 0) {
        setScrollProgress((window.scrollY / totalScroll) * 100);
      } else {
        setScrollProgress(0);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [location.pathname]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {/* Viewport Top Scroll Progress Indicator */}
      <div 
        style={{ 
          position: 'fixed', 
          top: 0, 
          left: 0, 
          width: `${scrollProgress}%`, 
          height: '2.5px', 
          backgroundColor: 'var(--primary)', 
          zIndex: 10000, 
          transition: 'width 0.1s cubic-bezier(0.22, 1, 0.36, 1)' 
        }} 
      />
      <Header />
      <main style={{ flex: '1 0 auto' }}>
        <div key={location.key} className="page-transition-wrapper">
          <Outlet />
        </div>
      </main>
      <Footer contact={siteData?.contact || {}} />
    </div>
  );
}
