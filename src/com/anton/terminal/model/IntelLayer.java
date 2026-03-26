package com.anton.terminal.model;

public final class IntelLayer {
    private final String id;
    private final String name;
    private final String category;
    private final String color;
    private final String description;

    public IntelLayer(String id, String name, String category, String color, String description) {
        this.id = id;
        this.name = name;
        this.category = category;
        this.color = color;
        this.description = description;
    }

    public String getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public String getCategory() {
        return category;
    }

    public String getColor() {
        return color;
    }

    public String getDescription() {
        return description;
    }
}
