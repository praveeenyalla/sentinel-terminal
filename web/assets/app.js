const SHIP_LAYER_IDS = new Set(["ais", "piracy", "ports", "subsea", "chokepoints", "arctic", "naval"]);
const AIR_LAYER_IDS = new Set(["adsb", "airbases", "satcom", "space"]);

const OVERLAY_DEFS = [
  { id: "intel", label: "Intel", copy: "Threat, conflict, cyber, and disaster markers." },
  { id: "ships", label: "Ships", copy: "AIS-style vessel tracks with ship names and carrier groups." },
  { id: "routes", label: "Sea Routes", copy: "Strategic maritime corridors and chokepoints." },
  { id: "cables", label: "Cables", copy: "Internet backbone lines, landing routes, and operators." },
  { id: "air", label: "Air Traffic", copy: "ADSB-style aircraft markers and flight details." }
];

const TERMINAL_TABS = [
  { id: "markets", label: "MARKETS" },
  { id: "all-chains", label: "ALL CHAINS" },
  { id: "relationships", label: "RELATIONSHIPS" }
];

const ROUTE_DEFS = [
  {
    id: "route-suez",
    name: "Suez - Europe Corridor",
    status: "HEAVY FLOW",
    corridor: "Mediterranean / Red Sea",
    operators: "Maersk / MSC / CMA CGM",
    coordinates: [[103.82, 1.29], [79.86, 6.93], [43.33, 12.58], [32.55, 29.97], [14.4, 35.9], [2.35, 48.85], [-0.12, 51.5]]
  },
  {
    id: "route-hormuz",
    name: "Hormuz Energy Lane",
    status: "ESCORTED",
    corridor: "Gulf / Arabian Sea",
    operators: "National tanker fleets / LNG carriers",
    coordinates: [[51.39, 35.69], [55.27, 25.2], [56.26, 26.33], [66.97, 24.86], [72.88, 19.07], [80.27, 13.08], [103.82, 1.29]]
  },
  {
    id: "route-panama",
    name: "Panama Interoceanic Route",
    status: "MODERATE DELAY",
    corridor: "Caribbean / Pacific",
    operators: "Pacific container alliances",
    coordinates: [[-74.07, 4.71], [-79.52, 8.98], [-95.36, 29.76], [-118.24, 34.05], [-122.33, 47.61]]
  },
  {
    id: "route-bab",
    name: "Bab el-Mandeb Transit",
    status: "RISK ELEVATED",
    corridor: "Horn of Africa",
    operators: "Energy + bulk shipping lanes",
    coordinates: [[39.28, -6.8], [43.33, 12.58], [46.68, 24.71], [55.27, 25.2], [72.88, 19.07], [103.82, 1.29]]
  },
  {
    id: "route-northern",
    name: "Northern Sea Route",
    status: "SEASONAL",
    corridor: "Arctic",
    operators: "Ice-class carriers / state escorts",
    coordinates: [[28.97, 41.0], [33.08, 68.95], [58.0, 71.0], [95.0, 73.0], [139.65, 35.67]]
  }
];

const SUBSEA_CABLE_DEFS = [
  {
    id: "cable-2africa",
    name: "2Africa",
    operator: "Vodafone / China Mobile / Meta",
    capacity: "180 Tbps",
    landing: "Europe - Africa - Gulf - India",
    companies: ["Meta", "Vodafone", "China Mobile", "Orange"],
    coordinates: [[2.35, 48.85], [14.4, 35.9], [3.38, 6.52], [32.55, 29.97], [55.27, 25.2], [72.88, 19.07]]
  },
  {
    id: "cable-equiano",
    name: "Equiano",
    operator: "Google",
    capacity: "144 Tbps",
    landing: "Portugal - West Africa - South Africa",
    companies: ["Google", "Paratus", "WIOCC"],
    coordinates: [[-9.14, 38.72], [-17.45, 14.69], [3.38, 6.52], [18.42, -33.92]]
  },
  {
    id: "cable-sea-me-we6",
    name: "SEA-ME-WE 6",
    operator: "SubCom consortium",
    capacity: "126 Tbps",
    landing: "Singapore - South Asia - Gulf - Mediterranean",
    companies: ["Singtel", "Telecom Egypt", "Bharti Airtel"],
    coordinates: [[103.82, 1.29], [79.86, 6.93], [72.88, 19.07], [55.27, 25.2], [32.55, 29.97], [14.4, 35.9]]
  },
  {
    id: "cable-faster",
    name: "FASTER",
    operator: "Google consortium",
    capacity: "60 Tbps",
    landing: "US West Coast - Japan",
    companies: ["Google", "KDDI", "China Telecom Global"],
    coordinates: [[-122.33, 47.61], [-157.85, 21.3], [139.65, 35.67]]
  },
  {
    id: "cable-marea",
    name: "MAREA",
    operator: "Microsoft / Meta / Telxius",
    capacity: "200 Tbps",
    landing: "Virginia - Spain",
    companies: ["Microsoft", "Meta", "Telxius"],
    coordinates: [[-76.29, 36.85], [-9.14, 38.72], [2.17, 41.38]]
  }
];

const FLIGHT_HUBS = [
  { code: "SIN", name: "Singapore", coords: [103.82, 1.29] },
  { code: "DXB", name: "Dubai", coords: [55.27, 25.2] },
  { code: "LHR", name: "London", coords: [-0.12, 51.5] },
  { code: "IAD", name: "Washington", coords: [-77.04, 38.89] },
  { code: "HND", name: "Tokyo", coords: [139.65, 35.67] },
  { code: "DEL", name: "New Delhi", coords: [77.21, 28.61] },
  { code: "SYD", name: "Sydney", coords: [151.21, -33.87] },
  { code: "DOH", name: "Doha", coords: [51.53, 25.29] }
];

