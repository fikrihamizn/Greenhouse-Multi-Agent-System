/*
 * ESP8266 Greenhouse Node — Zentra Flora
 * ───────────────────────────────────────
 * Photoresistor : A0  (ADC, 0–1023)
 * LED D1        : GPIO5
 * LED D2        : GPIO4
 * LED D3        : GPIO0  ← boot-mode pin; keep LOW during power-on
 *
 * Behaviour:
 *   • Local HTTP server (port 80) for direct browser/Postman access.
 *   • Every 2 s: POST photoresistor reading to FastAPI backend.
 *   • Backend response carries desired LED states → applied immediately.
 *
 * Setup:
 *   1. Set ssid / password to your WiFi credentials.
 *   2. Set BACKEND_IP to your PC's local IP (run `ipconfig` on Windows).
 *      The PC must be on the same WiFi network as the ESP8266.
 *   3. Flash with Arduino IDE (Board: "NodeMCU 1.0 (ESP-12E Module)").
 */

#include <ESP8266WiFi.h>
#include <ESP8266WebServer.h>
#include <ESP8266HTTPClient.h>
#include <WiFiClient.h>

// ── Configuration ─────────────────────────────────────────────────────────────
const char* ssid       = "YOUR_SSID";
const char* password   = "YOUR_PASSWORD";

// PC running FastAPI backend (same WiFi network).  Find with: ipconfig → IPv4
const char* BACKEND_IP   = "192.168.1.xxx";
const int   BACKEND_PORT = 8000;

const unsigned long PUSH_INTERVAL_MS = 2000;   // push every 2 seconds

// ── Pin Definitions ───────────────────────────────────────────────────────────
const int PHOTO_PIN = A0;
const int LED_D1    = D1;   // GPIO5
const int LED_D2    = D2;   // GPIO4
const int LED_D3    = D3;   // GPIO0 — keep LOW at boot to avoid flash mode

// ── State ─────────────────────────────────────────────────────────────────────
bool led1_state          = false;
bool led2_state          = false;
bool led3_state          = false;
int  photoresistor_value = 0;

unsigned long lastPushMs = 0;

ESP8266WebServer server(80);

// ── Setup ─────────────────────────────────────────────────────────────────────
void setup() {
  Serial.begin(115200);
  delay(100);

  // LEDs — all OFF first to avoid boot issues on GPIO0 (D3)
  pinMode(LED_D1, OUTPUT);
  pinMode(LED_D2, OUTPUT);
  pinMode(LED_D3, OUTPUT);
  digitalWrite(LED_D1, LOW);
  digitalWrite(LED_D2, LOW);
  digitalWrite(LED_D3, LOW);

  Serial.println("\n\nZentra Flora — ESP8266 Node starting…");
  connectToWiFi();

  // ── Local web server routes ───────────────────────────────────────────────
  server.on("/",            handleRoot);
  server.on("/sensor",      handleSensor);
  server.on("/status",      handleStatus);

  server.on("/led1/on",     []() { setLed(1, true);  server.send(200, "text/plain", "LED D1 ON");    Serial.println("[Local] LED D1 ON");  });
  server.on("/led1/off",    []() { setLed(1, false); server.send(200, "text/plain", "LED D1 OFF");   Serial.println("[Local] LED D1 OFF"); });
  server.on("/led2/on",     []() { setLed(2, true);  server.send(200, "text/plain", "LED D2 ON");    Serial.println("[Local] LED D2 ON");  });
  server.on("/led2/off",    []() { setLed(2, false); server.send(200, "text/plain", "LED D2 OFF");   Serial.println("[Local] LED D2 OFF"); });
  server.on("/led3/on",     []() { setLed(3, true);  server.send(200, "text/plain", "LED D3 ON");    Serial.println("[Local] LED D3 ON");  });
  server.on("/led3/off",    []() { setLed(3, false); server.send(200, "text/plain", "LED D3 OFF");   Serial.println("[Local] LED D3 OFF"); });
  server.on("/led/all/on",  []() { setLed(0, true);  server.send(200, "text/plain", "All LEDs ON");  Serial.println("[Local] All LEDs ON"); });
  server.on("/led/all/off", []() { setLed(0, false); server.send(200, "text/plain", "All LEDs OFF"); Serial.println("[Local] All LEDs OFF"); });
  server.onNotFound([]() { server.send(404, "text/plain", "404 Not Found"); });

  server.begin();
  Serial.println("Local HTTP server started on port 80");
  Serial.print("ESP8266 IP : ");
  Serial.println(WiFi.localIP());
  Serial.print("Backend    : http://");
  Serial.print(BACKEND_IP);
  Serial.print(":");
  Serial.println(BACKEND_PORT);
}

