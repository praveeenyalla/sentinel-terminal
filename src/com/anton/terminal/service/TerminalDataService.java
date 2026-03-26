package com.anton.terminal.service;

import com.anton.terminal.model.IntelEvent;
import com.anton.terminal.model.IntelLayer;
import com.anton.terminal.model.MarketTicker;

import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;
import java.text.DecimalFormat;
import java.text.DecimalFormatSymbols;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Random;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.TimeUnit;

public final class TerminalDataService {
    private static final int TARGET_EVENT_COUNT = 1200;
    private static final DecimalFormat NUMBER_FORMAT = new DecimalFormat("0.00", DecimalFormatSymbols.getInstance(Locale.US));

    private final Random random = new Random();
    private final ScheduledExecutorService scheduler = Executors.newSingleThreadScheduledExecutor();
    private final List<IntelLayer> layers = new ArrayList<IntelLayer>();
    private final List<IntelEvent> events = new ArrayList<IntelEvent>();
    private final List<MarketTicker> markets = new ArrayList<MarketTicker>();
    private final List<GeoHub> hubs = new ArrayList<GeoHub>();
    private final long startTime = System.currentTimeMillis();
    private long pulseSequence = 0L;
    private String commandBanner = "Bloomberg-class style terminal built in pure Java 8.";

    public TerminalDataService() {
        seedLayers();
        seedHubs();
        seedMarkets();
        seedEvents();
        scheduler.scheduleAtFixedRate(new Runnable() {
            @Override
            public void run() {
                refresh();
            }
        }, 1200L, 1800L, TimeUnit.MILLISECONDS);
    }

    public synchronized String getSnapshotJson() {
        StringBuilder sb = new StringBuilder(1024 * 256);
        long now = System.currentTimeMillis();
        Map<String, Integer> layerCounts = countEventsByLayer();
        int criticalCount = 0;
        for (IntelEvent event : events) {
            if (event.getSeverity() >= 4) {
                criticalCount++;
            }
        }

        sb.append('{');
        field(sb, "generatedAt", now).append(',');
        field(sb, "uptimeSeconds", (now - startTime) / 1000L).append(',');
        sb.append("\"metrics\":{");
        field(sb, "layerCount", layers.size()).append(',');
        field(sb, "eventCount", events.size()).append(',');
        field(sb, "criticalCount", criticalCount).append(',');
        field(sb, "marketStress", doubleValue(42.0 + random.nextDouble() * 28.0)).append(',');
        field(sb, "systemLoad", doubleValue(27.0 + random.nextDouble() * 14.0)).append(',');
        stringField(sb, "analysisMode", "browser-worker");
        sb.append("},");

        sb.append("\"status\":{");
        stringField(sb, "banner", commandBanner).append(',');
        stringField(sb, "feedPath", "RSS -> edge collector -> Java core -> browser worker").append(',');
        stringField(sb, "mapMode", "globe");
        sb.append("},");

        sb.append("\"layers\":[");
        for (int i = 0; i < layers.size(); i++) {
            IntelLayer layer = layers.get(i);
            if (i > 0) {
                sb.append(',');
            }
            sb.append('{');
            stringField(sb, "id", layer.getId()).append(',');
            stringField(sb, "name", layer.getName()).append(',');
            stringField(sb, "category", layer.getCategory()).append(',');
            stringField(sb, "color", layer.getColor()).append(',');
            stringField(sb, "description", layer.getDescription()).append(',');
            field(sb, "activeCount", layerCounts.containsKey(layer.getId()) ? layerCounts.get(layer.getId()) : 0);
            sb.append('}');
        }
        sb.append("],");

        List<IntelEvent> sortedEvents = new ArrayList<IntelEvent>(events);
        Collections.sort(sortedEvents, new Comparator<IntelEvent>() {
            @Override
            public int compare(IntelEvent left, IntelEvent right) {
                if (left.getUpdatedAt() == right.getUpdatedAt()) {
                    return left.getId().compareTo(right.getId());
                }
                return left.getUpdatedAt() > right.getUpdatedAt() ? -1 : 1;
            }
        });

        sb.append("\"events\":[");
        for (int i = 0; i < sortedEvents.size(); i++) {
            IntelEvent event = sortedEvents.get(i);
            if (i > 0) {
                sb.append(',');
            }
            appendEvent(sb, event);
        }
        sb.append("],");

        sb.append("\"feed\":[");
        int feedSize = Math.min(28, sortedEvents.size());
        for (int i = 0; i < feedSize; i++) {
            IntelEvent event = sortedEvents.get(i);
            if (i > 0) {
                sb.append(',');
            }
            sb.append('{');
            stringField(sb, "id", event.getId()).append(',');
            stringField(sb, "headline", event.getTitle()).append(',');
            stringField(sb, "summary", event.getSummary()).append(',');
            stringField(sb, "source", event.getSource()).append(',');
            stringField(sb, "region", event.getRegion()).append(',');
            stringField(sb, "layerId", event.getLayerId()).append(',');
            field(sb, "severity", event.getSeverity()).append(',');
            field(sb, "confidence", doubleValue(event.getConfidence())).append(',');
            field(sb, "updatedAt", event.getUpdatedAt());
            sb.append('}');
        }
        sb.append("],");

        sb.append("\"markets\":[");
        for (int i = 0; i < markets.size(); i++) {
            MarketTicker market = markets.get(i);
            if (i > 0) {
                sb.append(',');
            }
            sb.append('{');
            stringField(sb, "symbol", market.getSymbol()).append(',');
            stringField(sb, "label", market.getLabel()).append(',');
            field(sb, "price", doubleValue(market.getPrice())).append(',');
            field(sb, "changePercent", doubleValue(market.getChangePercent())).append(',');
            field(sb, "volume", doubleValue(market.getVolume())).append(',');
            sb.append("\"trend\":[");
            double[] trend = market.getTrend();
            for (int j = 0; j < trend.length; j++) {
                if (j > 0) {
                    sb.append(',');
                }
                sb.append(doubleValue(trend[j]));
            }
            sb.append(']');
            sb.append('}');
        }
        sb.append("],");

        sb.append("\"regions\":[");
        appendRegions(sb);
        sb.append(']');

        sb.append('}');
        return sb.toString();
    }

