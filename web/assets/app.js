const state = {
  snapshot: null,
  analysis: [],
  visibleLayers: new Set(),
  selectedEventId: null
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
  regionList: document.getElementById("region-list"),
  commandInput: document.getElementById("command-input"),
  commandResponse: document.getElementById("command-response"),
  pipelineValue: document.getElementById("pipeline-value")
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
  style: {
    version: 8,
    projection: { type: "globe" },
    sources: {
      dark: {
        type: "raster",
        tiles: [
          "https://tile.openstreetmap.org/{z}/{x}/{y}.png"
        ],
        tileSize: 256,
        attribution: "&copy; OpenStreetMap contributors"
      }
    },
    layers: [
      {
        id: "dark",
        type: "raster",
        source: "dark",
        paint: {
          "raster-opacity": 0.35,
          "raster-brightness-min": 0.05,
          "raster-brightness-max": 0.55,
          "raster-saturation": -0.75
        }
      }
    ]
  },
  center: [18, 14],
  zoom: 1.35,
  antialias: true,
  dragRotate: true
});

map.addControl(new maplibregl.NavigationControl({ visualizePitch: true }), "bottom-right");

map.on("style.load", () => {
  if (typeof map.setProjection === "function") {
    map.setProjection({ type: "globe" });
  }
  if (typeof map.setFog === "function") {
    map.setFog({
      color: "rgb(9, 13, 20)",
      "high-color": "rgb(25, 31, 39)",
      "horizon-blend": 0.08,
      "space-color": "rgb(2, 4, 8)"
    });
  }
});

map.on("load", () => {
  if (!map.getSource("events")) {
    map.addSource("events", {
      type: "geojson",
      data: featureCollection([])
    });
  }

  map.addLayer({
    id: "event-points",
    type: "circle",
    source: "events",
    paint: {
      "circle-radius": [
        "interpolate",
        ["linear"],
        ["get", "severity"],
        1, 4,
        3, 8,
        5, 12
      ],
      "circle-color": ["get", "color"],
      "circle-opacity": 0.82,
      "circle-stroke-color": "#fff8e7",
      "circle-stroke-width": 0.7,
      "circle-blur": 0.18
    }
  });

  map.addLayer({
    id: "event-glow",
    type: "circle",
    source: "events",
    paint: {
      "circle-radius": [
        "interpolate",
        ["linear"],
        ["get", "severity"],
        1, 8,
        5, 22
      ],
      "circle-color": ["get", "color"],
      "circle-opacity": 0.18,
      "circle-blur": 1.1
    }
  }, "event-points");

  map.on("click", "event-points", (event) => {
    const feature = event.features && event.features[0];
    if (!feature) {
      return;
    }
    state.selectedEventId = feature.properties.id;
    const coordinates = feature.geometry.coordinates.slice();
    const html = `
      <div class="popup-card">
        <strong>${feature.properties.title}</strong>
        <div>${feature.properties.layerName}</div>
        <div>${feature.properties.source} / ${feature.properties.region}</div>
      </div>`;
    new maplibregl.Popup({ closeButton: false, offset: 14 })
      .setLngLat(coordinates)
      .setHTML(html)
      .addTo(map);
  });

  loadSnapshot();
  setInterval(loadSnapshot, 2200);
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

  renderLayers(layers);
  renderFeed(feed);
  renderMarkets(markets);
  renderRegions(regions);
  updateMap(events);
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
      updateMap(state.snapshot.events);
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
          ${item.headline}
          <span class="feed-severity" style="background:${severityColor};">${severityLabel}</span>
        </div>
        <div class="feed-meta">${item.source} | ${item.region} | confidence ${Math.round(item.confidence * 100)}%</div>
        <div class="analysis-body">${item.summary}</div>
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
      map.flyTo({
        center: [selected.longitude, selected.latitude],
        zoom: 3.2,
        essential: true,
        duration: 1400
      });
      state.selectedEventId = selected.id;
    });
  });
}

function renderAnalysis() {
  elements.analysisList.innerHTML = state.analysis.map((item) => {
    const tone = item.risk === "HIGH" ? "#f94144" : item.risk === "MED" ? "#ffb347" : "#70e000";
    return `
      <article class="analysis-row">
        <div class="analysis-title">${item.title}</div>
        <div class="analysis-body">${item.narrative}</div>
        <div class="analysis-risk" style="background:${tone}; color:#05070b;">
          ${item.category} / ${item.risk} / ${item.score}
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
            <div class="market-meta">${market.label}</div>
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

function renderRegions(regions) {
  elements.regionList.innerHTML = regions.map((region) => `
    <div class="region-row">
      <span>${region.region}</span>
      <strong>${region.count}</strong>
    </div>
  `).join("");
}

function updateMap(events) {
  if (!map.getSource("events")) {
    return;
  }
  const visibleEvents = events.filter((event) => state.visibleLayers.has(event.layerId));
  map.getSource("events").setData(featureCollection(visibleEvents.map((event) => ({
    type: "Feature",
    geometry: {
      type: "Point",
      coordinates: [Number(event.longitude), Number(event.latitude)]
    },
    properties: {
      id: event.id,
      title: event.title,
      layerName: event.layerName,
      source: event.source,
      region: event.region,
      severity: Number(event.severity),
      color: event.color
    }
  }))));
}

function featureCollection(features) {
  return {
    type: "FeatureCollection",
    features
  };
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
