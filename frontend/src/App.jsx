import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import HeaderBanner from './components/HeaderBanner';
import StatCard from './components/StatCard';
import SensorCharts from './components/SensorCharts';
import GrowthStage from './components/GrowthStage';
import TaskList from './components/TaskList';
import Diagnostics from './components/Diagnostics';
import IoTSimulator from './components/IoTSimulator';
import ChatDrawer from './components/ChatDrawer';
import { Sprout, LogOut, ShieldCheck, CloudOff, Info } from 'lucide-react';


const API_BASE = "http://localhost:8000/api";

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [backendConnected, setBackendConnected] = useState(false);
  const [loading, setLoading] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  
  const [loggedInUser, setLoggedInUser] = useState(() => {
    try {
      const saved = localStorage.getItem('zentra_user_profile');
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      return null;
    }
  });

  const [loggedInEmail, setLoggedInEmail] = useState(() => {
    try {
      const saved = localStorage.getItem('zentra_user_profile');
      if (saved) {
        const u = JSON.parse(saved);
        return u.email || '';
      }
    } catch (e) {}
    return localStorage.getItem('zentra_user_email') || '';
  });

  const [authMode, setAuthMode] = useState('login');
  
  // Login input states
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  
  // Signup input states
  const [signupUsername, setSignupUsername] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupFirstName, setSignupFirstName] = useState('');
  const [signupSecondName, setSignupSecondName] = useState('');
  
  const [authenticating, setAuthenticating] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    const ident = loginIdentifier.trim();
    const pass = loginPassword.trim();
    
    if (!ident || !pass) {
      alert("Please enter both your identifier (email or username) and password.");
      return;
    }
    setAuthenticating(true);

    if (!backendConnected) {
      // Offline fallback
      setTimeout(() => {
        if (
          (ident.toLowerCase() === 'admin' || ident.toLowerCase() === 'aniqihtisyam4@gmail.com') &&
          pass === 'password123'
        ) {
          const profile = {
            username: "admin",
            email: "aniqihtisyam4@gmail.com",
            first_name: "Aniq",
            second_name: "Ihtisyam"
          };
          localStorage.setItem('zentra_user_profile', JSON.stringify(profile));
          localStorage.setItem('zentra_user_email', profile.email);
          setLoggedInUser(profile);
          setLoggedInEmail(profile.email);
        } else {
          const profile = {
            username: ident.split('@')[0],
            email: ident.includes('@') ? ident : `${ident}@zentra.com`,
            first_name: ident.charAt(0).toUpperCase() + ident.slice(1),
            second_name: "User"
          };
          localStorage.setItem('zentra_user_profile', JSON.stringify(profile));
          localStorage.setItem('zentra_user_email', profile.email);
          setLoggedInUser(profile);
          setLoggedInEmail(profile.email);
        }
        setAuthenticating(false);
      }, 800);
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier: ident, password: pass })
      });
      if (res.ok) {
        const payload = await res.json();
        const profile = payload.user;
        localStorage.setItem('zentra_user_profile', JSON.stringify(profile));
        localStorage.setItem('zentra_user_email', profile.email);
        setLoggedInUser(profile);
        setLoggedInEmail(profile.email);
      } else {
        const err = await res.json();
        alert(err.detail || "Authentication failed.");
      }
    } catch (err) {
      console.error("Login error:", err);
      alert("Authentication connection failed.");
    } finally {
      setAuthenticating(false);
    }
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    const uname = signupUsername.trim();
    const emailVal = signupEmail.trim().toLowerCase();
    const pass = signupPassword.trim();
    const fname = signupFirstName.trim();
    const sname = signupSecondName.trim();

    if (!uname || !emailVal || !pass || !fname || !sname) {
      alert("Please fill in all the registration fields.");
      return;
    }
    if (!emailVal.includes('@')) {
      alert("Please enter a valid email address.");
      return;
    }
    setAuthenticating(true);

    if (!backendConnected) {
      setTimeout(() => {
        const profile = {
          username: uname,
          email: emailVal,
          first_name: fname,
          second_name: sname
        };
        localStorage.setItem('zentra_user_profile', JSON.stringify(profile));
        localStorage.setItem('zentra_user_email', profile.email);
        setLoggedInUser(profile);
        setLoggedInEmail(profile.email);
        setAuthenticating(false);
        alert("Registered successfully inside Offline Mock Mode!");
      }, 1000);
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: uname,
          password: pass,
          email: emailVal,
          first_name: fname,
          second_name: sname
        })
      });
      if (res.ok) {
        const payload = await res.json();
        const profile = payload.user;
        localStorage.setItem('zentra_user_profile', JSON.stringify(profile));
        localStorage.setItem('zentra_user_email', profile.email);
        setLoggedInUser(profile);
        setLoggedInEmail(profile.email);
        alert("Account registered successfully! A welcoming email has been dispatched.");
      } else {
        const err = await res.json();
        alert(err.detail || "Registration failed.");
      }
    } catch (err) {
      console.error("Signup error:", err);
      alert("Registration connection failed.");
    } finally {
      setAuthenticating(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('zentra_user_profile');
    localStorage.removeItem('zentra_user_email');
    setLoggedInUser(null);
    setLoggedInEmail('');
    setLoginIdentifier('');
    setLoginPassword('');
    setSignupUsername('');
    setSignupEmail('');
    setSignupPassword('');
    setSignupFirstName('');
    setSignupSecondName('');
  };


  // Toggle dark mode class on document body
  useEffect(() => {
    if (darkMode) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
  }, [darkMode]);

  // Global system data state container
  const [data, setData] = useState({
    current_plant: "Strawberry",
    growth_stage: "Fruiting",
    age_days: 45,
    sensors: { temperature: 24.5, humidity: 65, light: 450, soil_moisture: 42 },
    targets: { min_temp: 18, max_temp: 26, min_humidity: 60, max_humidity: 80, min_light: 300, max_light: 800, min_soil_moisture: 50, max_soil_moisture: 70 },
    actuators: { pump: false, fan: false, grow_lights: false },
    sensor_history: [],
    chat_history: [],
    alerts_history: [],
    diagnostics_history: [],
    tasks: []
  });

  // Pull telemetry payload from the API
  const fetchStatus = async () => {
    try {
      const res = await fetch(`${API_BASE}/status`);
      if (res.ok) {
        const payload = await res.json();
        setData(payload);
        setBackendConnected(true);
      }
    } catch (err) {
      console.warn("FastAPI backend is offline. Running in dashboard mock preview mode.");
      setBackendConnected(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
    // 3 seconds refresh polling loop to watch simulator slider actions live!
    const timer = setInterval(fetchStatus, 3000);
    return () => clearInterval(timer);
  }, []);

  // API Mutator Calls
  const handleSelectPlant = async (plantPayload) => {
    // Optimistic state updates
    setData(prev => ({
      ...prev,
      current_plant: plantPayload.plant_type,
      growth_stage: plantPayload.growth_stage,
      age_days: plantPayload.age_days
    }));

    if (!backendConnected) return;

    try {
      const res = await fetch(`${API_BASE}/plant/select`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(plantPayload)
      });
      if (res.ok) {
        fetchStatus();
      }
    } catch (err) {
      console.error("Select plant error:", err);
    }
  };

  const handleUpdateSensors = async (sensorPayload) => {
    // Optimistic state updates
    setData(prev => ({
      ...prev,
      sensors: sensorPayload
    }));

    if (!backendConnected) {
      // Simulate Actuator Control locally if backend is offline
      const temp = sensorPayload.temperature;
      const moist = sensorPayload.soil_moisture;
      const humidity = sensorPayload.humidity;
      const light = sensorPayload.light;
      
      const t = data.targets;
      setData(prev => ({
        ...prev,
        actuators: {
          pump: moist < t.min_soil_moisture,
          fan: temp > t.max_temp || humidity > t.max_humidity,
          grow_lights: light < t.min_light
        }
      }));
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/sensors`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sensorPayload)
      });
      if (res.ok) {
        fetchStatus();
      }
    } catch (err) {
      console.error("Update sensors error:", err);
    }
  };

  const handleToggleActuator = async (device, state) => {
    // Optimistic update
    setData(prev => ({
      ...prev,
      actuators: {
        ...prev.actuators,
        [device]: state
      }
    }));

    if (!backendConnected) return;

    try {
      const res = await fetch(`${API_BASE}/actuators/toggle`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ device, state })
      });
      if (res.ok) {
        fetchStatus();
      }
    } catch (err) {
      console.error("Toggle actuator error:", err);
    }
  };

  const handleDiagnoseLeaf = async (formData) => {
    if (!backendConnected) {
      // Offline local simulation
      const mockResult = {
        filename: "leaf_sample.png",
        file_size_kb: 450,
        diagnosis: "Powdery Mildew Infection (Podosphaera macularis)",
        status: "Infected",
        severity: "Medium",
        confidence: 94.2,
        symptoms: "White powder spots covering top foliage, leaf distortion.",
        urgent_action: "Reduce humidity, isolate pots, and increase fan speed.",
        organic_treatment: "Spray with organic cold-pressed Neem Oil formula.",
        chemical_treatment: "Sulfur-based fungicides.",
        timestamp: "Offline Mock Mode"
      };
      
      setData(prev => ({
        ...prev,
        diagnostics_history: [mockResult, ...prev.diagnostics_history]
      }));
      return mockResult;
    }

    try {
      const res = await fetch(`${API_BASE}/diagnose`, {
        method: 'POST',
        body: formData
      });
      if (res.ok) {
        const report = await res.json();
        fetchStatus();
        return report;
      }
    } catch (err) {
      console.error("Diagnostics upload error:", err);
    }
  };

  const handleSendChatMessage = async (message) => {
    // Optimistic update
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const userMsg = { sender: 'User', message, timestamp };
    
    setData(prev => ({
      ...prev,
      chat_history: [...prev.chat_history, userMsg]
    }));

    if (!backendConnected) {
      // Local chatbot responses
      setTimeout(() => {
        let reply = "I am currently running in Offline Preview. Please boot the FastAPI Python backend to connect my active reasoning engine.";
        if (message.toLowerCase() === "/status") {
          reply = `Offline Status: managing ${data.current_plant} - current soil moisture is ${data.sensors.soil_moisture}%`;
        }
        setData(prev => ({
          ...prev,
          chat_history: [...prev.chat_history, { sender: 'Bot', message: reply, timestamp }]
        }));
      }, 800);
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message })
      });
      if (res.ok) {
        fetchStatus();
      }
    } catch (err) {
      console.error("Chat error:", err);
    }
  };

  const handleSelectModel = async (modelName) => {
    // Optimistic update
    setData(prev => ({
      ...prev,
      active_model: modelName
    }));

    if (!backendConnected) return;

    try {
      const res = await fetch(`${API_BASE}/model/select`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ model: modelName })
      });
      if (res.ok) {
        fetchStatus();
      }
    } catch (err) {
      console.error("Select model error:", err);
    }
  };

  const handleBindAgentModel = async (agentName, modelName) => {
    // Optimistic update
    setData(prev => ({
      ...prev,
      agent_bindings: {
        ...prev.agent_bindings,
        [agentName]: modelName
      }
    }));

    if (!backendConnected) return;

    try {
      const res = await fetch(`${API_BASE}/model/bind`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ agent: agentName, model: modelName })
      });
      if (res.ok) {
        fetchStatus();
      }
    } catch (err) {
      console.error("Bind agent model error:", err);
    }
  };

  // Helper metric states
  const totalTasks = data.tasks.length;
  const completedTasksCount = data.tasks.filter(t => t.completed).length;
  const tasksValue = totalTasks > 0 ? `${completedTasksCount}/${totalTasks}` : "0/0";
  const tasksPct = totalTasks > 0 ? Math.round((completedTasksCount / totalTasks) * 100) : 100;

  const activeActuatorsCount = (data.actuators.pump ? 1 : 0) + (data.actuators.fan ? 1 : 0) + (data.actuators.grow_lights ? 1 : 0);

  if (!loggedInEmail) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        backgroundColor: 'var(--color-bg-base)',
        padding: '24px',
        fontFamily: 'var(--font-primary)'
      }}>
        <div style={{
          backgroundColor: 'var(--color-bg-card)',
          border: '1px solid var(--color-border)',
          borderRadius: '24px',
          padding: '40px',
          width: '100%',
          maxWidth: '460px',
          boxShadow: 'var(--shadow-premium)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '20px',
          transition: 'background-color 0.2s, border 0.2s'
        }}>
          {/* Logo */}
          <div style={{
            width: '56px',
            height: '56px',
            borderRadius: '16px',
            backgroundColor: 'var(--color-primary-light)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(124, 58, 237, 0.15)',
            transition: 'background-color 0.2s'
          }}>
            <Sprout size={28} color="var(--color-primary)" />
          </div>

          <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '24px', fontWeight: '800', color: 'var(--color-text-title)', transition: 'color 0.2s' }}>
              Welcome to Zentra Flora
            </h2>
            <p style={{ fontSize: '13px', color: 'var(--color-text-muted)', lineHeight: '1.4', transition: 'color 0.2s' }}>
              Automated AI Multi-Agent Greenhouse Portal
            </p>
          </div>

          {/* Form Tabs */}
          <div style={{ display: 'flex', borderBottom: '1px solid var(--color-border)', width: '100%', marginBottom: '8px' }}>
            <button 
              type="button"
              onClick={() => setAuthMode('login')} 
              style={{
                flex: 1,
                paddingBottom: '12px',
                border: 'none',
                borderBottom: authMode === 'login' ? '2px solid var(--color-primary)' : 'none',
                backgroundColor: 'transparent',
                fontWeight: authMode === 'login' ? '700' : '500',
                color: authMode === 'login' ? 'var(--color-text-title)' : 'var(--color-text-muted)',
                fontSize: '14px',
                cursor: 'pointer',
                transition: 'color 0.2s'
              }}
            >
              Sign In
            </button>
            <button 
              type="button"
              onClick={() => setAuthMode('signup')} 
              style={{
                flex: 1,
                paddingBottom: '12px',
                border: 'none',
                borderBottom: authMode === 'signup' ? '2px solid var(--color-primary)' : 'none',
                backgroundColor: 'transparent',
                fontWeight: authMode === 'signup' ? '700' : '500',
                color: authMode === 'signup' ? 'var(--color-text-title)' : 'var(--color-text-muted)',
                fontSize: '14px',
                cursor: 'pointer',
                transition: 'color 0.2s'
              }}
            >
              Sign Up
            </button>
          </div>

          {authMode === 'login' ? (
            <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '100%' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '11px', fontWeight: '700', color: 'var(--color-text-muted)', textTransform: 'uppercase', transition: 'color 0.2s' }}>
                  Username or Email
                </label>
                <input
                  type="text"
                  placeholder="enter your username or email..."
                  value={loginIdentifier}
                  onChange={(e) => setLoginIdentifier(e.target.value)}
                  required
                  style={{
                    height: '44px',
                    borderRadius: '12px',
                    border: '1px solid var(--color-border)',
                    padding: '0 16px',
                    backgroundColor: 'var(--color-bg-base)',
                    fontSize: '14px',
                    color: 'var(--color-text-body)',
                    outline: 'none',
                    fontWeight: '500',
                    transition: 'background-color 0.2s, border 0.2s, color 0.2s'
                  }}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '11px', fontWeight: '700', color: 'var(--color-text-muted)', textTransform: 'uppercase', transition: 'color 0.2s' }}>
                  Password
                </label>
                <input
                  type="password"
                  placeholder="enter your account password..."
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  required
                  style={{
                    height: '44px',
                    borderRadius: '12px',
                    border: '1px solid var(--color-border)',
                    padding: '0 16px',
                    backgroundColor: 'var(--color-bg-base)',
                    fontSize: '14px',
                    color: 'var(--color-text-body)',
                    outline: 'none',
                    fontWeight: '500',
                    transition: 'background-color 0.2s, border 0.2s, color 0.2s'
                  }}
                />
              </div>

              <button
                type="submit"
                disabled={authenticating}
                style={{
                  height: '46px',
                  borderRadius: '12px',
                  border: 'none',
                  backgroundColor: 'var(--color-primary)',
                  color: '#FFFFFF',
                  fontSize: '14px',
                  fontWeight: '700',
                  cursor: 'pointer',
                  boxShadow: '0 4px 14px rgba(109, 40, 217, 0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}
              >
                {authenticating ? 'Authenticating...' : 'Sign In & Synchronize'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleSignUp} style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '100%' }}>
              <div style={{ display: 'flex', gap: '12px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: 1 }}>
                  <label style={{ fontSize: '10px', fontWeight: '700', color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>
                    First Name
                  </label>
                  <input
                    type="text"
                    placeholder="First Name"
                    value={signupFirstName}
                    onChange={(e) => setSignupFirstName(e.target.value)}
                    required
                    style={{
                      height: '40px',
                      borderRadius: '10px',
                      border: '1px solid var(--color-border)',
                      padding: '0 12px',
                      backgroundColor: 'var(--color-bg-base)',
                      fontSize: '13px',
                      color: 'var(--color-text-body)',
                      outline: 'none',
                      fontWeight: '500',
                      transition: 'background-color 0.2s, border 0.2s'
                    }}
                  />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: 1 }}>
                  <label style={{ fontSize: '10px', fontWeight: '700', color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>
                    Second Name
                  </label>
                  <input
                    type="text"
                    placeholder="Second Name"
                    value={signupSecondName}
                    onChange={(e) => setSignupSecondName(e.target.value)}
                    required
                    style={{
                      height: '40px',
                      borderRadius: '10px',
                      border: '1px solid var(--color-border)',
                      padding: '0 12px',
                      backgroundColor: 'var(--color-bg-base)',
                      fontSize: '13px',
                      color: 'var(--color-text-body)',
                      outline: 'none',
                      fontWeight: '500',
                      transition: 'background-color 0.2s, border 0.2s'
                    }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ fontSize: '10px', fontWeight: '700', color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>
                  Username
                </label>
                <input
                  type="text"
                  placeholder="choose username..."
                  value={signupUsername}
                  onChange={(e) => setSignupUsername(e.target.value)}
                  required
                  style={{
                    height: '40px',
                    borderRadius: '10px',
                    border: '1px solid var(--color-border)',
                    padding: '0 12px',
                    backgroundColor: 'var(--color-bg-base)',
                    fontSize: '13px',
                    color: 'var(--color-text-body)',
                    outline: 'none',
                    fontWeight: '500',
                    transition: 'background-color 0.2s, border 0.2s'
                  }}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ fontSize: '10px', fontWeight: '700', color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>
                  Email Address
                </label>
                <input
                  type="email"
                  placeholder="enter email address..."
                  value={signupEmail}
                  onChange={(e) => setSignupEmail(e.target.value)}
                  required
                  style={{
                    height: '40px',
                    borderRadius: '10px',
                    border: '1px solid var(--color-border)',
                    padding: '0 12px',
                    backgroundColor: 'var(--color-bg-base)',
                    fontSize: '13px',
                    color: 'var(--color-text-body)',
                    outline: 'none',
                    fontWeight: '500',
                    transition: 'background-color 0.2s, border 0.2s'
                  }}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ fontSize: '10px', fontWeight: '700', color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>
                  Password
                </label>
                <input
                  type="password"
                  placeholder="create password..."
                  value={signupPassword}
                  onChange={(e) => setSignupPassword(e.target.value)}
                  required
                  style={{
                    height: '40px',
                    borderRadius: '10px',
                    border: '1px solid var(--color-border)',
                    padding: '0 12px',
                    backgroundColor: 'var(--color-bg-base)',
                    fontSize: '13px',
                    color: 'var(--color-text-body)',
                    outline: 'none',
                    fontWeight: '500',
                    transition: 'background-color 0.2s, border 0.2s'
                  }}
                />
              </div>

              <button
                type="submit"
                disabled={authenticating}
                style={{
                  height: '44px',
                  borderRadius: '12px',
                  border: 'none',
                  backgroundColor: 'var(--color-primary)',
                  color: '#FFFFFF',
                  fontSize: '13.5px',
                  fontWeight: '700',
                  cursor: 'pointer',
                  boxShadow: '0 4px 14px rgba(109, 40, 217, 0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  marginTop: '6px'
                }}
              >
                {authenticating ? 'Registering...' : 'Create Account & Register'}
              </button>
            </form>
          )}

          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            backgroundColor: 'var(--color-primary-light)',
            border: '1px solid var(--color-border)',
            borderRadius: '12px',
            padding: '12px',
            fontSize: '11px',
            color: 'var(--color-text-body)',
            lineHeight: '1.4',
            transition: 'background-color 0.2s, border 0.2s, color 0.2s'
          }}>
            <Info size={16} color="var(--color-primary)" style={{ flexShrink: 0 }} />
            <span>
              Registration dispatches a welcoming message containing the system chatbot subscription channel link: <strong>https://t.me/melmalebot</strong>.
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.appContainer}>
      {/* Sidebar Navigation */}
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} darkMode={darkMode} setDarkMode={setDarkMode} />

      {/* Main Panel Content Area */}
      <main style={styles.mainContent}>
        {/* Offline Alert Indicator */}
        {!backendConnected && (
          <div style={styles.offlineBanner}>
            <CloudOff size={16} />
            <span>
              FastAPI backend is not running at <code>http://localhost:8000</code>. Dashboard is loaded in <strong>Offline Interactive Mock Mode</strong>.
            </span>
          </div>
        )}

        {/* Dynamic router based on active Sidebar state */}
        {activeTab === 'settings' ? (
          <div style={styles.settingsPage}>
            <h2>System Configurations</h2>
            <div style={styles.settingsGrid}>
              
              {/* Model Select Card */}
              <div style={styles.settingsCard}>
                <h3>System AI Core Model</h3>
                <p style={styles.note}>Define the backing AI Model running active reasoning routines inside Zentra Flora agents.</p>
                
                <div style={styles.fieldRow}>
                  <label>Selected LLM / VLM Core</label>
                  <select 
                    value={data.active_model || 'qwen3-vl-4b'}
                    onChange={(e) => handleSelectModel(e.target.value)}
                    style={{
                      ...styles.fieldInput,
                      backgroundColor: '#FFFFFF',
                      cursor: 'pointer',
                      fontWeight: '600'
                    }}
                  >
                    {data.models ? (
                      Object.keys(data.models).map(key => (
                        <option key={key} value={key}>{data.models[key].name}</option>
                      ))
                    ) : (
                      <>
                        <option value="qwen3-vl-4b">Qwen 3 VL 4B (VLM)</option>
                        <option value="llama3.2-1b">Llama 3.2 1B (LLM)</option>
                        <option value="gemma3-1b">Gemma 3 1B (LLM)</option>
                      </>
                    )}
                  </select>
                </div>

                {data.models && data.models[data.active_model || 'qwen3-vl-4b'] && (
                  <div style={{
                    backgroundColor: '#FAF5FF',
                    border: '1px solid #F3E8FF',
                    borderRadius: '12px',
                    padding: '14px',
                    fontSize: '12px',
                    color: '#475569',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '4px'
                  }}>
                    <span style={{ fontWeight: '700', color: '#7C3AED' }}>
                      Active: {data.models[data.active_model || 'qwen3-vl-4b'].type}
                    </span>
                    <span style={{ fontSize: '11px', fontWeight: '500' }}>
                      Context Window: {data.models[data.active_model || 'qwen3-vl-4b'].context_window} tokens | Params: {data.models[data.active_model || 'qwen3-vl-4b'].parameters}
                    </span>
                    <p style={{ marginTop: '4px', lineHeight: '1.4' }}>
                      {data.models[data.active_model || 'qwen3-vl-4b'].description}
                    </p>
                  </div>
                )}
              </div>

              {/* Agent-Specific Model Bindings Card */}
              <div style={styles.settingsCard}>
                <h3>Agent-Specific AI Models</h3>
                <p style={styles.note}>Fine-tune your agricultural agents by assigning specialized LLMs or VLMs per task.</p>
                
                {/* Diagnostics Agent */}
                <div style={styles.fieldRow}>
                  <label style={{ fontWeight: '600' }}>Diagnostics Agent (Vision)</label>
                  <select 
                    value={(data.agent_bindings && data.agent_bindings.vision) || 'qwen3-vl-4b'}
                    onChange={(e) => handleBindAgentModel('vision', e.target.value)}
                    style={{
                      ...styles.fieldInput,
                      backgroundColor: '#FFFFFF',
                      cursor: 'pointer',
                      fontWeight: '500'
                    }}
                  >
                    <option value="qwen3-vl-4b">Qwen 3 VL 4B (VLM - Recommended)</option>
                    <option value="llama3.2-1b">Llama 3.2 1B (LLM)</option>
                    <option value="gemma3-1b">Gemma 3 1B (LLM)</option>
                  </select>
                </div>

                {/* Plant Expert Agent */}
                <div style={styles.fieldRow}>
                  <label style={{ fontWeight: '600' }}>Plant Expert Agent</label>
                  <select 
                    value={(data.agent_bindings && data.agent_bindings.expert) || 'gemma3-1b'}
                    onChange={(e) => handleBindAgentModel('expert', e.target.value)}
                    style={{
                      ...styles.fieldInput,
                      backgroundColor: '#FFFFFF',
                      cursor: 'pointer',
                      fontWeight: '500'
                    }}
                  >
                    <option value="gemma3-1b">Gemma 3 1B (LLM - Recommended)</option>
                    <option value="qwen3-vl-4b">Qwen 3 VL 4B (VLM)</option>
                    <option value="llama3.2-1b">Llama 3.2 1B (LLM)</option>
                  </select>
                </div>

                {/* Task-Scheduler Agent */}
                <div style={styles.fieldRow}>
                  <label style={{ fontWeight: '600' }}>Task-Scheduler Agent</label>
                  <select 
                    value={(data.agent_bindings && data.agent_bindings.scheduler) || 'llama3.2-1b'}
                    onChange={(e) => handleBindAgentModel('scheduler', e.target.value)}
                    style={{
                      ...styles.fieldInput,
                      backgroundColor: '#FFFFFF',
                      cursor: 'pointer',
                      fontWeight: '500'
                    }}
                  >
                    <option value="llama3.2-1b">Llama 3.2 1B (LLM - Recommended)</option>
                    <option value="gemma3-1b">Gemma 3 1B (LLM)</option>
                    <option value="qwen3-vl-4b">Qwen 3 VL 4B (VLM)</option>
                  </select>
                </div>
              </div>

              {/* Suppabase & Vercel Card */}
              <div style={styles.settingsCard}>
                <h3>Cloud Integrations</h3>
                <div style={styles.fieldRow}>
                  <label>Supabase Database Connection</label>
                  <input 
                    type="text" 
                    value={backendConnected ? "Connected (Loaded via backend)" : "supabase-connection-active (Simulation)"} 
                    style={styles.fieldInput} 
                    readOnly 
                  />
                </div>
                <div style={styles.fieldRow}>
                  <label>Vercel Deployments Integrations</label>
                  <input 
                    type="text" 
                    value={backendConnected ? "Active (Vercel Project linked)" : "vercel-linked-deployment (Simulation)"} 
                    style={styles.fieldInput} 
                    readOnly 
                  />
                </div>
                <p style={styles.note}>Supabase endpoints and Vercel personal tokens are securely mapped from backend <code>.env</code> file configurations.</p>
              </div>

              {/* Notifications and SMTP Credentials */}
              <div style={styles.settingsCard}>
                <h3>Alerting & Mail Channels</h3>
                <div style={styles.fieldRow}>
                  <label>Telegram Guardian alerts</label>
                  <input type="text" value="telegram-bot-polling-active" style={styles.fieldInput} readOnly />
                </div>
                <div style={styles.fieldRow}>
                  <label>SMTP Email Sender</label>
                  <input type="text" value="smtp-sender-active" style={styles.fieldInput} readOnly />
                </div>
                <p style={styles.note}>Telegram /status webhook handles and SMTP secure app passwords are initialized on system bootloader tasks.</p>
              </div>

              {/* User Profile Card */}
              <div style={styles.settingsCard}>
                <h3>User Authentication</h3>
                <div style={styles.fieldRow}>
                  <label>Full Name</label>
                  <input type="text" value={loggedInUser ? `${loggedInUser.first_name} ${loggedInUser.second_name}` : 'Developer Account'} style={styles.fieldInput} readOnly />
                </div>
                <div style={styles.fieldRow}>
                  <label>Username</label>
                  <input type="text" value={loggedInUser?.username || 'admin'} style={styles.fieldInput} readOnly />
                </div>
                <div style={styles.fieldRow}>
                  <label>Signed In As (Email)</label>
                  <input type="text" value={loggedInEmail} style={styles.fieldInput} readOnly />
                </div>
                <div style={styles.fieldRow}>
                  <label>Telegram Bot Invite</label>
                  <a 
                    href="https://t.me/melmalebot" 
                    target="_blank" 
                    rel="noreferrer"
                    style={{
                      fontSize: '13px',
                      color: 'var(--color-primary)',
                      fontWeight: '700',
                      textDecoration: 'underline',
                      marginTop: '4px',
                      fontFamily: 'var(--font-primary)'
                    }}
                  >
                    Subscribe to Bot (@melmalebot)
                  </a>
                </div>
                <button
                  onClick={handleLogout}
                  style={{
                    height: '42px',
                    borderRadius: '12px',
                    border: 'none',
                    backgroundColor: '#EF4444',
                    color: '#FFFFFF',
                    fontSize: '13px',
                    fontWeight: '700',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    marginTop: '12px',
                    boxShadow: '0 2px 8px rgba(239, 68, 68, 0.15)'
                  }}
                >
                  <LogOut size={14} />
                  <span>Sign Out / Lock Portal</span>
                </button>
              </div>
            </div>
          </div>

        ) : (
          <>
            {/* Top Header Banner containing illustrations */}
            <HeaderBanner 
              plantName={data.current_plant} 
              stage={data.growth_stage} 
              onExport={() => alert("Telemetry history reports exported successfully.")}
              userName={loggedInUser ? `${loggedInUser.first_name} ${loggedInUser.second_name}` : ''}
            />

            {/* Metrics cards row matching Zentra layout */}
            <div style={styles.statGrid}>
              <StatCard 
                type="health"
                title="Greenhouse Health"
                value="98.4%"
                change="+1.2%"
                trendUp={true}
                description="Vegetative performance rating"
              />
              <StatCard 
                type="actuators"
                title="Active Actuators"
                value={`${activeActuatorsCount} Devices`}
                change={null}
                trendUp={true}
                description={`Pump: ${data.actuators.pump ? 'ON' : 'OFF'} | Fan: ${data.actuators.fan ? 'ON' : 'OFF'}`}
              />
              <StatCard 
                type="water"
                title="Soil Hydration Status"
                value={`${data.sensors.soil_moisture}%`}
                change={data.sensors.soil_moisture < data.targets.min_soil_moisture ? "Low" : "Ideal"}
                trendUp={data.sensors.soil_moisture >= data.targets.min_soil_moisture}
                description={`Range Target: ${data.targets.min_soil_moisture}% - ${data.targets.max_soil_moisture}%`}
              />
              <StatCard 
                type="tasks"
                title="Scheduler Progress"
                value={tasksValue}
                change={`+${tasksPct}%`}
                trendUp={true}
                description="Daily chores completed ratio"
              />
            </div>

            {/* Split layout grids */}
            <div style={styles.splitRow}>
              {/* Telemetry charts (70%) */}
              <div style={styles.chartsCol}>
                <SensorCharts history={data.sensor_history} />
              </div>
              
              {/* Target reconfigurator (30%) */}
              <div style={styles.stagesCol}>
                <GrowthStage
                  currentPlant={data.current_plant}
                  growthStage={data.growth_stage}
                  ageDays={data.age_days}
                  sensors={data.sensors}
                  targets={data.targets}
                  onSelectPlant={handleSelectPlant}
                />
              </div>
            </div>

            {/* Chores list & Diagnostics center side-by-side */}
            <div style={styles.splitHalfRow}>
              <div style={styles.halfCol}>
                <TaskList 
                  tasks={data.tasks} 
                  currentPlant={data.current_plant} 
                  stage={data.growth_stage} 
                  ageDays={data.age_days}
                />
              </div>
              <div style={styles.halfCol}>
                <Diagnostics 
                  onDiagnose={handleDiagnoseLeaf} 
                  history={data.diagnostics_history} 
                />
              </div>
            </div>

            {/* Simulation Slider tools & simulated Telegram/Alert panels */}
            <div style={styles.splitHalfRow}>
              <div style={styles.halfCol}>
                <IoTSimulator
                  sensors={data.sensors}
                  actuators={data.actuators}
                  targets={data.targets}
                  onUpdateSensors={handleUpdateSensors}
                  onToggleActuator={handleToggleActuator}
                />
              </div>
              <div style={styles.halfCol}>
                <ChatDrawer
                  chatHistory={data.chat_history}
                  alertsHistory={data.alerts_history}
                  onSendChatMessage={handleSendChatMessage}
                />
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}

const styles = {
  appContainer: {
    display: 'flex',
    minHeight: '100vh',
    backgroundColor: 'var(--color-bg-base)',
    transition: 'background-color 0.2s'
  },
  mainContent: {
    marginLeft: '260px', // Matches sidebar width
    flex: 1,
    padding: '32px',
    maxWidth: '100%',
    width: 'calc(100% - 260px)',
    display: 'flex',
    flexDirection: 'column',
    gap: '24px'
  },
  offlineBanner: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    backgroundColor: '#FEF3C7',
    border: '1px solid #FCD34D',
    borderRadius: '12px',
    padding: '12px 16px',
    fontSize: '13px',
    fontWeight: '600',
    color: '#D97706'
  },
  statGrid: {
    display: 'flex',
    gap: '16px',
    flexWrap: 'wrap'
  },
  splitRow: {
    display: 'flex',
    gap: '20px',
    flexWrap: 'wrap'
  },
  chartsCol: {
    flex: '1.8 1 500px'
  },
  stagesCol: {
    flex: '1 1 300px'
  },
  splitHalfRow: {
    display: 'flex',
    gap: '20px',
    flexWrap: 'wrap'
  },
  halfCol: {
    flex: '1 1 450px'
  },
  settingsPage: {
    display: 'flex',
    flexDirection: 'column',
    gap: '24px'
  },
  settingsGrid: {
    display: 'flex',
    gap: '20px',
    flexWrap: 'wrap'
  },
  settingsCard: {
    flex: '1 1 340px',
    backgroundColor: 'var(--color-bg-card)',
    border: '1px solid var(--color-border)',
    borderRadius: '20px',
    padding: '24px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.01)',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    transition: 'background-color 0.2s, border 0.2s'
  },
  fieldRow: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px'
  },
  fieldInput: {
    height: '42px',
    borderRadius: '10px',
    border: '1px solid var(--color-border)',
    padding: '0 14px',
    backgroundColor: 'var(--color-bg-base)',
    fontSize: '13px',
    color: 'var(--color-text-body)',
    outline: 'none',
    transition: 'background-color 0.2s, border 0.2s, color 0.2s'
  },
  note: {
    fontSize: '11px',
    color: 'var(--color-text-muted)',
    lineHeight: '1.4',
    transition: 'color 0.2s'
  }
};