const COMPANY_GRAPH = [
  {
    id: "company-maersk",
    name: "Maersk",
    sector: "Shipping & Logistics",
    ticker: "AMKBY",
    summary: "Controls container flow across Suez and Panama while reacting to fuel and insurance costs.",
    connections: ["MSC", "DP World", "CMA CGM"],
    focusType: "route",
    focusId: "route-suez",
    signal: "CL"
  },
  {
    id: "company-dpworld",
    name: "DP World",
    sector: "Ports & Terminals",
    ticker: "PRIVATE",
    summary: "Port operator connected to Red Sea transshipment, customs delays, and berth allocation pressure.",
    connections: ["Maersk", "COSCO", "APM Terminals"],
    focusType: "route",
    focusId: "route-bab",
    signal: "DXY"
  },
  {
    id: "company-google",
    name: "Google Cloud",
    sector: "Digital Infrastructure",
    ticker: "GOOGL",
    summary: "Capacity demand and edge routing tie cloud growth to subsea cable uptime and landing diversity.",
    connections: ["Microsoft", "Meta", "KDDI"],
    focusType: "cable",
    focusId: "cable-equiano",
    signal: "NQ"
  },
  {
    id: "company-meta",
    name: "Meta Platforms",
    sector: "Digital Infrastructure",
    ticker: "META",
    summary: "Invests in high-capacity subsea systems and regional edge nodes to reduce latency and outage exposure.",
    connections: ["Vodafone", "Microsoft", "Orange"],
    focusType: "cable",
    focusId: "cable-2africa",
    signal: "NQ"
  },
  {
    id: "company-qatar",
    name: "Qatar Airways",
    sector: "Air Transport",
    ticker: "PRIVATE",
    summary: "Flight corridors and overflight permissions affect regional widebody lift and military deconfliction.",
    connections: ["Boeing", "Airbus", "Hamad Airport"],
    focusType: "air",
    focusId: "adsb",
    signal: "VIX"
  },
  {
    id: "company-shell",
    name: "Shell Trading",
    sector: "Energy Trading",
    ticker: "SHEL",
    summary: "Energy shipping, refinery flows, and Hormuz transit risk drive trading posture and freight exposure.",
    connections: ["QatarEnergy", "Trafigura", "Vitol"],
    focusType: "route",
    focusId: "route-hormuz",
    signal: "CL"
  }
];

const state = {
  snapshot: null,
  analysis: [],
  visibleLayers: new Set(),
  selectedEventId: null,
  selectedDetail: null,
  activePopup: null,
  activeTerminalTab: "markets",
  overlayVisibility: {
    intel: true,
    ships: true,
    routes: true,
    cables: true,
    air: true
  },
  overlayCounts: {
    intel: 0,
    ships: 0,
    routes: ROUTE_DEFS.length,
    cables: SUBSEA_CABLE_DEFS.length,
    air: 0
  },
  lookups: {
    events: {},
    ships: {},
    air: {},
    routes: buildLookup(ROUTE_DEFS),
    cables: buildLookup(SUBSEA_CABLE_DEFS)
  }
};

const elements = {
  fpsValue: document.getElementById("fps-value"),
  loadValue: document.getElementById("load-value"),
  alertsValue: document.getElementById("alerts-value"),
  modeValue: document.getElementById("mode-value"),
  layerList: document.getElementById("layer-list"),
  feedList: document.getElementById("feed-list"),
  analysisList: document.getElementById("analysis-list"),
  marketGrid: document.getElementById("market-grid"),
  allChainsGrid: document.getElementById("all-chains-grid"),
  relationshipGrid: document.getElementById("relationship-grid"),
  regionList: document.getElementById("region-list"),
  overlayControls: document.getElementById("overlay-controls"),
  terminalTabs: document.getElementById("terminal-tabs"),
  commandInput: document.getElementById("command-input"),
  commandResponse: document.getElementById("command-response"),
  pipelineValue: document.getElementById("pipeline-value"),
  selectionCard: document.getElementById("selection-card")
};

const worker = new Worker("/assets/threat-worker.js");
worker.onmessage = (event) => {
  const message = event.data || {};
  if (message.type === "analysis") {
    state.analysis = message.items || [];
    renderAnalysis();
  }
};

const map = new maplibregl.Map({
  container: "map",
  style: "https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json",
  center: [15, 12],
  zoom: 0.78,
  minZoom: 0.55,
  maxZoom: 6.8,
  pitch: 8,
  bearing: -4,
  antialias: true,
  dragRotate: false,
  renderWorldCopies: false
});

map.addControl(new maplibregl.NavigationControl({ visualizePitch: true }), "bottom-right");

map.on("style.load", () => {
  if (typeof map.setProjection === "function") {
    map.setProjection({ type: "globe" });
  }
  if (typeof map.setFog === "function") {
    map.setFog({
      color: "rgb(8, 12, 18)",
      "high-color": "rgb(26, 34, 44)",
      "horizon-blend": 0.08,
      "space-color": "rgb(2, 4, 8)",
      "star-intensity": 0.16
    });
  }
});

map.on("load", () => {
  addMapLayers();
  bindMapInteractions();
  renderOverlayControls();
  renderTerminalTabs();
  applyTerminalTab();
  renderSelection();
  loadSnapshot();
  setInterval(loadSnapshot, 2200);
  requestAnimationFrame(() => map.resize());
});

elements.commandInput.addEventListener("keydown", async (event) => {
  if (event.key !== "Enter") {
    return;
  }
  const query = elements.commandInput.value.trim();
  if (!query) {
    return;
  }

  elements.commandResponse.textContent = "Executing " + query + " ...";
  try {
    const response = await fetch(`/api/command?q=${encodeURIComponent(query)}`);
    const payload = await response.json();
    elements.commandResponse.textContent = payload.message;
  } catch (error) {
    elements.commandResponse.textContent = "Command path unavailable.";
  }
});

async function loadSnapshot() {
  try {
    const response = await fetch("/api/snapshot", { cache: "no-store" });
    const snapshot = await response.json();
    state.snapshot = snapshot;
    if (state.visibleLayers.size === 0) {
      snapshot.layers.forEach((layer) => state.visibleLayers.add(layer.id));
    }
    renderSnapshot();
    worker.postMessage({ type: "analyze", items: snapshot.feed });
  } catch (error) {
    elements.commandResponse.textContent = "Snapshot fetch failed. Check the Java server.";
  }
}

function renderSnapshot() {
  if (!state.snapshot) {
    return;
  }

  const { metrics, status, layers, feed, markets, regions, events } = state.snapshot;
  elements.loadValue.textContent = `${metrics.systemLoad}%`;
  elements.alertsValue.textContent = metrics.criticalCount;
  elements.modeValue.textContent = "LOCAL";
  elements.pipelineValue.textContent = status.feedPath;
  elements.commandResponse.textContent = status.banner;

  renderOverlayControls();
  renderTerminalTabs();
  renderLayers(layers);
  renderFeed(feed);
  renderMarkets(markets);
  renderRegions(regions);
  updateMapData(events);
  renderAllChains();
  renderRelationships(markets);
  applyTerminalTab();
}