    public synchronized String handleCommand(String rawQuery) {
        String query = rawQuery == null ? "" : rawQuery.trim();
        String decoded = query;
        try {
            decoded = URLDecoder.decode(query, StandardCharsets.UTF_8.name());
        } catch (Exception ignored) {
        }
        String normalized = decoded.trim().toUpperCase(Locale.US);
        String message = "Unknown command. Try HELP.";
        String focus = "";

        if (normalized.length() == 0) {
            message = "Type HELP for commands.";
        } else if ("HELP".equals(normalized)) {
            message = "HELP | LAYER <id> | WATCH <symbol> | REGION <name> | STATUS";
        } else if ("STATUS".equals(normalized)) {
            message = "42+ intelligence layers online. " + events.size() + " active markers. Browser analysis active.";
        } else if (normalized.startsWith("LAYER ")) {
            String requestedLayer = normalized.substring(6).trim();
            IntelLayer match = findLayer(requestedLayer);
            if (match != null) {
                Map<String, Integer> counts = countEventsByLayer();
                int activeCount = counts.containsKey(match.getId()) ? counts.get(match.getId()) : 0;
                message = match.getName() + " | " + activeCount + " active markers | " + match.getDescription();
                focus = match.getId();
            } else {
                message = "Layer not found: " + requestedLayer;
            }
        } else if (normalized.startsWith("WATCH ")) {
            String requestedSymbol = normalized.substring(6).trim();
            MarketTicker market = findMarket(requestedSymbol);
            if (market != null) {
                message = market.getLabel() + " " + NUMBER_FORMAT.format(market.getPrice()) + " (" + NUMBER_FORMAT.format(market.getChangePercent()) + "%)";
                focus = market.getSymbol();
            } else {
                message = "Market symbol not found: " + requestedSymbol;
            }
        } else if (normalized.startsWith("REGION ")) {
            String region = normalized.substring(7).trim();
            int count = countRegion(region);
            message = region + " has " + count + " active items in the stream.";
            focus = region;
        }

        commandBanner = message;
        StringBuilder sb = new StringBuilder(256);
        sb.append('{');
        stringField(sb, "query", decoded).append(',');
        stringField(sb, "message", message).append(',');
        stringField(sb, "focus", focus).append(',');
        field(sb, "generatedAt", System.currentTimeMillis());
        sb.append('}');
        return sb.toString();
    }

