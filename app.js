/**
 * ==========================================================================
 * THE ROLE OF A FLIGHT OPERATIONS OFFICER (FOO)
 * Interactive Simulation, Fuel Planning, Weather Decoder & Presentation Mode
 * ==========================================================================
 */

document.addEventListener('DOMContentLoaded', () => {
  initZuluClock();
  initNavHighlighting();
  initLabTabs();
  initRadarSimulation();
  initWeatherDecoder();
  initFuelCalculator();
  initPilotComms();
  initPresentationMode();
  initAudioAmbience();
});

/* ==========================================================================
   1. ZULU CLOCK (UTC TIME)
   ========================================================================== */
function initZuluClock() {
  const clockEl = document.getElementById('utcClock');
  if (!clockEl) return;

  function update() {
    const now = new Date();
    const h = String(now.getUTCHours()).padStart(2, '0');
    const m = String(now.getUTCMinutes()).padStart(2, '0');
    const s = String(now.getUTCSeconds()).padStart(2, '0');
    clockEl.textContent = `${h}:${m}:${s} UTC (ZULU)`;
  }
  update();
  setInterval(update, 1000);
}

/* ==========================================================================
   2. MAIN NAVIGATION ACTIVE STATE
   ========================================================================== */
function initNavHighlighting() {
  const navLinks = document.querySelectorAll('.main-nav .nav-link');
  const sections = document.querySelectorAll('.content-section, .hero-section');

  window.addEventListener('scroll', () => {
    let current = '';
    const scrollPos = window.scrollY + 200;

    sections.forEach(section => {
      const top = section.offsetTop;
      const height = section.offsetHeight;
      if (scrollPos >= top && scrollPos < top + height) {
        current = section.getAttribute('id');
      }
    });

    navLinks.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href') === `#${current}`) {
        link.classList.add('active');
      }
    });
  });
}

/* ==========================================================================
   3. INTERACTIVE LAB TABS
   ========================================================================== */
function initLabTabs() {
  const tabs = document.querySelectorAll('.lab-tab');
  const panels = document.querySelectorAll('.tab-panel');

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      panels.forEach(p => p.classList.remove('active'));

      tab.classList.add('active');
      const targetId = tab.getAttribute('data-tab');
      const targetPanel = document.getElementById(targetId);
      if (targetPanel) {
        targetPanel.classList.add('active');
      }

      // If radar tab becomes active, trigger radar redraw
      if (targetId === 'tab-radar' && window.radarResizeHandler) {
        window.radarResizeHandler();
      }
    });
  });
}

/* ==========================================================================
   4. RADAR SIMULATION & ROUTE VISUALIZATION (CANVAS)
   ========================================================================== */