function renderOverlayControls() {
  elements.overlayControls.innerHTML = OVERLAY_DEFS.map((overlay) => {
    const active = state.overlayVisibility[overlay.id];
    const count = state.overlayCounts[overlay.id] || 0;
    return `
      <button class="overlay-toggle ${active ? "active" : ""}" data-overlay-id="${overlay.id}">
        <div class="overlay-toggle-row">
          <span>${overlay.label}</span>
          <span class="overlay-toggle-count">${count}</span>
        </div>
        <div class="overlay-toggle-copy">${overlay.copy}</div>
      </button>
    `;
  }).join("");

  Array.from(elements.overlayControls.querySelectorAll("[data-overlay-id]")).forEach((button) => {
    button.addEventListener("click", () => {
      const overlayId = button.getAttribute("data-overlay-id");
      state.overlayVisibility[overlayId] = !state.overlayVisibility[overlayId];
      renderOverlayControls();
      applyOverlayVisibility();
    });
  });
}

function renderTerminalTabs() {
  elements.terminalTabs.innerHTML = TERMINAL_TABS.map((tab) => `
    <button class="terminal-tab ${state.activeTerminalTab === tab.id ? "active" : ""}" data-terminal-tab="${tab.id}">
      ${tab.label}
    </button>
  `).join("");

  Array.from(elements.terminalTabs.querySelectorAll("[data-terminal-tab]")).forEach((button) => {
    button.addEventListener("click", () => {
      state.activeTerminalTab = button.getAttribute("data-terminal-tab");
      renderTerminalTabs();
      applyTerminalTab();
    });
  });
}

function applyTerminalTab() {
  ["markets", "all-chains", "relationships"].forEach((tabId) => {
    const view = document.getElementById(`terminal-view-${tabId}`);
    if (!view) {
      return;
    }
    const isActive = state.activeTerminalTab === tabId;
    view.classList.toggle("active", isActive);
    view.classList.toggle(tabId, isActive);
  });
}

function renderLayers(layers) {
  const html = layers.map((layer) => {
    const active = state.visibleLayers.has(layer.id);
    return `
      <button class="layer-row ${active ? "active" : ""}" data-layer-id="${layer.id}">
        <div class="layer-name">
          <span>${layer.name}</span>
          <span class="layer-chip" style="color:${layer.color}; background:${layer.color};"></span>
        </div>
        <div class="layer-meta">${layer.category} | ${layer.activeCount} active<br>${layer.description}</div>
      </button>
    `;
  }).join("");

  elements.layerList.innerHTML = html;
  Array.from(elements.layerList.querySelectorAll("[data-layer-id]")).forEach((button) => {
    button.addEventListener("click", () => {
      const layerId = button.getAttribute("data-layer-id");
      if (state.visibleLayers.has(layerId)) {
        state.visibleLayers.delete(layerId);
      } else {
        state.visibleLayers.add(layerId);
      }
      renderLayers(layers);
      updateMapData(state.snapshot.events);
    });
  });
}

function renderFeed(feed) {
  elements.feedList.innerHTML = feed.map((item) => {
    const severityColor = severityColorFor(item.severity);
    const severityLabel = item.severity >= 4 ? "HIGH" : item.severity === 3 ? "MED" : "LOW";
    return `
      <article class="feed-row" data-feed-id="${item.id}">
        <div class="feed-headline">
          ${escapeHtml(item.headline)}
          <span class="feed-severity" style="background:${severityColor};">${severityLabel}</span>
        </div>
        <div class="feed-meta">${escapeHtml(item.source)} | ${escapeHtml(item.region)} | confidence ${Math.round(item.confidence * 100)}%</div>
        <div class="analysis-body">${escapeHtml(item.summary)}</div>
      </article>
    `;
  }).join("");

  Array.from(elements.feedList.querySelectorAll("[data-feed-id]")).forEach((row) => {
    row.addEventListener("click", () => {
      const eventId = row.getAttribute("data-feed-id");
      const selected = state.snapshot.events.find((item) => item.id === eventId);
      if (!selected) {
        return;
      }
      focusEvent(selected);
    });
  });
}

function renderAnalysis() {
  elements.analysisList.innerHTML = state.analysis.map((item) => {
    const tone = item.risk === "HIGH" ? "#f94144" : item.risk === "MED" ? "#ffb347" : "#70e000";
    return `
      <article class="analysis-row">
        <div class="analysis-title">${escapeHtml(item.title)}</div>
        <div class="analysis-body">${escapeHtml(item.narrative)}</div>
        <div class="analysis-risk" style="background:${tone}; color:#05070b;">
          ${escapeHtml(item.category)} / ${escapeHtml(item.risk)} / ${item.score}
        </div>
      </article>
    `;
  }).join("");
}

function renderMarkets(markets) {
  elements.marketGrid.innerHTML = markets.map((market) => {
    const trend = normalizeTrend(market.trend);
    const changeClass = Number(market.changePercent) >= 0 ? "positive" : "negative";
    const sparkline = trend.map((value) => `<span style="height:${value}%;"></span>`).join("");
    return `
      <article class="market-card">
        <div class="market-top">
          <div>
            <div class="market-symbol">${market.symbol}</div>
            <div class="market-meta">${escapeHtml(market.label)}</div>
            <div class="market-volume">VOL ${formatVolume(market.volume)}</div>
          </div>
          <div>
            <div class="market-price">${Number(market.price).toFixed(2)}</div>
            <div class="market-change ${changeClass}">${Number(market.changePercent).toFixed(2)}%</div>
          </div>
        </div>
        <div class="sparkline">${sparkline}</div>
      </article>
    `;
  }).join("");
}

