package com.algorithmrace.visualizer;

import jakarta.servlet.*;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

import java.io.IOException;

/**
 * Injects security headers on every HTTP response to mitigate
 * XSS, clickjacking, MIME-sniffing, and other common web attacks.
 */
@Component
@Order(Ordered.HIGHEST_PRECEDENCE)
public class SecurityHeaderFilter implements Filter {

	@Override
	public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
			throws IOException, ServletException {
		if (response instanceof HttpServletResponse httpResponse) {
			// Prevent MIME-type sniffing
			httpResponse.setHeader("X-Content-Type-Options", "nosniff");
			// Prevent clickjacking via iframe embedding
			httpResponse.setHeader("X-Frame-Options", "DENY");
			// Disable legacy XSS filter (modern browsers don't need it; can cause issues)
			httpResponse.setHeader("X-XSS-Protection", "0");
			// Control referrer information leakage
			httpResponse.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
			// Restrict browser features
			httpResponse.setHeader("Permissions-Policy",
					"camera=(), microphone=(), geolocation=(), payment=()");
			// Prevent caching of API responses that may contain sensitive simulation data
			httpResponse.setHeader("Cache-Control", "no-store, no-cache, must-revalidate");
			httpResponse.setHeader("Pragma", "no-cache");
		}
		chain.doFilter(request, response);
	}
}