function initRadarSimulation() {
  const canvas = document.getElementById('radarCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  // Route Waypoints for Chicago (KORD) to New York (KJFK)
  const waypoints = {
    KORD: { x: 0.12, y: 0.52, name: 'KORD (Chicago)' },
    GIJ:  { x: 0.28, y: 0.48, name: 'GIJ (Goshen)' },
    DJB:  { x: 0.44, y: 0.45, name: 'DJB (Dryer)' },
    // Direct Route point (goes right through storm):
    J60:  { x: 0.62, y: 0.42, name: 'J60 (Direct - Storm Risk)' },
    // FOO Diverted Route point (south via J70):
    J70:  { x: 0.62, y: 0.68, name: 'J70 (FOO Safe Corridor)' },
    LENDY:{ x: 0.82, y: 0.46, name: 'LENDY Arrival' },
    KJFK: { x: 0.90, y: 0.50, name: 'KJFK (New York)' },
    KEWR: { x: 0.88, y: 0.38, name: 'KEWR (Alternate)' }
  };

  // State
  let showStorm = true;
  let useFooReroute = false;
  let planeProgress = 0.05; // 0 to 1
  let isPaused = false;

  const stormToggleBtn = document.getElementById('toggleStormBtn');
  const routeToggleBtn = document.getElementById('toggleRouteBtn');
  const resetBtn = document.getElementById('resetFlightBtn');
  const captionText = document.getElementById('radarCaptionText');
  const flightStatusBadge = document.getElementById('flightStatusBadge');
  const telemetryAlt = document.getElementById('telemetryAlt');
  const telemetryGS = document.getElementById('telemetryGS');
  const telemetryFuel = document.getElementById('telemetryFuel');
  const telemetryETA = document.getElementById('telemetryETA');

  if (stormToggleBtn) {
    stormToggleBtn.classList.add('active');
    stormToggleBtn.addEventListener('click', () => {
      showStorm = !showStorm;
      stormToggleBtn.classList.toggle('active', showStorm);
      stormToggleBtn.textContent = showStorm ? '⚡ Hide Storm Cell' : '⚡ Show Storm Cell';
      updateCaption();
    });
  }

  if (routeToggleBtn) {
    routeToggleBtn.addEventListener('click', () => {
      useFooReroute = !useFooReroute;
      routeToggleBtn.classList.toggle('active', useFooReroute);
      routeToggleBtn.textContent = useFooReroute ? '✅ Active: Safe Route J70' : '🔀 FOO Storm Reroute';
      updateCaption();
    });
  }

  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      planeProgress = 0.02;
    });
  }

  function updateCaption() {
    if (!captionText) return;
    if (useFooReroute) {
      captionText.innerHTML = `<strong>FOO Optimized Route Active:</strong> Diverting aircraft 40 NM south via airway J70. Avoids convective thunderstorm tops at 42,000 ft with zero turbulence. Fuel penalty: +850 lbs (covered by Contingency Fuel).`;
      if (flightStatusBadge) flightStatusBadge.textContent = 'EN ROUTE (FOO SAFE J70)';
    } else if (showStorm) {
      captionText.innerHTML = `<strong>⚠️ HAZARD WARNING:</strong> Direct airway J60 passes directly through severe convective storm cell over Pennsylvania! FOO recommends immediate reroute to J70.`;
      if (flightStatusBadge) flightStatusBadge.textContent = 'WEATHER CONFLICT AHEAD';
    } else {
      captionText.innerHTML = `<strong>Direct Route:</strong> Clear skies scenario via airway J60 straight into New York JFK.`;
      if (flightStatusBadge) flightStatusBadge.textContent = 'EN ROUTE (FL370)';
    }
  }

  function resizeCanvas() {
    const rect = canvas.parentElement.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;
  }
  window.addEventListener('resize', resizeCanvas);
  window.radarResizeHandler = resizeCanvas;
  resizeCanvas();

  // Animation Loop
  function drawRadar() {
    const w = canvas.width;
    const h = canvas.height;
    ctx.clearRect(0, 0, w, h);

    // 1. Radar Grid Circles
    ctx.strokeStyle = 'rgba(0, 240, 255, 0.08)';
    ctx.lineWidth = 1;
    const centerX = w * 0.5;
    const centerY = h * 0.5;
    [80, 160, 240, 320].forEach(radius => {
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
      ctx.stroke();
    });

    // 2. Draw Storm Cell (Convective SIGMET) over Pennsylvania
    if (showStorm) {
      const stormX = w * 0.62;
      const stormY = h * 0.40;
      
      const grad = ctx.createRadialGradient(stormX, stormY, 10, stormX, stormY, 65);
      grad.addColorStop(0, 'rgba(239, 68, 68, 0.55)');
      grad.addColorStop(0.5, 'rgba(245, 158, 11, 0.35)');
      grad.addColorStop(1, 'rgba(239, 68, 68, 0)');
      
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(stormX, stormY, 65, 0, Math.PI * 2);
      ctx.fill();

      // Flashing lightning center
      ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
      ctx.font = '14px sans-serif';
      ctx.fillText('⚡ SEVERE CB (42,000 FT)', stormX - 75, stormY - 25);
    }

    // 3. Define Route Path
    const currentMidPoint = useFooReroute ? waypoints.J70 : waypoints.J60;
    const routePoints = [
      waypoints.KORD,
      waypoints.GIJ,
      waypoints.DJB,
      currentMidPoint,
      waypoints.LENDY,
      waypoints.KJFK
    ];

    // Draw Route Flight Path Line
    ctx.beginPath();
    ctx.moveTo(routePoints[0].x * w, routePoints[0].y * h);
    for (let i = 1; i < routePoints.length; i++) {
      ctx.lineTo(routePoints[i].x * w, routePoints[i].y * h);
    }
    ctx.strokeStyle = useFooReroute ? '#00f0ff' : (showStorm ? '#ef4444' : '#38bdf8');
    ctx.lineWidth = 3;
    ctx.setLineDash([6, 4]);
    ctx.stroke();
    ctx.setLineDash([]); // Reset dash

    // Draw Alternate Route to KEWR (Dashed Yellow)
    ctx.beginPath();
    ctx.moveTo(waypoints.LENDY.x * w, waypoints.LENDY.y * h);
    ctx.lineTo(waypoints.KEWR.x * w, waypoints.KEWR.y * h);
    ctx.strokeStyle = 'rgba(245, 158, 11, 0.6)';
    ctx.lineWidth = 2;
    ctx.setLineDash([4, 4]);
    ctx.stroke();
    ctx.setLineDash([]);

    // 4. Draw Waypoints & Airport Dots
    Object.keys(waypoints).forEach(key => {
      const pt = waypoints[key];
      const px = pt.x * w;
      const py = pt.y * h;

      ctx.fillStyle = key.startsWith('K') ? '#00f0ff' : '#94a3b8';
      ctx.beginPath();
      ctx.arc(px, py, key.startsWith('K') ? 6 : 4, 0, Math.PI * 2);
      ctx.fill();

      // Text label
      ctx.font = '11px JetBrains Mono, monospace';
      ctx.fillStyle = key.startsWith('K') ? '#ffffff' : '#cbd5e1';
      ctx.fillText(pt.name, px + 8, py - 6);
    });

    // 5. Calculate Plane Position along the polyline
    planeProgress += 0.0012;
    if (planeProgress > 0.98) planeProgress = 0.02;

    const totalSegments = routePoints.length - 1;
    const segmentProgress = planeProgress * totalSegments;
    const currentSegmentIndex = Math.min(Math.floor(segmentProgress), totalSegments - 1);
    const t = segmentProgress - currentSegmentIndex;

    const pStart = routePoints[currentSegmentIndex];
    const pEnd = routePoints[currentSegmentIndex + 1];

    const planeX = (pStart.x + (pEnd.x - pStart.x) * t) * w;
    const planeY = (pStart.y + (pEnd.y - pStart.y) * t) * h;

    // Angle of flight
    const angle = Math.atan2((pEnd.y - pStart.y) * h, (pEnd.x - pStart.x) * w);

    // 6. Draw Airplane Symbol
    ctx.save();
    ctx.translate(planeX, planeY);
    ctx.rotate(angle);

    ctx.fillStyle = '#ffffff';
    ctx.shadowColor = '#00f0ff';
    ctx.shadowBlur = 10;

    // Draw stylized jet plane
    ctx.beginPath();
    ctx.moveTo(14, 0);
    ctx.lineTo(-8, -12);
    ctx.lineTo(-4, -3);
    ctx.lineTo(-14, -3);
    ctx.lineTo(-16, -7);
    ctx.lineTo(-18, -7);
    ctx.lineTo(-16, 0);
    ctx.lineTo(-18, 7);
    ctx.lineTo(-16, 7);
    ctx.lineTo(-14, 3);
    ctx.lineTo(-4, 3);
    ctx.lineTo(-8, 12);
    ctx.closePath();
    ctx.fill();

    ctx.restore();

    // Plane Data Tag Box
    ctx.fillStyle = 'rgba(7, 13, 30, 0.85)';
    ctx.strokeStyle = '#00f0ff';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.rect(planeX + 16, planeY - 24, 90, 36);
    ctx.fill();
    ctx.stroke();

    ctx.font = '9px JetBrains Mono, monospace';
    ctx.fillStyle = '#00f0ff';
    ctx.fillText('PA-204 (B738)', planeX + 22, planeY - 12);
    ctx.fillStyle = '#ffffff';
    ctx.fillText('FL370 / 465KT', planeX + 22, planeY + 2);

    // Update Telemetry Widget
    if (telemetryAlt) {
      if (planeProgress < 0.15) {
        telemetryAlt.textContent = 'CLIMBING FL280';
      } else if (planeProgress > 0.85) {
        telemetryAlt.textContent = 'DESCENDING 9,000 FT';
      } else {
        telemetryAlt.textContent = '37,000 FT (CRUISE)';
      }
    }

    requestAnimationFrame(drawRadar);
  }

  requestAnimationFrame(drawRadar);
}