function renderAllChains() {
  const ships = Object.values(state.lookups.ships).slice(0, 10);
  const air = Object.values(state.lookups.air).slice(0, 10);

  elements.allChainsGrid.innerHTML = `
    ${renderChainSection("SEA ROUTES", ROUTE_DEFS.length, ROUTE_DEFS.map((route) => `
      <button class="chain-item" data-focus-type="route" data-focus-id="${route.id}">
        <div class="chain-item-title">${escapeHtml(route.name)}</div>
        <div class="chain-item-meta">${escapeHtml(route.corridor)} | ${escapeHtml(route.operators)}</div>
        <div class="chain-item-chip">${escapeHtml(route.status)}</div>
      </button>
    `).join(""))}
    ${renderChainSection("LIVE VESSELS", ships.length, ships.map((ship) => `
      <button class="chain-item" data-focus-type="ship" data-focus-id="${ship.id}">
        <div class="chain-item-title">${escapeHtml(ship.vessel)}</div>
        <div class="chain-item-meta">${escapeHtml(ship.className)} | ${escapeHtml(ship.routeTag)}</div>
        <div class="chain-item-copy">${escapeHtml(ship.callsign)} | ${escapeHtml(ship.speed)} | ${escapeHtml(ship.heading)}</div>
        <div class="chain-item-chip">${escapeHtml(ship.status)}</div>
      </button>
    `).join(""))}
    ${renderChainSection("AIR TRAFFIC", air.length, air.map((flight) => `
      <button class="chain-item" data-focus-type="air" data-focus-id="${flight.id}">
        <div class="chain-item-title">${escapeHtml(flight.flight)}</div>
        <div class="chain-item-meta">${escapeHtml(flight.airframe)} | ${escapeHtml(flight.routeLabel)}</div>
        <div class="chain-item-copy">${escapeHtml(flight.altitude)} | ${escapeHtml(flight.groundSpeed)} | ${escapeHtml(flight.status)}</div>
        <div class="chain-item-chip">${escapeHtml(flight.originCode)} -> ${escapeHtml(flight.destinationCode)}</div>
      </button>
    `).join(""))}
    ${renderChainSection("SUBSEA CABLES", SUBSEA_CABLE_DEFS.length, SUBSEA_CABLE_DEFS.map((cable) => `
      <button class="chain-item" data-focus-type="cable" data-focus-id="${cable.id}">
        <div class="chain-item-title">${escapeHtml(cable.name)}</div>
        <div class="chain-item-meta">${escapeHtml(cable.operator)} | ${escapeHtml(cable.capacity)}</div>
        <div class="chain-item-copy">${escapeHtml(cable.landing)}</div>
        <div class="chain-item-chip">${escapeHtml(cable.companies.join(" / "))}</div>
      </button>
    `).join(""))}
  `;

  bindChainFocusHandlers(elements.allChainsGrid);
}

function renderRelationships(markets) {
  elements.relationshipGrid.innerHTML = COMPANY_GRAPH.map((company) => `
    <button class="company-card" data-focus-type="company" data-focus-id="${company.id}">
      <div class="company-name">${escapeHtml(company.name)}</div>
      <div class="company-meta">${escapeHtml(company.sector)} | ${escapeHtml(company.ticker)}</div>
      <div class="company-copy">${escapeHtml(company.summary)}</div>
      <div class="company-chip">${escapeHtml(company.signal)} ${escapeHtml(companySignalValue(markets, company.signal))}</div>
      <div class="company-links">
        ${company.connections.map((name) => `<span class="company-link">${escapeHtml(name)}</span>`).join("")}
      </div>
    </button>
  `).join("");

  bindChainFocusHandlers(elements.relationshipGrid);
}

function renderChainSection(title, count, itemsHtml) {
  return `
    <section class="chain-section">
      <div class="chain-section-head">
        <div class="chain-title">${title}</div>
        <div class="chain-count">${count}</div>
      </div>
      <div class="chain-list">${itemsHtml}</div>
    </section>
  `;
}

function bindChainFocusHandlers(root) {
  Array.from(root.querySelectorAll("[data-focus-type]")).forEach((button) => {
    button.addEventListener("click", () => {
      handleTerminalFocus(
        button.getAttribute("data-focus-type"),
        button.getAttribute("data-focus-id")
      );
    });
  });
}

function handleTerminalFocus(type, id) {
  if (type === "route") {
    focusRoute(id);
    return;
  }
  if (type === "ship") {
    focusShip(id);
    return;
  }
  if (type === "air") {
    focusAir(id);
    return;
  }
  if (type === "cable") {
    focusCable(id);
    return;
  }
  if (type === "company") {
    focusCompany(id);
  }
}

function renderRegions(regions) {
  elements.regionList.innerHTML = regions.map((region) => `
    <div class="region-row">
      <span>${escapeHtml(region.region)}</span>
      <strong>${region.count}</strong>
    </div>
  `).join("");
}

function renderSelection(detail) {
  const current = detail || state.selectedDetail;
  state.selectedDetail = current || null;
  if (!current) {
    elements.selectionCard.innerHTML = `
      <div class="selection-empty">
        Click a marker, ship, aircraft, cable, route, or company card to inspect the active chain.
      </div>
    `;
    return;
  }

  const chipColor = current.kind === "route"
    ? "#4cc9f0"
    : current.kind === "ship"
      ? "#00d4ff"
      : current.kind === "air"
        ? "#ffd166"
        : current.kind === "cable"
          ? "#8ce99a"
          : current.kind === "company"
            ? "#ffb347"
            : severityColorFor(current.severity || 2);
  elements.selectionCard.innerHTML = `
    <div class="selection-title">${escapeHtml(current.title)}</div>
    <div class="selection-meta">${escapeHtml(current.subtitle)}</div>
    <div class="selection-chip" style="background:${chipColor}; color:#05070b;">
      ${escapeHtml(current.chip)}
    </div>
    <div class="selection-meta">${escapeHtml(current.body)}</div>
    <div class="selection-grid">
      ${(current.stats || []).map((stat) => `
        <div class="selection-stat">
          <div class="selection-stat-label">${escapeHtml(stat.label)}</div>
          <div class="selection-stat-value">${escapeHtml(stat.value)}</div>
        </div>
      `).join("")}
    </div>
  `;
}

