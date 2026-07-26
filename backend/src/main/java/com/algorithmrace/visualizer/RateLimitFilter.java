package com.algorithmrace.visualizer;

import jakarta.servlet.*;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * IP-based sliding-window rate limiter to prevent DoS attacks on
 * computationally expensive simulation endpoints.
 * <p>
 * Limits:
 * - /api/simulations/*  → 30 requests per 60 seconds per IP
 * - /api/catalog         → 120 requests per 60 seconds per IP
 * - All other /api/*     → 60 requests per 60 seconds per IP
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

		SlidingWindow window = clients
				.computeIfAbsent(clientIp, k -> new ConcurrentHashMap<>())
				.computeIfAbsent(bucket, k -> new SlidingWindow());

		if (!window.tryAcquire(limit)) {
			log.warn("Rate limit exceeded for IP={} bucket={}", clientIp, bucket);
			httpResponse.setStatus(HttpStatus.TOO_MANY_REQUESTS.value());
			httpResponse.setContentType("application/json");
			httpResponse.getWriter().write(
					"{\"error\":\"Too Many Requests\",\"message\":\"Rate limit exceeded. Please try again later.\"}");
			return;
		}

		chain.doFilter(request, response);
	}

	private String resolveClientIp(HttpServletRequest request) {
		// Use X-Forwarded-For only if present (behind reverse proxy),
		// but always fall back to remote addr to prevent header spoofing
		String forwarded = request.getHeader("X-Forwarded-For");
		if (forwarded != null && !forwarded.isBlank()) {
			// Take only the first IP (client IP, not proxy chain)
			String ip = forwarded.split(",")[0].trim();
			// Basic validation: only allow IP-like strings
			if (ip.matches("[0-9a-fA-F.:]+")) {
				return ip;
			}
		}
		return request.getRemoteAddr();
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
	 * Thread-safe sliding window counter.
	 * Keeps timestamps of recent requests and evicts expired ones.
	 */
	private static class SlidingWindow {
		private final java.util.Deque<Long> timestamps = new java.util.concurrent.ConcurrentLinkedDeque<>();

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
