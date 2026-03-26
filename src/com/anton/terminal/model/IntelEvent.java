package com.anton.terminal.model;

public final class IntelEvent {
    private final String id;
    private final String layerId;
    private final String layerName;
    private final String color;
    private final String source;
    private final String region;
    private String title;
    private String summary;
    private double latitude;
    private double longitude;
    private int severity;
    private double confidence;
    private long updatedAt;

    public IntelEvent(
        String id,
        String layerId,
        String layerName,
        String color,
        String source,
        String region,
        String title,
        String summary,
        double latitude,
        double longitude,
        int severity,
        double confidence,
        long updatedAt
    ) {
        this.id = id;
        this.layerId = layerId;
        this.layerName = layerName;
        this.color = color;
        this.source = source;
        this.region = region;
        this.title = title;
        this.summary = summary;
        this.latitude = latitude;
        this.longitude = longitude;
        this.severity = severity;
        this.confidence = confidence;
        this.updatedAt = updatedAt;
    }

    public String getId() {
        return id;
    }

    public String getLayerId() {
        return layerId;
    }

    public String getLayerName() {
        return layerName;
    }

    public String getColor() {
        return color;
    }

    public String getSource() {
        return source;
    }

    public String getRegion() {
        return region;
    }

    public String getTitle() {
        return title;
    }

    public String getSummary() {
        return summary;
    }

    public double getLatitude() {
        return latitude;
    }

    public double getLongitude() {
        return longitude;
    }

    public int getSeverity() {
        return severity;
    }

    public double getConfidence() {
        return confidence;
    }

    public long getUpdatedAt() {
        return updatedAt;
    }

    public void update(
        String title,
        String summary,
        double latitude,
        double longitude,
        int severity,
        double confidence,
        long updatedAt
    ) {
        this.title = title;
        this.summary = summary;
        this.latitude = latitude;
        this.longitude = longitude;
        this.severity = severity;
        this.confidence = confidence;
        this.updatedAt = updatedAt;
    }
}