function updateMapData(events) {
  if (!map.getSource("intel")) {
    return;
  }

  const visibleEvents = events.filter((event) => state.visibleLayers.has(event.layerId));
  const intelFeatures = [];
  const shipFeatures = [];
  const airFeatures = [];
  const airRouteFeatures = [];
  const eventLookup = {};
  const shipLookup = {};
  const airLookup = {};

  visibleEvents.forEach((event) => {
    eventLookup[event.id] = event;
    if (SHIP_LAYER_IDS.has(event.layerId)) {
      const shipFeature = toShipFeature(event);
      shipFeatures.push(shipFeature);
      shipLookup[shipFeature.properties.id] = shipFeature.properties;
      return;
    }
    if (AIR_LAYER_IDS.has(event.layerId)) {
      const airFeature = toAirFeature(event);
      airFeatures.push(airFeature);
      airRouteFeatures.push(toAirRouteFeature(airFeature.properties, event));
      airLookup[airFeature.properties.id] = airFeature.properties;
      return;
    }
    intelFeatures.push(toIntelFeature(event));
  });

  state.lookups.events = eventLookup;
  state.lookups.ships = shipLookup;
  state.lookups.air = airLookup;
  state.overlayCounts = {
    intel: intelFeatures.length,
    ships: shipFeatures.length,
    routes: ROUTE_DEFS.length,
    cables: SUBSEA_CABLE_DEFS.length,
    air: airFeatures.length
  };

  map.getSource("intel").setData(featureCollection(intelFeatures));
  map.getSource("ships").setData(featureCollection(shipFeatures));
  map.getSource("air").setData(featureCollection(airFeatures));
  map.getSource("air-routes").setData(featureCollection(airRouteFeatures));
  map.getSource("routes").setData(featureCollection(buildRouteFeatures()));
  map.getSource("cables").setData(featureCollection(buildCableFeatures()));
  renderOverlayControls();
  applyOverlayVisibility();
}

function addMapLayers() {
  addGeoJsonSource("intel", featureCollection([]));
  addGeoJsonSource("ships", featureCollection([]));
  addGeoJsonSource("air", featureCollection([]));
  addGeoJsonSource("air-routes", featureCollection([]));
  addGeoJsonSource("routes", featureCollection(buildRouteFeatures()));
  addGeoJsonSource("cables", featureCollection(buildCableFeatures()));

  addLayerIfMissing({
    id: "route-glow",
    type: "line",
    source: "routes",
    paint: {
      "line-color": "#4cc9f0",
      "line-width": ["interpolate", ["linear"], ["zoom"], 0.5, 3, 6, 9],
      "line-opacity": 0.14,
      "line-blur": 1
    }
  });

  addLayerIfMissing({
    id: "route-main",
    type: "line",
    source: "routes",
    paint: {
      "line-color": "#7ce8ff",
      "line-width": ["interpolate", ["linear"], ["zoom"], 0.5, 1, 6, 3.2],
      "line-opacity": 0.58,
      "line-dasharray": [2, 2]
    }
  });

  addLayerIfMissing({
    id: "route-hit",
    type: "line",
    source: "routes",
    paint: {
      "line-color": "rgba(0, 0, 0, 0)",
      "line-width": 14
    }
  });

  addLayerIfMissing({
    id: "cable-glow",
    type: "line",
    source: "cables",
    paint: {
      "line-color": "#8ce99a",
      "line-width": ["interpolate", ["linear"], ["zoom"], 0.5, 3, 6, 8],
      "line-opacity": 0.12,
      "line-blur": 1
    }
  });

  addLayerIfMissing({
    id: "cable-main",
    type: "line",
    source: "cables",
    paint: {
      "line-color": "#a9ffb8",
      "line-width": ["interpolate", ["linear"], ["zoom"], 0.5, 0.9, 6, 2.6],
      "line-opacity": 0.46
    }
  });

  addLayerIfMissing({
    id: "cable-hit",
    type: "line",
    source: "cables",
    paint: {
      "line-color": "rgba(0, 0, 0, 0)",
      "line-width": 16
    }
  });

  addLayerIfMissing({
    id: "air-routes",
    type: "line",
    source: "air-routes",
    paint: {
      "line-color": "#ffd166",
      "line-width": ["interpolate", ["linear"], ["zoom"], 0.5, 0.7, 6, 2.2],
      "line-opacity": 0.32,
      "line-dasharray": [1.5, 1.5]
    }
  });

  addLayerIfMissing({
    id: "intel-glow",
    type: "circle",
    source: "intel",
    paint: {
      "circle-radius": ["interpolate", ["linear"], ["get", "severity"], 1, 8, 5, 22],
      "circle-color": ["get", "color"],
      "circle-opacity": 0.18,
      "circle-blur": 1.1
    }
  });

  addLayerIfMissing({
    id: "intel-points",
    type: "circle",
    source: "intel",
    paint: {
      "circle-radius": ["interpolate", ["linear"], ["get", "severity"], 1, 4, 3, 8, 5, 12],
      "circle-color": ["get", "color"],
      "circle-opacity": 0.84,
      "circle-stroke-color": "#fff8e7",
      "circle-stroke-width": 0.7,
      "circle-blur": 0.16
    }
  });

  addLayerIfMissing({
    id: "ship-points",
    type: "circle",
    source: "ships",
    paint: {
      "circle-radius": ["interpolate", ["linear"], ["zoom"], 0.5, 4, 6, 8],
      "circle-color": "#22d3ee",
      "circle-stroke-color": "#ecfeff",
      "circle-stroke-width": 1,
      "circle-opacity": 0.92
    }
  });

  addLayerIfMissing({
    id: "ship-labels",
    type: "symbol",
    source: "ships",
    minzoom: 3,
    layout: {
      "text-field": ["get", "callsign"],
      "text-size": 10,
      "text-offset": [0, 1.3],
      "text-anchor": "top"
    },
    paint: {
      "text-color": "#b8f7ff",
      "text-halo-color": "rgba(5, 7, 11, 0.95)",
      "text-halo-width": 1
    }
  });

  addLayerIfMissing({
    id: "air-points",
    type: "circle",
    source: "air",
    paint: {
      "circle-radius": ["interpolate", ["linear"], ["zoom"], 0.5, 4, 6, 8.5],
      "circle-color": "#ffd166",
      "circle-stroke-color": "#fff8e7",
      "circle-stroke-width": 1,
      "circle-opacity": 0.95
    }
  });

  addLayerIfMissing({
    id: "air-labels",
    type: "symbol",
    source: "air",
    minzoom: 3,
    layout: {
      "text-field": ["get", "flight"],
      "text-size": 10,
      "text-offset": [0, 1.3],
      "text-anchor": "top"
    },
    paint: {
      "text-color": "#fff1b2",
      "text-halo-color": "rgba(5, 7, 11, 0.95)",
      "text-halo-width": 1
    }
  });
}