/* ==========================================================================
   5. WEATHER DECODER (METAR / TAF)
   ========================================================================== */
function initWeatherDecoder() {
  const stationData = {
    KJFK: {
      title: 'KJFK - New York John F. Kennedy International',
      raw: 'KJFK 281451Z 19014G22KT 10SM SCT040 BKN090 22/16 A2992 RMK AO2',
      wind: '190° at 14 knots (Gusting 22 kts)',
      vis: '10 Statute Miles (Clear visibility)',
      clouds: 'Scattered 4,000 ft, Broken 9,000 ft',
      temp: '22°C / Dewpoint 16°C | Altimeter 29.92 inHg',
      category: 'VFR (Visual Flight Rules) - SAFE FOR LANDING',
      verdict: 'FOO Assessment: Weather is legally stable and above minimums. Crosswinds are safely aligned with Runway 22L. Alternate airport KEWR remains designated for traffic contingencies.'
    },
    KORD: {
      title: "KORD - Chicago O'Hare International",
      raw: 'KORD 281456Z 32009KT 10SM FEW025 SCT250 18/09 A3004 RMK AO2',
      wind: '320° at 9 knots (Light northwest breeze)',
      vis: '10 Statute Miles (Unlimited)',
      clouds: 'Few 2,500 ft, Scattered 25,000 ft (Cirrus)',
      temp: '18°C / Dewpoint 09°C | Altimeter 30.04 inHg',
      category: 'VFR - OPTIMAL DEPARTURE CONDITIONS',
      verdict: 'FOO Assessment: Excellent departure conditions. No ground de-icing or low-visibility taxi procedures needed. Runway 28C available for heavy gross takeoff weight.'
    },
    EGLL: {
      title: 'EGLL - London Heathrow Airport',
      raw: 'EGLL 281420Z 24016KT 8000 -RA BKN012 OVC025 14/12 Q1012 TEMPO BKN008',
      wind: '240° at 16 knots (Steady wind from southwest)',
      vis: '8,000 meters (Approx 5 miles in light rain)',
      clouds: 'Broken at 1,200 ft, Overcast at 2,500 ft (Low ceiling)',
      temp: '14°C / Dewpoint 12°C | QNH 1012 hPa',
      category: 'MVFR (Marginal VFR) - ILS APPROACH REQUIRED',
      verdict: 'FOO Assessment: Wet runway conditions reduce braking action. FOO increases required landing distance calculation by 15% and ensures Cat II ILS auto-land capability.'
    },
    OMDB: {
      title: 'OMDB - Dubai International Airport',
      raw: 'OMDB 281400Z 35012KT 9999 NSC 38/20 Q1006 NOSIG',
      wind: '350° at 12 knots',
      vis: '10 Kilometers or more (Cavok)',
      clouds: 'Nil Significant Clouds (Clear)',
      temp: '38°C (High Density Altitude) | QNH 1006 hPa',
      category: 'VFR - EXTREME AMBIENT TEMPERATURE',
      verdict: 'FOO Assessment: Hot air (38°C) is less dense, reducing engine thrust and wing lift. FOO must carefully check maximum takeoff weight (MTOW) limits to avoid runway overrun.'
    }
  };

  const presetButtons = document.querySelectorAll('.preset-chip');
  const rawTextEl = document.getElementById('rawMetarText');
  const stationTitleEl = document.getElementById('weatherStationTitle');
  const vfrBadgeEl = document.getElementById('vfrBadge');
  const wWindEl = document.getElementById('wWind');
  const wVisEl = document.getElementById('wVis');
  const wCloudsEl = document.getElementById('wClouds');
  const wTempEl = document.getElementById('wTemp');
  const verdictEl = document.getElementById('dispatcherVerdictText');
  const decodeBtn = document.getElementById('decodeWeatherBtn');

  let currentKey = 'KJFK';

  function displayAirport(key) {
    currentKey = key;
    const data = stationData[key];
    if (!data) return;

    if (rawTextEl) rawTextEl.textContent = data.raw;
    if (stationTitleEl) stationTitleEl.textContent = data.title;
    if (vfrBadgeEl) vfrBadgeEl.textContent = data.category;
    if (wWindEl) wWindEl.textContent = data.wind;
    if (wVisEl) wVisEl.textContent = data.vis;
    if (wCloudsEl) wCloudsEl.textContent = data.clouds;
    if (wTempEl) wTempEl.textContent = data.temp;
    if (verdictEl) verdictEl.innerHTML = `<strong>FOO Operational Assessment:</strong> ${data.verdict}`;
  }

  presetButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      presetButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const key = btn.getAttribute('data-airport');
      displayAirport(key);
    });
  });

  if (decodeBtn) {
    decodeBtn.addEventListener('click', () => {
      displayAirport(currentKey);
      decodeBtn.textContent = '✅ Weather Successfully Decoded!';
      setTimeout(() => {
        decodeBtn.textContent = '🔍 Click to Decode for Pilots & Students';
      }, 2000);
    });
  }
}

