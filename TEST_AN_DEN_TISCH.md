# Test der "An den Tisch" Funktionalität

## Erwartetes Verhalten:

1. **Start der Konversation:**
   - URL öffnen: `http://localhost:5173/project-chat?prompt=Build%20a%20LED%20brightness%20controller%20using%20an%20Arduino%20Leonardo%2C%20potentiometer%2C%20and%20LED`
   - Erste Message sollte Projektverständnis zeigen mit "Weiter"/"Frage" Buttons

2. **Auf "Weiter" klicken:**
   - Komponenten-Liste sollte erscheinen
   - "Circuit Designer" / "An den Tisch" Buttons sollten sichtbar sein

3. **Auf "An den Tisch" klicken:**
   - Sofort: "Perfekt! Lassen Sie uns Schritt für Schritt..." Message
   - Nach 2s: "🔌 **Schritt 1/7:** Arduino Leonardo mit USB-Kabel..."
   - Nach 4s: "🛠️ **Schritt 2/7:** Breadboard auf dem Arbeitsplatz..."
   - Nach 6s: "💡 **Schritt 3/7:** LED in Breadboard eingesteckt..."
   - Nach 8s: "⚡ **Schritt 4/7:** 220Ω Widerstand zwischen LED-Kathode..."
   - Nach 10s: "🎛️ **Schritt 5/7:** Potentiometer in Breadboard..."
   - Nach 12s: "🔗 **Schritt 6/7:** Stromversorgung: 5V und GND..."
   - Nach 14s: "📡 **Schritt 7/7:** Signal-Verbindungen: Pin 9 → LED..."
   - Nach 16s: "🎉 **Hardware-Aufbau komplett!** Ich habe erkannt..."
   - Nach 18s: "Möchten Sie jetzt mit dem Code Tutorial beginnen?" mit Tutorial Button

## Debug Console Output:
- `onWorkspaceButton called with action: real-table`
- `handleWorkspaceButton called with action: real-table`
- `Jumping to real-workspace-steps`
- `Starting delayed steps for real-workspace-steps`

## Implementierte Features:
- ✅ Realistische Schritt-für-Schritt Simulation der Hardwareverbindungen
- ✅ Zeitgesteuerte Messages (alle 2 Sekunden)
- ✅ Fortschrittsanzeige (Schritt X/7)
- ✅ Detaillierte Pin-Verbindungen wie im Circuit Designer
- ✅ Abschließende Erkennung + Tutorial Button
- ✅ Emoji-Icons für bessere Visualisierung
- ✅ Professionelle Sprache mit technischen Details
