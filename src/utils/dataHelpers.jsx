import { 
  Globe, 
  Mail, 
  MapPin, 
  User, 
  Calendar,
  Layers,
  Image as ImageIcon
} from 'lucide-react';

// Dedicated Branded Social & Competitive Programming Icons (Zero-dependency SVG)
export const LinkedInIcon = ({ size = 16, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect x="2" y="9" width="4" height="12" />
    <circle cx="4" cy="4" r="2" />
  </svg>
);

export const GitHubIcon = ({ size = 16, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
  </svg>
);

export const TwitterIcon = ({ size = 16, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
  </svg>
);

export const InstagramIcon = ({ size = 16, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
  </svg>
);

export const LeetCodeIcon = ({ size = 16, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M13.483 0a1.374 1.374 0 0 0-.961.438L7.116 6.226l-3.854 4.126a5.266 5.266 0 0 0-1.209 2.104 5.35 5.35 0 0 0-.125.513 5.527 5.527 0 0 0 .062 2.362 5.83 5.83 0 0 0 .349 1.017 5.938 5.938 0 0 0 4.818 3.662 5.894 5.894 0 0 0 3.343-.572l6.099-3.486a1.445 1.445 0 0 0 .61-1.742 1.457 1.457 0 0 0-1.714-.72l-5.69 3.253a3.02 3.02 0 0 1-2.453.298 3.1 3.1 0 0 1-2.158-1.929 3.012 3.012 0 0 1 .632-3.232l3.473-3.718 4.417-4.735a1.432 1.432 0 0 0-.064-1.996A1.377 1.377 0 0 0 13.483 0zm-2.88 7.218a1.433 1.433 0 0 0-.997.417l-1.96 2.1a1.447 1.447 0 1 0 2.115 1.969l1.96-2.1a1.433 1.433 0 0 0-.121-1.969 1.436 1.436 0 0 0-.997-.417zM14.54 13.43a1.44 1.44 0 0 0-1.44 1.44v.005a1.44 1.44 0 0 0 1.44 1.44h6.02a1.44 1.44 0 0 0 1.44-1.44v-.005a1.44 1.44 0 0 0-1.44-1.44h-6.02z" />
  </svg>
);

export const HackerRankIcon = ({ size = 16, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 0L1.608 6v12L12 24l10.392-6V6L12 0zm3.627 15.347h-1.637v-2.222H9.98v2.222H8.343V8.653H9.98v2.233h3.98V8.653h1.637v6.694z"/>
  </svg>
);

export const CodeChefIcon = ({ size = 16, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 4h2v5.18l3.12 1.8-1 1.73L11 12.5V6zm-3.5 9c-.83 0-1.5-.67-1.5-1.5S6.67 12 7.5 12s1.5.67 1.5 1.5S8.33 15 7.5 15zm9 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z"/>
  </svg>
);

export const CodeforcesIcon = ({ size = 16, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M4.5 7.5a1.5 1.5 0 0 1 1.5 1.5v12a1.5 1.5 0 0 1-3 0V9a1.5 1.5 0 0 1 1.5-1.5zM12 3a1.5 1.5 0 0 1 1.5 1.5v16.5a1.5 1.5 0 0 1-3 0V4.5A1.5 1.5 0 0 1 12 3zm7.5 7.5a1.5 1.5 0 0 1 1.5 1.5v9a1.5 1.5 0 0 1-3 0v-9a1.5 1.5 0 0 1 1.5-1.5z" />
  </svg>
);

export const GeeksforGeeksIcon = ({ size = 16, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm3.6 13.7a4.6 4.6 0 0 1-3.6 1.7 4.7 4.7 0 0 1-4.7-4.7 4.7 4.7 0 0 1 4.7-4.7 4.6 4.6 0 0 1 3.5 1.6l-1.4 1.4a2.6 2.6 0 0 0-2.1-1 2.7 2.7 0 0 0-2.7 2.7 2.7 2.7 0 0 0 2.7 2.7 2.6 2.6 0 0 0 2.1-1h-2.1v-2h4.1z"/>
  </svg>
);

export const KaggleIcon = ({ size = 16, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.825 23.859c-.022.09-.112.141-.27.141h-3.139a.633.633 0 0 1-.54-.27l-5.074-6.871-1.417 1.35v5.52c0 .18-.09.27-.27.27H5.27c-.18 0-.27-.09-.27-.27V.27c0-.18.09-.27.27-.27h2.845c.18 0 .27.09.27.27v14.197l6.234-6.408a.747.747 0 0 1 .54-.247h3.297c.18 0 .27.09.27.27 0 .09-.045.18-.135.27l-6.84 6.84 7.29 8.397c.09.09.112.18.09.27z"/>
  </svg>
);

export const GitLabIcon = ({ size = 16, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="m23.6 9.6-1.7-5.1c-.2-.6-.9-1-1.5-.7-.4.2-.6.6-.7.9l-2.4 7.4H6.7L4.3 4.7c-.2-.7-.9-1.1-1.6-.9-.3.1-.6.4-.7.9L.4 9.6c-.3.8 0 1.7.7 2.1l10.5 7.6a.7.7 0 0 0 .8 0l10.5-7.6c.7-.4 1-1.3.7-2.1z"/>
  </svg>
);

export const YouTubeIcon = ({ size = 16, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
  </svg>
);

export const MediumIcon = ({ size = 16, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M13.54 12a6.8 6.8 0 0 1-6.77 6.82A6.8 6.8 0 0 1 0 12a6.8 6.8 0 0 1 6.77-6.82A6.8 6.8 0 0 1 13.54 12zM20.96 12c0 3.54-1.51 6.42-3.38 6.42-1.87 0-3.39-2.88-3.39-6.42s1.52-6.42 3.39-6.42 3.38 2.88 3.38 6.42M24 12c0 3.17-.53 5.75-1.19 5.75-.66 0-1.19-2.58-1.19-5.75s.53-5.75 1.19-5.75C23.47 6.25 24 8.83 24 12z"/>
  </svg>
);

export const ScholarIcon = ({ size = 16, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
    <path d="M6 12v5c3 3 9 3 12 0v-5" />
  </svg>
);

/**
 * Parses member metadata, custom structured URLs, social & competitive coding icons, and display order
 */
export function parseMemberData(member) {
  if (!member) return { bio: '', links: [], rawUrls: [], linkedinUrl: '', display_order: 9999 };

  const rawBio = member.biography || member.description || '';
  let cleanBio = rawBio;
  let rawLinks = [];
  let metaOrder = null;

  const match = rawBio.match(/<!--(?:KLEF|KLU)_LINKS:([\s\S]*?)-->/);
  if (match && match[1]) {
    try {
      const parsed = JSON.parse(match[1]);
      if (Array.isArray(parsed)) {
        rawLinks = parsed;
      } else if (parsed && typeof parsed === 'object') {
        if (Array.isArray(parsed.links)) rawLinks = parsed.links;
        if (parsed.display_order !== undefined && parsed.display_order !== null && parsed.display_order !== '') {
          metaOrder = Number(parsed.display_order);
        }
      }
    } catch {}
    cleanBio = rawBio.replace(/\n*<!--(?:KLEF|KLU)_LINKS:[\s\S]*?-->/g, '').trim();
  }

  if (rawLinks.length === 0 && Array.isArray(member.social_links) && member.social_links.length > 0) {
    rawLinks = member.social_links;
  }

  const rawUrls = [];
  const candidateUrls = [];

  if (member.linkedin_url) candidateUrls.push({ url: member.linkedin_url, label: 'LinkedIn' });
  if (member.github_url) candidateUrls.push({ url: member.github_url, label: 'GitHub' });
  if (member.portfolio_url) candidateUrls.push({ url: member.portfolio_url, label: 'Portfolio' });

  rawLinks.forEach(item => {
    if (typeof item === 'string' && item.trim()) {
      candidateUrls.push({ url: item.trim() });
    } else if (item && item.url && String(item.url).trim()) {
      candidateUrls.push(item);
    }
  });

  const links = [];
  const seenUrls = new Set();
  let foundLinkedin = '';

  candidateUrls.forEach(rawItem => {
    const cleanUrl = String(rawItem.url || '').trim();
    if (!cleanUrl || seenUrls.has(cleanUrl.toLowerCase())) return;
    seenUrls.add(cleanUrl.toLowerCase());
    rawUrls.push(cleanUrl);

    const urlLower = cleanUrl.toLowerCase();
    let rawLabel = (rawItem.label || '').trim();
    let labelLower = rawLabel.toLowerCase();

    const isGeneric = (lbl) => {
      if (!lbl) return true;
      const l = lbl.trim().toLowerCase();
      return (
        l === 'website' ||
        l === 'portfolio' ||
        l === 'website / portfolio' ||
        l === 'website/portfolio' ||
        l === 'url' ||
        l === 'link' ||
        l === 'custom link' ||
        l === 'profile' ||
        l === 'social'
      );
    };

    let type = 'website';
    let label = rawLabel || 'Portfolio';
    let icon = Globe;
    let color = '#005CA9';

    // 1. LinkedIn
    if (urlLower.includes('linkedin.com') || labelLower.includes('linkedin')) {
      type = 'linkedin';
      label = (isGeneric(rawLabel) || labelLower.includes('linkedin')) ? 'LinkedIn' : rawLabel;
      icon = LinkedInIcon;
      color = '#0A66C2';
      if (!foundLinkedin) foundLinkedin = cleanUrl;
    }
    // 2. GitHub
    else if (urlLower.includes('github.com') || labelLower.includes('github')) {
      type = 'github';
      label = (isGeneric(rawLabel) || labelLower.includes('github')) ? 'GitHub' : rawLabel;
      icon = GitHubIcon;
      color = '#1E293B';
    }
    // 3. LeetCode
    else if (urlLower.includes('leetcode.com') || urlLower.includes('leetcode.cn') || labelLower.includes('leetcode')) {
      type = 'leetcode';
      label = (isGeneric(rawLabel) || labelLower.includes('leetcode')) ? 'LeetCode' : rawLabel;
      icon = LeetCodeIcon;
      color = '#FFA116';
    }
    // 4. HackerRank
    else if (urlLower.includes('hackerrank.com') || labelLower.includes('hackerrank')) {
      type = 'hackerrank';
      label = (isGeneric(rawLabel) || labelLower.includes('hackerrank')) ? 'HackerRank' : rawLabel;
      icon = HackerRankIcon;
      color = '#2EC866';
    }
    // 5. CodeChef
    else if (urlLower.includes('codechef.com') || labelLower.includes('codechef')) {
      type = 'codechef';
      label = (isGeneric(rawLabel) || labelLower.includes('codechef')) ? 'CodeChef' : rawLabel;
      icon = CodeChefIcon;
      color = '#5B4638';
    }
    // 6. Codeforces
    else if (urlLower.includes('codeforces.com') || labelLower.includes('codeforces')) {
      type = 'codeforces';
      label = (isGeneric(rawLabel) || labelLower.includes('codeforces')) ? 'Codeforces' : rawLabel;
      icon = CodeforcesIcon;
      color = '#1F8ACB';
    }
    // 7. GeeksforGeeks
    else if (urlLower.includes('geeksforgeeks.org') || labelLower.includes('geeksforgeeks') || labelLower.includes('gfg')) {
      type = 'geeksforgeeks';
      label = (isGeneric(rawLabel) || labelLower.includes('geeksforgeeks') || labelLower.includes('gfg')) ? 'GeeksforGeeks' : rawLabel;
      icon = GeeksforGeeksIcon;
      color = '#2F8D46';
    }
    // 8. Kaggle
    else if (urlLower.includes('kaggle.com') || labelLower.includes('kaggle')) {
      type = 'kaggle';
      label = (isGeneric(rawLabel) || labelLower.includes('kaggle')) ? 'Kaggle' : rawLabel;
      icon = KaggleIcon;
      color = '#20BEFF';
    }
    // 9. GitLab
    else if (urlLower.includes('gitlab.com') || labelLower.includes('gitlab')) {
      type = 'gitlab';
      label = (isGeneric(rawLabel) || labelLower.includes('gitlab')) ? 'GitLab' : rawLabel;
      icon = GitLabIcon;
      color = '#FC6D26';
    }
    // 10. Twitter / X
    else if (urlLower.includes('twitter.com') || urlLower.includes('x.com') || labelLower.includes('twitter') || labelLower === 'x') {
      type = 'twitter';
      label = (isGeneric(rawLabel) || labelLower.includes('twitter') || labelLower === 'x') ? 'Twitter / X' : rawLabel;
      icon = TwitterIcon;
      color = '#0284C7';
    }
    // 11. Instagram
    else if (urlLower.includes('instagram.com') || labelLower.includes('instagram')) {
      type = 'instagram';
      label = (isGeneric(rawLabel) || labelLower.includes('instagram')) ? 'Instagram' : rawLabel;
      icon = InstagramIcon;
      color = '#E1306C';
    }
    // 12. YouTube
    else if (urlLower.includes('youtube.com') || urlLower.includes('youtu.be') || labelLower.includes('youtube')) {
      type = 'youtube';
      label = (isGeneric(rawLabel) || labelLower.includes('youtube')) ? 'YouTube' : rawLabel;
      icon = YouTubeIcon;
      color = '#FF0000';
    }
    // 13. Medium
    else if (urlLower.includes('medium.com') || labelLower.includes('medium')) {
      type = 'medium';
      label = (isGeneric(rawLabel) || labelLower.includes('medium')) ? 'Medium' : rawLabel;
      icon = MediumIcon;
      color = '#12100E';
    }
    // 14. Google Scholar
    else if (urlLower.includes('scholar.google') || labelLower.includes('scholar')) {
      type = 'scholar';
      label = (isGeneric(rawLabel) || labelLower.includes('scholar')) ? 'Google Scholar' : rawLabel;
      icon = ScholarIcon;
      color = '#4285F4';
    }
    // 15. ResearchGate
    else if (urlLower.includes('researchgate.net') || labelLower.includes('researchgate')) {
      type = 'researchgate';
      label = (isGeneric(rawLabel) || labelLower.includes('researchgate')) ? 'ResearchGate' : rawLabel;
      icon = Globe;
      color = '#00CCBB';
    }
    // 16. Email
    else if (cleanUrl.startsWith('mailto:') || labelLower.includes('email') || labelLower.includes('mail')) {
      type = 'email';
      label = (isGeneric(rawLabel) || labelLower.includes('email') || labelLower.includes('mail')) ? 'Email' : rawLabel;
      icon = Mail;
      color = '#DC2626';
    }
    // 17. Intelligent Domain Title Extraction for ANY Custom / Other Links
    else {
      type = 'website';
      if (isGeneric(rawLabel)) {
        try {
          const parsedUrl = new URL(cleanUrl.startsWith('http') ? cleanUrl : `https://${cleanUrl}`);
          let host = parsedUrl.hostname.replace(/^www\./, '');
          const hostParts = host.split('.');
          if (hostParts.length >= 2) {
            const domainName = hostParts[0].charAt(0).toUpperCase() + hostParts[0].slice(1);
            label = `${domainName}`;
          } else {
            label = host;
          }
        } catch {
          label = 'Portfolio';
        }
      } else {
        label = rawLabel;
      }
      icon = Globe;
      color = '#005CA9';
    }


    links.push({ type, url: cleanUrl, label, icon, color });
  });

  const isOrderValid = (val) => val !== undefined && val !== null && val !== '' && !isNaN(Number(val));
  const finalOrder = isOrderValid(member.display_order)
    ? Number(member.display_order)
    : (isOrderValid(metaOrder) ? Number(metaOrder) : 9999);

  return { bio: cleanBio, links, rawUrls, linkedinUrl: foundLinkedin, display_order: finalOrder };
}

/**
 * Parses event metadata including display_order and event_format
 */
export function parseEventData(event) {
  if (!event) return { title: '', cleanDescription: '', event_format: 'in_person', display_order: 9999 };
  const rawDesc = event.description || '';
  let metaOrder = null;
  let metaFormat = null;
  const metaMatch = rawDesc.match(/<!--(?:KLEF|KLU)_EVENT:([\s\S]*?)-->/);
  if (metaMatch && metaMatch[1]) {
    try {
      const parsed = JSON.parse(metaMatch[1]);
      if (parsed && typeof parsed === 'object') {
        if (parsed.display_order !== undefined && parsed.display_order !== null && parsed.display_order !== '') {
          metaOrder = Number(parsed.display_order);
        }
        if (parsed.event_format) {
          metaFormat = parsed.event_format;
        }
      }
    } catch {}
  }
  const cleanDesc = rawDesc.replace(/\n*<!--(?:KLEF|KLU)_EVENT:[\s\S]*?-->/g, '').trim();

  const v = (event.venue || '').toLowerCase();
  let defaultFormat = 'in_person';
  if (v.includes('online') || v.includes('virtual') || v.includes('zoom') || v.includes('meet') || v.includes('webinar')) {
    defaultFormat = 'online';
  } else if (v.includes('hybrid')) {
    defaultFormat = 'hybrid';
  }
  const format = event.event_format || metaFormat || defaultFormat;

  const isOrderValid = (val) => val !== undefined && val !== null && val !== '' && !isNaN(Number(val));
  const finalOrder = isOrderValid(event.display_order)
    ? Number(event.display_order)
    : (isOrderValid(metaOrder) ? Number(metaOrder) : 9999);

  return {
    title: event.title || '',
    cleanDescription: cleanDesc,
    event_format: format,
    display_order: finalOrder,
  };
}

/**
 * Parses gallery item metadata, multiple images, date, and description
 */
export function parseGalleryItem(item) {
  if (!item) return { title: '', coverUrl: '', images: [], date: '', description: '', display_order: 9999 };

  const rawCaption = item.caption || item.title || '';
  const coverUrl = item.url || item.image_url || '';
  let images = [];
  let date = item.event_date || item.date || '';
  let description = item.description || item.bio || '';
  let metaOrder = null;

  const descMatch = (description || '').match(/<!--(?:KLEF|KLU)_GALLERY:([\s\S]*?)-->/);
  if (descMatch && descMatch[1]) {
    try {
      const parsedMeta = JSON.parse(descMatch[1]);
      if (parsedMeta) {
        if (Array.isArray(parsedMeta.images) && parsedMeta.images.length > 0) {
          images = parsedMeta.images;
        }
        if (parsedMeta.date) date = parsedMeta.date;
        if (parsedMeta.description !== undefined) description = parsedMeta.description;
        if (parsedMeta.display_order !== undefined && parsedMeta.display_order !== null && parsedMeta.display_order !== '') {
          metaOrder = Number(parsedMeta.display_order);
        }
      }
    } catch {}
  }

  if (images.length === 0 && Array.isArray(item.images) && item.images.length > 0) {
    images = item.images;
  }

  if (images.length === 0 && coverUrl) {
    images = [coverUrl];
  }

  const cleanTitle = rawCaption.replace(/\[(?:Event|Photos|Date):.*?\]/gi, '').trim();
  const cleanDesc = (description || '').replace(/\n*<!--(?:KLEF|KLU)_GALLERY:[\s\S]*?-->/g, '').trim();

  const isOrderValid = (val) => val !== undefined && val !== null && val !== '' && !isNaN(Number(val));
  const finalOrder = isOrderValid(item.display_order)
    ? Number(item.display_order)
    : (isOrderValid(metaOrder) ? Number(metaOrder) : 9999);

  return {
    title: cleanTitle || 'Chapter Activity',
    coverUrl: coverUrl || images[0] || '',
    images: images.filter(Boolean),
    date: date || '',
    description: cleanDesc || '',
    display_order: finalOrder
  };
}

// 36 Curated Member Background Colors (4 Harmonious Sets)
// ponytail: brand-only palette (KL red / ACM blue, sampled from public/brand logo)
export const cardColors = ['#D32A38', '#0093D3', '#A8202A', '#0077B6'];

export function generateCardPalettes(hexList) {
  return hexList.map(hex => {
    let r = parseInt(hex.slice(1, 3), 16) / 255;
    let g = parseInt(hex.slice(3, 5), 16) / 255;
    let b = parseInt(hex.slice(5, 7), 16) / 255;
    let max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h = 0, s = 0, l = (max + min) / 2;
    if (max !== min) {
      let d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
      }
      h /= 6;
    }
    const hDeg = Math.round(h * 360);
    const sPct = Math.round(s * 100);
    const lPct = Math.round(l * 100);

    return {
      bg: hex,
      border: `hsl(${hDeg}, ${Math.min(sPct + 15, 65)}%, ${Math.max(lPct - 12, 48)}%)`,
      accent: `hsl(${hDeg}, ${Math.min(sPct + 40, 90)}%, ${Math.max(lPct - 45, 20)}%)`,
      badgeBg: `hsl(${hDeg}, ${Math.min(sPct, 50)}%, ${Math.max(lPct - 4, 86)}%)`,
      badgeColor: `hsl(${hDeg}, ${Math.min(sPct + 40, 92)}%, ${Math.max(lPct - 50, 18)}%)`
    };
  });
}

export const CARD_PALETTES = generateCardPalettes(cardColors);
