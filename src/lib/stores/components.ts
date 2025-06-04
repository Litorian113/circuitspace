import { writable } from 'svelte/store';

export interface ComponentQuiz {
	question: string;
	options: string[];
	correctAnswer: number;
	explanation: string;
}

export interface ComponentDetails {
	id: string;
	name: string;
	category: string;
	difficulty: 'beginner' | 'intermediate' | 'advanced';
	image: string;
	description: string;
	detailedDescription: string;
	specifications: Record<string, string>;
	pinouts?: string[];
	commonUses: string[];
	workingPrinciple: string;
	safetyTips: string[];
	quiz: ComponentQuiz[];
	level: number;
	experience: number;
	maxLevel: 5;
	quizzesTaken: number;
	maxQuizzesPerDay: 5;
	lastQuizDate?: Date;
}

export interface ComponentProgress {
	[componentId: string]: {
		level: number;
		experience: number;
		quizzesTaken: number;
		lastQuizDate?: Date;
	};
}

export const componentLibrary: ComponentDetails[] = [
	{
		id: '5v-motor',
		name: '5V DC Motor',
		category: 'Actuator',
		difficulty: 'intermediate',
		image: '/components/5vMotor.png',
		description: 'A small direct current motor that converts electrical energy into mechanical rotation.',
		detailedDescription: 'DC motors are fundamental actuators in electronics that convert electrical energy into rotational mechanical energy. They work on the principle of electromagnetic induction and are widely used in robotics, automation, and various mechanical applications.',
		specifications: {
			'Voltage': '5V DC',
			'Current': '100-200mA',
			'RPM': '3000-6000',
			'Torque': '0.5-1.0 kg⋅cm',
			'Size': '25mm diameter'
		},
		pinouts: ['Positive (+)', 'Negative (-)'],
		commonUses: [
			'Robot wheels and movement',
			'Fan systems',
			'Conveyor belts',
			'Rotating displays',
			'Camera pan/tilt mechanisms'
		],
		workingPrinciple: 'When current flows through the motor windings in a magnetic field, it creates a force that causes the rotor to spin. The direction of rotation can be controlled by reversing the polarity of the applied voltage.',
		safetyTips: [
			'Always use a driver circuit - never connect directly to microcontroller pins',
			'Add flyback diodes to protect against voltage spikes',
			'Ensure adequate power supply capacity',
			'Check current requirements to avoid overheating'
		],
		quiz: [
			{
				question: 'What is the main function of a DC motor?',
				options: [
					'Convert light to electricity',
					'Convert electrical energy to mechanical rotation',
					'Store electrical energy',
					'Amplify electrical signals'
				],
				correctAnswer: 1,
				explanation: 'DC motors convert electrical energy into mechanical rotational energy, making them perfect for creating movement in projects.'
			},
			{
				question: 'Why should you never connect a motor directly to a microcontroller pin?',
				options: [
					'It will work fine',
					'The motor might run backwards',
					'The current draw can damage the microcontroller',
					'The motor will run too fast'
				],
				correctAnswer: 2,
				explanation: 'Motors draw much more current than microcontroller pins can safely provide. Always use a motor driver or transistor circuit.'
			},
			{
				question: 'What component should you add to protect against voltage spikes from motors?',
				options: [
					'Resistor',
					'Capacitor',
					'Flyback diode',
					'LED'
				],
				correctAnswer: 2,
				explanation: 'Flyback diodes protect circuits from voltage spikes that occur when the motor stops, as the magnetic field collapses.'
			},
			{
				question: 'How can you control the direction of a DC motor?',
				options: [
					'Change the voltage level',
					'Reverse the polarity',
					'Add more current',
					'Use PWM only'
				],
				correctAnswer: 1,
				explanation: 'Reversing the polarity (switching positive and negative connections) changes the direction of current flow and thus the rotation direction.'
			},
			{
				question: 'What does PWM control in a DC motor?',
				options: [
					'Direction only',
					'Speed only',
					'Color',
					'Temperature'
				],
				correctAnswer: 1,
				explanation: 'PWM (Pulse Width Modulation) controls the effective voltage delivered to the motor, which controls its speed.'
			}
		],
		level: 1,
		experience: 0,
		maxLevel: 5,
		quizzesTaken: 0,
		maxQuizzesPerDay: 5
	},
	{
		id: 'arduino-micro',
		name: 'Arduino Micro',
		category: 'Microcontroller',
		difficulty: 'advanced',
		image: '/components/arduinomicro.png',
		description: 'A compact microcontroller board based on the ATmega32U4 with built-in USB connectivity.',
		detailedDescription: 'The Arduino Micro is a small, complete, and breadboard-friendly board based on the ATmega32U4. It has built-in USB communication, eliminating the need for a secondary processor. This makes it ideal for projects requiring direct USB communication or HID emulation.',
		specifications: {
			'Microcontroller': 'ATmega32U4',
			'Operating Voltage': '5V',
			'Input Voltage': '7-12V',
			'Digital I/O Pins': '20',
			'PWM Channels': '7',
			'Analog Input Pins': '12',
			'Flash Memory': '32KB',
			'SRAM': '2.5KB',
			'EEPROM': '1KB',
			'Clock Speed': '16MHz'
		},
		pinouts: [
			'Digital pins 0-13',
			'Analog pins A0-A5',
			'Power pins (5V, 3.3V, GND)',
			'USB connector',
			'Reset button'
		],
		commonUses: [
			'USB HID devices (keyboard, mouse emulation)',
			'Data logging projects',
			'Sensor monitoring systems',
			'Interactive art installations',
			'Educational programming projects'
		],
		workingPrinciple: 'The Arduino Micro runs programs stored in its flash memory. It can read digital and analog inputs, control outputs, communicate via USB, and execute code written in the Arduino IDE. The ATmega32U4 includes native USB support.',
		safetyTips: [
			'Never exceed 5V on input pins',
			'Limit current draw from pins to 20mA each',
			'Use proper voltage dividers for higher voltage inputs',
			'Avoid short circuits between power and ground',
			'Use decoupling capacitors for stable power supply'
		],
		quiz: [
			{
				question: 'What makes the Arduino Micro special compared to other Arduino boards?',
				options: [
					'It\'s the fastest Arduino',
					'It has built-in WiFi',
					'It has native USB connectivity',
					'It runs on 3.3V'
				],
				correctAnswer: 2,
				explanation: 'The Arduino Micro has a built-in USB controller (ATmega32U4), allowing it to appear as a USB device without additional chips.'
			},
			{
				question: 'How many digital I/O pins does the Arduino Micro have?',
				options: ['14', '16', '18', '20'],
				correctAnswer: 3,
				explanation: 'The Arduino Micro has 20 digital I/O pins, more than the standard Arduino Uno which has 14.'
			},
			{
				question: 'What is the maximum safe current you should draw from a single Arduino pin?',
				options: ['10mA', '20mA', '40mA', '100mA'],
				correctAnswer: 1,
				explanation: 'Each Arduino pin can safely provide up to 20mA of current. Exceeding this can damage the microcontroller.'
			},
			{
				question: 'What voltage do the Arduino Micro digital pins operate at?',
				options: ['3.3V', '5V', '12V', '24V'],
				correctAnswer: 1,
				explanation: 'Arduino Micro digital pins operate at 5V logic levels for both input and output operations.'
			},
			{
				question: 'Which microcontroller chip powers the Arduino Micro?',
				options: ['ATmega328P', 'ATmega32U4', 'ESP8266', 'STM32'],
				correctAnswer: 1,
				explanation: 'The Arduino Micro uses the ATmega32U4 microcontroller, which includes native USB support.'
			}
		],
		level: 1,
		experience: 0,
		maxLevel: 5,
		quizzesTaken: 0,
		maxQuizzesPerDay: 5
	},
	{
		id: 'breadboard',
		name: 'Breadboard',
		category: 'Prototyping',
		difficulty: 'beginner',
		image: '/components/breadboard.png',
		description: 'A solderless construction base used for building temporary electronic circuits and prototypes.',
		detailedDescription: 'A breadboard is an essential tool for electronics prototyping that allows you to build circuits without soldering. It consists of a plastic board with numerous holes that are internally connected in specific patterns, enabling easy insertion and connection of electronic components.',
		specifications: {
			'Tie Points': '400-830 points',
			'Contact Rating': '1A at 5V',
			'Material': 'ABS Plastic',
			'Contact Material': 'Phosphor Bronze',
			'Standard Size': '165 x 55mm',
			'Hole Spacing': '2.54mm (0.1")'
		},
		pinouts: [
			'Power rails (red/black strips)',
			'Terminal strips (lettered rows)',
			'Central divider channel'
		],
		commonUses: [
			'Circuit prototyping and testing',
			'Educational electronics learning',
			'Temporary circuit assembly',
			'Component testing and debugging',
			'Arduino and microcontroller projects'
		],
		workingPrinciple: 'Breadboards have internal metal strips that connect holes in specific patterns. The power rails run along the sides, while the terminal strips connect 5 holes horizontally. The central channel separates the two sides, perfect for placing ICs.',
		safetyTips: [
			'Keep voltage under 15V for safety',
			'Don\'t exceed 1A current through connections',
			'Insert components gently to avoid damage',
			'Keep the board clean and free of debris',
			'Double-check connections before applying power'
		],
		quiz: [
			{
				question: 'How are the holes in a breadboard\'s terminal strips connected?',
				options: [
					'All holes are connected',
					'Holes are connected vertically in columns',
					'Holes are connected horizontally in rows of 5',
					'No holes are connected'
				],
				correctAnswer: 2,
				explanation: 'In terminal strips, holes are connected horizontally in groups of 5, allowing easy component connections.'
			},
			{
				question: 'What is the purpose of the central channel in a breadboard?',
				options: [
					'Decoration only',
					'To separate the two sides and place ICs',
					'For ventilation',
					'To make it easier to break'
				],
				correctAnswer: 1,
				explanation: 'The central channel separates the two sides and is specifically designed to accommodate IC chips spanning across it.'
			},
			{
				question: 'What do the power rails (red and black strips) typically carry?',
				options: [
					'Data signals',
					'Positive and negative power supply',
					'Ground only',
					'Clock signals'
				],
				correctAnswer: 1,
				explanation: 'Power rails carry the positive power supply (Vcc) and ground (GND) to distribute power across your circuit.'
			},
			{
				question: 'What is the standard hole spacing on a breadboard?',
				options: ['1.27mm', '2.54mm', '5.08mm', '10.16mm'],
				correctAnswer: 1,
				explanation: '2.54mm (0.1 inch) is the standard spacing, matching the pin spacing of most electronic components.'
			},
			{
				question: 'What material are breadboard contacts typically made of?',
				options: [
					'Copper',
					'Aluminum',
					'Phosphor Bronze',
					'Gold'
				],
				correctAnswer: 2,
				explanation: 'Phosphor bronze provides good electrical conductivity and spring properties for reliable connections.'
			}
		],
		level: 1,
		experience: 0,
		maxLevel: 5,
		quizzesTaken: 0,
		maxQuizzesPerDay: 5
	},
	{
		id: 'led',
		name: 'LED (Light Emitting Diode)',
		category: 'Output',
		difficulty: 'beginner',
		image: '/components/leuchtdiode.png',
		description: 'A semiconductor device that emits light when current flows through it in the forward direction.',
		detailedDescription: 'LEDs are semiconductor devices that emit light through electroluminescence. They are highly efficient, long-lasting, and available in many colors. LEDs have polarity and require current limiting resistors to prevent damage.',
		specifications: {
			'Forward Voltage': '1.8-3.3V (color dependent)',
			'Forward Current': '20mA (typical)',
			'Luminous Intensity': '20-2000mcd',
			'Viewing Angle': '30-120 degrees',
			'Lifespan': '25,000-50,000 hours',
			'Colors': 'Red, Green, Blue, Yellow, White, RGB'
		},
		pinouts: ['Anode (+, longer leg)', 'Cathode (-, shorter leg, flat side)'],
		commonUses: [
			'Status indicators',
			'Display backlighting',
			'Decorative lighting',
			'Signal lights',
			'Seven-segment displays',
			'Digital clocks and counters'
		],
		workingPrinciple: 'When forward voltage is applied across the LED, electrons and holes recombine in the semiconductor junction, releasing energy as photons (light). Different semiconductor materials produce different colors.',
		safetyTips: [
			'Always use current limiting resistors',
			'Observe correct polarity (anode to positive)',
			'Don\'t exceed maximum forward current (usually 20mA)',
			'Use appropriate voltage levels',
			'Handle with care - avoid static discharge'
		],
		quiz: [
			{
				question: 'Which leg of an LED is typically longer?',
				options: [
					'Cathode (negative)',
					'Anode (positive)',
					'Both are the same length',
					'It varies by color'
				],
				correctAnswer: 1,
				explanation: 'The anode (positive leg) is typically longer to help identify the correct polarity when connecting the LED.'
			},
			{
				question: 'Why do LEDs need current limiting resistors?',
				options: [
					'To make them brighter',
					'To change their color',
					'To prevent excessive current and damage',
					'To make them blink'
				],
				correctAnswer: 2,
				explanation: 'LEDs have very low internal resistance and will draw excessive current without a limiting resistor, causing damage.'
			},
			{
				question: 'What happens if you connect an LED backwards?',
				options: [
					'It will be brighter',
					'It will not light up',
					'It will change color',
					'It will explode'
				],
				correctAnswer: 1,
				explanation: 'LEDs only conduct (and emit light) when forward biased. Reverse connection blocks current flow.'
			},
			{
				question: 'What determines the color of an LED?',
				options: [
					'The applied voltage',
					'The current through it',
					'The semiconductor material',
					'The resistor value'
				],
				correctAnswer: 2,
				explanation: 'Different semiconductor materials have different energy band gaps, which determine the color of emitted light.'
			},
			{
				question: 'What is the typical forward current rating for standard LEDs?',
				options: ['5mA', '20mA', '50mA', '100mA'],
				correctAnswer: 1,
				explanation: 'Most standard LEDs are rated for 20mA forward current for optimal brightness and lifespan.'
			}
		],
		level: 1,
		experience: 0,
		maxLevel: 5,
		quizzesTaken: 0,
		maxQuizzesPerDay: 5
	},
	{
		id: 'jumper-cable',
		name: 'Jumper Cable',
		category: 'Connection',
		difficulty: 'beginner',
		image: '/components/jumpercable.png',
		description: 'Flexible wires with connectors used to establish electrical connections between components.',
		detailedDescription: 'Jumper cables are essential for connecting electronic components in breadboard circuits and prototypes. They come in various types: male-to-male, male-to-female, and female-to-female connectors, each serving different connection needs.',
		specifications: {
			'Wire Gauge': '22-26 AWG',
			'Length': '10-30cm typical',
			'Current Rating': '1-3A',
			'Voltage Rating': '300V',
			'Connector Types': 'Male/Female pins',
			'Colors': 'Multiple (for organization)'
		},
		pinouts: ['Pin connectors (male or female)', 'Wire conductor', 'Insulation jacket'],
		commonUses: [
			'Breadboard connections',
			'Arduino to component wiring',
			'Prototype circuit assembly',
			'Sensor connections',
			'Module interconnections',
			'Testing and debugging circuits'
		],
		workingPrinciple: 'Jumper cables provide a flexible electrical path between two points. The metal pins make contact with component pins or breadboard holes, while the wire carries current. Good contact and proper gauge selection ensure reliable connections.',
		safetyTips: [
			'Check wire gauge for current requirements',
			'Ensure secure connections to prevent intermittent faults',
			'Use appropriate colors for power (red) and ground (black)',
			'Inspect for damage before use',
			'Keep connections organized to avoid short circuits'
		],
		quiz: [
			{
				question: 'What does "male-to-female" mean for jumper cables?',
				options: [
					'One end has a pin, the other has a socket',
					'Different colors',
					'Different lengths',
					'Different materials'
				],
				correctAnswer: 0,
				explanation: 'Male connectors have protruding pins, while female connectors have sockets that accept pins.'
			},
			{
				question: 'Why is it important to use different colored jumper cables?',
				options: [
					'They conduct electricity better',
					'For circuit organization and safety',
					'They are cheaper',
					'They last longer'
				],
				correctAnswer: 1,
				explanation: 'Different colors help organize circuits and prevent mistakes, especially for power (red) and ground (black) connections.'
			},
			{
				question: 'What happens if you use a jumper cable with insufficient current rating?',
				options: [
					'Nothing, it will work fine',
					'The cable may overheat and fail',
					'It will work faster',
					'It will change color'
				],
				correctAnswer: 1,
				explanation: 'Using cables with insufficient current rating can cause overheating, voltage drops, and potential fire hazards.'
			},
			{
				question: 'Which type of jumper cable would you use to connect an Arduino pin to a breadboard?',
				options: [
					'Male-to-male',
					'Female-to-male',
					'Female-to-female',
					'Any type works'
				],
				correctAnswer: 1,
				explanation: 'Arduino pins are male, breadboard holes are effectively female, so you need male-to-male or female-to-male cables.'
			},
			{
				question: 'What does AWG stand for in wire specifications?',
				options: [
					'Advanced Wire Gauge',
					'American Wire Gauge',
					'Automatic Wire Generator',
					'Amplified Wire Grade'
				],
				correctAnswer: 1,
				explanation: 'AWG (American Wire Gauge) is a standard system for denoting wire diameter and current carrying capacity.'
			}
		],
		level: 1,
		experience: 0,
		maxLevel: 5,
		quizzesTaken: 0,
		maxQuizzesPerDay: 5
	},
	{
		id: 'potentiometer',
		name: 'Potentiometer',
		category: 'Input',
		difficulty: 'intermediate',
		image: '/components/poti.png',
		description: 'A variable resistor with three terminals that can be used to control voltage or resistance.',
		detailedDescription: 'A potentiometer is a manually adjustable variable resistor with three terminals. It consists of a resistive element and a sliding contact (wiper) that moves along the element. This creates a voltage divider that can provide variable output voltage.',
		specifications: {
			'Resistance Range': '1kΩ - 1MΩ',
			'Power Rating': '0.125W - 2W',
			'Rotation': '270° - 300°',
			'Tolerance': '±20%',
			'Taper': 'Linear or Logarithmic',
			'Terminals': '3 (two ends + wiper)'
		},
		pinouts: ['Terminal 1 (one end)', 'Terminal 2 (wiper/center)', 'Terminal 3 (other end)'],
		commonUses: [
			'Volume controls',
			'Brightness adjustment',
			'Motor speed control',
			'Analog input for microcontrollers',
			'Voltage divider circuits',
			'Calibration adjustments'
		],
		workingPrinciple: 'The potentiometer works as a voltage divider. As you turn the knob, the wiper moves along the resistive track, changing the ratio of resistance on either side. This creates a variable voltage output proportional to the wiper position.',
		safetyTips: [
			'Don\'t exceed power rating to prevent overheating',
			'Use appropriate voltage levels',
			'Handle gently - the wiper can wear out',
			'Clean contacts if experiencing crackling',
			'Use decoupling capacitors for stable readings'
		],
		quiz: [
			{
				question: 'How many terminals does a potentiometer have?',
				options: ['2', '3', '4', '5'],
				correctAnswer: 1,
				explanation: 'Potentiometers have three terminals: two for the ends of the resistive element and one for the wiper (center tap).'
			},
			{
				question: 'What happens when you turn a potentiometer knob?',
				options: [
					'The total resistance changes',
					'The wiper position changes along the resistive track',
					'The voltage supply changes',
					'The current increases'
				],
				correctAnswer: 1,
				explanation: 'Turning the knob moves the wiper along the resistive track, changing the voltage division ratio.'
			},
			{
				question: 'In a voltage divider configuration, which terminal provides the variable output?',
				options: [
					'Terminal 1',
					'Terminal 2 (wiper)',
					'Terminal 3',
					'Any terminal'
				],
				correctAnswer: 1,
				explanation: 'The wiper (center terminal) provides the variable voltage output in a voltage divider configuration.'
			},
			{
				question: 'What does "linear taper" mean in a potentiometer?',
				options: [
					'The shape is linear',
					'Resistance changes proportionally with rotation',
					'It only works with DC',
					'It has three terminals'
				],
				correctAnswer: 1,
				explanation: 'Linear taper means the resistance changes proportionally with the amount of rotation, providing uniform control.'
			},
			{
				question: 'How should you connect a potentiometer to read analog values with Arduino?',
				options: [
					'Connect all three terminals to Arduino pins',
					'Connect outer terminals to 5V and GND, wiper to analog pin',
					'Connect only the wiper to Arduino',
					'Connect it in series with LED'
				],
				correctAnswer: 1,
				explanation: 'For analog reading, connect the outer terminals to power and ground, and the wiper to an analog input pin.'
			}
		],
		level: 1,
		experience: 0,
		maxLevel: 5,
		quizzesTaken: 0,
		maxQuizzesPerDay: 5
	},
	{
		id: 'pushbutton',
		name: 'Push Button',
		category: 'Input',
		difficulty: 'beginner',
		image: '/components/pushbutton.png',
		description: 'A momentary switch that makes or breaks a connection when pressed and returns to its default state when released.',
		detailedDescription: 'Push buttons are momentary switches that temporarily change their state when pressed. They are fundamental input devices in electronics, providing user interface capabilities for controlling circuits and microcontrollers. Most push buttons have two pairs of terminals for reliable connections.',
		specifications: {
			'Contact Rating': '50mA to 1A',
			'Voltage Rating': '12V to 250V',
			'Operating Force': '1-5N',
			'Contact Type': 'SPST or SPDT',
			'Terminals': '4 (two pairs)',
			'Life Cycles': '100,000 - 1,000,000'
		},
		pinouts: ['Terminal pair 1 (normally open)', 'Terminal pair 2 (connected to pair 1)'],
		commonUses: [
			'User input interfaces',
			'Reset buttons',
			'Menu navigation',
			'Emergency stops',
			'Mode selection',
			'Digital input for microcontrollers'
		],
		workingPrinciple: 'When pressed, the button\'s internal contacts close, completing the circuit. When released, spring mechanisms return the contacts to their open state. The button typically has four terminals arranged in two pairs for reliable connection.',
		safetyTips: [
			'Use pull-up or pull-down resistors for clean digital signals',
			'Implement debouncing in software or hardware',
			'Don\'t exceed current and voltage ratings',
			'Consider switch bounce in timing-critical applications',
			'Use appropriate mounting to prevent mechanical stress'
		],
		quiz: [
			{
				question: 'What type of switch is a typical push button?',
				options: [
					'Latching switch',
					'Momentary switch',
					'Toggle switch',
					'Rotary switch'
				],
				correctAnswer: 1,
				explanation: 'Push buttons are momentary switches - they only maintain their pressed state while being actively pressed.'
			},
			{
				question: 'Why do push buttons typically have 4 terminals?',
				options: [
					'For different voltages',
					'For LED indicators',
					'For reliable connection (two pairs)',
					'For multiple functions'
				],
				correctAnswer: 2,
				explanation: 'Four terminals arranged in two pairs provide redundant connections for reliability and easier breadboard mounting.'
			},
			{
				question: 'What is "switch bounce" in push buttons?',
				options: [
					'The button physically bouncing',
					'Multiple rapid on/off signals when pressed',
					'The button not working',
					'Electrical noise'
				],
				correctAnswer: 1,
				explanation: 'Switch bounce refers to the rapid making and breaking of contact that occurs when the button is pressed, creating multiple signals.'
			},
			{
				question: 'Why are pull-up resistors important with push buttons?',
				options: [
					'To make the button brighter',
					'To provide a defined logic level when not pressed',
					'To increase current',
					'To change the button color'
				],
				correctAnswer: 1,
				explanation: 'Pull-up resistors ensure the input reads a defined HIGH state when the button is not pressed, preventing floating inputs.'
			},
			{
				question: 'What is debouncing in the context of push buttons?',
				options: [
					'Cleaning the button',
					'Filtering out multiple rapid signals from switch bounce',
					'Making the button quieter',
					'Increasing button sensitivity'
				],
				correctAnswer: 1,
				explanation: 'Debouncing is the process of filtering out the rapid on/off signals caused by mechanical switch bounce to get clean digital signals.'
			}
		],
		level: 1,
		experience: 0,
		maxLevel: 5,
		quizzesTaken: 0,
		maxQuizzesPerDay: 5
	},
	{
		id: 'resistor',
		name: 'Resistor',
		category: 'Passive',
		difficulty: 'beginner',
		image: '/components/widerstand.png',
		description: 'A passive component that opposes the flow of electric current, creating voltage drops and limiting current.',
		detailedDescription: 'Resistors are fundamental passive components that resist the flow of electric current. They are used to control voltage and current levels, divide voltages, and protect other components. Resistor values are indicated by color bands and follow Ohm\'s law (V = I × R).',
		specifications: {
			'Resistance': '1Ω to 10MΩ+',
			'Power Rating': '1/8W to 5W+',
			'Tolerance': '±1% to ±20%',
			'Temperature Coefficient': '±50 to ±500 ppm/°C',
			'Material': 'Carbon, Metal film, Wire wound',
			'Color Bands': '4, 5, or 6 band coding'
		},
		pinouts: ['Terminal 1', 'Terminal 2 (non-polarized)'],
		commonUses: [
			'Current limiting (LED protection)',
			'Voltage dividers',
			'Pull-up and pull-down resistors',
			'Biasing circuits',
			'Feedback networks',
			'Signal conditioning'
		],
		workingPrinciple: 'Resistors work by converting electrical energy into heat. The resistance value determines how much current will flow for a given voltage, following Ohm\'s law. Higher resistance means less current flow.',
		safetyTips: [
			'Choose appropriate power rating to prevent overheating',
			'Verify resistance value with multimeter if unsure',
			'Allow for tolerance in precision circuits',
			'Use heat sinks for high-power applications',
			'Consider temperature effects on resistance'
		],
		quiz: [
			{
				question: 'What does Ohm\'s law state?',
				options: [
					'V = I + R',
					'V = I × R',
					'V = I / R',
					'V = R / I'
				],
				correctAnswer: 1,
				explanation: 'Ohm\'s law states that Voltage equals Current times Resistance (V = I × R).'
			},
			{
				question: 'What happens if you exceed a resistor\'s power rating?',
				options: [
					'It works more efficiently',
					'It may overheat and fail',
					'It changes resistance value',
					'Nothing happens'
				],
				correctAnswer: 1,
				explanation: 'Exceeding the power rating causes the resistor to overheat, potentially changing value or failing completely.'
			},
			{
				question: 'What do the color bands on a resistor indicate?',
				options: [
					'Temperature rating',
					'Power rating',
					'Resistance value and tolerance',
					'Manufacturing date'
				],
				correctAnswer: 2,
				explanation: 'Color bands indicate the resistance value, multiplier, and tolerance of the resistor using a standardized color code.'
			},
			{
				question: 'In an LED circuit, what is the primary purpose of a resistor?',
				options: [
					'To make the LED brighter',
					'To limit current and prevent LED damage',
					'To change LED color',
					'To store energy'
				],
				correctAnswer: 1,
				explanation: 'Current-limiting resistors prevent excessive current that would damage LEDs, ensuring safe operation.'
			},
			{
				question: 'What does a 5% tolerance rating mean?',
				options: [
					'The resistor works 5% of the time',
					'The actual resistance can vary ±5% from the marked value',
					'It can handle 5% more power',
					'It lasts 5% longer'
				],
				correctAnswer: 1,
				explanation: 'Tolerance indicates how much the actual resistance can vary from the marked value - ±5% is typical for standard resistors.'
			}
		],
		level: 1,
		experience: 0,
		maxLevel: 5,
		quizzesTaken: 0,
		maxQuizzesPerDay: 5
	},
	{
		id: 'leonardo-keyestudio',
		name: 'Arduino Leonardo (Keyestudio)',
		category: 'Microcontroller',
		difficulty: 'advanced',
		image: '/components/leonardoKeyestudio.png',
		description: 'A versatile microcontroller board based on the ATmega32U4 with built-in USB communication.',
		detailedDescription: 'The Arduino Leonardo is a microcontroller board based on the ATmega32U4. It has 20 digital input/output pins, a 16 MHz crystal oscillator, a micro USB connection, a power jack, an ICSP header, and a reset button. Unlike other Arduino boards, the Leonardo can act as a USB device, making it ideal for projects that need to emulate keyboards, mice, or other USB devices.',
		specifications: {
			'Microcontroller': 'ATmega32U4',
			'Operating Voltage': '5V',
			'Input Voltage': '7-12V (recommended)',
			'Digital I/O Pins': '20',
			'PWM Channels': '7',
			'Analog Input Pins': '12',
			'DC Current per I/O Pin': '20mA',
			'DC Current for 3.3V Pin': '50mA',
			'Flash Memory': '32KB (4KB used by bootloader)',
			'SRAM': '2.5KB',
			'EEPROM': '1KB',
			'Clock Speed': '16MHz',
			'USB': 'Micro USB',
			'Dimensions': '68.6 x 53.4mm'
		},
		pinouts: [
			'Digital pins 0-13',
			'Analog pins A0-A5',
			'Power pins (5V, 3.3V, GND, Vin)',
			'ICSP header',
			'Reset button',
			'USB connector'
		],
		commonUses: [
			'USB HID devices (keyboard/mouse emulation)',
			'IoT projects with wireless communication',
			'Sensor data logging and monitoring',
			'Home automation systems',
			'Interactive art installations',
			'Educational programming projects',
			'Prototype development for commercial products'
		],
		workingPrinciple: 'The Leonardo runs programs stored in its flash memory. It can communicate directly with a computer via USB without needing an additional USB-to-serial chip. The ATmega32U4 has built-in USB communication, allowing it to appear as various USB devices like keyboards, mice, or serial ports.',
		safetyTips: [
			'Never exceed the input voltage range of 7-12V',
			'Avoid short circuits between power pins',
			'Use appropriate current limiting for LEDs and other components',
			'Be careful with the micro USB connector - it can break with excessive force',
			'Always disconnect power before wiring connections',
			'Use pull-up resistors for reliable digital inputs'
		],
		quiz: [
			{
				question: 'What makes the Arduino Leonardo different from the Arduino Uno?',
				options: [
					'It has more digital pins',
					'It has built-in USB communication without a separate chip',
					'It runs at a higher clock speed',
					'It uses a different programming language'
				],
				correctAnswer: 1,
				explanation: 'The Leonardo has built-in USB communication via the ATmega32U4 microcontroller, eliminating the need for a separate USB-to-serial converter chip like the Uno uses.'
			},
			{
				question: 'How many analog input pins does the Arduino Leonardo have?',
				options: [
					'6 pins',
					'8 pins',
					'10 pins',
					'12 pins'
				],
				correctAnswer: 3,
				explanation: 'The Arduino Leonardo has 12 analog input pins (A0-A11), which is more than many other Arduino boards.'
			},
			{
				question: 'What unique capability does the Leonardo have for USB communication?',
				options: [
					'It can only send data to a computer',
					'It can emulate USB devices like keyboards and mice',
					'It requires special drivers for USB communication',
					'It cannot communicate via USB'
				],
				correctAnswer: 1,
				explanation: 'The Leonardo can emulate USB HID devices like keyboards and mice, making it perfect for projects that need to control a computer directly.'
			},
			{
				question: 'What is the recommended input voltage range for the Arduino Leonardo?',
				options: [
					'3-5V',
					'5-9V',
					'7-12V',
					'12-20V'
				],
				correctAnswer: 2,
				explanation: 'The recommended input voltage range is 7-12V. Going outside this range can damage the board or cause unreliable operation.'
			},
			{
				question: 'How much flash memory does the Arduino Leonardo have available for user programs?',
				options: [
					'32KB total',
					'28KB (32KB minus 4KB bootloader)',
					'16KB',
					'64KB'
				],
				correctAnswer: 1,
				explanation: 'The Leonardo has 32KB of flash memory total, but 4KB is reserved for the bootloader, leaving 28KB available for user programs.'
			}
		],
		level: 1,
		experience: 0,
		maxLevel: 5,
		quizzesTaken: 0,
		maxQuizzesPerDay: 5
	}
];

