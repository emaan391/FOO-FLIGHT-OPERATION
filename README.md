# ✈️ The Role of a Flight Operations Officer (FOO) in Aviation
### Modern, Interactive Student Project & Classroom Presentation

An engaging, professional, and visually stunning student aviation project about the vital role of a **Flight Operations Officer (FOO)** / **Flight Dispatcher** in commercial aviation.

---

## 🚀 How to Run the Project

1. **Direct Browser Launch (Zero Installation Required):**
   - Simply double-click **`index.html`** in this folder to open it directly in Google Chrome, Microsoft Edge, Mozilla Firefox, or Safari.
2. **Or Run via a Local Web Server (Optional):**
   ```powershell
   # If you have Python installed:
   python -m http.server 8000
   # Then open: http://localhost:8000
   ```

---

## 📁 Project Structure

| File | Description |
| :--- | :--- |
| **`index.html`** | The main interactive web application and presentation dashboard. |
| **`style.css`** | Aerospace dark-theme styling, glassmorphism OCC panels, radar sweep effects, responsive grid, and `@media print` rules. |
| **`app.js`** | JavaScript engine powering the live radar canvas, flight route animation, weather METAR decoder, fuel calculator, ACARS chat simulator, audio synthesizer, and presentation mode. |
| **`Flight_Operations_Officer_Report.md`** | Complete, academic student report with executive summary, regulatory framework, case study, presentation speech, and aviation glossary. |
| **`README.md`** | Project documentation and instructions. |

---

## 🎯 What's Included in This Project

### 1. What is a FOO?
* Clear definition: The **"Pilot on the Ground"** stationed in the airline's **Operations Control Center (OCC)**.
* Explains the international **Dual-Signature Rule** (ICAO Annex 6 / FAA 14 CFR Part 121): No commercial passenger aircraft can legally push back from the gate without the joint approval of both the Captain and the FOO.
* Comparison table: **Cockpit Captain vs. Dispatch FOO**.

### 2. The 4 Primary Duties (Short & Clear)
1. **Flight & Route Planning:** Airway waypoints, cruise altitude optimization, filing flight plans with Air Traffic Control (ATC), and weight & balance checks.
2. **Checking Weather Conditions:** Decoding METAR and TAF reports, avoiding convective thunderstorm cells (SIGMET), clear-air turbulence, and leveraging jet streams (WINTEM).
3. **Communication Between Pilots & Airport Staff:** Briefing pilots, in-flight ACARS data-link messaging, liaising with ground ramp crews, refuelers, and maintenance engineers.
4. **Monitoring Flight Information ("Flight Following"):** Active 24/7 radar surveillance from gate to gate, monitoring progressive fuel burn, dynamic storm rerouting, and emergency diversion support.

### 3. Interactive Dispatcher Control Lab
* **Live Animated Flight Radar (Canvas):**
  * Watch Flight **PA-204 (Chicago KORD ➔ New York KJFK)** fly along waypoints in real-time with altitude, speed, and fuel burn telemetry.
  * **Interactive Reroute:** Click *"FOO Storm Reroute"* to divert the aircraft 40 NM south via airway `J70`, safely clearing a severe 42,000-foot thunderstorm cell over Pennsylvania!
* **Aviation Weather Decoder:**
  * Select airports (`KJFK`, `KORD`, `EGLL`, `OMDB`) to view raw teletype METAR weather codes and click to decode them into plain English for pilots and students.
* **Interactive Fuel Calculator Simulator:**
  * Sliders for Flight Distance, Passenger/Cargo Weight, and En-Route Headwinds/Tailwinds.
  * Computes the complete legal **ICAO Block Fuel** formula:  
    $$\text{Block Fuel} = \text{Taxi} + \text{Trip} + \text{Contingency (5\%)} + \text{Alternate (KEWR)} + \text{Final Reserve (30 min)} + \text{Extra}$$
  * Dynamic visual fuel stack bar and gallon conversions.
* **Cockpit-to-Ground ACARS Chat Terminal:**
  * Send text messages from Dispatch to the Captain and receive realistic pilot readbacks!

### 4. Step-by-Step Practical Case Study (Flight PA-204)
* **T-3 Hours:** Weather & airspace radar scrutiny (storm detection).
* **T-2 Hours:** Route planning, alternate airport selection (KEWR), and fuel burn calculations.
* **T-1 Hour:** Captain briefing and joint Dispatch Release signature.
* **En-Route:** Active flight following, smooth landing at JFK.

### 5. Why FOOs Make Flights Safe & Organized
* **4 Pillars:** Independent Redundancy, Crisis & Emergency Management, Fuel Efficiency & Eco-flying, and Network Punctuality.

### 6. Classroom Presentation Features
* **📽️ Classroom Mode Button:** One-click turns the web application into a full-screen, slide-by-slide presentation suitable for school or university projectors. Supports keyboard navigation (`Space`, `Arrow Right`, `Arrow Left`, `Escape`).
* **🖨️ Print Report Button:** Pre-configured `@media print` CSS cleanly formats the entire project into a printable homework submission or PDF document with zero cut-offs.
* **🎤 Student Cue Cards:** 6 pre-written speaking cue cards with talking points, key aviation vocabulary, and speech notes ready for oral presentations.
* **🔊 Audio Ambience Toggle:** Realistic OCC sound cues synthesized using the browser's built-in Web Audio API (100% offline, zero external sound files).

---
*Created for Aviation Science & Flight Management Students.*
