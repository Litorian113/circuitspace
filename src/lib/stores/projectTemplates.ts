import type { Component, Project } from './project';

export interface ProjectTemplate {
	id: string;
	name: string;
	description: string;
	category: 'beginner' | 'intermediate' | 'advanced';
	estimatedTime: string;
	difficulty: 1 | 2 | 3 | 4 | 5;
	components: Component[];
	code: string;
	learningObjectives: string[];
	circuitDiagram?: string;
	tags: string[];
}

export const projectTemplates: ProjectTemplate[] = [
	{
		id: 'smart-led-controller',
		name: 'Smart LED Controller',
		description: 'Build an intelligent LED strip controller with multiple lighting modes, remote control capabilities, and smartphone integration.',
		category: 'intermediate',
		estimatedTime: '2-3 hours',
		difficulty: 3,
		learningObjectives: [
			'Understanding addressable LED strips (WS2812B)',
			'Arduino programming basics',
			'Button debouncing techniques',
			'State machine programming',
			'PWM and color mixing'
		],
		tags: ['led', 'lighting', 'arduino', 'remote-control', 'iot'],
		components: [
			{
				id: 'arduino-uno',
				name: 'Arduino Uno',
				description: 'Main microcontroller board',
				price: '$25',
				category: 'microcontroller',
				pinouts: ['D0-D13', 'A0-A5', '5V', '3.3V', 'GND'],
				specifications: {
					'MCU': 'ATmega328P',
					'Clock Speed': '16 MHz',
					'Flash Memory': '32 KB',
					'SRAM': '2 KB',
					'EEPROM': '1 KB'
				}
			},
			{
				id: 'led-strip-ws2812b',
				name: 'WS2812B LED Strip',
				description: 'Addressable RGB LED strip - 1 meter, 30 LEDs',
				price: '$15',
				category: 'output',
				pinouts: ['VCC', 'GND', 'Data In', 'Data Out'],
				specifications: {
					'LEDs per meter': '30',
					'Voltage': '5V',
					'Current per LED': '50mA',
					'Color depth': '24-bit'
				}
			},
			{
				id: 'push-button',
				name: 'Push Button',
				description: 'Momentary push button switch',
				price: '$3',
				category: 'input'
			},
			{
				id: 'potentiometer',
				name: 'Potentiometer',
				description: '10kΩ rotary potentiometer',
				price: '$2',
				category: 'input'
			},
			{
				id: 'breadboard',
				name: 'Breadboard',
				description: 'Solderless prototyping board',
				price: '$8',
				category: 'prototyping'
			}
		],
		code: `#include <FastLED.h>

#define LED_PIN 6
#define BUTTON_PIN 2
#define BRIGHTNESS_PIN A0
#define NUM_LEDS 30

CRGB leds[NUM_LEDS];
int currentMode = 0;
int totalModes = 5;
bool buttonPressed = false;
unsigned long lastButtonTime = 0;
const unsigned long debounceDelay = 200;

void setup() {
  FastLED.addLeds<WS2812B, LED_PIN, GRB>(leds, NUM_LEDS);
  FastLED.setBrightness(100);
  pinMode(BUTTON_PIN, INPUT_PULLUP);
  Serial.begin(9600);
  Serial.println("Circuitspace Smart LED Controller v1.0");
  Serial.println("Modes: Rainbow, Breathing, Strobe, Color Cycle, Static");
}

void loop() {
  handleButtonInput();
  updateBrightness();
  
  switch(currentMode) {
    case 0: rainbowMode(); break;
    case 1: breathingMode(); break;
    case 2: strobeMode(); break;
    case 3: colorCycleMode(); break;
    case 4: staticMode(); break;
  }
  
  FastLED.show();
  delay(20);
}

void handleButtonInput() {
  bool buttonState = !digitalRead(BUTTON_PIN);
  unsigned long currentTime = millis();
  
  if (buttonState && !buttonPressed && (currentTime - lastButtonTime > debounceDelay)) {
    buttonPressed = true;
    lastButtonTime = currentTime;
    currentMode = (currentMode + 1) % totalModes;
    Serial.print("Mode changed to: ");
    Serial.println(currentMode);
    clearLEDs();
  } else if (!buttonState) {
    buttonPressed = false;
  }
}

void updateBrightness() {
  int brightness = map(analogRead(BRIGHTNESS_PIN), 0, 1023, 10, 255);
  FastLED.setBrightness(brightness);
}

void clearLEDs() {
  for(int i = 0; i < NUM_LEDS; i++) {
    leds[i] = CRGB::Black;
  }
  FastLED.show();
}

void rainbowMode() {
  static uint8_t hue = 0;
  for(int i = 0; i < NUM_LEDS; i++) {
    leds[i] = CHSV(hue + (i * 8), 255, 255);
  }
  hue += 2;
}

void breathingMode() {
  static uint8_t brightness = 0;
  static int8_t direction = 1;
  
  brightness += direction * 3;
  if(brightness >= 255 || brightness <= 30) {
    direction *= -1;
  }
  
  for(int i = 0; i < NUM_LEDS; i++) {
    leds[i] = CHSV(120, 255, brightness); // Green breathing
  }
}

void strobeMode() {
  static unsigned long lastFlash = 0;
  static bool flashState = false;
  
  if(millis() - lastFlash > 100) {
    flashState = !flashState;
    lastFlash = millis();
    
    CRGB color = flashState ? CRGB::White : CRGB::Black;
    for(int i = 0; i < NUM_LEDS; i++) {
      leds[i] = color;
    }
  }
}

void colorCycleMode() {
  static uint8_t hue = 0;
  static unsigned long lastUpdate = 0;
  
  if(millis() - lastUpdate > 50) {
    for(int i = 0; i < NUM_LEDS; i++) {
      leds[i] = CHSV(hue, 255, 255);
    }
    hue += 5;
    lastUpdate = millis();
  }
}

void staticMode() {
  for(int i = 0; i < NUM_LEDS; i++) {
    leds[i] = CRGB::Blue;
  }
}`
	},
	{
		id: 'temperature-monitor',
		name: 'Temperature Monitor System',
		description: 'Create a digital temperature monitoring system with OLED display, data logging, and alert system.',
		category: 'beginner',
		estimatedTime: '1-2 hours',
		difficulty: 2,
		learningObjectives: [
			'Analog sensor reading',
			'OLED display control',
			'Serial communication',
			'Temperature calculations',
			'Basic data visualization'
		],
		tags: ['sensor', 'temperature', 'display', 'monitoring', 'beginner'],
		components: [
			{
				id: 'arduino-nano',
				name: 'Arduino Nano',
				description: 'Compact microcontroller board',
				price: '$12',
				category: 'microcontroller'
			},
			{
				id: 'oled-display',
				name: 'OLED Display',
				description: '0.96" 128x64 I2C OLED',
				price: '$8',
				category: 'output'
			},
			{
				id: 'temp-sensor',
				name: 'TMP36 Temperature Sensor',
				description: 'Analog temperature sensor',
				price: '$4',
				category: 'sensor'
			},
			{
				id: 'breadboard',
				name: 'Breadboard',
				description: 'Solderless prototyping board',
				price: '$8',
				category: 'prototyping'
			}
		],
		code: `#include <SPI.h>
#include <Wire.h>
#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>

#define SCREEN_WIDTH 128
#define SCREEN_HEIGHT 64
#define OLED_RESET -1
#define TMP36_PIN A0

Adafruit_SSD1306 display(SCREEN_WIDTH, SCREEN_HEIGHT, &Wire, OLED_RESET);

float temperatures[10];
int tempIndex = 0;
unsigned long lastReading = 0;
const unsigned long readingInterval = 2000;

void setup() {
  Serial.begin(9600);
  
  if(!display.begin(SSD1306_SWITCHCAPVCC, 0x3C)) {
    Serial.println("SSD1306 allocation failed");
    for(;;);
  }
  
  display.clearDisplay();
  display.setTextSize(1);
  display.setTextColor(SSD1306_WHITE);
  display.setCursor(0,0);
  display.println("Temperature Monitor");
  display.println("Initializing...");
  display.display();
  
  // Initialize temperature array
  for(int i = 0; i < 10; i++) {
    temperatures[i] = 0;
  }
  
  delay(2000);
  Serial.println("Circuitspace Temperature Monitor v1.0");
}

void loop() {
  if(millis() - lastReading >= readingInterval) {
    float temp = readTemperature();
    updateTemperatureArray(temp);
    updateDisplay(temp);
    logTemperature(temp);
    lastReading = millis();
  }
}

float readTemperature() {
  int reading = analogRead(TMP36_PIN);
  float voltage = reading * 5.0 / 1024.0;
  float temperature = (voltage - 0.5) * 100;
  return temperature;
}

void updateTemperatureArray(float temp) {
  temperatures[tempIndex] = temp;
  tempIndex = (tempIndex + 1) % 10;
}

float getAverageTemperature() {
  float sum = 0;
  for(int i = 0; i < 10; i++) {
    sum += temperatures[i];
  }
  return sum / 10.0;
}

void updateDisplay(float currentTemp) {
  display.clearDisplay();
  
  // Title
  display.setTextSize(1);
  display.setCursor(0, 0);
  display.println("Temperature Monitor");
  
  // Current temperature
  display.setTextSize(2);
  display.setCursor(0, 16);
  display.print(currentTemp, 1);
  display.print("C");
  
  // Average temperature
  display.setTextSize(1);
  display.setCursor(0, 40);
  display.print("Avg: ");
  display.print(getAverageTemperature(), 1);
  display.print("C");
  
  // Status
  display.setCursor(0, 56);
  if(currentTemp > 30) {
    display.print("Status: HOT!");
  } else if(currentTemp < 10) {
    display.print("Status: COLD!");
  } else {
    display.print("Status: Normal");
  }
  
  display.display();
}

void logTemperature(float temp) {
  Serial.print("Temperature: ");
  Serial.print(temp);
  Serial.print("C, Average: ");
  Serial.print(getAverageTemperature());
  Serial.println("C");
}`
	},
	{
		id: 'iot-plant-monitor',
		name: 'IoT Plant Care Monitor',
		description: 'Build an advanced plant monitoring system with WiFi connectivity, mobile alerts, and automated watering.',
		category: 'advanced',
		estimatedTime: '4-6 hours',
		difficulty: 5,
		learningObjectives: [
			'ESP32 WiFi programming',
			'Multiple sensor integration',
			'Web server development',
			'Real-time data transmission',
			'Automated control systems',
			'Mobile app integration'
		],
		tags: ['iot', 'wifi', 'sensors', 'automation', 'plants', 'advanced'],
		components: [
			{
				id: 'esp32',
				name: 'ESP32 DevKit',
				description: 'WiFi/Bluetooth microcontroller',
				price: '$12',
				category: 'microcontroller'
			},
			{
				id: 'soil-moisture',
				name: 'Soil Moisture Sensor',
				description: 'Capacitive soil moisture sensor',
				price: '$6',
				category: 'sensor'
			},
			{
				id: 'dht22',
				name: 'DHT22 Sensor',
				description: 'Temperature and humidity sensor',
				price: '$8',
				category: 'sensor'
			},
			{
				id: 'light-sensor',
				name: 'LDR Light Sensor',
				description: 'Light dependent resistor',
				price: '$2',
				category: 'sensor'
			},
			{
				id: 'water-pump',
				name: 'Mini Water Pump',
				description: '3V DC mini water pump',
				price: '$10',
				category: 'actuator'
			},
			{
				id: 'relay-module',
				name: 'Relay Module',
				description: '5V relay module for pump control',
				price: '$5',
				category: 'control'
			}
		],
		code: `#include <WiFi.h>
#include <WebServer.h>
#include <DHT.h>
#include <ArduinoJson.h>

// WiFi credentials
const char* ssid = "your-wifi-name";
const char* password = "your-wifi-password";

// Pin definitions
#define DHT_PIN 4
#define SOIL_PIN A0
#define LIGHT_PIN A1
#define PUMP_PIN 2
#define DHT_TYPE DHT22

DHT dht(DHT_PIN, DHT_TYPE);
WebServer server(80);

// Sensor data structure
struct SensorData {
  float temperature;
  float humidity;
  int soilMoisture;
  int lightLevel;
  bool pumpStatus;
  unsigned long timestamp;
};

SensorData currentData;
unsigned long lastSensorReading = 0;
const unsigned long sensorInterval = 30000; // Read sensors every 30 seconds

// Plant care thresholds
const int DRY_SOIL_THRESHOLD = 30;
const int WET_SOIL_THRESHOLD = 70;
const int LOW_LIGHT_THRESHOLD = 200;

void setup() {
  Serial.begin(115200);
  
  // Initialize pins
  pinMode(PUMP_PIN, OUTPUT);
  digitalWrite(PUMP_PIN, LOW);
  
  // Initialize DHT sensor
  dht.begin();
  
  // Connect to WiFi
  WiFi.begin(ssid, password);
  Serial.print("Connecting to WiFi");
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println();
  Serial.print("WiFi connected! IP address: ");
  Serial.println(WiFi.localIP());
  
  // Setup web server routes
  server.on("/", handleRoot);
  server.on("/api/data", handleApiData);
  server.on("/api/water", handleWaterPlant);
  server.on("/api/settings", HTTP_POST, handleSettings);
  
  server.begin();
  Serial.println("Web server started");
  Serial.println("Circuitspace IoT Plant Monitor v1.0");
}

void loop() {
  server.handleClient();
  
  if (millis() - lastSensorReading >= sensorInterval) {
    readSensors();
    checkPlantNeeds();
    lastSensorReading = millis();
  }
  
  delay(100);
}

void readSensors() {
  currentData.temperature = dht.readTemperature();
  currentData.humidity = dht.readHumidity();
  currentData.soilMoisture = map(analogRead(SOIL_PIN), 0, 4095, 0, 100);
  currentData.lightLevel = analogRead(LIGHT_PIN);
  currentData.timestamp = millis();
  
  // Log sensor data
  Serial.println("=== Sensor Reading ===");
  Serial.printf("Temperature: %.1f°C\\n", currentData.temperature);
  Serial.printf("Humidity: %.1f%%\\n", currentData.humidity);
  Serial.printf("Soil Moisture: %d%%\\n", currentData.soilMoisture);
  Serial.printf("Light Level: %d\\n", currentData.lightLevel);
  Serial.println("=====================");
}

void checkPlantNeeds() {
  // Check if soil is too dry
  if (currentData.soilMoisture < DRY_SOIL_THRESHOLD) {
    Serial.println("Soil is dry! Auto-watering...");
    waterPlant(3000); // Water for 3 seconds
  }
  
  // Check light levels
  if (currentData.lightLevel < LOW_LIGHT_THRESHOLD) {
    Serial.println("Warning: Low light levels detected!");
  }
  
  // Check temperature/humidity
  if (currentData.temperature > 30) {
    Serial.println("Warning: High temperature!");
  }
  if (currentData.humidity < 40) {
    Serial.println("Warning: Low humidity!");
  }
}

void waterPlant(int duration) {
  currentData.pumpStatus = true;
  digitalWrite(PUMP_PIN, HIGH);
  Serial.printf("Watering plant for %d ms\\n", duration);
  delay(duration);
  digitalWrite(PUMP_PIN, LOW);
  currentData.pumpStatus = false;
  Serial.println("Watering complete");
}

void handleRoot() {
  String html = generateDashboardHTML();
  server.send(200, "text/html", html);
}

void handleApiData() {
  StaticJsonDocument<300> doc;
  doc["temperature"] = currentData.temperature;
  doc["humidity"] = currentData.humidity;
  doc["soilMoisture"] = currentData.soilMoisture;
  doc["lightLevel"] = currentData.lightLevel;
  doc["pumpStatus"] = currentData.pumpStatus;
  doc["timestamp"] = currentData.timestamp;
  
  String json;
  serializeJson(doc, json);
  server.send(200, "application/json", json);
}

void handleWaterPlant() {
  int duration = 2000; // Default 2 seconds
  if (server.hasArg("duration")) {
    duration = server.arg("duration").toInt();
  }
  
  waterPlant(duration);
  server.send(200, "text/plain", "Watering complete");
}

void handleSettings() {
  // Handle settings updates
  server.send(200, "text/plain", "Settings updated");
}

String generateDashboardHTML() {
  String html = R"(
<!DOCTYPE html>
<html>
<head>
  <title>Plant Monitor Dashboard</title>
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <style>
    body { font-family: Arial; margin: 20px; background: #f0f0f0; }
    .container { max-width: 800px; margin: 0 auto; }
    .card { background: white; padding: 20px; margin: 10px 0; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
    .sensor-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; }
    .sensor-value { font-size: 2em; font-weight: bold; color: #00d4aa; }
    .status { padding: 5px 10px; border-radius: 15px; display: inline-block; }
    .status.good { background: #d4edda; color: #155724; }
    .status.warning { background: #fff3cd; color: #856404; }
    .status.critical { background: #f8d7da; color: #721c24; }
    button { background: #00d4aa; color: white; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer; }
    button:hover { background: #00b8d4; }
  </style>
</head>
<body>
  <div class="container">
    <h1>🌱 Plant Care Monitor</h1>
    
    <div class="sensor-grid">
      <div class="card">
        <h3>Temperature</h3>
        <div class="sensor-value")" + String(currentData.temperature, 1) + R"(°C</div>
        <div class="status )" + (currentData.temperature > 30 ? "critical" : "good") + R"(">
          )" + (currentData.temperature > 30 ? "Too Hot!" : "Normal") + R"(
        </div>
      </div>
      
      <div class="card">
        <h3>Humidity</h3>
        <div class="sensor-value")" + String(currentData.humidity, 1) + R"(%</div>
        <div class="status )" + (currentData.humidity < 40 ? "warning" : "good") + R"(">
          )" + (currentData.humidity < 40 ? "Low" : "Normal") + R"(
        </div>
      </div>
      
      <div class="card">
        <h3>Soil Moisture</h3>
        <div class="sensor-value")" + String(currentData.soilMoisture) + R"(%</div>
        <div class="status )" + (currentData.soilMoisture < 30 ? "critical" : currentData.soilMoisture > 70 ? "good" : "warning") + R"(">
          )" + (currentData.soilMoisture < 30 ? "Dry!" : currentData.soilMoisture > 70 ? "Perfect" : "OK") + R"(
        </div>
      </div>
      
      <div class="card">
        <h3>Light Level</h3>
        <div class="sensor-value")" + String(currentData.lightLevel) + R"(</div>
        <div class="status )" + (currentData.lightLevel < 200 ? "warning" : "good") + R"(">
          )" + (currentData.lightLevel < 200 ? "Low Light" : "Good Light") + R"(
        </div>
      </div>
    </div>
    
    <div class="card">
      <h3>Manual Controls</h3>
      <button onclick="waterPlant()">💧 Water Plant</button>
      <button onclick="refreshData()">🔄 Refresh Data</button>
    </div>
  </div>
  
  <script>
    function waterPlant() {
      fetch('/api/water', {method: 'POST'})
        .then(() => alert('Plant watered!'))
        .catch(err => alert('Error: ' + err));
    }
    
    function refreshData() {
      location.reload();
    }
    
    // Auto-refresh every 30 seconds
    setInterval(refreshData, 30000);
  </script>
</body>
</html>
  )";
  return html;
}`
	},
	{
		id: 'home-security-system',
		name: 'Smart Home Security System',
		description: 'Create a comprehensive home security system with motion detection, door/window sensors, and smartphone notifications.',
		category: 'advanced',
		estimatedTime: '5-8 hours',
		difficulty: 4,
		learningObjectives: [
			'Multiple sensor integration',
			'State machine programming',
			'Wireless communication',
			'Security system logic',
			'Alert mechanisms'
		],
		tags: ['security', 'motion', 'sensors', 'alarm', 'iot'],
		components: [
			{
				id: 'esp32',
				name: 'ESP32 DevKit',
				description: 'WiFi/Bluetooth microcontroller',
				price: '$12',
				category: 'microcontroller'
			},
			{
				id: 'pir-sensor',
				name: 'PIR Motion Sensor',
				description: 'Passive infrared motion detector',
				price: '$4',
				category: 'sensor'
			},
			{
				id: 'door-sensor',
				name: 'Magnetic Door Sensor',
				description: 'Reed switch door/window sensor',
				price: '$6',
				category: 'sensor'
			},
			{
				id: 'buzzer',
				name: 'Piezo Buzzer',
				description: 'Active buzzer for alarms',
				price: '$3',
				category: 'output'
			},
			{
				id: 'oled-display',
				name: 'OLED Display',
				description: '0.96" 128x64 I2C OLED',
				price: '$8',
				category: 'output'
			}
		],
		code: `// Smart Home Security System Code would go here...`
	}
];

export function getTemplateById(id: string): ProjectTemplate | undefined {
	return projectTemplates.find(template => template.id === id);
}

export function getTemplatesByCategory(category: 'beginner' | 'intermediate' | 'advanced'): ProjectTemplate[] {
	return projectTemplates.filter(template => template.category === category);
}

export function getTemplatesByTag(tag: string): ProjectTemplate[] {
	return projectTemplates.filter(template => template.tags.includes(tag));
}

export function searchTemplates(query: string): ProjectTemplate[] {
	const searchTerm = query.toLowerCase();
	return projectTemplates.filter(template => 
		template.name.toLowerCase().includes(searchTerm) ||
		template.description.toLowerCase().includes(searchTerm) ||
		template.tags.some(tag => tag.toLowerCase().includes(searchTerm))
	);
}
