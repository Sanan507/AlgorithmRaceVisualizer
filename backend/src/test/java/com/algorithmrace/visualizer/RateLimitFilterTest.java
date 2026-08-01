package com.algorithmrace.visualizer;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import jakarta.servlet.FilterChain;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.lang.reflect.Method;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockHttpServletRequest;

class RateLimitFilterTest {

  private RateLimitFilter filter;
  private Method resolveClientIpMethod;
  private HttpServletRequest mockRequest;
  private HttpServletResponse mockResponse;
  private FilterChain mockFilterChain;

  @BeforeEach
  void setUp() throws Exception {
    filter = new RateLimitFilter();
    resolveClientIpMethod =
        RateLimitFilter.class.getDeclaredMethod("resolveClientIp", HttpServletRequest.class);
    resolveClientIpMethod.setAccessible(true);
    mockRequest = mock(HttpServletRequest.class);
    mockResponse = mock(HttpServletResponse.class);
    mockFilterChain = mock(FilterChain.class);
  }

  private String invokeResolveClientIp(HttpServletRequest request) throws Exception {
    return (String) resolveClientIpMethod.invoke(filter, request);
  }

  @Test
  void testDirectRequest() throws Exception {
    MockHttpServletRequest request = new MockHttpServletRequest();
    request.setRemoteAddr("203.0.113.1");

    assertEquals("203.0.113.1", invokeResolveClientIp(request));
  }

  @Test
  void testDirectRequestWithSpoofedHeader() throws Exception {
    MockHttpServletRequest request = new MockHttpServletRequest();
    request.setRemoteAddr("203.0.113.1");
    // This is a direct connection from a public IP that has spoofed the X-Forwarded-For header
    request.addHeader("X-Forwarded-For", "198.51.100.1");

    assertEquals("203.0.113.1", invokeResolveClientIp(request));
  }

  @Test
  void testRequestFromInternalProxy() throws Exception {
    MockHttpServletRequest request = new MockHttpServletRequest();
    request.setRemoteAddr("10.0.0.5");
    request.addHeader("X-Forwarded-For", "203.0.113.1");

    assertEquals("203.0.113.1", invokeResolveClientIp(request));
  }

  @Test
  void testRequestFromInternalProxySpoofedChain() throws Exception {
    MockHttpServletRequest request = new MockHttpServletRequest();
    request.setRemoteAddr("10.0.0.5");
    // Client sent spoofed IP 1.2.3.4, real IP is 203.0.113.1
    request.addHeader("X-Forwarded-For", "1.2.3.4, 203.0.113.1");

    assertEquals("203.0.113.1", invokeResolveClientIp(request));
  }

  @Test
  void testRequestFromMultipleInternalProxies() throws Exception {
    MockHttpServletRequest request = new MockHttpServletRequest();
    request.setRemoteAddr("10.0.0.5");
    // Client IP 203.0.113.1, passed through internal proxy 192.168.1.1, then to 10.0.0.5
    request.addHeader("X-Forwarded-For", "203.0.113.1, 192.168.1.1");

    assertEquals("203.0.113.1", invokeResolveClientIp(request));
  }

  @Test
  void testRequestFromMultipleInternalProxiesSpoofed() throws Exception {
    MockHttpServletRequest request = new MockHttpServletRequest();
    request.setRemoteAddr("10.0.0.5");
    // Client spoofed 1.2.3.4, real IP 203.0.113.1, internal proxy 192.168.1.1
    request.addHeader("X-Forwarded-For", "1.2.3.4, 203.0.113.1, 192.168.1.1");

    assertEquals("203.0.113.1", invokeResolveClientIp(request));
  }

  @Test
  void testRequestFromInternalProxyNoValidIp() throws Exception {
    MockHttpServletRequest request = new MockHttpServletRequest();
    request.setRemoteAddr("10.0.0.5");
    request.addHeader("X-Forwarded-For", "invalid_ip");

    // Should fallback to remote addr if no valid IP found in header
    assertEquals("10.0.0.5", invokeResolveClientIp(request));
  }

  @Test
  void testRequestFromInternalClientViaInternalProxy() throws Exception {
    MockHttpServletRequest request = new MockHttpServletRequest();
    request.setRemoteAddr("10.0.0.5");
    request.addHeader("X-Forwarded-For", "192.168.1.50");

    assertEquals("192.168.1.50", invokeResolveClientIp(request));
  }

  @Test
  void doFilter_nonApiRoot_bypassesFilter() throws Exception {
    when(mockRequest.getRequestURI()).thenReturn("/");

    filter.doFilter(mockRequest, mockResponse, mockFilterChain);

    verify(mockFilterChain).doFilter(mockRequest, mockResponse);
    verify(mockResponse, never()).setStatus(anyInt());
  }

  @Test
  void doFilter_untrustedProxyHeader_ignoresSpoofedHeader() throws Exception {
    when(mockRequest.getRequestURI()).thenReturn("/api/simulations/sorting");
    when(mockRequest.getRemoteAddr()).thenReturn("203.0.113.195"); // Public IP (not proxy)
    when(mockRequest.getHeader("X-Forwarded-For")).thenReturn("198.51.100.10"); // Spoofed IP

    filter.doFilter(mockRequest, mockResponse, mockFilterChain);

    verify(mockFilterChain).doFilter(mockRequest, mockResponse);
  }

  @Test
  void doFilter_trustedProxyHeader_usesForwardedHeader() throws Exception {
    when(mockRequest.getRequestURI()).thenReturn("/api/simulations/sorting");
    when(mockRequest.getRemoteAddr()).thenReturn("127.0.0.1"); // Trusted local proxy
    when(mockRequest.getHeader("X-Forwarded-For")).thenReturn("198.51.100.10");

    filter.doFilter(mockRequest, mockResponse, mockFilterChain);

    verify(mockFilterChain).doFilter(mockRequest, mockResponse);
  }
}
