import React from 'react';
import { 
  LayoutDashboard, 
  Settings, 
  Sprout, 
  Sun, 
  Moon,
  UserCheck
} from 'lucide-react';

export default function Sidebar({ activeTab, setActiveTab, darkMode, setDarkMode }) {
  return (
    <div className="sidebar-capsule">
      {/* Brand Header Logo */}
      <div style={styles.brandContainer} title="Zentra Flora Greenhouse System">
        <div style={styles.logoCircle}>
          <Sprout size={20} color="#FFFFFF" />
        </div>
      </div>

      {/* Centered Pill Navigation Track */}
      <div className="sidebar-track">
        {/* Dashboard Button */}
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`sidebar-circle-btn ${activeTab === 'dashboard' ? 'active' : ''}`}
          title="Telemetry Dashboard"
        >
          <LayoutDashboard size={20} />
        </button>

        {/* System Settings Button */}
        <button
          onClick={() => setActiveTab('settings')}
          className={`sidebar-circle-btn ${activeTab === 'settings' ? 'active' : ''}`}
          title="Model & AI Configurations"
        >
          <Settings size={20} />
        </button>

        {/* Dynamic Light/Dark Mode Toggle Circle Button */}
        <button
          onClick={() => setDarkMode(!darkMode)}
          className="sidebar-circle-btn"
          style={{ 
            color: darkMode ? 'var(--color-warning)' : 'var(--color-primary)',
            marginTop: 'auto'
          }}
          title={darkMode ? "Switch to Light Theme" : "Switch to Dark Theme"}
        >
          {darkMode ? <Sun size={20} /> : <Moon size={20} />}
        </button>
      </div>

      {/* Styled User Profile Initials/Avatar at Bottom */}
      <div style={styles.avatarContainer} title="Aniq (System Owner)">
        <div style={styles.avatarCircle}>
          <UserCheck size={16} color="var(--color-primary)" />
        </div>
        <div style={styles.onlineBadge}></div>
      </div>
    </div>
  );
}

const styles = {
  brandContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    paddingBottom: '8px'
  },
  logoCircle: {
    width: '46px',
    height: '46px',
    borderRadius: '50%',
    backgroundColor: 'var(--color-primary)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 4px 14px rgba(124, 58, 237, 0.3)'
  },
  avatarContainer: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '44px',
    height: '44px',
    cursor: 'pointer'
  },
  avatarCircle: {
    width: '42px',
    height: '42px',
    borderRadius: '50%',
    backgroundColor: 'var(--color-primary-light)',
    border: '2px solid var(--color-border)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'border-color 0.2s'
  },
  onlineBadge: {
    position: 'absolute',
    bottom: '1px',
    right: '1px',
    width: '10px',
    height: '10px',
    borderRadius: '50%',
    backgroundColor: 'var(--color-success)',
    border: '2px solid var(--color-bg-sidebar)',
    boxShadow: '0 0 6px var(--color-success)'
  }
};
