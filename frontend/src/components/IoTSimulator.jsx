import React from 'react';
import { Sliders, Cpu, Power, Droplet, Wind, Sun } from 'lucide-react';

export default function IoTSimulator({ sensors, actuators, targets, onUpdateSensors, onToggleActuator }) {
  
  const handleSliderChange = (metric, value) => {
    const newReadings = {
      temperature: sensors.temperature,
      humidity: sensors.humidity,
      light: sensors.light,
      soil_moisture: sensors.soil_moisture,
      [metric]: parseFloat(value)
    };
    onUpdateSensors(newReadings);
  };

  const getStatusColor = (active) => active ? '#7C3AED' : '#94A3B8';

  return (
    <div style={styles.card}>
      <div style={styles.header}>
        <h3 style={styles.title}>Smart Hardware IoT Simulator</h3>
        <span style={styles.subtitle}>Simulate incoming environmental readings and control actuators</span>
      </div>

      <div style={styles.simulatorGrid}>
        {/* Sliders Column */}
        <div style={styles.slidersCol}>
          <div style={styles.panelTitleRow}>
            <Sliders size={14} color="#7C3AED" />
            <span style={styles.panelTitle}>Incoming IoT Sensor Sliders</span>
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
              <span style={styles.rangeLabels}>10°C (Cold) <span>Target: {targets.min_temp}-{targets.max_temp}°C</span> 45°C (Hot)</span>
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
              <span style={styles.rangeLabels}>20% (Dry) <span>Target: {targets.min_humidity}-{targets.max_humidity}%</span> 99% (Saturated)</span>
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
              <span style={styles.rangeLabels}>10% (Arid) <span>Target: {targets.min_soil_moisture}-{targets.max_soil_moisture}%</span> 90% (Flooded)</span>
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
              <span style={styles.rangeLabels}>50 Lux (Shade) <span>Target: {targets.min_light}-{targets.max_light} Lux</span> 1200 Lux (Sun)</span>
            </div>
          </div>
        </div>

        {/* Actuators Column */}
        <div style={styles.actuatorsCol}>
          <div style={styles.panelTitleRow}>
            <Cpu size={14} color="#7C3AED" />
            <span style={styles.panelTitle}>Actuators override (Control Agent)</span>
          </div>

          <div style={styles.actuatorList}>
            {/* Water Pump */}
            <div style={{
              ...styles.actuatorCard,
              borderColor: actuators.pump ? 'var(--color-primary-medium)' : 'var(--color-border)',
              backgroundColor: actuators.pump ? 'var(--color-primary-light)' : 'var(--color-bg-card)'
            }}>
              <div style={{ ...styles.actuatorIconCircle, backgroundColor: actuators.pump ? 'var(--color-primary-light)' : 'var(--color-bg-base)' }}>
                <Droplet size={18} color={actuators.pump ? 'var(--color-primary)' : 'var(--color-text-muted)'} />
              </div>
              <div style={styles.actuatorDetails}>
                <span style={styles.actuatorName}>Water Pump</span>
                <span style={{ 
                  ...styles.actuatorStatus, 
                  color: actuators.pump ? 'var(--color-primary)' : 'var(--color-text-muted)' 
                }}>
                  {actuators.pump ? 'Irrigating Soil' : 'Inactive'}
                </span>
              </div>
              <button 
                onClick={() => onToggleActuator('pump', !actuators.pump)}
                style={{
                  ...styles.toggleBtn,
                  backgroundColor: actuators.pump ? 'var(--color-primary)' : 'var(--color-bg-base)'
                }}
              >
                <Power size={14} color={actuators.pump ? '#FFFFFF' : 'var(--color-text-body)'} />
              </button>
            </div>

            {/* Exhaust Fan */}
            <div style={{
              ...styles.actuatorCard,
              borderColor: actuators.fan ? 'var(--color-primary-medium)' : 'var(--color-border)',
              backgroundColor: actuators.fan ? 'var(--color-primary-light)' : 'var(--color-bg-card)'
            }}>
              <div style={{ ...styles.actuatorIconCircle, backgroundColor: actuators.fan ? 'var(--color-primary-light)' : 'var(--color-bg-base)' }}>
                <Wind size={18} color={actuators.fan ? 'var(--color-primary)' : 'var(--color-text-muted)'} />
              </div>
              <div style={styles.actuatorDetails}>
                <span style={styles.actuatorName}>Exhaust Fan</span>
                <span style={{ 
                  ...styles.actuatorStatus, 
                  color: actuators.fan ? 'var(--color-primary)' : 'var(--color-text-muted)' 
                }}>
                  {actuators.fan ? 'Ventilating / Cooling' : 'Inactive'}
                </span>
              </div>
              <button 
                onClick={() => onToggleActuator('fan', !actuators.fan)}
                style={{
                  ...styles.toggleBtn,
                  backgroundColor: actuators.fan ? 'var(--color-primary)' : 'var(--color-bg-base)'
                }}
              >
                <Power size={14} color={actuators.fan ? '#FFFFFF' : 'var(--color-text-body)'} />
              </button>
            </div>

            {/* Grow Lights */}
            <div style={{
              ...styles.actuatorCard,
              borderColor: actuators.grow_lights ? 'var(--color-primary-medium)' : 'var(--color-border)',
              backgroundColor: actuators.grow_lights ? 'var(--color-primary-light)' : 'var(--color-bg-card)'
            }}>
              <div style={{ ...styles.actuatorIconCircle, backgroundColor: actuators.grow_lights ? 'var(--color-primary-light)' : 'var(--color-bg-base)' }}>
                <Sun size={18} color={actuators.grow_lights ? 'var(--color-primary)' : 'var(--color-text-muted)'} />
              </div>
              <div style={styles.actuatorDetails}>
                <span style={styles.actuatorName}>Grow Lights</span>
                <span style={{ 
                  ...styles.actuatorStatus, 
                  color: actuators.grow_lights ? 'var(--color-primary)' : 'var(--color-text-muted)' 
                }}>
                  {actuators.grow_lights ? 'Full Spectrum Active' : 'Inactive'}
                </span>
              </div>
              <button 
                onClick={() => onToggleActuator('grow_lights', !actuators.grow_lights)}
                style={{
                  ...styles.toggleBtn,
                  backgroundColor: actuators.grow_lights ? 'var(--color-primary)' : 'var(--color-bg-base)'
                }}
              >
                <Power size={14} color={actuators.grow_lights ? '#FFFFFF' : 'var(--color-text-body)'} />
              </button>
            </div>
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
    borderRadius: '20px',
    padding: '24px',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.01)',
    transition: 'background-color 0.2s, border 0.2s'
  },
  header: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    marginBottom: '20px'
  },
  title: {
    fontSize: '16px',
    fontWeight: '700',
    color: 'var(--color-text-title)',
    fontFamily: "'Outfit', sans-serif",
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
    flex: '1.2 1 300px',
    display: 'flex',
    flexDirection: 'column',
    gap: '14px'
  },
  actuatorsCol: {
    flex: '1 1 260px',
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
  sliderList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px'
  },
  sliderGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px'
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
  actuatorList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px'
  },
  actuatorCard: {
    display: 'flex',
    alignItems: 'center',
    padding: '12px 14px',
    border: '1px solid',
    borderRadius: '14px',
    gap: '12px',
    transition: 'all 0.2s'
  },
  actuatorIconCircle: {
    width: '36px',
    height: '36px',
    borderRadius: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    transition: 'all 0.2s'
  },
  actuatorDetails: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
    flex: 1
  },
  actuatorName: {
    fontSize: '13px',
    fontWeight: '700',
    color: 'var(--color-text-title)',
    transition: 'color 0.2s'
  },
  actuatorStatus: {
    fontSize: '11px',
    fontWeight: '600',
    transition: 'color 0.2s'
  },
  toggleBtn: {
    width: '32px',
    height: '32px',
    borderRadius: '8px',
    border: 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    boxShadow: '0 2px 6px rgba(0,0,0,0.02)',
    transition: 'all 0.2s'
  }
};