function bindMapInteractions() {
  const interactiveLayers = ["intel-points", "ship-points", "ship-labels", "air-points", "air-labels", "route-hit", "cable-hit"];
  interactiveLayers.forEach((layerId) => {
    map.on("mouseenter", layerId, () => {
      map.getCanvas().style.cursor = "pointer";
    });
    map.on("mouseleave", layerId, () => {
      map.getCanvas().style.cursor = "";
    });
  });

  map.on("click", "intel-points", (event) => {
    const feature = firstFeature(event);
    if (feature) {
      const detail = detailFromIntelProperties(feature.properties);
      renderSelection(detail);
      showPopup(detail, feature.geometry.coordinates.slice());
    }
  });

  map.on("click", "ship-points", handleShipClick);
  map.on("click", "ship-labels", handleShipClick);
  map.on("click", "air-points", handleAirClick);
  map.on("click", "air-labels", handleAirClick);
  map.on("click", "route-hit", (event) => {
    const feature = firstFeature(event);
    if (feature) {
      focusRoute(feature.properties.id);
    }
  });
  map.on("click", "cable-hit", (event) => {
    const feature = firstFeature(event);
    if (feature) {
      focusCable(feature.properties.id);
    }
  });
}

function handleShipClick(event) {
  const feature = firstFeature(event);
  if (feature) {
    const detail = detailFromShipProperties(feature.properties);
    renderSelection(detail);
    showPopup(detail, feature.geometry.coordinates.slice());
  }
}

function handleAirClick(event) {
  const feature = firstFeature(event);
  if (feature) {
    const detail = detailFromAirProperties(feature.properties);
    renderSelection(detail);
    showPopup(detail, feature.geometry.coordinates.slice());
  }
}

function firstFeature(event) {
  return event.features && event.features[0] ? event.features[0] : null;
}

function showPopup(detail, coordinates) {
  if (state.activePopup) {
    state.activePopup.remove();
  }
  state.activePopup = new maplibregl.Popup({ closeButton: false, offset: 14 })
    .setLngLat(coordinates)
    .setHTML(`
      <div class="popup-card">
        <strong>${escapeHtml(detail.title)}</strong>
        <div>${escapeHtml(detail.subtitle)}</div>
      </div>
    `)
    .addTo(map);
}

function focusEvent(event) {
  const detail = AIR_LAYER_IDS.has(event.layerId)
    ? detailFromAirProperties(toAirFeature(event).properties)
    : SHIP_LAYER_IDS.has(event.layerId)
      ? detailFromShipProperties(toShipFeature(event).properties)
      : detailFromEvent(event);

  state.selectedEventId = event.id;
  renderSelection(detail);
  map.flyTo({
    center: [Number(event.longitude), Number(event.latitude)],
    zoom: detail.kind === "intel" ? 3.8 : 4.2,
    essential: true,
    duration: 1100
  });
  showPopup(detail, [Number(event.longitude), Number(event.latitude)]);
}

function focusRoute(routeId) {
  const route = state.lookups.routes[routeId];
  if (!route) {
    return;
  }
  const detail = detailFromRoute(route);
  renderSelection(detail);
  fitCoordinates(route.coordinates, 110);
  showPopup(detail, midpoint(route.coordinates));
}

function focusCable(cableId) {
  const cable = state.lookups.cables[cableId];
  if (!cable) {
    return;
  }
  const detail = detailFromCable(cable);
  renderSelection(detail);
  fitCoordinates(cable.coordinates, 110);
  showPopup(detail, midpoint(cable.coordinates));
}

function focusShip(shipId) {
  const ship = state.lookups.ships[shipId];
  if (!ship) {
    return;
  }
  const detail = detailFromShipProperties(ship);
  renderSelection(detail);
  map.flyTo({
    center: [ship.longitudeRaw, ship.latitudeRaw],
    zoom: 4.3,
    essential: true,
    duration: 1100
  });
  showPopup(detail, [ship.longitudeRaw, ship.latitudeRaw]);
}

function focusAir(airId) {
  const air = state.lookups.air[airId];
  if (!air) {
    return;
  }
  const detail = detailFromAirProperties(air);
  renderSelection(detail);
  map.flyTo({
    center: [air.longitudeRaw, air.latitudeRaw],
    zoom: 4.4,
    essential: true,
    duration: 1100
  });
  showPopup(detail, [air.longitudeRaw, air.latitudeRaw]);
}

function focusCompany(companyId) {
  const company = COMPANY_GRAPH.find((item) => item.id === companyId);
  if (!company) {
    return;
  }
  const detail = detailFromCompany(company);
  renderSelection(detail);
  if (company.focusType === "route") {
    focusRoute(company.focusId);
    renderSelection(detail);
    return;
  }
  if (company.focusType === "cable") {
    focusCable(company.focusId);
    renderSelection(detail);
    return;
  }
  if (company.focusType === "air") {
    const airMatch = Object.values(state.lookups.air).find((flight) => flight.layerId === company.focusId) || Object.values(state.lookups.air)[0];
    if (airMatch) {
      map.flyTo({
        center: [airMatch.longitudeRaw, airMatch.latitudeRaw],
        zoom: 4.2,
        essential: true,
        duration: 1100
      });
      showPopup(detail, [airMatch.longitudeRaw, airMatch.latitudeRaw]);
    }
  }
}

function applyOverlayVisibility() {
  setLayerVisibility(["intel-glow", "intel-points"], state.overlayVisibility.intel);
  setLayerVisibility(["ship-points", "ship-labels"], state.overlayVisibility.ships);
  setLayerVisibility(["route-glow", "route-main", "route-hit"], state.overlayVisibility.routes);
  setLayerVisibility(["cable-glow", "cable-main", "cable-hit"], state.overlayVisibility.cables);
  setLayerVisibility(["air-routes", "air-points", "air-labels"], state.overlayVisibility.air);
}

function setLayerVisibility(layerIds, visible) {
  layerIds.forEach((layerId) => {
    if (map.getLayer(layerId)) {
      map.setLayoutProperty(layerId, "visibility", visible ? "visible" : "none");
    }
  });
}

function addGeoJsonSource(id, data) {
  if (!map.getSource(id)) {
    map.addSource(id, {
      type: "geojson",
      data
    });
  }
}

function addLayerIfMissing(layer, beforeId) {
  if (!map.getLayer(layer.id)) {
    map.addLayer(layer, beforeId);
  }
}

