package com.anton.terminal;

import com.anton.terminal.service.TerminalDataService;
import com.sun.net.httpserver.Headers;
import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpHandler;
import com.sun.net.httpserver.HttpServer;

import java.io.IOException;
import java.io.OutputStream;
import java.net.InetSocketAddress;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.concurrent.Executors;

public final class Main {
    private Main() {
    }

    public static void main(String[] args) throws Exception {
        int port = 8080;
        String portEnv = System.getenv("PORT");
        if (portEnv != null && portEnv.trim().length() > 0) {
            try {
                port = Integer.parseInt(portEnv.trim());
            } catch (NumberFormatException ignored) {
                port = 8080;
            }
        }

        final Path webRoot = Paths.get("web").toAbsolutePath().normalize();
        final TerminalDataService dataService = new TerminalDataService();
        final HttpServer server = HttpServer.create(new InetSocketAddress(port), 0);

        server.createContext("/api/health", new HttpHandler() {
            @Override
            public void handle(HttpExchange exchange) throws IOException {
                sendJson(exchange, 200, "{\"status\":\"ok\"}");
            }
        });

        server.createContext("/api/snapshot", new HttpHandler() {
            @Override
            public void handle(HttpExchange exchange) throws IOException {
                if (!"GET".equalsIgnoreCase(exchange.getRequestMethod())) {
                    sendJson(exchange, 405, "{\"error\":\"Method not allowed\"}");
                    return;
                }
                sendJson(exchange, 200, dataService.getSnapshotJson());
            }
        });

        server.createContext("/api/command", new HttpHandler() {
            @Override
            public void handle(HttpExchange exchange) throws IOException {
                if (!"GET".equalsIgnoreCase(exchange.getRequestMethod())) {
                    sendJson(exchange, 405, "{\"error\":\"Method not allowed\"}");
                    return;
                }
                String query = "";
                if (exchange.getRequestURI().getQuery() != null) {
                    query = exchange.getRequestURI().getQuery().replaceFirst("^q=", "");
                }
                sendJson(exchange, 200, dataService.handleCommand(query));
            }
        });

        server.createContext("/", new HttpHandler() {
            @Override
            public void handle(HttpExchange exchange) throws IOException {
                if (!"GET".equalsIgnoreCase(exchange.getRequestMethod())) {
                    sendText(exchange, 405, "Method not allowed", "text/plain; charset=utf-8");
                    return;
                }

                String rawPath = exchange.getRequestURI().getPath();
                String relative = "/".equals(rawPath) ? "index.html" : rawPath.substring(1);
                Path target = webRoot.resolve(relative).normalize();

                if (!target.startsWith(webRoot) || Files.isDirectory(target) || !Files.exists(target)) {
                    sendText(exchange, 404, "Not found", "text/plain; charset=utf-8");
                    return;
                }

                byte[] body = Files.readAllBytes(target);
                sendBytes(exchange, 200, body, detectContentType(target));
            }
        });

        server.setExecutor(Executors.newCachedThreadPool());
        Runtime.getRuntime().addShutdownHook(new Thread(new Runnable() {
            @Override
            public void run() {
                dataService.shutdown();
                server.stop(0);
            }
        }));
        server.start();
        System.out.println("Sentinel Terminal running on http://localhost:" + port);
    }

    private static void sendJson(HttpExchange exchange, int statusCode, String json) throws IOException {
        sendText(exchange, statusCode, json, "application/json; charset=utf-8");
    }

    private static void sendText(HttpExchange exchange, int statusCode, String body, String contentType) throws IOException {
        sendBytes(exchange, statusCode, body.getBytes(StandardCharsets.UTF_8), contentType);
    }

    private static void sendBytes(HttpExchange exchange, int statusCode, byte[] body, String contentType) throws IOException {
        Headers headers = exchange.getResponseHeaders();
        headers.set("Content-Type", contentType);
        headers.set("Cache-Control", "no-store, max-age=0");
        headers.set("Access-Control-Allow-Origin", "*");
        exchange.sendResponseHeaders(statusCode, body.length);
        OutputStream outputStream = exchange.getResponseBody();
        try {
            outputStream.write(body);
        } finally {
            outputStream.close();
        }
    }

    private static String detectContentType(Path path) {
        String fileName = path.getFileName().toString().toLowerCase();
        if (fileName.endsWith(".html")) {
            return "text/html; charset=utf-8";
        }
        if (fileName.endsWith(".css")) {
            return "text/css; charset=utf-8";
        }
        if (fileName.endsWith(".js")) {
            return "application/javascript; charset=utf-8";
        }
        if (fileName.endsWith(".json")) {
            return "application/json; charset=utf-8";
        }
        if (fileName.endsWith(".svg")) {
            return "image/svg+xml";
        }
        return "application/octet-stream";
    }
}