// ── Main Loop ─────────────────────────────────────────────────────────────────
void loop() {
  server.handleClient();

  if (millis() - lastPushMs >= PUSH_INTERVAL_MS) {
    lastPushMs = millis();
    pushToBackend();
  }
}

// ── LED helper — led=0 means all ─────────────────────────────────────────────
void setLed(int led, bool state) {
  if (led == 1 || led == 0) { led1_state = state; digitalWrite(LED_D1, state ? HIGH : LOW); }
  if (led == 2 || led == 0) { led2_state = state; digitalWrite(LED_D2, state ? HIGH : LOW); }
  if (led == 3 || led == 0) { led3_state = state; digitalWrite(LED_D3, state ? HIGH : LOW); }
}

// ── Push photoresistor data → receive LED commands ────────────────────────────
void pushToBackend() {
  // Reconnect WiFi if dropped
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("[WiFi] Disconnected — reconnecting…");
    connectToWiFi();
    return;
  }

  photoresistor_value = analogRead(PHOTO_PIN);

  WiFiClient client;
  HTTPClient http;

  String url = String("http://") + BACKEND_IP + ":" + String(BACKEND_PORT) + "/api/esp8266/sensor";

  if (!http.begin(client, url)) {
    Serial.println("[Backend] Could not open connection");
    return;
  }

  http.addHeader("Content-Type", "application/json");
  http.setTimeout(3000);

  // Build JSON payload manually (no ArduinoJson dependency)
  String payload = "{\"photoresistor\":";
  payload += photoresistor_value;
  payload += ",\"led1\":";
  payload += led1_state ? "true" : "false";
  payload += ",\"led2\":";
  payload += led2_state ? "true" : "false";
  payload += ",\"led3\":";
  payload += led3_state ? "true" : "false";
  payload += "}";

  int httpCode = http.POST(payload);

  if (httpCode == 200) {
    String response = http.getString();

    // Parse desired LED states from response
    // Expected: {"status":"OK","led1":true,"led2":false,"led3":false}
    bool desired_led1 = response.indexOf("\"led1\":true") >= 0;
    bool desired_led2 = response.indexOf("\"led2\":true") >= 0;
    bool desired_led3 = response.indexOf("\"led3\":true") >= 0;

    if (desired_led1 != led1_state) { setLed(1, desired_led1); Serial.println(desired_led1 ? "[Backend] LED D1 → ON" : "[Backend] LED D1 → OFF"); }
    if (desired_led2 != led2_state) { setLed(2, desired_led2); Serial.println(desired_led2 ? "[Backend] LED D2 → ON" : "[Backend] LED D2 → OFF"); }
    if (desired_led3 != led3_state) { setLed(3, desired_led3); Serial.println(desired_led3 ? "[Backend] LED D3 → ON" : "[Backend] LED D3 → OFF"); }

    Serial.printf("[Backend] Photo=%d  L1=%d L2=%d L3=%d\n",
      photoresistor_value, led1_state, led2_state, led3_state);
  } else {
    Serial.printf("[Backend] HTTP error: %d\n", httpCode);
  }

  http.end();
}

// ── WiFi Connection ───────────────────────────────────────────────────────────
void connectToWiFi() {
  Serial.printf("Connecting to: %s\n", ssid);
  WiFi.disconnect(true);
  delay(100);
  WiFi.mode(WIFI_STA);
  WiFi.begin(ssid, password);

  int attempts = 0;
  while (WiFi.status() != WL_CONNECTED && attempts < 40) {  // 20 seconds max
    delay(500);
    Serial.print(".");
    attempts++;
  }
  Serial.println();

  if (WiFi.status() == WL_CONNECTED) {
    Serial.println("WiFi connected!");
    Serial.print("IP: ");
    Serial.println(WiFi.localIP());
  } else {
    // Print status code to help diagnose the failure
    int s = WiFi.status();
    Serial.print("WiFi failed (status=");
    Serial.print(s);
    Serial.print(") — ");
    if (s == WL_NO_SSID_AVAIL)   Serial.println("SSID not found. Check name or switch hotspot to 2.4 GHz band.");
    else if (s == WL_CONNECT_FAILED) Serial.println("Wrong password.");
    else                          Serial.println("Unknown error. Ensure hotspot is on 2.4 GHz (ESP8266 does not support 5 GHz).");
    Serial.println("Continuing in local-only mode.");
  }
}