    public synchronized void shutdown() {
        scheduler.shutdownNow();
    }

    private void refresh() {
        synchronized (this) {
            pulseSequence++;
            for (MarketTicker market : markets) {
                double drift = (random.nextDouble() - 0.5) * 1.8;
                double nextPrice = Math.max(1.0, market.getPrice() * (1.0 + (drift / 100.0)));
                double nextChange = market.getChangePercent() * 0.4 + drift;
                double nextVolume = Math.max(0.1, market.getVolume() + (random.nextDouble() - 0.5) * 2.4);
                market.tick(nextPrice, nextChange, nextVolume);
            }

            int touches = 24;
            for (int i = 0; i < touches; i++) {
                IntelEvent event = events.get(random.nextInt(events.size()));
                GeoHub hub = hubs.get(random.nextInt(hubs.size()));
                int severity = clampSeverity(event.getSeverity() + random.nextInt(3) - 1);
                double confidence = clampConfidence(event.getConfidence() + ((random.nextDouble() - 0.5) * 0.14));
                double latitude = clampLatitude(hub.latitude + jitter(3.2));
                double longitude = normalizeLongitude(hub.longitude + jitter(3.2));
                String headline = buildHeadline(event.getLayerName(), hub.name, severity);
                String summary = buildSummary(event.getLayerName(), hub.name, event.getSource(), severity);
                event.update(headline, summary, latitude, longitude, severity, confidence, System.currentTimeMillis());
            }

            int rotate = 8;
            for (int i = 0; i < rotate; i++) {
                int index = random.nextInt(events.size());
                events.set(index, generateEvent(index + pulseSequence * 7L));
            }
        }
    }