// Store for component progress
export const componentProgress = writable<ComponentProgress>({});

// Helper functions
export function getComponentById(id: string): ComponentDetails | undefined {
	return componentLibrary.find(component => component.id === id);
}

export function updateComponentProgress(componentId: string, experienceGained: number) {
	componentProgress.update(progress => {
		const currentProgress = progress[componentId] || { level: 1, experience: 0, quizzesTaken: 0 };
		const newExperience = currentProgress.experience + experienceGained;
		const experiencePerLevel = 100;
		const newLevel = Math.min(5, Math.floor(newExperience / experiencePerLevel) + 1);
		
		return {
			...progress,
			[componentId]: {
				...currentProgress,
				level: newLevel,
				experience: newExperience,
				quizzesTaken: currentProgress.quizzesTaken + 1,
				lastQuizDate: new Date()
			}
		};
	});
}

// Get player level based on total experience
export function getPlayerLevel(): number {
	const progress = loadComponentProgress();
	const totalExp = getTotalExperience();
	// Every 500 XP = 1 player level
	return Math.floor(totalExp / 500) + 1;
}

// Get total experience across all components
export function getTotalExperience(): number {
	const progress = loadComponentProgress();
	return Object.values(progress).reduce((total, comp) => total + comp.experience, 0);
}

