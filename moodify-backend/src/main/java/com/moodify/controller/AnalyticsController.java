package com.moodify.controller;

import com.moodify.dto.AnalyticsResponse;
import com.moodify.dto.ApiResponse;
import com.moodify.service.AnalyticsService;
import com.moodify.util.SecurityUtils;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/analytics")
public class AnalyticsController {

    private final AnalyticsService analyticsService;
    private final SecurityUtils securityUtils;

    public AnalyticsController(AnalyticsService analyticsService, SecurityUtils securityUtils) {
        this.analyticsService = analyticsService;
        this.securityUtils = securityUtils;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<AnalyticsResponse>> getAnalytics() {
        Long userId = securityUtils.getCurrentUserId();
        AnalyticsResponse response = analyticsService.getAnalytics(userId);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/report")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getMonthlyReport(
            @RequestParam int year,
            @RequestParam int month) {
        Long userId = securityUtils.getCurrentUserId();
        Map<String, Object> report = analyticsService.getMonthlyReport(userId, year, month);
        return ResponseEntity.ok(ApiResponse.success(report));
    }
}
