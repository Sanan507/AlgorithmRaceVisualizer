package com.algorithmrace.visualizer;

import jakarta.servlet.*;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;

/**
 * IP-based sliding-window rate limiter to prevent DoS attacks on computationally expensive
 * simulation endpoints.
 *
 * <p>Limits: - /api/simulations/* → 30 requests per 60 seconds per IP - /api/catalog → 120 requests
 * per 60 seconds per IP - All other /api/* → 60 requests per 60 seconds per IP
 */
@Component
@Order(Ordered.HIGHEST_PRECEDENCE + 1)
public class RateLimitFilter implements Filter {

  private static final Logger log = LoggerFactory.getLogger(RateLimitFilter.class);

  private static final int SIMULATION_LIMIT = 30;
  private static final int CATALOG_LIMIT = 120;
  private static final int DEFAULT_LIMIT = 60;
  private static final long WINDOW_MS = 60_000L;

  // Stores: clientIP -> bucket -> [timestamps]
  private final Map<String, Map<String, SlidingWindow>> clients = new ConcurrentHashMap<>();

  @Override
  public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
      throws IOException, ServletException {
    if (!(request instanceof HttpServletRequest httpRequest)
        || !(response instanceof HttpServletResponse httpResponse)) {
      chain.doFilter(request, response);
      return;
    }

    String path = httpRequest.getRequestURI();

    // Only rate-limit API paths
    if (!path.startsWith("/api/")) {
      chain.doFilter(request, response);
      return;
    }

    String clientIp = resolveClientIp(httpRequest);
    String bucket = resolveBucket(path);
    int limit = resolveLimit(path);

    SlidingWindow window =
        clients
            .computeIfAbsent(clientIp, k -> new ConcurrentHashMap<>())
            .computeIfAbsent(bucket, k -> new SlidingWindow());

    if (!window.tryAcquire(limit)) {
      log.warn("Rate limit exceeded for IP={} bucket={}", clientIp, bucket);
      httpResponse.setStatus(HttpStatus.TOO_MANY_REQUESTS.value());
      httpResponse.setContentType("application/json");
      httpResponse
          .getWriter()
          .write(
              "{\"error\":\"Too Many Requests\",\"message\":\"Rate limit exceeded. Please try again"
                  + " later.\"}");
      return;
    }

    chain.doFilter(request, response);
  }

  private String resolveClientIp(HttpServletRequest request) {
    String remoteAddr = request.getRemoteAddr();

    // If the direct connection is NOT from a trusted internal IP, we cannot trust headers.
    if (!isInternalIp(remoteAddr)) {
      return remoteAddr;
    }

    String lastTrustedIp = remoteAddr;
    String forwarded = request.getHeader("X-Forwarded-For");
    if (forwarded != null && !forwarded.isBlank()) {
      // Parse from right-to-left. The rightmost IP is the one added by the last proxy.
      // We skip internal proxies to find the true client IP.
      String[] ips = forwarded.split(",");
      for (int i = ips.length - 1; i >= 0; i--) {
        String ip = ips[i].trim();
        if (!isInternalIp(ip)) {
          if (ip.matches("[0-9a-fA-F.:]+")) {
            return ip;
          }
        } else {
          lastTrustedIp = ip;
        }
      }
    }
    return lastTrustedIp;
  }

  private boolean isInternalIp(String ip) {
    if (ip == null) return false;
    // IPv4 localhost
    if (ip.startsWith("127.")) return true;
    // IPv6 localhost
    if (ip.equals("0:0:0:0:0:0:0:1") || ip.equals("::1")) return true;
    // 10.0.0.0/8
    if (ip.startsWith("10.")) return true;
    // 172.16.0.0/12
    if (ip.matches("^172\\.(1[6-9]|2[0-9]|3[0-1])\\..+")) return true;
    // 192.168.0.0/16
    if (ip.startsWith("192.168.")) return true;

    return false;
  }

  private String resolveBucket(String path) {
    if (path.startsWith("/api/simulations")) return "simulation";
    if (path.startsWith("/api/catalog")) return "catalog";
    return "default";
  }

  private int resolveLimit(String path) {
    if (path.startsWith("/api/simulations")) return SIMULATION_LIMIT;
    if (path.startsWith("/api/catalog")) return CATALOG_LIMIT;
    return DEFAULT_LIMIT;
  }

  /**
   * Thread-safe sliding window counter. Keeps timestamps of recent requests and evicts expired
   * ones.
   */
  private static class SlidingWindow {
    private final java.util.Deque<Long> timestamps =
        new java.util.concurrent.ConcurrentLinkedDeque<>();

    boolean tryAcquire(int limit) {
      long now = System.currentTimeMillis();
      long cutoff = now - WINDOW_MS;

      // Evict expired timestamps
      while (!timestamps.isEmpty() && timestamps.peekFirst() < cutoff) {
        timestamps.pollFirst();
      }

      if (timestamps.size() >= limit) {
        return false;
      }

      timestamps.addLast(now);
      return true;
    }
  }
}