    private void seedLayers() {
        addLayer("conflicts", "Conflict Zones", "Security", "#ff6b1a", "Kinetic incidents, front lines, and ceasefire pressure points.");
        addLayer("airbases", "Military Airbases", "Infrastructure", "#ffd43b", "Active airbases, rapid sortie hubs, and dispersal fields.");
        addLayer("naval", "Naval Bases", "Infrastructure", "#4cc9f0", "Fleet staging ports, submarine pens, and replenishment harbors.");
        addLayer("missiles", "Missile Sites", "Security", "#ff5d73", "Strategic missile batteries, SAM envelopes, and launch posture.");
        addLayer("cables", "Undersea Cables", "Infrastructure", "#86efac", "Subsea cable landing points and chokepoint vulnerability mapping.");
        addLayer("fires", "Satellite Fire Detections", "Disaster", "#ff9f1c", "Thermal anomalies from wildfire and industrial burn signatures.");
        addLayer("adsb", "Military ADS-B", "Aerospace", "#8ecae6", "Military and government aircraft telemetry from open signals.");
        addLayer("ais", "AIS Vessel Tracking", "Maritime", "#00b4d8", "Commercial and gray-zone maritime traffic lanes.");
        addLayer("cyber", "Cyber Threat Indicators", "Cyber", "#f72585", "Malware, botnet, phishing, and infrastructure exposure detections.");
        addLayer("telegram", "Telegram OSINT", "Social", "#90be6d", "Open-source channels, regional chatter, and rapid incident claims.");
        addLayer("quakes", "Earthquake Monitor", "Disaster", "#f8961e", "Global seismic events, aftershock clusters, and swarm alerts.");
        addLayer("energy", "Energy Nodes", "Economics", "#f9c74f", "Refineries, LNG terminals, substations, and pipeline nodes.");
        addLayer("grid", "Power Grid", "Infrastructure", "#e9ff70", "Grid instability, blackout reports, and regional load anomalies.");
        addLayer("satcom", "SATCOM Outages", "Aerospace", "#9d4edd", "Satellite communications degradations and service interruptions.");
        addLayer("space", "Space Launch Activity", "Aerospace", "#c77dff", "Launch windows, tracking corridors, and debris advisories.");
        addLayer("piracy", "Piracy Risk", "Maritime", "#48cae4", "Boarding incidents and maritime interdiction watch zones.");
        addLayer("borders", "Border Crossings", "Security", "#f94144", "Cross-border pressure points, customs friction, and closures.");
        addLayer("riots", "Civil Unrest", "Social", "#f3722c", "Protests, riot reporting, and public order escalations.");
        addLayer("sanctions", "Sanctions & Trade", "Economics", "#f9844a", "Sanctions moves, export restrictions, and licensing actions.");
        addLayer("minerals", "Strategic Minerals", "Economics", "#43aa8b", "Lithium, cobalt, nickel, and rare earth supply stress.");
        addLayer("ports", "Ports & Terminals", "Maritime", "#4d908e", "Container bottlenecks, berth occupancy, and access disruptions.");
        addLayer("pipelines", "Pipelines", "Infrastructure", "#577590", "Pipeline pressure anomalies and corridor disruptions.");
        addLayer("weather", "Extreme Weather", "Disaster", "#f9844a", "Cyclones, atmospheric rivers, and severe storm tracks.");
        addLayer("drones", "Drone Activity", "Security", "#ff4d6d", "UAS observations, strike reports, and airspace intrusions.");
        addLayer("disinfo", "Disinformation", "Social", "#b5179e", "Narrative spikes, coordinated amplification, and trust erosion.");
        addLayer("gnss", "GNSS Jamming", "Cyber", "#7209b7", "Spoofing, jamming, and navigation reliability incidents.");
        addLayer("internet", "Internet Outages", "Cyber", "#560bad", "Routing instability, undersea outages, and regional blackouts.");
        addLayer("water", "Water Stress", "Economics", "#4895ef", "Reservoir pressure, drought intensity, and river chokepoints.");
        addLayer("bio", "Biosecurity", "Disaster", "#80ed99", "Public health surveillance and emerging outbreak indicators.");
        addLayer("embassy", "Embassy Alerts", "Security", "#f15bb5", "Travel warnings and official mission security notices.");
        addLayer("arctic", "Arctic Routes", "Maritime", "#a9def9", "Ice corridor openings and northern logistics changes.");
        addLayer("supply", "Supply Chains", "Economics", "#52b788", "Lead time compression, production delays, and logistics shocks.");
        addLayer("currency", "Currency Stress", "Economics", "#ffca3a", "FX volatility, capital controls, and reserve pressure.");
        addLayer("satchange", "Satellite Change Detection", "Aerospace", "#7b2cbf", "Imagery deltas around bases, ports, and corridors.");
        addLayer("subsea", "Subsea Activity", "Maritime", "#64dfdf", "ROV sightings, cable ship operations, and seabed work.");
        addLayer("insurgency", "Insurgent Movement", "Security", "#e63946", "Non-state actor mobility and territorial friction.");
        addLayer("terror", "Terror Alerts", "Security", "#d90429", "Counterterror advisories and live threat bulletins.");
        addLayer("customs", "Customs Delays", "Economics", "#adb5bd", "Inspection slowdowns and border trade congestion.");
        addLayer("elections", "Election Unrest", "Social", "#ff006e", "Election security, demonstrations, and vote-related violence.");
        addLayer("chokepoints", "Maritime Chokepoints", "Maritime", "#00f5d4", "Suez, Bab el-Mandeb, Hormuz, and Panama stress.");
        addLayer("refugee", "Refugee Flow", "Social", "#ffbe0b", "Population displacement and humanitarian corridor pressure.");
        addLayer("wildcards", "Wildcard Signals", "Analysis", "#d9ed92", "Low-confidence anomalies surfaced for analyst review.");
    }