// Get component progress for a specific component
export function getComponentProgress(componentId: string) {
	const progress = loadComponentProgress();
	return progress[componentId] || { 
		level: 1, 
		experience: 0, 
		quizzesTaken: 0,
		lastQuizDate: undefined
	};
}

// Check if user can take quiz for a component
export function canTakeQuiz(componentId: string): boolean {
	const progress = loadComponentProgress();
	const componentProg = progress[componentId];
	if (!componentProg) return true;
	
	const today = new Date().toDateString();
	const lastQuizDate = componentProg.lastQuizDate ? new Date(componentProg.lastQuizDate).toDateString() : '';
	
	if (today !== lastQuizDate) {
		return true; // New day, reset quiz count
	}
	
	return componentProg.quizzesTaken < 5;
}

export function getProgressPercentage(experience: number, level: number): number {
	const experiencePerLevel = 100;
	const currentLevelExp = (level - 1) * experiencePerLevel;
	const expInCurrentLevel = experience - currentLevelExp;
	return Math.min(100, (expInCurrentLevel / experiencePerLevel) * 100);
}

// Load progress from localStorage and return it
export function loadComponentProgress(): ComponentProgress {
	if (typeof window !== 'undefined') {
		const saved = localStorage.getItem('circuitspace-component-progress');
		if (saved) {
			const parsed = JSON.parse(saved);
			componentProgress.set(parsed);
			return parsed;
		}
	}
	return {};
}

