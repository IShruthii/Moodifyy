package com.moodify.service;

import com.moodify.dto.RecommendationResponse;

public interface RecommendationService {
    RecommendationResponse getRecommendations(String mood, String musicLanguage);
    void logRecommendationClick(Long userId, String mood, String type, String title);
}