    private void seedHubs() {
        addHub("Washington", "North America", 38.89511, -77.03637);
        addHub("New York", "North America", 40.71278, -74.00594);
        addHub("Ottawa", "North America", 45.42153, -75.69719);
        addHub("Mexico City", "North America", 19.43261, -99.13321);
        addHub("Bogota", "Latin America", 4.711, -74.0721);
        addHub("Sao Paulo", "Latin America", -23.55052, -46.63331);
        addHub("Buenos Aires", "Latin America", -34.60372, -58.38159);
        addHub("London", "Europe", 51.50722, -0.1275);
        addHub("Paris", "Europe", 48.85661, 2.35222);
        addHub("Berlin", "Europe", 52.52, 13.405);
        addHub("Warsaw", "Europe", 52.22968, 21.01223);
        addHub("Kyiv", "Europe", 50.4501, 30.5234);
        addHub("Istanbul", "Europe", 41.00824, 28.97836);
        addHub("Moscow", "Europe", 55.75583, 37.6173);
        addHub("Cairo", "Middle East", 30.04442, 31.23571);
        addHub("Riyadh", "Middle East", 24.71355, 46.6753);
        addHub("Dubai", "Middle East", 25.20485, 55.27078);
        addHub("Tehran", "Middle East", 35.6892, 51.389);
        addHub("Baghdad", "Middle East", 33.31524, 44.36607);
        addHub("Tel Aviv", "Middle East", 32.0853, 34.78177);
        addHub("Nairobi", "Africa", -1.28639, 36.81722);
        addHub("Addis Ababa", "Africa", 8.9806, 38.7578);
        addHub("Lagos", "Africa", 6.52438, 3.37921);
        addHub("Johannesburg", "Africa", -26.2041, 28.0473);
        addHub("Cape Town", "Africa", -33.92487, 18.42406);
        addHub("Khartoum", "Africa", 15.50065, 32.5599);
        addHub("New Delhi", "South Asia", 28.61394, 77.20902);
        addHub("Mumbai", "South Asia", 19.07609, 72.87743);
        addHub("Karachi", "South Asia", 24.86073, 67.00114);
        addHub("Colombo", "South Asia", 6.92708, 79.86124);
        addHub("Kathmandu", "South Asia", 27.7172, 85.324);
        addHub("Beijing", "East Asia", 39.9042, 116.4074);
        addHub("Shanghai", "East Asia", 31.23039, 121.4737);
        addHub("Taipei", "East Asia", 25.033, 121.5654);
        addHub("Seoul", "East Asia", 37.5665, 126.978);
        addHub("Tokyo", "East Asia", 35.6762, 139.6503);
        addHub("Manila", "Southeast Asia", 14.59951, 120.98422);
        addHub("Singapore", "Southeast Asia", 1.35208, 103.81984);
        addHub("Jakarta", "Southeast Asia", -6.20876, 106.8456);
        addHub("Bangkok", "Southeast Asia", 13.75633, 100.50177);
        addHub("Sydney", "Oceania", -33.86882, 151.20929);
        addHub("Melbourne", "Oceania", -37.81363, 144.96306);
        addHub("Auckland", "Oceania", -36.84846, 174.76334);
        addHub("Honolulu", "Pacific", 21.30694, -157.85833);
        addHub("Reykjavik", "Arctic", 64.14658, -21.94264);
        addHub("Murmansk", "Arctic", 68.95852, 33.08266);
        addHub("Panama City", "Latin America", 8.98238, -79.51987);
        addHub("Suez", "Middle East", 29.9668, 32.5498);
        addHub("Bab el-Mandeb", "Middle East", 12.5856, 43.3333);
    }

    private void seedMarkets() {
        addMarket("SPX", "S&P 500", 5211.21);
        addMarket("NQ", "Nasdaq 100", 18340.14);
        addMarket("CL", "WTI Crude", 81.66);
        addMarket("GC", "Gold", 2198.10);
        addMarket("BTC", "Bitcoin", 68542.80);
        addMarket("ETH", "Ethereum", 3620.42);
        addMarket("DXY", "Dollar Index", 104.18);
        addMarket("VIX", "Volatility", 14.32);
    }

    private void seedEvents() {
        for (int i = 0; i < TARGET_EVENT_COUNT; i++) {
            events.add(generateEvent(i + 1L));
        }
    }