// ── Local Web Server Handlers ─────────────────────────────────────────────────
void handleRoot() {
  photoresistor_value = analogRead(PHOTO_PIN);
  int lightPct = map(photoresistor_value, 0, 1023, 0, 100);

  String html = "<!DOCTYPE html><html><head><meta charset='utf-8'>";
  html += "<meta name='viewport' content='width=device-width,initial-scale=1'>";
  html += "<title>ESP8266 Node</title>";
  html += "<style>body{font-family:Arial,sans-serif;margin:20px;background:#111;color:#eee;}";
  html += "h1{color:#4ade80;margin:0 0 4px}h2{font-size:14px;color:#6b7280;margin:0 0 20px}";
  html += ".card{background:#1f2937;border-radius:10px;padding:16px;margin:12px 0}";
  html += ".val{font-size:38px;font-weight:800;color:#fff;letter-spacing:-1px}";
  html += ".sub{font-size:12px;color:#6b7280;margin-top:2px}";
  html += ".bar-bg{background:#374151;border-radius:4px;height:8px;margin:8px 0}";
  html += ".bar-fill{background:linear-gradient(90deg,#16a34a,#4ade80);height:8px;border-radius:4px;transition:width .4s}";
  html += "button{padding:10px 18px;margin:4px;font-size:13px;font-weight:600;cursor:pointer;border:none;border-radius:6px}";
  html += ".btn-on{background:#4ade80;color:#000}.btn-off{background:#374151;color:#eee}";
  html += ".btn-all-on{background:#3b82f6;color:#fff}.btn-all-off{background:#ef4444;color:#fff}</style>";
  html += "</head><body>";
  html += "<h1>Zentra Flora</h1><h2>ESP8266 Greenhouse Node — " + WiFi.localIP().toString() + "</h2>";

  html += "<div class='card'><div style='font-size:13px;font-weight:700;color:#9ca3af;margin-bottom:8px'>PHOTORESISTOR (A0)</div>";
  html += "<div class='val' id='photo'>" + String(photoresistor_value) + "</div>";
  html += "<div class='sub'>raw ADC / 1023 &nbsp;·&nbsp; <span id='pct'>" + String(lightPct) + "</span>% light level</div>";
  html += "<div class='bar-bg'><div class='bar-fill' id='bar' style='width:" + String(lightPct) + "%'></div></div></div>";

  html += "<div class='card'><div style='font-size:13px;font-weight:700;color:#9ca3af;margin-bottom:10px'>LED CONTROL</div>";
  html += "<div>D1 (GPIO5) &nbsp;<button class='btn-on' onclick=\"fetch('/led1/on')\">ON</button><button class='btn-off' onclick=\"fetch('/led1/off')\">OFF</button></div><br>";
  html += "<div>D2 (GPIO4) &nbsp;<button class='btn-on' onclick=\"fetch('/led2/on')\">ON</button><button class='btn-off' onclick=\"fetch('/led2/off')\">OFF</button></div><br>";
  html += "<div>D3 (GPIO0) &nbsp;<button class='btn-on' onclick=\"fetch('/led3/on')\">ON</button><button class='btn-off' onclick=\"fetch('/led3/off')\">OFF</button></div><br>";
  html += "<hr style='border-color:#374151'>";
  html += "<button class='btn-all-on' onclick=\"fetch('/led/all/on')\">ALL ON</button>";
  html += "<button class='btn-all-off' onclick=\"fetch('/led/all/off')\">ALL OFF</button></div>";

  html += "<script>setInterval(()=>{fetch('/sensor').then(r=>r.text()).then(v=>{";
  html += "document.getElementById('photo').textContent=v;";
  html += "let p=Math.round(v/1023*100);";
  html += "document.getElementById('pct').textContent=p;";
  html += "document.getElementById('bar').style.width=p+'%';";
  html += "})},1000);</script>";
  html += "</body></html>";

  server.send(200, "text/html", html);
}

void handleSensor() {
  photoresistor_value = analogRead(PHOTO_PIN);
  server.send(200, "text/plain", String(photoresistor_value));
}

void handleStatus() {
  photoresistor_value = analogRead(PHOTO_PIN);
  String json = "{\"photoresistor\":";
  json += photoresistor_value;
  json += ",\"led1\":"; json += led1_state ? "true" : "false";
  json += ",\"led2\":"; json += led2_state ? "true" : "false";
  json += ",\"led3\":"; json += led3_state ? "true" : "false";
  json += ",\"ip\":\""; json += WiFi.localIP().toString(); json += "\"}";
  server.send(200, "application/json", json);
}
