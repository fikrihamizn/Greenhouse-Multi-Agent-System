import React, { useState, useEffect, useRef } from 'react';
import { Sliders, Cpu, Wifi, Terminal, RefreshCw, Layers } from 'lucide-react';

export default function IoTSimulator({ sensors, actuators, targets, onUpdateSensors, onToggleActuator }) {
  const [consoleLogs, setConsoleLogs] = useState([
    "🤖 Zentra Flora ESP32 Bootloader v1.0.4 commencing...",
    "🔑 Loading local secure environmental variables...",
    "📡 SSID found: [Zentra_Flora_5G]",
    "📶 WiFi RSSI Signal: -58 dBm (Strong)",
    "🟢 Connected successfully! IP Allocated: 192.168.1.142",
    "🔌 Establishing FastAPI WebSockets gateway link...",
    "🚀 Handshake verified at http://localhost:8000/api",
    "🌿 Sensor diagnostics: All systems operating within normal parameters."
  ]);
  const consoleEndRef = useRef(null);

  const handleSliderChange = (metric, value) => {
    const newReadings = {
      ...sensors,
      [metric]: parseFloat(value)
    };
    onUpdateSensors(newReadings);
    
    // Add real-time telemetry adjustment line to mock IDE console
    const formattedMetric = metric.replace('_', ' ').toUpperCase();
    logConsole(`[TELEMETRY] Sensor ${formattedMetric} calibrated to: ${value}`);
  };

  const logConsole = (message) => {
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    setConsoleLogs(prev => [...prev, `[${time}] ${message}`]);
  };

  // Auto-scroll terminal log console
  useEffect(() => {
    if (consoleEndRef.current) {
      consoleEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [consoleLogs]);

  // Generate dynamic runtime events to simulate a live active Arduino IDE
  useEffect(() => {
    const intervals = [
      "📶 RSSI signal check: -59 dBm | WiFi connection stable",
      "📤 Pushing raw telemetry matrices to Supabase database relations...",
      `🤖 Multi-Agent AI query: Evaluating ${sensors.soil_moisture}% soil moisture bounds`,
      "📥 MQTT subscription: Listening on channels [/zentra/grow/actuators]",
      `⚙️ Hardware telemetry: Core Temp ${sensors.temperature}°C | Humidity ${sensors.humidity}%`
    ];

    const interval = setInterval(() => {
      const randomMsg = intervals[Math.floor(Math.random() * intervals.length)];
      logConsole(randomMsg);
    }, 9000);

    return () => clearInterval(interval);
  }, [sensors]);

  // Track actuator overrides inside mock console
  useEffect(() => {
    logConsole(`[ACTUATOR OVERRIDE] Grow lights toggled: ${actuators.grow_lights ? 'HIGH (ON)' : 'LOW (OFF)'}`);
  }, [actuators.grow_lights]);

  useEffect(() => {
    logConsole(`[ACTUATOR OVERRIDE] Ventilation fan speed: ${actuators.fan ? 'HIGH (ON)' : 'LOW (OFF)'}`);
  }, [actuators.fan]);

  useEffect(() => {
    logConsole(`[ACTUATOR OVERRIDE] Water pump irrigation: ${actuators.pump ? 'HIGH (ON)' : 'LOW (OFF)'}`);
  }, [actuators.pump]);

  return (
    <div style={styles.card}>
      <div style={styles.header}>
        <div style={styles.titleRow}>
          <div style={styles.iconCircle}>
            <Cpu size={18} color="var(--color-primary)" />
          </div>
          <div>
            <h3 style={styles.title}>IoT Node Control & Arduino Console</h3>
            <span style={styles.subtitle}>Simulate hardware core and compile local firmware commands</span>
          </div>
        </div>
      </div>

      <div style={styles.simulatorGrid}>
        {/* Sliders Column */}
        <div style={styles.slidersCol}>
          <div style={styles.panelTitleRow}>
            <Sliders size={14} color="var(--color-primary)" />
            <span style={styles.panelTitle}>Calibrate Telemetry Sliders</span>
          </div>

          <div style={styles.sliderList}>
            {/* Temp Slider */}
            <div style={styles.sliderGroup}>
              <div style={styles.sliderHeader}>
                <span style={styles.sliderName}>Air Temp</span>
                <span style={styles.sliderValue}>{sensors.temperature}°C</span>
              </div>
              <input
                type="range"
                min="10"
                max="45"
                step="0.5"
                value={sensors.temperature}
                onChange={(e) => handleSliderChange('temperature', e.target.value)}
                style={styles.rangeInput}
              />
              <div style={styles.rangeLabels}>
                <span>10°C</span>
                <span>Ideal: {targets.min_temp}-{targets.max_temp}°C</span>
                <span>45°C</span>
              </div>
            </div>

            {/* Humidity Slider */}
            <div style={styles.sliderGroup}>
              <div style={styles.sliderHeader}>
                <span style={styles.sliderName}>Air Humidity</span>
                <span style={styles.sliderValue}>{sensors.humidity}%</span>
              </div>
              <input
                type="range"
                min="20"
                max="99"
                step="1"
                value={sensors.humidity}
                onChange={(e) => handleSliderChange('humidity', e.target.value)}
                style={styles.rangeInput}
              />
              <div style={styles.rangeLabels}>
                <span>20%</span>
                <span>Ideal: {targets.min_humidity}-{targets.max_humidity}%</span>
                <span>99%</span>
              </div>
            </div>

            {/* Soil Moisture Slider */}
            <div style={styles.sliderGroup}>
              <div style={styles.sliderHeader}>
                <span style={styles.sliderName}>Soil Moisture</span>
                <span style={styles.sliderValue}>{sensors.soil_moisture}%</span>
              </div>
              <input
                type="range"
                min="10"
                max="90"
                step="1"
                value={sensors.soil_moisture}
                onChange={(e) => handleSliderChange('soil_moisture', e.target.value)}
                style={styles.rangeInput}
              />
              <div style={styles.rangeLabels}>
                <span>10%</span>
                <span>Ideal: {targets.min_soil_moisture}-{targets.max_soil_moisture}%</span>
                <span>90%</span>
              </div>
            </div>

            {/* Light Slider */}
            <div style={styles.sliderGroup}>
              <div style={styles.sliderHeader}>
                <span style={styles.sliderName}>Ambient Light</span>
                <span style={styles.sliderValue}>{sensors.light} Lux</span>
              </div>
              <input
                type="range"
                min="50"
                max="1200"
                step="10"
                value={sensors.light}
                onChange={(e) => handleSliderChange('light', e.target.value)}
                style={styles.rangeInput}
              />
              <div style={styles.rangeLabels}>
                <span>50 lx</span>
                <span>Ideal: {targets.min_light}-{targets.max_light} Lux</span>
                <span>1200 lx</span>
              </div>
            </div>
          </div>
        </div>

        {/* Arduino IDE Terminal Column */}
        <div style={styles.ideCol}>
          <div style={styles.panelTitleRow}>
            <Terminal size={14} color="var(--color-primary)" />
            <span style={styles.panelTitle}>Arduino IDE Live Stream Logs</span>
            <button 
              onClick={() => {
                setConsoleLogs(prev => [...prev, `[RESET] Reloading Arduino firmware flash commands...`]);
                logConsole("Reconnected to serial monitor.");
              }}
              style={styles.refreshBtn}
              title="Reset Serial Monitor"
            >
              <RefreshCw size={11} color="var(--color-text-muted)" />
            </button>
          </div>

          {/* Microcontroller Hardware Stats Header */}
          <div style={styles.hardwareSpecsCard}>
            <div style={styles.specItem}>
              <Cpu size={12} color="var(--color-primary)" />
              <span>Chip: <strong>ESP32-S3 WROOM</strong></span>
            </div>
            <div style={styles.specItem}>
              <Layers size={12} color="var(--color-success)" />
              <span>RAM: <strong>192 KB / 320 KB</strong></span>
            </div>
            <div style={styles.specItem}>
              <Wifi size={12} color="#38BDF8" />
              <span>WiFi: <strong>Strong (-58dBm)</strong></span>
            </div>
          </div>

          {/* Scrolling Code Console */}
          <div className="arduino-console">
            {consoleLogs.map((log, idx) => {
              let classColor = "";
              if (log.includes("[ERROR]") || log.includes("[RESET]")) classColor = "console-line-yellow";
              else if (log.includes("[SUCCESS]") || log.includes("Connected")) classColor = "console-line-green";
              else if (log.includes("[TELEMETRY]")) classColor = "console-line-purple";

              return (
                <div key={idx} className={classColor} style={{ marginBottom: '4px' }}>
                  {log}
                </div>
              );
            })}
            <div ref={consoleEndRef} className="console-blink-cursor" />
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  card: {
    backgroundColor: 'var(--color-bg-card)',
    border: '1px solid var(--color-border)',
    borderRadius: '24px',
    padding: '24px',
    boxShadow: 'var(--shadow-lg)',
    transition: 'background-color 0.2s, border 0.2s'
  },
  header: {
    marginBottom: '20px'
  },
  titleRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px'
  },
  iconCircle: {
    width: '38px',
    height: '38px',
    borderRadius: '12px',
    backgroundColor: 'var(--color-primary-light)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'background-color 0.2s'
  },
  title: {
    fontSize: '16px',
    fontWeight: '800',
    color: 'var(--color-text-title)',
    fontFamily: 'var(--font-display)',
    transition: 'color 0.2s'
  },
  subtitle: {
    fontSize: '11px',
    color: 'var(--color-text-muted)',
    fontWeight: '500',
    transition: 'color 0.2s'
  },
  simulatorGrid: {
    display: 'flex',
    gap: '24px',
    flexWrap: 'wrap'
  },
  slidersCol: {
    flex: '1 1 300px',
    display: 'flex',
    flexDirection: 'column',
    gap: '14px'
  },
  ideCol: {
    flex: '1.2 1 340px',
    display: 'flex',
    flexDirection: 'column',
    gap: '14px'
  },
  panelTitleRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    paddingBottom: '8px',
    borderBottom: '1px solid var(--color-border)',
    position: 'relative',
    transition: 'border 0.2s'
  },
  panelTitle: {
    fontSize: '12px',
    fontWeight: '700',
    color: 'var(--color-text-body)',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    transition: 'color 0.2s'
  },
  refreshBtn: {
    position: 'absolute',
    right: 0,
    top: '-4px',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '24px',
    height: '24px',
    borderRadius: '50%'
  },
  sliderList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px'
  },
  sliderGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px'
  },
  sliderHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '12px',
    fontWeight: '700'
  },
  sliderName: {
    color: 'var(--color-text-body)',
    transition: 'color 0.2s'
  },
  sliderValue: {
    color: 'var(--color-primary)',
    transition: 'color 0.2s'
  },
  rangeInput: {
    width: '100%',
    cursor: 'pointer',
    accentColor: 'var(--color-primary)',
    height: '6px',
    borderRadius: '10px',
    backgroundColor: 'var(--color-bg-base)',
    border: 'none',
    outline: 'none',
    transition: 'background-color 0.2s'
  },
  rangeLabels: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '9px',
    color: 'var(--color-text-muted)',
    fontWeight: '600',
    transition: 'color 0.2s'
  },
  hardwareSpecsCard: {
    display: 'flex',
    justifyContent: 'space-between',
    backgroundColor: 'var(--color-bg-base)',
    borderRadius: '14px',
    padding: '12px 14px',
    border: '1px solid var(--color-border)',
    transition: 'background-color 0.2s, border 0.2s'
  },
  specItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '11px',
    color: 'var(--color-text-body)'
  }
};
