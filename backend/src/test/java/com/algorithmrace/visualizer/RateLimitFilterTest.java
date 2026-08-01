package com.algorithmrace.visualizer;

import static org.junit.jupiter.api.Assertions.assertEquals;

import jakarta.servlet.http.HttpServletRequest;
import java.lang.reflect.Method;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockHttpServletRequest;

public class RateLimitFilterTest {

  private RateLimitFilter filter;
  private Method resolveClientIpMethod;

  @BeforeEach
  public void setUp() throws Exception {
    filter = new RateLimitFilter();
    resolveClientIpMethod =
        RateLimitFilter.class.getDeclaredMethod("resolveClientIp", HttpServletRequest.class);
    resolveClientIpMethod.setAccessible(true);
  }

  private String invokeResolveClientIp(HttpServletRequest request) throws Exception {
    return (String) resolveClientIpMethod.invoke(filter, request);
  }

  @Test
  public void testDirectRequest() throws Exception {
    MockHttpServletRequest request = new MockHttpServletRequest();
    request.setRemoteAddr("203.0.113.1");

    assertEquals("203.0.113.1", invokeResolveClientIp(request));
  }

  @Test
  public void testDirectRequestWithSpoofedHeader() throws Exception {
    MockHttpServletRequest request = new MockHttpServletRequest();
    request.setRemoteAddr("203.0.113.1");
    // This is a direct connection from a public IP that has spoofed the X-Forwarded-For header
    request.addHeader("X-Forwarded-For", "198.51.100.1");

    assertEquals("203.0.113.1", invokeResolveClientIp(request));
  }

  @Test
  public void testRequestFromInternalProxy() throws Exception {
    MockHttpServletRequest request = new MockHttpServletRequest();
    request.setRemoteAddr("10.0.0.5");
    request.addHeader("X-Forwarded-For", "203.0.113.1");

    assertEquals("203.0.113.1", invokeResolveClientIp(request));
  }

  @Test
  public void testRequestFromInternalProxySpoofedChain() throws Exception {
    MockHttpServletRequest request = new MockHttpServletRequest();
    request.setRemoteAddr("10.0.0.5");
    // Client sent spoofed IP 1.2.3.4, real IP is 203.0.113.1
    request.addHeader("X-Forwarded-For", "1.2.3.4, 203.0.113.1");

    assertEquals("203.0.113.1", invokeResolveClientIp(request));
  }

  @Test
  public void testRequestFromMultipleInternalProxies() throws Exception {
    MockHttpServletRequest request = new MockHttpServletRequest();
    request.setRemoteAddr("10.0.0.5");
    // Client IP 203.0.113.1, passed through internal proxy 192.168.1.1, then to 10.0.0.5
    request.addHeader("X-Forwarded-For", "203.0.113.1, 192.168.1.1");

    assertEquals("203.0.113.1", invokeResolveClientIp(request));
  }

  @Test
  public void testRequestFromMultipleInternalProxiesSpoofed() throws Exception {
    MockHttpServletRequest request = new MockHttpServletRequest();
    request.setRemoteAddr("10.0.0.5");
    // Client spoofed 1.2.3.4, real IP 203.0.113.1, internal proxy 192.168.1.1
    request.addHeader("X-Forwarded-For", "1.2.3.4, 203.0.113.1, 192.168.1.1");

    assertEquals("203.0.113.1", invokeResolveClientIp(request));
  }

  @Test
  public void testRequestFromInternalProxyNoValidIp() throws Exception {
    MockHttpServletRequest request = new MockHttpServletRequest();
    request.setRemoteAddr("10.0.0.5");
    request.addHeader("X-Forwarded-For", "invalid_ip");

    // Should fallback to remote addr if no valid IP found in header
    assertEquals("10.0.0.5", invokeResolveClientIp(request));
  }

  @Test
  public void testRequestFromInternalClientViaInternalProxy() throws Exception {
    MockHttpServletRequest request = new MockHttpServletRequest();
    request.setRemoteAddr("10.0.0.5");
    request.addHeader("X-Forwarded-For", "192.168.1.50");

    assertEquals("192.168.1.50", invokeResolveClientIp(request));
  }
}
