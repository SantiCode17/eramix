package com.eramix.config;

import io.github.bucket4j.Bandwidth;
import io.github.bucket4j.Bucket;
import io.github.bucket4j.Refill;
import jakarta.servlet.*;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.boot.web.servlet.FilterRegistrationBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.io.IOException;
import java.time.Duration;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Rate limiting con Bucket4j – token bucket por IP.
 * <p>
 * Se protegen endpoints sensibles: auth, search, uploads.
 * Cada IP tiene su bucket individual.
 */
@Configuration
public class RateLimitConfig {

    private final Map<String, Bucket> buckets = new ConcurrentHashMap<>();

    // ── Auth: 10 req/min ─────────────────────────────────
    @Bean
    public FilterRegistrationBean<RateLimitFilter> authRateLimitFilter() {
        FilterRegistrationBean<RateLimitFilter> reg = new FilterRegistrationBean<>();
        reg.setFilter(new RateLimitFilter(buckets, 10, Duration.ofMinutes(1)));
        reg.addUrlPatterns("/api/v1/auth/*");
        reg.setOrder(1);
        return reg;
    }

    // ── Search: 30 req/min ───────────────────────────────
    @Bean
    public FilterRegistrationBean<RateLimitFilter> searchRateLimitFilter() {
        FilterRegistrationBean<RateLimitFilter> reg = new FilterRegistrationBean<>();
        reg.setFilter(new RateLimitFilter(buckets, 30, Duration.ofMinutes(1)));
        reg.addUrlPatterns("/api/v1/search/*");
        reg.setOrder(2);
        return reg;
    }

    // ── Uploads: 20 req/min ──────────────────────────────
    @Bean
    public FilterRegistrationBean<RateLimitFilter> uploadRateLimitFilter() {
        FilterRegistrationBean<RateLimitFilter> reg = new FilterRegistrationBean<>();
        reg.setFilter(new RateLimitFilter(buckets, 20, Duration.ofMinutes(1)));
        reg.addUrlPatterns("/api/v1/*/upload-image", "/api/v1/*/messages/image");
        reg.setOrder(3);
        return reg;
    }

    // ── Filter ───────────────────────────────────────────

    public static class RateLimitFilter implements Filter {

        private final Map<String, Bucket> buckets;
        private final int capacity;
        private final Duration refillDuration;

        public RateLimitFilter(Map<String, Bucket> buckets, int capacity, Duration refillDuration) {
            this.buckets = buckets;
            this.capacity = capacity;
            this.refillDuration = refillDuration;
        }

        @Override
        public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
                throws IOException, ServletException {

            HttpServletRequest httpReq = (HttpServletRequest) request;
            String key = resolveKey(httpReq);

            Bucket bucket = buckets.computeIfAbsent(key, k -> createBucket());

            if (bucket.tryConsume(1)) {
                chain.doFilter(request, response);
            } else {
                HttpServletResponse httpResp = (HttpServletResponse) response;
                httpResp.setStatus(429);
                httpResp.setContentType("application/json");
                httpResp.getWriter().write(
                        "{\"success\":false,\"message\":\"Rate limit exceeded. Try again later.\"}");
            }
        }

        private Bucket createBucket() {
            return Bucket.builder()
                    .addLimit(Bandwidth.classic(capacity, Refill.greedy(capacity, refillDuration)))
                    .build();
        }

        private String resolveKey(HttpServletRequest request) {
            String forwarded = request.getHeader("X-Forwarded-For");
            String ip = (forwarded != null && !forwarded.isBlank())
                    ? forwarded.split(",")[0].trim()
                    : request.getRemoteAddr();
            return ip + ":" + request.getRequestURI();
        }
    }
}