// Save progress to localStorage
export function saveComponentProgress(progress: ComponentProgress) {
	if (typeof window !== 'undefined') {
		localStorage.setItem('circuitspace-component-progress', JSON.stringify(progress));
	}
	componentProgress.set(progress);
}

// Get quiz questions for a component
export function getQuizQuestions(componentId: string) {
	const component = getComponentById(componentId);
	if (!component) return [];
	
	// Shuffle the quiz questions for variety
	const shuffled = [...component.quiz].sort(() => Math.random() - 0.5);
	return shuffled.slice(0, 5); // Return 5 random questions
}

// Submit quiz answer and update progress
export function submitQuizAnswer(componentId: string, correctAnswers: number, totalQuestions: number) {
	const component = getComponentById(componentId);
	if (!component) return { newLevel: 1, newExperience: 0, quizzesTaken: 0, experienceGained: 0 };
	
	const progress = loadComponentProgress();
	const currentProgress = progress[componentId] || { 
		level: 1, 
		experience: 0, 
		quizzesTaken: 0,
		lastQuizDate: new Date()
	};
	
	// Calculate experience gained (20 XP per correct answer)
	const experienceGained = correctAnswers * 20;
	const newExperience = currentProgress.experience + experienceGained;
	
	// Calculate new level (100 XP per level, max level 5)
	const experiencePerLevel = 100;
	const newLevel = Math.min(5, Math.floor(newExperience / experiencePerLevel) + 1);
	
	// Update quiz count for today
	const today = new Date().toDateString();
	const lastQuizDate = currentProgress.lastQuizDate ? new Date(currentProgress.lastQuizDate).toDateString() : '';
	const isToday = today === lastQuizDate;
	const newQuizzesTaken = isToday ? currentProgress.quizzesTaken + 1 : 1;
	
	const updatedProgress: ComponentProgress = {
		...progress,
		[componentId]: {
			level: newLevel,
			experience: newExperience,
			quizzesTaken: newQuizzesTaken,
			lastQuizDate: new Date()
		}
	};
	
	saveComponentProgress(updatedProgress);
	
	return {
		newLevel,
		newExperience,
		quizzesTaken: newQuizzesTaken,
		experienceGained
	};
}
