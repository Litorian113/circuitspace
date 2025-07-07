import { writable } from 'svelte/store';
import { browser } from '$app/environment';

export interface UserProject {
	id: string;
	name: string;
	description: string;
	category: 'beginner' | 'intermediate' | 'advanced';
	tags: string[];
	difficulty: number; // 1-5 stars
	components: string[];
	code: string;
	createdAt: Date;
	updatedAt: Date;
	imageUrl?: string;
	isTemplate: boolean; // false for user projects, true for templates
	state: 'in-progress' | 'done' | 'paused';
	estimatedTime: string;
	learningGoals: string[];
	componentsCount: number;
}

// User projects data
const userProjectsData: UserProject[] = [
	{
		id: 'user-project-1',
		name: 'Smart LED Controller',
		description: 'An intelligent LED strip controller with multiple lighting modes, remote control capabilities and smartphone integration.',
		category: 'intermediate',
		tags: ['led', 'lights', 'arduino', 'remote-control'],
		difficulty: 3,
		components: ['Arduino Nano', 'WS2812B LED Strip', 'IR Receiver', 'Resistors', 'Capacitor'],
		code: `#include <FastLED.h>
#include <IRremote.h>

#define LED_PIN 6
#define NUM_LEDS 60
#define IR_PIN 2

CRGB leds[NUM_LEDS];
IRrecv irrecv(IR_PIN);
decode_results results;

void setup() {
  FastLED.addLeds<WS2812B, LED_PIN, GRB>(leds, NUM_LEDS);
  FastLED.setBrightness(100);
  irrecv.enableIRIn();
  Serial.begin(9600);
}

void loop() {
  if (irrecv.decode(&results)) {
    handleRemoteControl(results.value);
    irrecv.resume();
  }
  
  // Run current lighting mode
  runLightingMode();
  FastLED.show();
  delay(50);
}`,
		createdAt: new Date('2024-12-10'),
		updatedAt: new Date('2024-12-28'),
		imageUrl: '/myProjectsIMG/Project1.png',
		isTemplate: false,
		state: 'done',
		estimatedTime: '2-3 hours',
		learningGoals: [
			'Working with addressable LED strips',
			'Arduino programming basics',
			'Smartphone app communication'
		],
		componentsCount: 5
	},
	{
		id: 'user-project-2',
		name: 'Smart Plant Monitor',
		description: 'An automated plant monitoring system that tracks soil moisture, temperature, and light levels with smartphone notifications.',
		category: 'intermediate',
		tags: ['plants', 'sensors', 'automation', 'monitoring'],
		difficulty: 3,
		components: ['Arduino Uno', 'Soil Moisture Sensor', 'DHT22', 'LDR', 'WiFi Module'],
		code: `#include <WiFi.h>
#include <DHT.h>

#define DHT_PIN 2
#define MOISTURE_PIN A0
#define LDR_PIN A1

DHT dht(DHT_PIN, DHT22);

void setup() {
  Serial.begin(9600);
  dht.begin();
  
  // Connect to WiFi
  WiFi.begin("SSID", "PASSWORD");
  while (WiFi.status() != WL_CONNECTED) {
    delay(1000);
    Serial.println("Connecting to WiFi...");
  }
}

void loop() {
  float temperature = dht.readTemperature();
  float humidity = dht.readHumidity();
  int moisture = analogRead(MOISTURE_PIN);
  int light = analogRead(LDR_PIN);
  
  // Send data to app
  sendSensorData(temperature, humidity, moisture, light);
  
  delay(30000); // Check every 30 seconds
}`,
		createdAt: new Date('2024-12-05'),
		updatedAt: new Date('2024-12-25'),
		imageUrl: '/myProjectsIMG/Project2.png',
		isTemplate: false,
		state: 'done',
		estimatedTime: '3-4 hours',
		learningGoals: [
			'Sensor integration and calibration',
			'WiFi communication protocols',
			'Data logging and analysis'
		],
		componentsCount: 5
	},
	{
		id: 'user-project-3',
		name: 'Home Security System',
		description: 'A comprehensive home security system with motion detection, door sensors, and real-time alerts to your smartphone.',
		category: 'advanced',
		tags: ['security', 'sensors', 'alerts', 'home-automation'],
		difficulty: 4,
		components: ['Arduino Mega', 'PIR Sensor', 'Reed Switch', 'GSM Module', 'Buzzer', 'LCD Display'],
		code: `#include <LiquidCrystal.h>
#include <SoftwareSerial.h>

#define PIR_PIN 2
#define DOOR_PIN 3
#define BUZZER_PIN 4

LiquidCrystal lcd(12, 11, 5, 4, 3, 2);
SoftwareSerial gsm(7, 8);

bool systemArmed = false;
bool alertActive = false;

void setup() {
  Serial.begin(9600);
  lcd.begin(16, 2);
  gsm.begin(9600);
  
  pinMode(PIR_PIN, INPUT);
  pinMode(DOOR_PIN, INPUT_PULLUP);
  pinMode(BUZZER_PIN, OUTPUT);
  
  lcd.print("Security System");
  lcd.setCursor(0, 1);
  lcd.print("Ready");
}

void loop() {
  if (systemArmed) {
    checkSensors();
  }
  
  handleCommands();
  updateDisplay();
  delay(100);
}`,
		createdAt: new Date('2024-11-20'),
		updatedAt: new Date('2024-12-30'),
		imageUrl: '/myProjectsIMG/Project3.png',
		isTemplate: false,
		state: 'in-progress',
		estimatedTime: '4-6 hours',
		learningGoals: [
			'Multi-sensor integration',
			'GSM communication',
			'Security system design',
			'Real-time alerting'
		],
		componentsCount: 6
	}
];

// Create writable store
function createUserProjectsStore() {
	const { subscribe, set, update } = writable<UserProject[]>(userProjectsData);

	return {
		subscribe,
		set,
		update,
		// Add a new project
		addProject: (project: Omit<UserProject, 'id' | 'createdAt' | 'updatedAt'>) => {
			const newProject: UserProject = {
				...project,
				id: `user-project-${Date.now()}`,
				createdAt: new Date(),
				updatedAt: new Date()
			};
			update(projects => [...projects, newProject]);
		},
		// Update existing project
		updateProject: (id: string, updates: Partial<UserProject>) => {
			update(projects => projects.map(project => 
				project.id === id 
					? { ...project, ...updates, updatedAt: new Date() }
					: project
			));
		},
		// Delete project
		deleteProject: (id: string) => {
			update(projects => projects.filter(project => project.id !== id));
		},
		// Get project by ID
		getProject: (id: string) => {
			let foundProject: UserProject | undefined;
			subscribe(projects => {
				foundProject = projects.find(project => project.id === id);
			})();
			return foundProject;
		}
	};
}

export const userProjects = createUserProjectsStore();