/* ==========================================================================
   6. FUEL PLANNING CALCULATOR
   ========================================================================== */
function initFuelCalculator() {
  const distRange = document.getElementById('distRange');
  const paxRange = document.getElementById('paxRange');
  const windRange = document.getElementById('windRange');
  const weatherReserveCheck = document.getElementById('weatherReserveCheck');

  const distVal = document.getElementById('distVal');
  const paxVal = document.getElementById('paxVal');
  const windVal = document.getElementById('windVal');

  const totalBlockFuel = document.getElementById('totalBlockFuel');
  const fuelTrip = document.getElementById('fuelTrip');
  const fuelContingency = document.getElementById('fuelContingency');
  const fuelAlternate = document.getElementById('fuelAlternate');
  const fuelReserve = document.getElementById('fuelReserve');
  const fuelTaxi = document.getElementById('fuelTaxi');
  const fuelExtra = document.getElementById('fuelExtra');
  const extraFuelRow = document.getElementById('extraFuelRow');

  function calculateFuel() {
    const dist = parseInt(distRange.value, 10);
    const pax = parseInt(paxRange.value, 10);
    const wind = parseInt(windRange.value, 10); // positive = tailwind, negative = headwind
    const hasExtraWeather = weatherReserveCheck ? weatherReserveCheck.checked : false;

    // Display labels
    if (distVal) distVal.textContent = `${dist} NM`;
    if (paxVal) paxVal.textContent = `${pax} Passengers`;
    if (windVal) {
      if (wind > 0) windVal.textContent = `+${wind} kts (Tailwind - Faster)`;
      else if (wind < 0) windVal.textContent = `${wind} kts (Headwind - Burns more)`;
      else windVal.textContent = '0 kts (Calm air)';
    }

    // Typical B737-800 Fuel Burn Model:
    // Base burn approx 14 lbs per NM
    // Headwind adds burn (~12 lbs per kt of headwind)
    // Pax weight adds burn (~6 lbs per pax)
    const baseTrip = dist * 14;
    const windFactor = (wind * -1) * (dist / 70); 
    const paxFactor = pax * 5.5;

    const trip = Math.round(Math.max(3500, baseTrip + windFactor + paxFactor));
    const contingency = Math.round(trip * 0.05); // 5% ICAO rule
    const alternate = Math.round(3000 + (dist * 0.4)); // Fuel to divert
    const reserve = 2800; // 30-minute legal hold at 1,500 ft
    const taxi = 600; // APU + Taxi out/in
    const extra = hasExtraWeather ? 1200 : 0;

    const total = trip + contingency + alternate + reserve + taxi + extra;
    const gallons = Math.round(total / 6.7); // Jet A-1 is ~6.7 lbs/gal

    // Update DOM
    if (fuelTrip) fuelTrip.textContent = `${trip.toLocaleString()} lbs`;
    if (fuelContingency) fuelContingency.textContent = `${contingency.toLocaleString()} lbs`;
    if (fuelAlternate) fuelAlternate.textContent = `${alternate.toLocaleString()} lbs`;
    if (fuelReserve) fuelReserve.textContent = `${reserve.toLocaleString()} lbs`;
    if (fuelTaxi) fuelTaxi.textContent = `${taxi.toLocaleString()} lbs`;
    if (fuelExtra) fuelExtra.textContent = `+${extra.toLocaleString()} lbs`;
    if (extraFuelRow) extraFuelRow.style.display = hasExtraWeather ? 'flex' : 'none';

    if (totalBlockFuel) {
      totalBlockFuel.textContent = `${total.toLocaleString()} LBS`;
      const sub = totalBlockFuel.nextElementSibling;
      if (sub) sub.textContent = `(Approx. ${gallons.toLocaleString()} Gallons Jet-A1)`;
    }

    // Update Visual Fuel Bar
    const tripPct = Math.round((trip / total) * 100);
    const contPct = Math.round((contingency / total) * 100);
    const altPct = Math.round((alternate / total) * 100);
    const resPct = Math.round((reserve / total) * 100);
    const taxiPct = 100 - (tripPct + contPct + altPct + resPct);

    const segments = document.querySelectorAll('.fuel-bar-container .f-segment');
    if (segments.length >= 5) {
      segments[0].style.width = `${tripPct}%`;
      segments[1].style.width = `${contPct}%`;
      segments[2].style.width = `${altPct}%`;
      segments[3].style.width = `${resPct}%`;
      segments[4].style.width = `${taxiPct}%`;
    }
  }

  [distRange, paxRange, windRange].forEach(input => {
    if (input) input.addEventListener('input', calculateFuel);
  });
  if (weatherReserveCheck) {
    weatherReserveCheck.addEventListener('change', calculateFuel);
  }

  calculateFuel();
}