function toIntelFeature(event) {
  return {
    type: "Feature",
    geometry: {
      type: "Point",
      coordinates: [Number(event.longitude), Number(event.latitude)]
    },
    properties: {
      id: event.id,
      kind: "intel",
      title: event.title,
      layerName: event.layerName,
      source: event.source,
      region: event.region,
      severity: Number(event.severity),
      confidence: Number(event.confidence),
      color: event.color,
      latitude: Number(event.latitude),
      longitude: Number(event.longitude)
    }
  };
}

function toShipFeature(event) {
  const isCarrier = event.layerId === "naval";
  const vessel = isCarrier
    ? pickFrom(event.id, "carrier-name", ["USS Gerald R. Ford", "INS Vikrant", "HMS Prince of Wales", "Charles de Gaulle", "Liaoning"])
    : `${pickFrom(event.id, "ship-name", ["Atlas", "Helios", "Mercury", "Orion", "Cetus", "Argus"])}-${seededRange(event.id, "ship-tail", 112, 984)}`;
  const className = isCarrier
    ? pickFrom(event.id, "carrier-class", ["Aircraft Carrier", "Carrier Strike Group", "Escort Group"])
    : pickFrom(event.id, "ship-class", ["Tanker", "Cargo", "Patrol", "Research", "Support"]);
  return {
    type: "Feature",
    geometry: {
      type: "Point",
      coordinates: [Number(event.longitude), Number(event.latitude)]
    },
    properties: {
      id: event.id,
      kind: "ship",
      layerId: event.layerId,
      vessel,
      callsign: `IMO-${seededRange(event.id, "ship-call", 1000, 9999)}`,
      speed: `${seededRange(event.id, "ship-speed", 9, 28)} kn`,
      heading: `${seededRange(event.id, "ship-heading", 0, 359)}°`,
      status: pickFrom(event.id, "ship-status", ["TRANSIT", "HOLDING", "ESCORT", "PORT APPROACH", "CONVOY"]),
      routeTag: pickFrom(event.id, "ship-route", ROUTE_DEFS.map((route) => route.name)),
      className,
      layerName: event.layerName,
      source: event.source,
      region: event.region,
      severity: Number(event.severity),
      confidence: Math.round(Number(event.confidence) * 100),
      latitude: formatCoordinate(event.latitude),
      longitude: formatCoordinate(event.longitude),
      latitudeRaw: Number(event.latitude),
      longitudeRaw: Number(event.longitude)
    }
  };
}

function toAirFeature(event) {
  const origin = FLIGHT_HUBS[seededNumber(event.id, "origin") % FLIGHT_HUBS.length];
  const destination = FLIGHT_HUBS[(seededNumber(event.id, "destination") % (FLIGHT_HUBS.length - 1) + 1) % FLIGHT_HUBS.length];
  return {
    type: "Feature",
    geometry: {
      type: "Point",
      coordinates: [Number(event.longitude), Number(event.latitude)]
    },
    properties: {
      id: event.id,
      kind: "air",
      layerId: event.layerId,
      flight: `${pickFrom(event.id, "air-prefix", ["RCH", "RECON", "PATROL", "NAVY", "FALCON", "MESA"])}-${seededRange(event.id, "air-tail", 31, 982)}`,
      airframe: pickFrom(event.id, "airframe", ["P-8A", "C-17", "E-3", "KC-135", "MQ-9", "A330 MRTT"]),
      altitude: `${seededRange(event.id, "altitude", 16000, 39000)} ft`,
      groundSpeed: `${seededRange(event.id, "ground-speed", 240, 540)} kt`,
      heading: `${seededRange(event.id, "air-heading", 0, 359)}°`,
      status: pickFrom(event.id, "air-status", ["ON STATION", "TRANSIT", "STACK", "HOLDING", "SURVEILLANCE"]),
      originCode: origin.code,
      destinationCode: destination.code,
      routeLabel: `${origin.code} -> ${destination.code}`,
      originCoords: origin.coords,
      destinationCoords: destination.coords,
      layerName: event.layerName,
      source: event.source,
      region: event.region,
      severity: Number(event.severity),
      confidence: Math.round(Number(event.confidence) * 100),
      latitude: formatCoordinate(event.latitude),
      longitude: formatCoordinate(event.longitude),
      latitudeRaw: Number(event.latitude),
      longitudeRaw: Number(event.longitude)
    }
  };
}

function toAirRouteFeature(properties, event) {
  return {
    type: "Feature",
    geometry: {
      type: "LineString",
      coordinates: [
        properties.originCoords,
        [Number(event.longitude), Number(event.latitude)],
        properties.destinationCoords
      ]
    },
    properties: {
      id: `air-route-${properties.id}`,
      flight: properties.flight
    }
  };
}

function buildRouteFeatures() {
  return ROUTE_DEFS.map((route) => ({
    type: "Feature",
    geometry: {
      type: "LineString",
      coordinates: route.coordinates
    },
    properties: {
      id: route.id,
      kind: "route",
      name: route.name,
      status: route.status,
      corridor: route.corridor,
      operators: route.operators,
      span: `${route.coordinates.length} waypoints`
    }
  }));
}

function buildCableFeatures() {
  return SUBSEA_CABLE_DEFS.map((cable) => ({
    type: "Feature",
    geometry: {
      type: "LineString",
      coordinates: cable.coordinates
    },
    properties: {
      id: cable.id,
      kind: "cable",
      name: cable.name,
      operator: cable.operator,
      capacity: cable.capacity,
      landing: cable.landing,
      companies: cable.companies.join(" / ")
    }
  }));
}

function detailFromEvent(event) {
  return {
    kind: "intel",
    title: event.title,
    subtitle: `${event.layerName} | ${event.source} | ${event.region}`,
    chip: `SEVERITY ${event.severity}`,
    body: event.summary,
    severity: Number(event.severity),
    stats: [
      { label: "Layer", value: event.layerName },
      { label: "Confidence", value: `${Math.round(Number(event.confidence) * 100)}%` },
      { label: "Latitude", value: formatCoordinate(event.latitude) },
      { label: "Longitude", value: formatCoordinate(event.longitude) }
    ]
  };
}