    private IntelEvent generateEvent(long seed) {
        IntelLayer layer = layers.get(random.nextInt(layers.size()));
        GeoHub hub = hubs.get(random.nextInt(hubs.size()));
        String source = sourceForLayer(layer.getId());
        int severity = 1 + random.nextInt(5);
        double confidence = 0.52 + (random.nextDouble() * 0.46);
        double latitude = clampLatitude(hub.latitude + jitter(3.8));
        double longitude = normalizeLongitude(hub.longitude + jitter(3.8));
        long updatedAt = System.currentTimeMillis() - random.nextInt(1000 * 60 * 45);
        String title = buildHeadline(layer.getName(), hub.name, severity);
        String summary = buildSummary(layer.getName(), hub.name, source, severity);
        return new IntelEvent(
            "evt-" + seed,
            layer.getId(),
            layer.getName(),
            layer.getColor(),
            source,
            hub.region,
            title,
            summary,
            latitude,
            longitude,
            severity,
            confidence,
            updatedAt
        );
    }

    private void appendEvent(StringBuilder sb, IntelEvent event) {
        sb.append('{');
        stringField(sb, "id", event.getId()).append(',');
        stringField(sb, "layerId", event.getLayerId()).append(',');
        stringField(sb, "layerName", event.getLayerName()).append(',');
        stringField(sb, "color", event.getColor()).append(',');
        stringField(sb, "source", event.getSource()).append(',');
        stringField(sb, "region", event.getRegion()).append(',');
        stringField(sb, "title", event.getTitle()).append(',');
        stringField(sb, "summary", event.getSummary()).append(',');
        field(sb, "latitude", doubleValue(event.getLatitude())).append(',');
        field(sb, "longitude", doubleValue(event.getLongitude())).append(',');
        field(sb, "severity", event.getSeverity()).append(',');
        field(sb, "confidence", doubleValue(event.getConfidence())).append(',');
        field(sb, "updatedAt", event.getUpdatedAt());
        sb.append('}');
    }

    private void appendRegions(StringBuilder sb) {
        Map<String, Integer> regionCount = new LinkedHashMap<String, Integer>();
        for (IntelEvent event : events) {
            Integer existing = regionCount.get(event.getRegion());
            regionCount.put(event.getRegion(), existing == null ? 1 : existing + 1);
        }
        int index = 0;
        for (Map.Entry<String, Integer> entry : regionCount.entrySet()) {
            if (index > 0) {
                sb.append(',');
            }
            sb.append('{');
            stringField(sb, "region", entry.getKey()).append(',');
            field(sb, "count", entry.getValue());
            sb.append('}');
            index++;
        }
    }

    private Map<String, Integer> countEventsByLayer() {
        Map<String, Integer> counts = new LinkedHashMap<String, Integer>();
        for (IntelEvent event : events) {
            Integer existing = counts.get(event.getLayerId());
            counts.put(event.getLayerId(), existing == null ? 1 : existing + 1);
        }
        return counts;
    }

    private int countRegion(String requestedRegion) {
        int count = 0;
        for (IntelEvent event : events) {
            if (event.getRegion().toUpperCase(Locale.US).contains(requestedRegion)) {
                count++;
            }
        }
        return count;
    }

    private IntelLayer findLayer(String requested) {
        for (IntelLayer layer : layers) {
            if (layer.getId().equalsIgnoreCase(requested) || layer.getName().toUpperCase(Locale.US).contains(requested)) {
                return layer;
            }
        }
        return null;
    }

    private MarketTicker findMarket(String requested) {
        for (MarketTicker market : markets) {
            if (market.getSymbol().equalsIgnoreCase(requested) || market.getLabel().toUpperCase(Locale.US).contains(requested)) {
                return market;
            }
        }
        return null;
    }

    private String sourceForLayer(String layerId) {
        if ("adsb".equals(layerId)) {
            return "OpenSky / military-scrape";
        }
        if ("ais".equals(layerId) || "piracy".equals(layerId) || "subsea".equals(layerId) || "ports".equals(layerId) || "chokepoints".equals(layerId)) {
            return "AIS fusion";
        }
        if ("fires".equals(layerId)) {
            return "NASA FIRMS";
        }
        if ("quakes".equals(layerId)) {
            return "USGS seismic";
        }
        if ("telegram".equals(layerId) || "riots".equals(layerId) || "elections".equals(layerId) || "refugee".equals(layerId)) {
            return "Telegram OSINT";
        }
        if ("cyber".equals(layerId) || "internet".equals(layerId) || "gnss".equals(layerId)) {
            return "Threat stream";
        }
        if ("satchange".equals(layerId) || "space".equals(layerId) || "satcom".equals(layerId)) {
            return "Satellite feed";
        }
        return "Multi-source ingest";
    }