/* ==========================================================================
   7. COCKPIT TO OCC PILOT COMMS SIMULATOR
   ========================================================================== */
function initPilotComms() {
  const input = document.getElementById('commsCustomInput');
  const sendBtn = document.getElementById('sendCommsBtn');
  const chatLog = document.getElementById('commsChatLog');

  if (!input || !sendBtn || !chatLog) return;

  function addMessage(sender, text, type = 'foo') {
    const now = new Date();
    const timeStr = `${String(now.getUTCHours()).padStart(2,'0')}:${String(now.getUTCMinutes()).padStart(2,'0')}Z`;

    const msgDiv = document.createElement('div');
    msgDiv.className = `chat-msg ${type}`;
    msgDiv.innerHTML = `
      <span class="msg-time">${timeStr}</span>
      <span class="msg-sender">${sender}:</span>
      <span class="msg-body">"${text}"</span>
    `;
    chatLog.appendChild(msgDiv);
    chatLog.scrollTop = chatLog.scrollHeight;
  }

  function handleSend() {
    const text = input.value.trim();
    if (!text) return;

    // Add user as FOO Dispatcher
    addMessage('FOO (STUDENT DISPATCH)', text, 'foo');
    input.value = '';

    // Generate realistic cockpit captain readback after 1.2s
    setTimeout(() => {
      let reply = "Dispatch, PA-204 copies message loud and clear. Systems nominal, standing by.";
      const lower = text.toLowerCase();

      if (lower.includes('fuel') || lower.includes('burn')) {
        reply = "PA-204 roger, fuel on board is 15,200 lbs, currently burning 4,100 lbs/hr. Right on planned profile.";
      } else if (lower.includes('weather') || lower.includes('storm') || lower.includes('wind')) {
        reply = "PA-204 copies weather update. Onboard weather radar shows cells painting yellow at 40 miles; following your J70 vector.";
      } else if (lower.includes('reroute') || lower.includes('j70') || lower.includes('heading')) {
        reply = "Dispatch, PA-204 executing reroute via waypoint J70. ATC has approved the southern vector.";
      } else if (lower.includes('land') || lower.includes('eta') || lower.includes('arrival')) {
        reply = "PA-204 ETA at JFK is 18:42 UTC. Runway 22L expected with ILS coupled.";
      }

      addMessage('CAPTAIN (AIRCRAFT PA-204)', reply, 'pilot');
    }, 1200);
  }

  sendBtn.addEventListener('click', handleSend);
  input.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') handleSend();
  });
}

