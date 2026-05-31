import React from 'react';
import { Search, Download, Plus, Sparkles, Activity } from 'lucide-react';

export default function HeaderBanner({ plantName, stage, onExport, userName }) {
  return (
    <div style={styles.container}>
      {/* Top action row */}
      <div style={styles.topRow}>
        <div style={styles.titleWrapper}>
          <h1 style={styles.mainHeading}>Zentra Flora</h1>
          <span style={styles.headingSubtitle}>Automated Multi-Agent Greenhouse Portal</span>
        </div>

        {/* Buttons */}
        <div style={styles.btnGroup}>
          <button style={styles.btnSecondary} onClick={onExport}>
            <Download size={16} />
            <span>Export Telemetry Report</span>
          </button>
        </div>
      </div>

      {/* Main Banner Illustration Section */}
      <div style={styles.banner}>
        {/* Greenhouse Banner Image Background */}
        <img 
          src="/greenhouse_banner.png" 
          alt="Smart Greenhouse Banner" 
          style={styles.bannerImg}
        />

        {/* Dark overlay gradients */}
        <div style={styles.bannerOverlay}></div>

        {/* Glass floating card info */}
        <div style={styles.glassCard}>
          <div style={styles.badge}>
            <Activity size={12} color="#10B981" />
            <span style={styles.badgeText}>Agent Active</span>
          </div>
          <h2 style={styles.bannerTitle}>AI Greenhouse Control</h2>
          <p style={styles.bannerSubtitle}>
            Hi <strong>{userName || 'Guest'}</strong>, managing <strong>{plantName}</strong> ({stage}) using Plant Expert & Actuator Control Agents.
          </p>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    marginBottom: '24px'
  },
  topRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '16px',
    flexWrap: 'wrap'
  },
  titleWrapper: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px'
  },
  mainHeading: {
    fontFamily: "'Outfit', sans-serif",
    fontSize: '28px',
    fontWeight: '800',
    color: 'var(--color-text-title)',
    transition: 'color 0.2s'
  },
  headingSubtitle: {
    fontSize: '13px',
    fontWeight: '600',
    color: 'var(--color-text-muted)',
    transition: 'color 0.2s'
  },
  btnGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px'
  },
  btnSecondary: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    backgroundColor: 'var(--color-bg-card)',
    border: '1px solid var(--color-border)',
    borderRadius: '12px',
    height: '46px',
    padding: '0 20px',
    fontSize: '14px',
    fontWeight: '600',
    color: 'var(--color-text-body)',
    cursor: 'pointer',
    boxShadow: '0 2px 6px rgba(0,0,0,0.01)',
    transition: 'background-color 0.2s, border 0.2s, color 0.2s'
  },
  banner: {
    position: 'relative',
    height: '180px',
    borderRadius: '24px',
    overflow: 'hidden',
    display: 'flex',
    alignItems: 'center',
    boxShadow: '0 10px 30px rgba(109, 40, 217, 0.05)'
  },
  bannerImg: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    top: 0,
    left: 0
  },
  bannerOverlay: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    left: 0,
    top: 0,
    background: 'linear-gradient(90deg, rgba(15, 23, 42, 0.45) 0%, rgba(124, 58, 237, 0.1) 100%)'
  },
  glassCard: {
    position: 'relative',
    marginLeft: '32px',
    backgroundColor: 'var(--color-bg-card)',
    border: '1px solid var(--color-border)',
    borderRadius: '20px',
    padding: '16px 24px',
    maxWidth: '460px',
    boxShadow: '0 10px 30px rgba(0, 0, 0, 0.08)',
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
    opacity: 0.95,
    transition: 'background-color 0.2s, border 0.2s'
  },
  badge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    backgroundColor: '#ECFDF5',
    border: '1px solid #A7F3D0',
    borderRadius: '20px',
    padding: '2px 8px',
    width: 'fit-content'
  },
  badgeText: {
    fontSize: '10px',
    fontWeight: '700',
    color: '#047857',
    textTransform: 'uppercase',
    letterSpacing: '0.5px'
  },
  bannerTitle: {
    fontSize: '20px',
    fontWeight: '800',
    color: 'var(--color-text-title)',
    fontFamily: "'Outfit', sans-serif",
    transition: 'color 0.2s'
  },
  bannerSubtitle: {
    fontSize: '12px',
    color: 'var(--color-text-body)',
    lineHeight: '1.5',
    transition: 'color 0.2s'
  }
};
;
