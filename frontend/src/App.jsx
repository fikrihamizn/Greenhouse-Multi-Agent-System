import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard, Settings, Sprout, Sun, Moon,
  Thermometer, Droplet, Wind, Lightbulb, ShieldCheck,
  ChevronRight, Info, LogOut, CloudOff, Activity,
  Wifi, Power, MessageSquare, ClipboardList, Microscope,
  BarChart2, UserCheck, Send, CheckCircle2, XCircle,
  RefreshCw, Zap, Bell, ExternalLink, AlertTriangle, Inbox
} from 'lucide-react';
import SensorCharts from './components/SensorCharts';
import GrowthStage from './components/GrowthStage';
import TaskList from './components/TaskList';
import Diagnostics from './components/Diagnostics';
import ChatDrawer from './components/ChatDrawer';

const API_BASE = 'http://127.0.0.1:8000/api';

export default function App() {
  // ── Navigation ──
  const [activeTab, setActiveTab] = useState('dashboard');
  const [darkMode, setDarkMode]   = useState(false);

  // ── Backend connection ──
  const [backendConnected, setBackendConnected] = useState(false);

  // ── Auth ──
  const [loggedInUser, setLoggedInUser]     = useState(() => { try { const s = localStorage.getItem('zentra_user_profile'); return s ? JSON.parse(s) : null; } catch { return null; } });
  const [loggedInEmail, setLoggedInEmail]   = useState(() => { try { const s = localStorage.getItem('zentra_user_profile'); if (s) return JSON.parse(s).email || ''; } catch {} return localStorage.getItem('zentra_user_email') || ''; });
  const [authMode, setAuthMode]             = useState('login');
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginPassword, setLoginPassword]   = useState('');
  const [signupUsername, setSignupUsername] = useState('');
  const [signupEmail, setSignupEmail]       = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupFirstName, setSignupFirstName] = useState('');
  const [signupSecondName, setSignupSecondName] = useState('');
  const [authenticating, setAuthenticating] = useState(false);

  // ── Global state from /api/status ──
  const [data, setData] = useState({
    current_plant: 'Strawberry',
    growth_stage: 'Fruiting',
    age_days: 45,
    sensors: { temperature: 24, humidity: 50, light: 220, soil_moisture: 42 },
    targets: { min_temp: 16, max_temp: 23, min_humidity: 50, max_humidity: 60, min_light: 600, max_light: 1000, min_soil_moisture: 50, max_soil_moisture: 60 },
    actuators: { pump: false, fan: false, grow_lights: false },
    sensor_history: [],
    chat_history: [],
    alerts_history: [],
    diagnostics_history: [],
    tasks: [],
    active_model: 'qwen3-vl-4b',
    agent_bindings: {},
    models: {}
  });

  // ── Sensor sim inputs (for dashboard IoT card) ──
  const [simInputs, setSimInputs] = useState({ temperature: 24, humidity: 50, light: 220, soil_moisture: 42 });
  const [simSending, setSimSending] = useState(false);
  const [simResult, setSimResult]   = useState(null); // { ok: bool, actions: [] }

  // ── Plant selector state (for right panel on dashboard) ──
  const PLANTS  = ['Strawberry', 'Tomato', 'Lettuce', 'Orchid', 'Basil'];
  const STAGES  = ['Seedling', 'Vegetative', 'Flowering', 'Fruiting'];
  const [selPlant, setSelPlant]  = useState('Strawberry');
  const [selStage, setSelStage]  = useState('Fruiting');
  const [selAge, setSelAge]      = useState(45);
  const [plantSaving, setPlantSaving] = useState(false);

  useEffect(() => {
    document.body.classList.toggle('dark-mode', darkMode);
  }, [darkMode]);

  // ── Poll /api/status every 3s ──
  const fetchStatus = async () => {
    try {
      const res = await fetch(`${API_BASE}/status`);
      if (res.ok) {
        const d = await res.json();
        setData(d);
        setBackendConnected(true);
        // Sync sim inputs to live sensor values
        if (d.sensors) setSimInputs({ temperature: d.sensors.temperature, humidity: d.sensors.humidity, light: d.sensors.light, soil_moisture: d.sensors.soil_moisture });
        // Sync plant panel
        setSelPlant(d.current_plant);
        setSelStage(d.growth_stage);
        setSelAge(d.age_days);
      }
    } catch { setBackendConnected(false); }
  };

  useEffect(() => { fetchStatus(); const t = setInterval(fetchStatus, 3000); return () => clearInterval(t); }, []);

  // ── Auth handlers ──
  const handleLogin = async (e) => {
    e.preventDefault();
    const ident = loginIdentifier.trim(), pass = loginPassword.trim();
    if (!ident || !pass) return alert('Enter identifier and password.');
    setAuthenticating(true);
    if (!backendConnected) {
      setTimeout(() => {
        const profile = { username: ident.split('@')[0], email: ident.includes('@') ? ident : `${ident}@zentra.com`, first_name: ident.charAt(0).toUpperCase() + ident.slice(1), second_name: 'User' };
        localStorage.setItem('zentra_user_profile', JSON.stringify(profile));
        localStorage.setItem('zentra_user_email', profile.email);
        setLoggedInUser(profile); setLoggedInEmail(profile.email); setAuthenticating(false);
      }, 600);
      return;
    }
    try {
      const res = await fetch(`${API_BASE}/auth/login`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ identifier: ident, password: pass }) });
      if (res.ok) { const { user } = await res.json(); localStorage.setItem('zentra_user_profile', JSON.stringify(user)); localStorage.setItem('zentra_user_email', user.email); setLoggedInUser(user); setLoggedInEmail(user.email); }
      else alert((await res.json()).detail || 'Auth failed.');
    } catch { alert('Connection failed.'); }
    finally { setAuthenticating(false); }
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    const uname = signupUsername.trim(), emailVal = signupEmail.trim().toLowerCase(), pass = signupPassword.trim(), fname = signupFirstName.trim(), sname = signupSecondName.trim();
    if (!uname || !emailVal || !pass || !fname || !sname) return alert('Fill in all fields.');
    setAuthenticating(true);
    if (!backendConnected) {
      setTimeout(() => {
        const profile = { username: uname, email: emailVal, first_name: fname, second_name: sname };
        localStorage.setItem('zentra_user_profile', JSON.stringify(profile));
        localStorage.setItem('zentra_user_email', profile.email);
        setLoggedInUser(profile); setLoggedInEmail(profile.email); setAuthenticating(false);
      }, 600);
      return;
    }
    try {
      const res = await fetch(`${API_BASE}/auth/signup`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ username: uname, password: pass, email: emailVal, first_name: fname, second_name: sname }) });
      if (res.ok) { const { user } = await res.json(); localStorage.setItem('zentra_user_profile', JSON.stringify(user)); localStorage.setItem('zentra_user_email', user.email); setLoggedInUser(user); setLoggedInEmail(user.email); }
      else alert((await res.json()).detail || 'Registration failed.');
    } catch { alert('Connection failed.'); }
    finally { setAuthenticating(false); }
  };

  const handleLogout = () => {
    localStorage.removeItem('zentra_user_profile'); localStorage.removeItem('zentra_user_email');
    setLoggedInUser(null); setLoggedInEmail('');
  };

  // ── Toggle actuator → POST /api/actuators/toggle ──
  const handleToggleActuator = async (device, state) => {
    setData(prev => ({ ...prev, actuators: { ...prev.actuators, [device]: state } }));
    if (!backendConnected) return;
    try { await fetch(`${API_BASE}/actuators/toggle`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ device, state }) }); fetchStatus(); } catch {}
  };

  // ── Push sensor reading → POST /api/sensors ──
  const handleSimPush = async () => {
    setSimSending(true); setSimResult(null);
    if (!backendConnected) { setTimeout(() => { setSimSending(false); setSimResult({ ok: true, actions: [] }); }, 600); return; }
    try {
      const res = await fetch(`${API_BASE}/sensors`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(simInputs) });
      if (res.ok) { const r = await res.json(); setSimResult({ ok: true, actions: r.triggered_actions || [] }); fetchStatus(); }
      else setSimResult({ ok: false, actions: [] });
    } catch { setSimResult({ ok: false, actions: [] }); }
    finally { setSimSending(false); }
  };

  // ── Plant select → POST /api/plant/select ──
  const handlePlantApply = async () => {
    setPlantSaving(true);
    const payload = { plant_type: selPlant, growth_stage: selStage, age_days: selAge };
    setData(prev => ({ ...prev, current_plant: selPlant, growth_stage: selStage, age_days: selAge }));
    if (!backendConnected) { setTimeout(() => setPlantSaving(false), 500); return; }
    try { await fetch(`${API_BASE}/plant/select`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) }); fetchStatus(); }
    catch {} finally { setPlantSaving(false); }
  };

  // ── Chat (page) ──
  const handleSendChatMessage = async (message) => {
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setData(prev => ({ ...prev, chat_history: [...prev.chat_history, { sender: 'User', message, timestamp }] }));
    if (!backendConnected) { setTimeout(() => { setData(prev => ({ ...prev, chat_history: [...prev.chat_history, { sender: 'Bot', message: 'Offline — backend not connected.', timestamp }] })); }, 500); return; }
    try { const res = await fetch(`${API_BASE}/chat`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ message }) }); if (res.ok) fetchStatus(); } catch {}
  };

  // ── Diagnose ──
  const handleDiagnoseLeaf = async (formData) => {
    if (!backendConnected) {
      const mock = { filename: 'leaf.png', file_size_kb: 450, diagnosis: 'Powdery Mildew Infection', status: 'Infected', severity: 'Medium', confidence: 94.2, symptoms: 'White powdery spots.', urgent_action: 'Reduce humidity.', organic_treatment: 'Neem Oil spray.', chemical_treatment: 'Sulfur fungicides.', timestamp: new Date().toLocaleDateString() };
      setData(prev => ({ ...prev, diagnostics_history: [mock, ...prev.diagnostics_history] })); return mock;
    }
    try { const res = await fetch(`${API_BASE}/diagnose`, { method: 'POST', body: formData }); if (res.ok) { const r = await res.json(); fetchStatus(); return r; } } catch {}
  };

  const sensors = data.sensors || { temperature: 24, humidity: 50, light: 220, soil_moisture: 42 };

  // ─────────────────────────────────────────────────
  // LOGIN / SIGNUP SCREEN (Handcrafted & Premium)
  // ─────────────────────────────────────────────────
  if (!loggedInEmail) {
    return (
      <div className="glass" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', backgroundColor: 'var(--color-bg-base)', padding: 24 }}>
        <div className="glass-card" style={{ padding: '40px 36px', width: '100%', maxWidth: 440, boxShadow: 'var(--shadow-premium)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 }}>
          <div style={{ width: 56, height: 56, borderRadius: 16, backgroundColor: 'var(--color-primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(124,58,237,.12)' }}>
            <Sprout size={28} color="var(--color-primary)" />
          </div>
          <div style={{ textAlign: 'center' }}>
            <h2 style={{ fontFamily: "'Outfit', sans-serif", fontSize: 26, fontWeight: 800, color: 'var(--color-text-title)', marginBottom: 4 }}>Zentra Flora</h2>
            <p style={{ fontSize: 13, color: 'var(--color-text-muted)', fontWeight: 500 }}>Automated Multi-Agent Greenhouse System</p>
          </div>
          <div style={{ display: 'flex', borderBottom: '1px solid var(--color-border)', width: '100%' }}>
            {['login', 'signup'].map(m => (
              <button key={m} onClick={() => setAuthMode(m)}
                style={{ flex: 1, paddingBottom: 12, border: 'none', borderBottom: authMode === m ? '2.5px solid var(--color-primary)' : '2px solid transparent', backgroundColor: 'transparent', fontSize: 14, cursor: 'pointer', color: authMode === m ? 'var(--color-primary)' : 'var(--color-text-muted)', fontWeight: authMode === m ? 700 : 500, fontFamily: 'inherit' }}>
                {m === 'login' ? 'Sign In' : 'Sign Up'}
              </button>
            ))}
          </div>
          {authMode === 'login' ? (
            <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 14, width: '100%' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>Username or Email</label>
                <input type="text" placeholder="username or email" value={loginIdentifier} onChange={e => setLoginIdentifier(e.target.value)} required className="zentra-input" />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>Password</label>
                <input type="password" placeholder="password" value={loginPassword} onChange={e => setLoginPassword(e.target.value)} required className="zentra-input" />
              </div>
              <button type="submit" disabled={authenticating} className="zentra-btn" style={{ marginTop: 8 }}>{authenticating ? 'Signing in…' : 'Sign In'}</button>
            </form>
          ) : (
            <form onSubmit={handleSignUp} style={{ display: 'flex', flexDirection: 'column', gap: 14, width: '100%' }}>
              <div style={{ display: 'flex', gap: 12 }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 5, flex: 1 }}>
                  <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>First Name</label>
                  <input type="text" placeholder="First" value={signupFirstName} onChange={e => setSignupFirstName(e.target.value)} required className="zentra-input" />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 5, flex: 1 }}>
                  <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>Last Name</label>
                  <input type="text" placeholder="Last" value={signupSecondName} onChange={e => setSignupSecondName(e.target.value)} required className="zentra-input" />
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>Username</label>
                <input type="text" placeholder="username" value={signupUsername} onChange={e => setSignupUsername(e.target.value)} required className="zentra-input" />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>Email</label>
                <input type="email" placeholder="email address" value={signupEmail} onChange={e => setSignupEmail(e.target.value)} required className="zentra-input" />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>Password</label>
                <input type="password" placeholder="password" value={signupPassword} onChange={e => setSignupPassword(e.target.value)} required className="zentra-input" />
              </div>
              <button type="submit" disabled={authenticating} className="zentra-btn" style={{ marginTop: 8 }}>{authenticating ? 'Creating account…' : 'Create Account'}</button>
            </form>
          )}
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, backgroundColor: 'var(--color-primary-light)', borderRadius: 12, padding: '10px 14px', fontSize: 11, color: 'var(--color-text-body)', lineHeight: 1.4, width: '100%', border: '1px solid var(--color-primary-medium)' }}>
            <Info size={13} color="var(--color-primary)" style={{ flexShrink: 0, marginTop: 1 }} />
            <span>After signup you'll receive a Telegram bot link: <strong>@melmalebot</strong></span>
          </div>
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────────────
  // MAIN APP NAVIGATION (CSS Refactored)
  // ─────────────────────────────────────────────────
  const sidebarItems = [
    { id: 'dashboard',   icon: LayoutDashboard, label: 'Dashboard'   },
    { id: 'sensors',     icon: BarChart2,        label: 'Sensors'     },
    { id: 'tasks',       icon: ClipboardList,    label: 'Task List'   },
    { id: 'diagnostics', icon: Microscope,       label: 'Diagnostics' },
    { id: 'chat',        icon: MessageSquare,    label: 'System Chat' },
    { id: 'telegram',    icon: Bell,             label: 'Telegram'    },
    { id: 'settings',    icon: Settings,         label: 'Settings'    },
  ];

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: 'var(--color-bg-base)', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>

      {/* ── SIDEBAR CAPSULE ── */}
      <aside className="sidebar-capsule">
        <div style={{ width: 44, height: 44, borderRadius: 14, backgroundColor: 'var(--color-bg-base)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-sm)', marginBottom: 20 }}>
          <Sprout size={20} color="var(--color-primary)" />
        </div>

        <div className="sidebar-track">
          {sidebarItems.map(item => {
            const Icon = item.icon;
            const active = activeTab === item.id;
            return (
              <button key={item.id} title={item.label} onClick={() => setActiveTab(item.id)}
                className={`sidebar-circle-btn ${active ? 'active' : ''}`}>
                <Icon size={20} />
              </button>
            );
          })}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
          <button onClick={() => setDarkMode(!darkMode)} className="sidebar-circle-btn" style={{ backgroundColor: 'var(--color-bg-card)', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-sm)' }} title="Toggle theme">
            {darkMode ? <Sun size={18} color="#FBBF24" /> : <Moon size={18} color="var(--color-primary)" />}
          </button>
          <div style={{ width: 38, height: 38, borderRadius: '50%', backgroundColor: 'var(--color-primary-light)', border: '2px solid var(--color-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', cursor: 'pointer' }}>
            <UserCheck size={16} color="var(--color-primary)" />
            <div style={{ position: 'absolute', bottom: 1, right: 1, width: 9, height: 9, borderRadius: '50%', backgroundColor: 'var(--color-success)', border: '1.5px solid var(--color-bg-base)' }} />
          </div>
        </div>
      </aside>

      {/* ── MAIN CONTENT AREA ── */}
      <div style={{ marginLeft: 96, flex: 1, display: 'flex', flexDirection: 'column', minHeight: '100vh', padding: '20px 24px 28px 20px' }}>

        {/* ══ DASHBOARD PAGE ══ */}
        {activeTab === 'dashboard' && (
          <div className="dashboard-grid">

            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 2 }}>
              <div>
                <span style={{ fontFamily: "'Outfit', sans-serif", fontSize: 20, fontWeight: 800, color: 'var(--color-text-title)', letterSpacing: '-0.3px', marginRight: 10 }}>Zentra Flora</span>
                {!backendConnected && <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 10, fontWeight: 700, color: 'var(--color-warning)', backgroundColor: 'var(--color-warning-light)', padding: '3px 8px', borderRadius: 20 }}><CloudOff size={11} /> Offline</span>}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: backendConnected ? 'var(--color-success)' : 'var(--color-danger)' }} />
                <span style={{ fontSize: 12, color: 'var(--color-text-muted)', fontWeight: 600 }}>{backendConnected ? 'API Connected' : 'Simulation Mode'}</span>
              </div>
            </div>

            {/* Top row: Greenhouse Hero + Plant Expert selectors */}
            <div className="dashboard-row-top">

              {/* Greenhouse hero image panel */}
              <div className="zentra-card" style={{ flex: '1 1 0', overflow: 'hidden', position: 'relative', minHeight: 240, padding: 0 }}>
                <div style={{ position: 'absolute', top: 14, left: 14, zIndex: 5, backgroundColor: 'var(--color-bg-card)', borderRadius: 20, padding: '5px 12px', display: 'flex', alignItems: 'center', gap: 6, boxShadow: 'var(--shadow-sm)', fontSize: 12, fontWeight: 700, color: 'var(--color-text-title)', border: '1px solid var(--color-border)' }}>
                  <div style={{ width: 7, height: 7, borderRadius: '50%', backgroundColor: 'var(--color-danger)' }} />
                  <span style={{ fontSize: 11, fontWeight: 700 }}>+Live</span>
                </div>
                
                <div style={{ position: 'absolute', top: 14, right: 14, zIndex: 5, display: 'flex', gap: 6 }}>
                  {[
                    { icon: <Thermometer size={11} />, val: `${sensors.temperature}°C`, ok: sensors.temperature >= data.targets.min_temp && sensors.temperature <= data.targets.max_temp },
                    { icon: <Droplet size={11} />,     val: `${sensors.humidity}%`,     ok: sensors.humidity >= data.targets.min_humidity && sensors.humidity <= data.targets.max_humidity },
                    { icon: <Lightbulb size={11} />,   val: `${sensors.light} lux`,     ok: sensors.light >= data.targets.min_light && sensors.light <= data.targets.max_light },
                    { icon: <Droplet size={11} />,     val: `${sensors.soil_moisture}%`, ok: sensors.soil_moisture >= data.targets.min_soil_moisture && sensors.soil_moisture <= data.targets.max_soil_moisture },
                  ].map((p, i) => (
                    <div key={i} style={{ backgroundColor: 'rgba(255,255,255,0.92)', borderRadius: 20, padding: '5px 10px', display: 'flex', alignItems: 'center', gap: 4, backdropFilter: 'blur(4px)', border: p.ok ? '1px solid var(--color-border)' : '1px solid rgba(239,68,68,0.5)' }}>
                      {p.icon}<span style={{ fontSize: 11, fontWeight: 600, color: p.ok ? '#0F172A' : 'var(--color-danger)' }}>{p.val}</span>
                    </div>
                  ))}
                </div>
                
                <img src="/greenhouse_hero.png" alt="Smart Greenhouse" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', position: 'absolute', top: 0, left: 0 }} />

                {/* Plant info overlay at bottom */}
                <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 5, background: 'linear-gradient(to top, rgba(0,0,0,0.6), transparent)', padding: '20px 16px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: 14, fontWeight: 700, color: '#fff', fontFamily: "'Outfit', sans-serif" }}>{data.current_plant}</span>
                  <span style={{ fontSize: 11, fontWeight: 700, color: '#fff', backgroundColor: 'rgba(124,58,237,0.85)', borderRadius: 20, padding: '4px 10px', backdropFilter: 'blur(4px)' }}>
                    {data.growth_stage} · Day {data.age_days}
                  </span>
                </div>
              </div>

              {/* Plant Expert bounds adjustor */}
              <div className="zentra-card" style={{ width: '100%', padding: '20px 16px 16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                  <span style={{ fontSize: 15, fontWeight: 800, color: 'var(--color-text-title)', fontFamily: "'Outfit', sans-serif" }}>Plant Expert</span>
                  <span style={{ fontSize: 10, color: 'var(--color-text-muted)', fontWeight: 600 }}>PlantExpertAgent</span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, flex: 1 }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    <label style={{ fontSize: 10, fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>Crop Species</label>
                    <div className="zentra-select-container">
                      <select value={selPlant} onChange={e => setSelPlant(e.target.value)} className="zentra-select">
                        {PLANTS.map(p => <option key={p}>{p}</option>)}
                      </select>
                    </div>
                  </div>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    <label style={{ fontSize: 10, fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>Growth Stage</label>
                    <div className="zentra-select-container">
                      <select value={selStage} onChange={e => setSelStage(e.target.value)} className="zentra-select">
                        {STAGES.map(s => <option key={s}>{s}</option>)}
                      </select>
                    </div>
                  </div>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    <label style={{ fontSize: 10, fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>Age (Days)</label>
                    <div className="zentra-select-container">
                      <input type="number" min={1} value={selAge} onChange={e => setSelAge(parseInt(e.target.value) || 1)} className="zentra-select" style={{ border: 'none', background: 'transparent' }} />
                    </div>
                  </div>

                  {/* Target thresholds display */}
                  <div style={{ backgroundColor: 'var(--color-bg-base)', borderRadius: 12, padding: '10px 12px', display: 'flex', flexDirection: 'column', gap: 6, marginTop: 'auto' }}>
                    <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase', marginBottom: 2 }}>Current Targets</div>
                    {[
                      { label: 'Temp', val: `${data.targets.min_temp}–${data.targets.max_temp}°C` },
                      { label: 'Humidity', val: `${data.targets.min_humidity}–${data.targets.max_humidity}%` },
                      { label: 'Light', val: `${data.targets.min_light}–${data.targets.max_light} lux` },
                      { label: 'Soil', val: `${data.targets.min_soil_moisture}–${data.targets.max_soil_moisture}%` },
                    ].map(t => (
                      <div key={t.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: 11, color: 'var(--color-text-body)' }}>{t.label}</span>
                        <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--color-primary)' }}>{t.val}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <button onClick={handlePlantApply} disabled={plantSaving} className="zentra-btn" style={{ width: '100%', marginTop: 8 }}>
                  {plantSaving ? <RefreshCw size={13} style={{ animation: 'spin 1s linear infinite' }} /> : <Zap size={13} />}
                  {plantSaving ? 'Reconfiguring…' : 'Apply & Reconfigure'}
                </button>
              </div>
            </div>

            {/* Bottom Row: IoT simulator + Actuators + Alerts */}
            <div className="dashboard-row-bottom">

              {/* IoT Push device */}
              <div className="zentra-card hardware-glow-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 800, color: 'var(--color-text-title)', fontFamily: "'Outfit', sans-serif" }}>IoT Sensor Push</div>
                    <div style={{ fontSize: 10, color: 'var(--color-text-muted)', fontWeight: 500, marginTop: 1 }}>ESP32-WROOM-32 · /api/sensors</div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Wifi size={14} color={backendConnected ? 'var(--color-success)' : 'var(--color-text-muted)'} />
                    <span style={{ fontSize: 11, fontWeight: 700, color: backendConnected ? 'var(--color-success)' : 'var(--color-text-muted)' }}>
                      {backendConnected ? 'Online' : 'Offline'}
                    </span>
                  </div>
                </div>

                {/* ESP32 hardware board render */}
                <div style={{ display: 'flex', justifyContent: 'center', backgroundColor: 'var(--color-bg-base)', borderRadius: 14, padding: '10px 0', border: '1px solid var(--color-border)' }}>
                  <img src="/esp32_board.png" alt="ESP32" style={{ height: 80, objectFit: 'contain', filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.08))' }} />
                </div>

                {/* Sensor values inputs */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                  {[
                    { key: 'temperature', label: 'Temp (°C)', icon: <Thermometer size={11} color="var(--color-primary)" /> },
                    { key: 'humidity',    label: 'Humidity (%)', icon: <Droplet size={11} color="#38BDF8" /> },
                    { key: 'light',       label: 'Light (lux)', icon: <Lightbulb size={11} color="#FBBF24" /> },
                    { key: 'soil_moisture', label: 'Soil (%)', icon: <Droplet size={11} color="var(--color-success)" /> },
                  ].map(f => (
                    <div key={f.key} style={{ backgroundColor: 'var(--color-bg-base)', borderRadius: 10, padding: '8px 10px', border: '1px solid var(--color-border)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 3 }}>
                        {f.icon}<span style={{ fontSize: 10, fontWeight: 700, color: 'var(--color-text-muted)' }}>{f.label}</span>
                      </div>
                      <input type="number" value={simInputs[f.key]}
                        onChange={e => setSimInputs(prev => ({ ...prev, [f.key]: parseFloat(e.target.value) || 0 }))}
                        style={{ width: '100%', border: 'none', background: 'transparent', fontSize: 14, fontWeight: 800, color: 'var(--color-text-title)', outline: 'none' }} />
                    </div>
                  ))}
                </div>

                <button onClick={handleSimPush} disabled={simSending} className="zentra-btn" style={{ height: 38 }}>
                  {simSending ? <RefreshCw size={13} style={{ animation: 'spin 1s linear infinite' }} /> : <Send size={13} />}
                  Push to Backend
                </button>

                {/* Result banner feedback */}
                {simResult && (
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 6, backgroundColor: simResult.ok ? 'var(--color-success-light)' : 'var(--color-danger-light)', borderRadius: 10, padding: '8px 10px', border: `1px solid ${simResult.ok ? 'var(--color-success)' : 'var(--color-danger)'}30` }}>
                    {simResult.ok ? <CheckCircle2 size={13} color="var(--color-success)" style={{ flexShrink: 0, marginTop: 2 }} /> : <XCircle size={13} color="var(--color-danger)" style={{ flexShrink: 0, marginTop: 2 }} />}
                    <span style={{ fontSize: 11, color: simResult.ok ? '#065F46' : '#991B1B', fontWeight: 600 }}>
                      {simResult.ok
                        ? simResult.actions.length > 0
                          ? simResult.actions.map(a => `${a.device} ${a.action}`).join(' · ')
                          : 'Readings accepted. All in range.'
                        : 'Failed to push readings.'}
                    </span>
                  </div>
                )}
              </div>

              {/* Actuator override switches */}
              <div className="zentra-card hardware-glow-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 800, color: 'var(--color-text-title)', fontFamily: "'Outfit', sans-serif" }}>Actuator Control</div>
                    <div style={{ fontSize: 10, color: 'var(--color-text-muted)', fontWeight: 500, marginTop: 1 }}>ActuatorControlAgent · manual overrides</div>
                  </div>
                  <Power size={16} color={Object.values(data.actuators).some(Boolean) ? 'var(--color-primary)' : 'var(--color-text-muted)'} />
                </div>

                {/* Three device toggle controls */}
                {[
                  { key: 'pump',        label: 'Water Pump',      sub: 'Soil moisture control',   icon: <Droplet size={18} />, onColor: '#38BDF8', onBg: '#EFF6FF' },
                  { key: 'fan',         label: 'Ventilation Fan', sub: 'Temp & humidity control', icon: <Wind size={18} />,   onColor: 'var(--color-primary)', onBg: 'var(--color-primary-light)' },
                  { key: 'grow_lights', label: 'Grow Lights',     sub: 'Light intensity control', icon: <Sun size={18} />,    onColor: '#FBBF24', onBg: '#FFFBEB' },
                ].map(act => {
                  const on = data.actuators[act.key];
                  return (
                    <div key={act.key} className={`actuator-row-interactive ${on ? 'active' : ''}`}
                      style={{
                        backgroundColor: on ? act.onBg : 'var(--color-bg-base)',
                        borderColor: on ? `${act.onColor}35` : 'var(--color-border)',
                      }}
                      onClick={() => handleToggleActuator(act.key, !on)}>
                      <div className="actuator-icon-circle" style={{
                        borderColor: on ? `${act.onColor}40` : 'var(--color-border)',
                        color: on ? act.onColor : 'var(--color-text-muted)'
                      }}>
                        {act.icon}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--color-text-title)' }}>{act.label}</div>
                        <div style={{ fontSize: 11, color: 'var(--color-text-muted)', marginTop: 1 }}>{act.sub}</div>
                      </div>
                      
                      {/* Stylized sliding checkbox toggle pill */}
                      <div style={{ width: 36, height: 20, borderRadius: 20, backgroundColor: on ? act.onColor : 'var(--color-border)', padding: 2, display: 'flex', alignItems: 'center', transition: 'background 0.2s', flexShrink: 0 }}>
                        <div style={{ width: 16, height: 16, borderRadius: '50%', backgroundColor: '#fff', transform: on ? 'translateX(16px)' : 'translateX(0)', transition: 'transform 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.15)' }} />
                      </div>
                    </div>
                  );
                })}

                <div style={{ fontSize: 11, color: 'var(--color-text-muted)', textAlign: 'center', paddingTop: 4 }}>
                  Auto-control via ActuatorControlAgent when sensor readings are pushed
                </div>
              </div>

              {/* Alert history notification panel */}
              <div className="zentra-card hardware-glow-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 800, color: 'var(--color-text-title)', fontFamily: "'Outfit', sans-serif" }}>Notifications</div>
                    <div style={{ fontSize: 10, color: 'var(--color-text-muted)', fontWeight: 500, marginTop: 1 }}>Telegram + Email · remote access</div>
                  </div>
                  <a href="https://t.me/melmalebot" target="_blank" rel="noreferrer"
                    style={{ fontSize: 11, fontWeight: 700, color: 'var(--color-primary)', textDecoration: 'none', backgroundColor: 'var(--color-primary-light)', padding: '4px 10px', borderRadius: 20, border: '1px solid var(--color-primary-medium)' }}>
                    Open Telegram →
                  </a>
                </div>

                {/* Remote command notification */}
                <div style={{ backgroundColor: 'var(--color-success-light)', borderRadius: 12, padding: '10px 12px', border: '1px solid var(--color-success)22' }}>
                  <div style={{ fontSize: 10, fontWeight: 800, color: 'var(--color-success)', textTransform: 'uppercase', marginBottom: 4 }}>📱 Remote Control Active</div>
                  <p style={{ fontSize: 11, color: 'var(--color-text-body)', margin: 0, lineHeight: 1.5 }}>Text <strong>@melmalebot</strong> on Telegram anytime to check sensors, trigger actuators, or get reports.</p>
                </div>

                {/* Recent notification alerts lists */}
                <div style={{ flex: 1, overflowY: 'auto' }}>
                  <div style={{ fontSize: 10, fontWeight: 800, color: 'var(--color-text-muted)', textTransform: 'uppercase', marginBottom: 6 }}>Recent Alerts ({data.alerts_history.length})</div>
                  {data.alerts_history.length === 0 ? (
                    <div style={{ fontSize: 11, color: 'var(--color-text-muted)', textAlign: 'center', padding: '16px 0' }}>No alerts fired — all parameters stable</div>
                  ) : (
                    data.alerts_history.slice(0, 3).map((alert, i) => (
                      <div key={i} style={{ padding: '8px 10px', backgroundColor: 'var(--color-warning-light)', borderRadius: 10, marginBottom: 5, border: '1px solid var(--color-warning)20' }}>
                        <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--color-warning)' }}>{alert.subject}</div>
                        <div style={{ fontSize: 10, color: 'var(--color-text-muted)', marginTop: 2 }}>{alert.timestamp}</div>
                      </div>
                    ))
                  )}
                </div>
              </div>

            </div>
          </div>
        )}

        {/* ══ SENSORS PAGE ══ */}
        {activeTab === 'sensors' && (
          <div className="page-shell" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <h2 className="page-title" style={{ fontFamily: "'Outfit', sans-serif", fontSize: 24, fontWeight: 800, color: 'var(--color-text-title)' }}>
              Sensor Telemetry & Plant Configuration
            </h2>
            {!backendConnected && <div style={{ display: 'flex', alignItems: 'center', gap: 8, backgroundColor: 'var(--color-warning-light)', border: '1px solid var(--color-warning)30', borderRadius: 12, padding: '10px 16px', fontSize: 12, fontWeight: 600, color: 'var(--color-warning)' }}><CloudOff size={13} /> Offline mode — using mock data</div>}
            <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
              <div style={{ flex: '2 1 500px' }}>
                <SensorCharts history={data.sensor_history} />
              </div>
              <div style={{ flex: '1 1 300px' }}>
                <GrowthStage currentPlant={data.current_plant} growthStage={data.growth_stage} ageDays={data.age_days} sensors={data.sensors} targets={data.targets}
                  onSelectPlant={async (payload) => {
                    setData(prev => ({ ...prev, current_plant: payload.plant_type, growth_stage: payload.growth_stage, age_days: payload.age_days }));
                    if (!backendConnected) return;
                    try { await fetch(`${API_BASE}/plant/select`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) }); fetchStatus(); } catch {}
                  }} />
              </div>
            </div>
          </div>
        )}

        {/* ══ TASKS PAGE ══ */}
        {activeTab === 'tasks' && (
          <div className="page-shell" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <h2 className="page-title" style={{ fontFamily: "'Outfit', sans-serif", fontSize: 24, fontWeight: 800, color: 'var(--color-text-title)' }}>
              Agri Task Schedule
            </h2>
            <p style={{ fontSize: 13, color: 'var(--color-text-body)', marginBottom: 16 }}>Daily actions generated by <strong>TaskSchedulerAgent</strong> based on {data.current_plant} at {data.growth_stage} stage (Day {data.age_days}).</p>
            {!backendConnected && <div style={{ display: 'flex', alignItems: 'center', gap: 8, backgroundColor: 'var(--color-warning-light)', border: '1px solid var(--color-warning)30', borderRadius: 12, padding: '10px 16px', fontSize: 12, fontWeight: 600, color: 'var(--color-warning)' }}><CloudOff size={13} /> Offline mode</div>}
            <TaskList tasks={data.tasks} currentPlant={data.current_plant} stage={data.growth_stage} ageDays={data.age_days} />
          </div>
        )}

        {/* ══ DIAGNOSTICS PAGE ══ */}
        {activeTab === 'diagnostics' && (
          <div className="page-shell" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <h2 className="page-title" style={{ fontFamily: "'Outfit', sans-serif", fontSize: 24, fontWeight: 800, color: 'var(--color-text-title)' }}>
              AI Leaf Diagnostics
            </h2>
            <p style={{ fontSize: 13, color: 'var(--color-text-body)', marginBottom: 16 }}>Upload a leaf photo. The <strong>DiagnosticsAgent</strong> ({data.active_model}) will identify diseases, pests, or confirm health.</p>
            {!backendConnected && <div style={{ display: 'flex', alignItems: 'center', gap: 8, backgroundColor: 'var(--color-warning-light)', border: '1px solid var(--color-warning)30', borderRadius: 12, padding: '10px 16px', fontSize: 12, fontWeight: 600, color: 'var(--color-warning)' }}><CloudOff size={13} /> Offline — using simulated diagnosis</div>}
            <Diagnostics onDiagnose={handleDiagnoseLeaf} history={data.diagnostics_history} />
          </div>
        )}

        {/* ══ SYSTEM CHATBOT PAGE ══ */}
        {activeTab === 'chat' && (
          <div className="page-shell" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <h2 className="page-title" style={{ fontFamily: "'Outfit', sans-serif", fontSize: 24, fontWeight: 800, color: 'var(--color-text-title)' }}>
              System Chatbot
            </h2>
            <p style={{ fontSize: 13, color: 'var(--color-text-body)', marginBottom: 16 }}>
              An in-app AI assistant restricted to greenhouse system queries only.
              Type commands like <code style={{ backgroundColor: 'var(--color-primary-light)', color: 'var(--color-primary)', padding: '1px 6px', borderRadius: 4, fontSize: 12 }}>/status</code> or <code style={{ backgroundColor: 'var(--color-primary-light)', color: 'var(--color-primary)', padding: '1px 6px', borderRadius: 4, fontSize: 12 }}>/tasks</code> to query the system.
            </p>
            {!backendConnected && <div style={{ display: 'flex', alignItems: 'center', gap: 8, backgroundColor: 'var(--color-warning-light)', border: '1px solid var(--color-warning)30', borderRadius: 12, padding: '10px 16px', fontSize: 12, fontWeight: 600, color: 'var(--color-warning)' }}><CloudOff size={13} /> Offline mode — responses are simulated</div>}
            <ChatDrawer chatHistory={data.chat_history} onSendChatMessage={handleSendChatMessage} />
          </div>
        )}

        {/* ══ TELEGRAM NOTIFICATIONS PAGE ══ */}
        {activeTab === 'telegram' && (
          <div className="page-shell" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <h2 className="page-title" style={{ fontFamily: "'Outfit', sans-serif", fontSize: 24, fontWeight: 800, color: 'var(--color-text-title)' }}>
              Telegram Notifications
            </h2>
            <p style={{ fontSize: 13, color: 'var(--color-text-body)', marginBottom: 16 }}>
              Telegram works <strong>without opening this app</strong>. The bot sends automatic alerts and responds to commands from your phone.
            </p>
            {!backendConnected && <div style={{ display: 'flex', alignItems: 'center', gap: 8, backgroundColor: 'var(--color-warning-light)', border: '1px solid var(--color-warning)30', borderRadius: 12, padding: '10px 16px', fontSize: 12, fontWeight: 600, color: 'var(--color-warning)' }}><CloudOff size={13} /> Backend offline — alert delivery paused</div>}

            <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
              {/* Bot overview card */}
              <div className="zentra-card" style={{ flex: '1 1 280px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 8 }}>
                  <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'linear-gradient(135deg,#229ED9,#0088CC)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 6px 18px rgba(34,158,217,0.3)', flexShrink: 0 }}>
                    <Send size={22} color="#fff" />
                  </div>
                  <div>
                    <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--color-text-title)', fontFamily: "'Outfit', sans-serif" }}>@melmalebot</div>
                    <div style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>Plant Guardian Bot</div>
                  </div>
                  <a href="https://t.me/melmalebot" target="_blank" rel="noreferrer" className="zentra-btn-secondary" style={{ marginLeft: 'auto', padding: '0 12px', height: '34px', fontSize: '12px' }}>
                    Open <ExternalLink size={11} />
                  </a>
                </div>
                <div style={{ backgroundColor: 'var(--color-primary-light)', borderRadius: 12, padding: '12px 14px', border: '1px solid var(--color-primary-medium)' }}>
                  <div style={{ fontSize: 10, fontWeight: 800, color: 'var(--color-primary)', textTransform: 'uppercase', marginBottom: 6 }}>How to connect</div>
                  <ol style={{ fontSize: 12, color: 'var(--color-text-body)', paddingLeft: 16, margin: 0, lineHeight: 1.8 }}>
                    <li>Open Telegram and search <strong>@melmalebot</strong></li>
                    <li>Press <strong>Start</strong> to activate the bot</li>
                    <li>Type <strong>/status</strong> to get a live greenhouse report</li>
                  </ol>
                </div>
              </div>

              {/* Commands overview card */}
              <div className="zentra-card" style={{ flex: '1 1 280px' }}>
                <h3 style={{ fontSize: 15, fontWeight: 800, color: 'var(--color-text-title)', fontFamily: "'Outfit', sans-serif" }}>Remote Commands</h3>
                <p style={{ fontSize: 12, color: 'var(--color-text-muted)', marginBottom: 10 }}>These work from your phone without opening the web app:</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {[
                    { cmd: '/status',    desc: 'Full greenhouse status report' },
                    { cmd: '/temp',      desc: 'Current air temperature' },
                    { cmd: '/humidity',  desc: 'Current humidity reading' },
                    { cmd: '/soil',      desc: 'Soil moisture level' },
                    { cmd: '/tasks',     desc: "Today's AI-generated task list" },
                    { cmd: '/pump_on',   desc: 'Activate water pump remotely' },
                    { cmd: '/pump_off',  desc: 'Deactivate water pump' },
                    { cmd: '/fan_on',    desc: 'Activate ventilation fan' },
                    { cmd: '/fan_off',   desc: 'Deactivate fan' },
                    { cmd: '[photo]',    desc: 'Send leaf photo for disease scan' },
                  ].map(c => (
                    <div key={c.cmd} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '7px 10px', backgroundColor: 'var(--color-bg-base)', borderRadius: 10, border: '1px solid var(--color-border)' }}>
                      <code style={{ fontSize: 11, fontWeight: 800, color: 'var(--color-primary)', backgroundColor: 'var(--color-primary-light)', padding: '2px 8px', borderRadius: 6, fontFamily: "'Courier New', monospace", whiteSpace: 'nowrap', flexShrink: 0 }}>{c.cmd}</code>
                      <span style={{ fontSize: 11, color: 'var(--color-text-body)' }}>{c.desc}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Fired alert specifications */}
              <div className="zentra-card" style={{ flex: '1 1 280px' }}>
                <h3 style={{ fontSize: 15, fontWeight: 800, color: 'var(--color-text-title)', fontFamily: "'Outfit', sans-serif" }}>Auto Alerts</h3>
                <p style={{ fontSize: 12, color: 'var(--color-text-muted)', marginBottom: 10 }}>These are sent automatically by the backend — no commands needed:</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 14 }}>
                  {[
                    { emoji: '⚠️', label: 'Threshold breached', desc: 'When temp/humidity/soil goes out of bounds' },
                    { emoji: '💧', label: 'Pump activated/off', desc: 'When ActuatorControlAgent triggers the pump' },
                    { emoji: '💨', label: 'Fan activated/off', desc: 'When fan is triggered by high temp or humidity' },
                    { emoji: '🌞', label: 'Grow lights toggled', desc: 'When light level goes below minimum lux' },
                    { emoji: '🏥', label: 'Disease detected', desc: 'When DiagnosticsAgent finds a disease in a leaf photo' },
                    { emoji: '🔑', label: 'User login', desc: 'When someone logs into the dashboard' },
                  ].map((a, i) => (
                    <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                      <span style={{ fontSize: 16, flexShrink: 0 }}>{a.emoji}</span>
                      <div>
                        <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--color-text-title)' }}>{a.label}</div>
                        <div style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>{a.desc}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ══ SETTINGS PAGE ══ */}
        {activeTab === 'settings' && (
          <div className="page-shell" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <h2 className="page-title" style={{ fontFamily: "'Outfit', sans-serif", fontSize: 24, fontWeight: 800, color: 'var(--color-text-title)' }}>
              System Settings
            </h2>
            <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>

              {/* Account Overview card */}
              <div className="zentra-card" style={{ flex: '1 1 320px' }}>
                <h3 style={{ fontSize: 15, fontWeight: 800, color: 'var(--color-text-title)', fontFamily: "'Outfit', sans-serif" }}>Account</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <label style={{ fontSize: 10, fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>Full Name</label>
                  <input readOnly value={loggedInUser ? `${loggedInUser.first_name} ${loggedInUser.second_name}` : ''} className="zentra-input" />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <label style={{ fontSize: 10, fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>Username</label>
                  <input readOnly value={loggedInUser?.username || ''} className="zentra-input" />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <label style={{ fontSize: 10, fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>Email</label>
                  <input readOnly value={loggedInEmail} className="zentra-input" />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <label style={{ fontSize: 10, fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>Telegram Bot</label>
                  <a href="https://t.me/melmalebot" target="_blank" rel="noreferrer" style={{ color: 'var(--color-primary)', fontSize: 13, fontWeight: 700 }}>@melmalebot</a>
                </div>
                <button onClick={handleLogout} className="zentra-btn" style={{ backgroundColor: '#EF4444', backgroundImage: 'none', boxShadow: '0 4px 14px rgba(239,68,68,0.2)', marginTop: 8 }}>
                  <LogOut size={13} /> Sign Out
                </button>
              </div>

              {/* System Connection details */}
              <div className="zentra-card" style={{ flex: '1 1 320px' }}>
                <h3 style={{ fontSize: 15, fontWeight: 800, color: 'var(--color-text-title)', fontFamily: "'Outfit', sans-serif" }}>System Connection Status</h3>

                {[
                  {
                    label: 'FastAPI Backend',
                    status: backendConnected ? 'Connected ✓' : 'Offline ❌',
                    ok: backendConnected,
                    note: backendConnected ? 'Serving on http://127.0.0.1:8000' : 'Run: uvicorn main:app --reload (from backend/app)',
                  },
                  {
                    label: 'Supabase Database',
                    status: backendConnected ? (data.is_supabase_configured ? 'Connected ✓' : 'Offline ❌') : 'Offline ❌',
                    ok: backendConnected && data.is_supabase_configured,
                    note: data.is_supabase_configured ? 'Successfully connected with Supabase credentials.' : 'Please configure SUPABASE_URL + SUPABASE_KEY in backend/.env.',
                  },
                  {
                    label: 'Telegram Bot (@melmalebot)',
                    status: backendConnected ? (data.is_telegram_configured ? (data.telegram_chat_id_set ? 'Connected ✓' : 'Token ✓ | Chat ID ⚠️ not set') : 'Offline ❌') : 'Offline ❌',
                    ok: backendConnected && data.is_telegram_configured && data.telegram_chat_id_set,
                    note: !backendConnected ? 'Backend offline.' : (!data.is_telegram_configured ? 'Set TELEGRAM_BOT_TOKEN in backend/.env.' : (!data.telegram_chat_id_set ? 'Set TELEGRAM_CHAT_ID in backend/.env. Get it by messaging @userinfobot on Telegram.' : 'Real-time alert dispatching and remote commands are active.')),
                  },
                  {
                    label: 'Local LLM (Ollama)',
                    status: backendConnected ? (data.ollama_connected ? (data.active_model_installed ? 'Connected & Loaded ✓' : 'Connected (Model not pulled) ⚠️') : 'Not running ❌') : 'Offline ❌',
                    ok: backendConnected && data.ollama_connected && data.active_model_installed,
                    note: !backendConnected ? 'Backend offline.' : (!data.ollama_connected ? 'Ollama is not running. Start Ollama on your PC to enable local agent inference.' : (data.active_model_installed ? `Successfully connected. Active model '${data.active_model}' is ready.` : `Ollama is running, but active model '${data.active_model}' is not pulled yet. Run: ollama pull ${data.active_model.replace('-4b', ':4b').replace('-1b', ':1b')}`)),
                  },
                ].map(svc => (
                  <div key={svc.label} style={{ padding: '10px 12px', backgroundColor: 'var(--color-bg-base)', borderRadius: 12, marginBottom: 8, border: '1px solid var(--color-border)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                      <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--color-text-title)' }}>{svc.label}</span>
                      <span style={{
                        fontSize: 11,
                        fontWeight: 700,
                        color: svc.ok ? 'var(--color-success)' : (svc.status.includes('❌') ? 'var(--color-danger)' : 'var(--color-warning)'),
                        backgroundColor: svc.ok ? 'var(--color-success-light)' : (svc.status.includes('❌') ? 'var(--color-danger-light)' : 'var(--color-warning-light)'),
                        padding: '2px 8px',
                        borderRadius: 20
                      }}>
                        {svc.status}
                      </span>
                    </div>
                    <span style={{ fontSize: 10, color: 'var(--color-text-muted)', lineHeight: 1.4 }}>{svc.note}</span>
                  </div>
                ))}

                {/* Auto-detected Telegram Chat ID */}
                {backendConnected && data.last_seen_chat_id && !data.telegram_chat_id_set && (
                  <div style={{ padding: '12px 14px', backgroundColor: 'var(--color-warning-light)', border: '1px solid var(--color-warning)30', borderRadius: 12, marginBottom: 12, marginTop: 12 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                      <AlertTriangle size={14} color="var(--color-warning)" />
                      <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--color-warning)' }}>Auto-detected Chat ID!</span>
                    </div>
                    <p style={{ fontSize: 11, color: 'var(--color-text-body)', margin: '0 0 8px 0', lineHeight: 1.4 }}>
                      We detected a message from Telegram Chat ID: <strong style={{ fontFamily: 'monospace', fontSize: 12 }}>{data.last_seen_chat_id}</strong>. Click below to automatically save it.
                    </p>
                    <button onClick={async () => {
                      try {
                        const res = await fetch(`${API_BASE}/telegram/save_chat_id`, {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ chat_id: data.last_seen_chat_id })
                        });
                        if (res.ok) {
                          alert('Telegram Chat ID saved successfully!');
                          fetchStatus();
                        } else {
                          alert('Failed to save Telegram Chat ID.');
                        }
                      } catch {
                        alert('Connection error.');
                      }
                    }} className="zentra-btn" style={{ height: '34px', fontSize: '11px', backgroundColor: 'var(--color-warning)', backgroundImage: 'none' }}>
                      <CheckCircle2 size={12} /> Apply to .env & Reload
                    </button>
                  </div>
                )}

                {/* AI Configuration select */}
                <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: 12, marginTop: 4 }}>
                  <label style={{ fontSize: 10, fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>Active AI Model (config only)</label>
                  <div className="zentra-select-container" style={{ marginTop: 6 }}>
                    <select value={data.active_model} onChange={async e => {
                      const model = e.target.value;
                      if (!backendConnected) return;
                      try { await fetch(`${API_BASE}/model/select`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ model }) }); fetchStatus(); } catch {}
                    }} className="zentra-select">
                      <option value="qwen3-vl-4b">Qwen 3 VL 4B — VLM (vision)</option>
                      <option value="llama3.2-1b">Llama 3.2 1B — LLM (text)</option>
                      <option value="gemma3-1b">Gemma 3 1B — LLM (text)</option>
                    </select>
                  </div>
                  <p style={{ fontSize: 10, color: 'var(--color-text-muted)', marginTop: 6, lineHeight: 1.5 }}>
                    To activate local LLM inference, run: <code style={{ backgroundColor: 'var(--color-primary-light)', color: 'var(--color-primary)', padding: '1px 5px', borderRadius: 4 }}>ollama pull {data.active_model}</code>
                  </p>
                </div>

                {/* Agent → Model Bindings specifications */}
                {Object.entries(data.agent_bindings || {}).length > 0 && (
                  <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: 10, marginTop: 8 }}>
                    <label style={{ fontSize: 10, fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>Agent → Model Bindings</label>
                    {Object.entries(data.agent_bindings).map(([agent, model]) => (
                      <div key={agent} style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', borderBottom: '1px solid var(--color-bg-base)' }}>
                        <span style={{ fontSize: 12, color: 'var(--color-text-body)', fontWeight: 600 }}>{agent}</span>
                        <span style={{ fontSize: 11, color: 'var(--color-primary)', fontWeight: 700, backgroundColor: 'var(--color-primary-light)', padding: '1px 8px', borderRadius: 6 }}>{model}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>
          </div>
        )}

      </div>
    </div>
  );
}
