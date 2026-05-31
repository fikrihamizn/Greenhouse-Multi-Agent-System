import React from 'react';
import { 
  LayoutDashboard, 
  Settings, 
  Sprout, 
  Sun, 
  Moon 
} from 'lucide-react';

export default function Sidebar({ activeTab, setActiveTab, darkMode, setDarkMode }) {
  const menuItems = [
    { id: 'dashboard', name: 'Dashboard', icon: LayoutDashboard }
  ];

  const settingsItems = [
    { id: 'settings', name: 'System Settings', icon: Settings }
  ];

  return (
    <div style={styles.sidebar}>
      {/* Brand Header */}
      <div style={styles.brand}>
        <div style={styles.logoContainer}>
          <Sprout size={22} color="var(--color-primary)" />
        </div>
        <span style={styles.brandName}>Zentra Flora</span>
      </div>

      {/* Primary Navigation */}
      <div style={styles.sectionHeader}>MENU</div>
      <nav style={styles.nav}>
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              style={{
                ...styles.navButton,
                ...(isActive ? styles.navButtonActive : {})
              }}
            >
              <Icon 
                size={18} 
                color={isActive ? 'var(--color-primary)' : 'var(--color-text-muted)'} 
                style={styles.icon}
              />
              <span style={{ 
                ...styles.label, 
                fontWeight: isActive ? '600' : '500',
                color: isActive ? 'var(--color-text-title)' : 'var(--color-text-body)'
              }}>{item.name}</span>
            </button>
          );
        })}
      </nav>

      {/* Settings Navigation */}
      <div style={styles.sectionHeader}>SETTINGS</div>
      <nav style={styles.nav}>
        {settingsItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              style={{
                ...styles.navButton,
                ...(isActive ? styles.navButtonActive : {})
              }}
            >
              <Icon 
                size={18} 
                color={isActive ? 'var(--color-primary)' : 'var(--color-text-muted)'} 
                style={styles.icon}
              />
              <span style={{ 
                ...styles.label, 
                fontWeight: isActive ? '600' : '500',
                color: isActive ? 'var(--color-text-title)' : 'var(--color-text-body)'
              }}>{item.name}</span>
            </button>
          );
        })}
      </nav>

      {/* Dark/Light Mode switch at bottom */}
      <div style={styles.themeToggleCard}>
        <div style={styles.themeToggleHeader}>
          {darkMode ? <Moon size={16} color="var(--color-primary)" /> : <Sun size={16} color="var(--color-warning)" />}
          <span style={styles.themeToggleText}>{darkMode ? 'Dark Mode' : 'Light Mode'}</span>
        </div>
        <button 
          onClick={() => setDarkMode(!darkMode)}
          style={{
            ...styles.togglePill,
            backgroundColor: darkMode ? 'var(--color-primary)' : '#CBD5E1'
          }}
        >
          <div style={{
            ...styles.toggleCircle,
            transform: darkMode ? 'translateX(18px)' : 'translateX(0px)'
          }}></div>
        </button>
      </div>
    </div>
  );
}

const styles = {
  sidebar: {
    width: '260px',
    backgroundColor: 'var(--color-bg-sidebar)',
    borderRight: '1px solid var(--color-border)',
    display: 'flex',
    flexDirection: 'column',
    height: '100vh',
    padding: '24px 16px',
    position: 'fixed',
    left: 0,
    top: 0,
    overflowY: 'auto',
    zIndex: 10,
    transition: 'background-color 0.2s, border-right 0.2s'
  },
  brand: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '32px',
    paddingLeft: '8px'
  },
  logoContainer: {
    width: '36px',
    height: '36px',
    borderRadius: '10px',
    backgroundColor: 'var(--color-primary-light)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 2px 8px rgba(124, 58, 237, 0.08)',
    transition: 'background-color 0.2s'
  },
  brandName: {
    fontFamily: "'Outfit', sans-serif",
    fontSize: '20px',
    fontWeight: '700',
    color: 'var(--color-text-title)',
    letterSpacing: '-0.5px',
    transition: 'color 0.2s'
  },
  sectionHeader: {
    fontSize: '11px',
    fontWeight: '700',
    color: 'var(--color-text-muted)',
    letterSpacing: '1px',
    margin: '16px 0 8px 8px',
    transition: 'color 0.2s'
  },
  nav: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    marginBottom: '16px'
  },
  navButton: {
    display: 'flex',
    alignItems: 'center',
    padding: '12px 14px',
    border: 'none',
    backgroundColor: 'transparent',
    borderRadius: '12px',
    cursor: 'pointer',
    width: '100%',
    textAlign: 'left',
    transition: 'all 0.15s ease-in-out'
  },
  navButtonActive: {
    backgroundColor: 'var(--color-primary-light)'
  },
  icon: {
    marginRight: '12px',
    flexShrink: 0
  },
  label: {
    fontSize: '14px',
    fontFamily: "'Plus Jakarta Sans', sans-serif",
    transition: 'color 0.2s'
  },
  themeToggleCard: {
    marginTop: 'auto',
    backgroundColor: 'var(--color-primary-light)',
    borderRadius: '16px',
    padding: '16px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    border: '1px solid var(--color-border)',
    transition: 'background-color 0.2s, border 0.2s'
  },
  themeToggleHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },
  themeToggleText: {
    fontSize: '13px',
    fontWeight: '600',
    color: 'var(--color-text-title)'
  },
  togglePill: {
    width: '38px',
    height: '20px',
    borderRadius: '20px',
    border: 'none',
    padding: '2px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    transition: 'background-color 0.2s'
  },
  toggleCircle: {
    width: '16px',
    height: '16px',
    borderRadius: '50%',
    backgroundColor: '#FFFFFF',
    transition: 'transform 0.2s ease-in-out',
    boxShadow: '0 1px 3px rgba(0,0,0,0.15)'
  }
};
;