    private String buildHeadline(String layerName, String hubName, int severity) {
        String prefix;
        if (severity >= 5) {
            prefix = "Critical escalation";
        } else if (severity == 4) {
            prefix = "High-confidence movement";
        } else if (severity == 3) {
            prefix = "Analyst attention";
        } else {
            prefix = "Emerging signal";
        }
        return prefix + ": " + layerName + " near " + hubName;
    }

    private String buildSummary(String layerName, String hubName, String source, int severity) {
        return layerName + " activity refreshed around " + hubName + " from " + source
            + ". Severity " + severity + " with local browser-side threat scoring ready for analyst review.";
    }

    private void addLayer(String id, String name, String category, String color, String description) {
        layers.add(new IntelLayer(id, name, category, color, description));
    }

    private void addHub(String name, String region, double latitude, double longitude) {
        hubs.add(new GeoHub(name, region, latitude, longitude));
    }

    private void addMarket(String symbol, String label, double price) {
        markets.add(new MarketTicker(symbol, label, price));
    }

    private double jitter(double max) {
        return (random.nextDouble() - 0.5) * max;
    }

    private int clampSeverity(int value) {
        if (value < 1) {
            return 1;
        }
        if (value > 5) {
            return 5;
        }
        return value;
    }

    private double clampConfidence(double value) {
        if (value < 0.50) {
            return 0.50;
        }
        if (value > 0.99) {
            return 0.99;
        }
        return value;
    }

    private double clampLatitude(double value) {
        if (value < -85.0) {
            return -85.0;
        }
        if (value > 85.0) {
            return 85.0;
        }
        return value;
    }

    private double normalizeLongitude(double value) {
        double normalized = value;
        while (normalized < -180.0) {
            normalized += 360.0;
        }
        while (normalized > 180.0) {
            normalized -= 360.0;
        }
        return normalized;
    }

    private StringBuilder stringField(StringBuilder sb, String key, String value) {
        quote(sb, key);
        sb.append(':');
        quote(sb, value);
        return sb;
    }

    private StringBuilder field(StringBuilder sb, String key, long value) {
        quote(sb, key);
        sb.append(':').append(value);
        return sb;
    }

    private StringBuilder field(StringBuilder sb, String key, int value) {
        quote(sb, key);
        sb.append(':').append(value);
        return sb;
    }

    private StringBuilder field(StringBuilder sb, String key, double value) {
        quote(sb, key);
        sb.append(':').append(NUMBER_FORMAT.format(value));
        return sb;
    }

    private double doubleValue(double value) {
        return Double.parseDouble(NUMBER_FORMAT.format(value));
    }

    private void quote(StringBuilder sb, String value) {
        sb.append('"');
        if (value != null) {
            for (int i = 0; i < value.length(); i++) {
                char ch = value.charAt(i);
                switch (ch) {
                    case '\\':
                        sb.append("\\\\");
                        break;
                    case '"':
                        sb.append("\\\"");
                        break;
                    case '\n':
                        sb.append("\\n");
                        break;
                    case '\r':
                        sb.append("\\r");
                        break;
                    case '\t':
                        sb.append("\\t");
                        break;
                    default:
                        if (ch < 32) {
                            sb.append("\\u");
                            String hex = Integer.toHexString(ch);
                            for (int j = hex.length(); j < 4; j++) {
                                sb.append('0');
                            }
                            sb.append(hex);
                        } else {
                            sb.append(ch);
                        }
                }
            }
        }
        sb.append('"');
    }

    private static final class GeoHub {
        private final String name;
        private final String region;
        private final double latitude;
        private final double longitude;

        private GeoHub(String name, String region, double latitude, double longitude) {
            this.name = name;
            this.region = region;
            this.latitude = latitude;
            this.longitude = longitude;
        }
    }
}
