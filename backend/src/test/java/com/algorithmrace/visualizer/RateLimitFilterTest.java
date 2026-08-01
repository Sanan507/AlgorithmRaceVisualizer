package com.algorithmrace.visualizer;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.*;

import jakarta.servlet.FilterChain;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;

class RateLimitFilterTest {

  @Test
  public void testDirectConnectionSpoofingIgnored() throws Exception {
    RateLimitFilter filter = new RateLimitFilter();
    MockHttpServletRequest request = new MockHttpServletRequest();
    MockHttpServletResponse response = new MockHttpServletResponse();
    FilterChain chain = mock(FilterChain.class);

    request.setRequestURI("/api/simulations");
    // Direct connection from attacker's public IP
    request.setRemoteAddr("203.0.113.5");
    // Attacker tries to spoof someone else's IP
    request.addHeader("X-Forwarded-For", "198.51.100.10");

    // Hit the limit
    for (int i = 0; i < 30; i++) {
      filter.doFilter(request, response, chain);
      response = new MockHttpServletResponse();
    }
    // 31st request should be blocked
    filter.doFilter(request, response, chain);
    assertEquals(429, response.getStatus());

    // Now attacker tries to use another spoofed IP but same real remote IP
    request = new MockHttpServletRequest();
    response = new MockHttpServletResponse();
    request.setRequestURI("/api/simulations");
    request.setRemoteAddr("203.0.113.5");
    request.addHeader("X-Forwarded-For", "198.51.100.11");

    filter.doFilter(request, response, chain);
    // Should still be blocked because it should ignore the spoofed header and use the remote addr
    assertEquals(429, response.getStatus());
  }

  @Test
  public void testBehindProxySpoofingIgnored() throws Exception {
    RateLimitFilter filter = new RateLimitFilter();
    MockHttpServletRequest request = new MockHttpServletRequest();
    MockHttpServletResponse response = new MockHttpServletResponse();
    FilterChain chain = mock(FilterChain.class);

    request.setRequestURI("/api/simulations");
    // Connection from trusted internal proxy
    request.setRemoteAddr("10.0.0.5");
    // Attacker spoofed IP and proxy appended real attacker IP
    request.addHeader("X-Forwarded-For", "1.2.3.4, 203.0.113.5");

    // Hit the limit for attacker real IP
    for (int i = 0; i < 30; i++) {
      filter.doFilter(request, response, chain);
      response = new MockHttpServletResponse();
    }
    // 31st request should be blocked
    filter.doFilter(request, response, chain);
    assertEquals(429, response.getStatus());

    // Attacker changes spoofed IP, but proxy still appends real IP
    request = new MockHttpServletRequest();
    response = new MockHttpServletResponse();
    request.setRequestURI("/api/simulations");
    request.setRemoteAddr("10.0.0.5");
    request.addHeader("X-Forwarded-For", "5.6.7.8, 203.0.113.5");

    filter.doFilter(request, response, chain);
    // Should still be blocked because it correctly identifies 203.0.113.5
    assertEquals(429, response.getStatus());
  }

  @Test
  void doFilter_nonApiRoot_bypassesFilter() throws Exception {
    RateLimitFilter filter = new RateLimitFilter();
    MockHttpServletRequest mockRequest = mock(MockHttpServletRequest.class);
    MockHttpServletResponse mockResponse = mock(MockHttpServletResponse.class);
    FilterChain mockFilterChain = mock(FilterChain.class);

    when(mockRequest.getRequestURI()).thenReturn("/");

    filter.doFilter(mockRequest, mockResponse, mockFilterChain);

    verify(mockFilterChain).doFilter(mockRequest, mockResponse);
    verify(mockResponse, never()).setStatus(anyInt());
  }

  @Test
  void doFilter_untrustedProxyHeader_ignoresSpoofedHeader() throws Exception {
    RateLimitFilter filter = new RateLimitFilter();
    MockHttpServletRequest mockRequest = mock(MockHttpServletRequest.class);
    MockHttpServletResponse mockResponse = mock(MockHttpServletResponse.class);
    FilterChain mockFilterChain = mock(FilterChain.class);

    when(mockRequest.getRequestURI()).thenReturn("/api/simulations/sorting");
    when(mockRequest.getRemoteAddr()).thenReturn("203.0.113.195"); // Public IP (not proxy)
    when(mockRequest.getHeader("X-Forwarded-For")).thenReturn("198.51.100.10"); // Spoofed IP

    filter.doFilter(mockRequest, mockResponse, mockFilterChain);

    verify(mockFilterChain).doFilter(mockRequest, mockResponse);
  }

  @Test
  void doFilter_trustedProxyHeader_usesForwardedHeader() throws Exception {
    RateLimitFilter filter = new RateLimitFilter();
    MockHttpServletRequest mockRequest = mock(MockHttpServletRequest.class);
    MockHttpServletResponse mockResponse = mock(MockHttpServletResponse.class);
    FilterChain mockFilterChain = mock(FilterChain.class);

    when(mockRequest.getRequestURI()).thenReturn("/api/simulations/sorting");
    when(mockRequest.getRemoteAddr()).thenReturn("127.0.0.1"); // Trusted local proxy
    when(mockRequest.getHeader("X-Forwarded-For")).thenReturn("198.51.100.10");

    filter.doFilter(mockRequest, mockResponse, mockFilterChain);

    verify(mockFilterChain).doFilter(mockRequest, mockResponse);
  }
}
