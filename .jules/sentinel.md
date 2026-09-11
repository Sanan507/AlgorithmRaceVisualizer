## 2026-09-11 - DoS Risk in Rate Limiter via Unbounded Memory
**Vulnerability:** The RateLimitFilter stored client IP rate-limiting data in an unbounded `ConcurrentHashMap`. An attacker could spoof numerous IPs or target many arbitrary buckets to infinitely grow the map, leading to memory exhaustion (OOM) and DoS.
**Learning:** Using basic Maps for caches or temporary tracking structures without strict bounds or eviction mechanisms in long-running applications poses significant DoS and stability risks.
**Prevention:** Always use proper caching libraries (like Caffeine or Guava) with strict bounds (`maximumSize`) and automatic time-based eviction policies (`expireAfterAccess` or `expireAfterWrite`) when tracking dynamic client data in memory.