/* ==========================================================================
   8. STUDENT PRESENTATION SLIDE MODE (FOR CLASSROOM / PROJECTOR)
   ========================================================================== */
function initPresentationMode() {
  const toggleBtn = document.getElementById('presentationToggleBtn');
  const presControls = document.getElementById('presentationControls');
  const prevBtn = document.getElementById('prevSlideBtn');
  const nextBtn = document.getElementById('nextSlideBtn');
  const exitBtn = document.getElementById('exitPresBtn');
  const slideNumEl = document.getElementById('currentSlideNum');

  const slides = document.querySelectorAll('.slide-target');
  let currentSlide = 0;
  let isPresentationActive = false;

  function updateSlideDisplay() {
    slides.forEach((slide, index) => {
      if (index === currentSlide) {
        slide.classList.add('active-slide');
      } else {
        slide.classList.remove('active-slide');
      }
    });
    if (slideNumEl) {
      slideNumEl.textContent = `${currentSlide + 1} / ${slides.length}`;
    }
    // Scroll active slide into view smoothly
    if (slides[currentSlide]) {
      slides[currentSlide].scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }

  function startPresentation() {
    isPresentationActive = true;
    document.body.classList.add('presentation-mode');
    if (presControls) presControls.classList.remove('hidden');
    currentSlide = 0;
    updateSlideDisplay();
    if (toggleBtn) {
      toggleBtn.querySelector('.btn-text').textContent = 'Exit Slides';
    }
  }

  function stopPresentation() {
    isPresentationActive = false;
    document.body.classList.remove('presentation-mode');
    if (presControls) presControls.classList.add('hidden');
    slides.forEach(s => s.classList.remove('active-slide'));
    if (toggleBtn) {
      toggleBtn.querySelector('.btn-text').textContent = 'Classroom Mode';
    }
  }

  if (toggleBtn) {
    toggleBtn.addEventListener('click', () => {
      if (isPresentationActive) stopPresentation();
      else startPresentation();
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      if (currentSlide < slides.length - 1) {
        currentSlide++;
        updateSlideDisplay();
      }
    });
  }

  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      if (currentSlide > 0) {
        currentSlide--;
        updateSlideDisplay();
      }
    });
  }

  if (exitBtn) {
    exitBtn.addEventListener('click', stopPresentation);
  }

  // Keyboard navigation (Arrow keys)
  window.addEventListener('keydown', (e) => {
    if (!isPresentationActive) return;
    if (e.key === 'ArrowRight' || e.key === 'Space') {
      if (currentSlide < slides.length - 1) {
        currentSlide++;
        updateSlideDisplay();
      }
    } else if (e.key === 'ArrowLeft') {
      if (currentSlide > 0) {
        currentSlide--;
        updateSlideDisplay();
      }
    } else if (e.key === 'Escape') {
      stopPresentation();
    }
  });
}

/* ==========================================================================
   9. OPTIONAL WEB AUDIO OCC AMBIENCE
   ========================================================================== */
function initAudioAmbience() {
  const audioBtn = document.getElementById('audioToggleBtn');
  if (!audioBtn) return;

  let audioCtx = null;
  let isPlaying = false;
  let oscillator = null;
  let gainNode = null;

  function playRadioChime() {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.12);

      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.25);
    } catch (e) {
      // Audio not permitted or supported
    }
  }

  audioBtn.addEventListener('click', () => {
    isPlaying = !isPlaying;
    playRadioChime();

    if (isPlaying) {
      audioBtn.classList.add('highlight');
      audioBtn.querySelector('.btn-text').textContent = 'Audio On';
    } else {
      audioBtn.classList.remove('highlight');
      audioBtn.querySelector('.btn-text').textContent = 'Audio';
    }
  });
}
