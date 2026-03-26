package com.anton.terminal.model;

public final class MarketTicker {
    private final String symbol;
    private final String label;
    private double price;
    private double changePercent;
    private double volume;
    private final double[] trend;

    public MarketTicker(String symbol, String label, double price) {
        this.symbol = symbol;
        this.label = label;
        this.price = price;
        this.changePercent = 0.0;
        this.volume = 1.0;
        this.trend = new double[20];
        for (int i = 0; i < trend.length; i++) {
            trend[i] = price;
        }
    }

    public String getSymbol() {
        return symbol;
    }

    public String getLabel() {
        return label;
    }

    public double getPrice() {
        return price;
    }

    public double getChangePercent() {
        return changePercent;
    }

    public double getVolume() {
        return volume;
    }

    public double[] getTrend() {
        return trend;
    }

    public void tick(double nextPrice, double nextChangePercent, double nextVolume) {
        price = nextPrice;
        changePercent = nextChangePercent;
        volume = nextVolume;
        System.arraycopy(trend, 1, trend, 0, trend.length - 1);
        trend[trend.length - 1] = nextPrice;
    }
}
