package com.moodify.service;

import com.moodify.dto.AnalyticsResponse;

public interface AnalyticsService {
    AnalyticsResponse getAnalytics(Long userId);
    void checkAndAwardBadges(Long userId);
    int calculateCurrentStreak(Long userId);
    java.util.Map<String, Object> getMonthlyReport(Long userId, int year, int month);
}