function detailFromIntelProperties(properties) {
  return {
    kind: "intel",
    title: properties.title,
    subtitle: `${properties.layerName} | ${properties.source} | ${properties.region}`,
    chip: `SEVERITY ${properties.severity}`,
    body: `Tracked intelligence marker refreshed from ${properties.source} in ${properties.region}.`,
    severity: Number(properties.severity),
    stats: [
      { label: "Layer", value: properties.layerName },
      { label: "Confidence", value: `${Math.round(Number(properties.confidence) * 100)}%` },
      { label: "Latitude", value: formatCoordinate(properties.latitude) },
      { label: "Longitude", value: formatCoordinate(properties.longitude) }
    ]
  };
}

function detailFromShipProperties(properties) {
  return {
    kind: "ship",
    title: properties.vessel,
    subtitle: `${properties.className} | ${properties.layerName} | ${properties.region}`,
    chip: `${properties.callsign} / ${properties.status}`,
    body: `Ship movement derived from ${properties.source}. Active route: ${properties.routeTag}.`,
    severity: Number(properties.severity),
    stats: [
      { label: "Speed", value: properties.speed },
      { label: "Heading", value: properties.heading },
      { label: "Confidence", value: `${properties.confidence}%` },
      { label: "Coords", value: `${properties.latitude}, ${properties.longitude}` }
    ]
  };
}

function detailFromAirProperties(properties) {
  return {
    kind: "air",
    title: properties.flight,
    subtitle: `${properties.airframe} | ${properties.layerName} | ${properties.region}`,
    chip: `${properties.status} / ${properties.altitude}`,
    body: `Flight corridor ${properties.routeLabel} sourced from ${properties.source}.`,
    severity: Number(properties.severity),
    stats: [
      { label: "Speed", value: properties.groundSpeed },
      { label: "Heading", value: properties.heading },
      { label: "Route", value: properties.routeLabel },
      { label: "Confidence", value: `${properties.confidence}%` }
    ]
  };
}

function detailFromRouteProperties(properties) {
  return {
    kind: "route",
    title: properties.name,
    subtitle: `${properties.corridor} corridor`,
    chip: properties.status,
    body: `Strategic sea route overlay for container, tanker, and naval transit monitoring.`,
    stats: [
      { label: "Status", value: properties.status },
      { label: "Corridor", value: properties.corridor },
      { label: "Coverage", value: properties.span },
      { label: "Type", value: "Maritime route" }
    ]
  };
}

function detailFromRoute(route) {
  return {
    kind: "route",
    title: route.name,
    subtitle: `${route.corridor} corridor`,
    chip: route.status,
    body: `Strategic maritime route with operators ${route.operators}.`,
    stats: [
      { label: "Operators", value: route.operators },
      { label: "Corridor", value: route.corridor },
      { label: "Coverage", value: `${route.coordinates.length} waypoints` },
      { label: "Type", value: "Sea route" }
    ]
  };
}

function detailFromCable(cable) {
  return {
    kind: "cable",
    title: cable.name,
    subtitle: `${cable.operator} | ${cable.capacity}`,
    chip: cable.landing,
    body: `Subsea internet backbone linking landing sites with operators ${cable.companies.join(", ")}.`,
    stats: [
      { label: "Operator", value: cable.operator },
      { label: "Capacity", value: cable.capacity },
      { label: "Landing", value: cable.landing },
      { label: "Companies", value: cable.companies.join(", ") }
    ]
  };
}

function detailFromCompany(company) {
  return {
    kind: "company",
    title: company.name,
    subtitle: `${company.sector} | ${company.ticker}`,
    chip: `${company.signal} ${companySignalValue(state.snapshot ? state.snapshot.markets : [], company.signal)}`,
    body: company.summary,
    stats: [
      { label: "Signal", value: company.signal },
      { label: "Connections", value: String(company.connections.length) },
      { label: "Focus", value: company.focusType.toUpperCase() },
      { label: "Links", value: company.connections.join(", ") }
    ]
  };
}

function featureCollection(features) {
  return {
    type: "FeatureCollection",
    features
  };
}

function buildLookup(items) {
  return items.reduce((lookup, item) => {
    lookup[item.id] = item;
    return lookup;
  }, {});
}

function fitCoordinates(coordinates, padding) {
  const bounds = coordinates.reduce((memo, coordinate) => memo.extend(coordinate), new maplibregl.LngLatBounds(coordinates[0], coordinates[0]));
  map.fitBounds(bounds, {
    padding,
    duration: 1100,
    maxZoom: 4.4,
    essential: true
  });
}

function midpoint(coordinates) {
  return coordinates[Math.floor(coordinates.length / 2)];
}

function companySignalValue(markets, symbol) {
  const market = (markets || []).find((item) => item.symbol === symbol);
  return market ? `${Number(market.price).toFixed(2)} (${Number(market.changePercent).toFixed(2)}%)` : "NA";
}

function normalizeTrend(values) {
  const numbers = values.map(Number);
  const min = Math.min.apply(null, numbers);
  const max = Math.max.apply(null, numbers);
  const spread = Math.max(max - min, 0.01);
  return numbers.map((value) => {
    const ratio = ((value - min) / spread) * 88 + 8;
    return Math.round(ratio);
  });
}

function severityColorFor(severity) {
  if (severity >= 5) {
    return "#f94144";
  }
  if (severity === 4) {
    return "#f3722c";
  }
  if (severity === 3) {
    return "#ffb347";
  }
  return "#70e000";
}

function seededNumber(id, salt) {
  const input = `${id}:${salt}`;
  let hash = 0;
  for (let index = 0; index < input.length; index += 1) {
    hash = (hash * 31 + input.charCodeAt(index)) % 1000003;
  }
  return hash;
}

function seededRange(id, salt, min, max) {
  return min + (seededNumber(id, salt) % (max - min + 1));
}

function pickFrom(id, salt, values) {
  return values[seededNumber(id, salt) % values.length];
}

function formatCoordinate(value) {
  return Number(value).toFixed(2);
}

function formatVolume(value) {
  return `${Number(value).toFixed(1)}M`;
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

let frameCount = 0;
let lastFpsSample = performance.now();
function trackFrame() {
  frameCount += 1;
  const now = performance.now();
  if (now - lastFpsSample >= 1000) {
    const fps = Math.round((frameCount * 1000) / (now - lastFpsSample));
    elements.fpsValue.textContent = String(fps);
    frameCount = 0;
    lastFpsSample = now;
  }
  requestAnimationFrame(trackFrame);
}
requestAnimationFrame(trackFrame);
