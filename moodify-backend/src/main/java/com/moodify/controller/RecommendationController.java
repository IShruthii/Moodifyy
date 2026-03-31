package com.moodify.controller;

import com.moodify.dto.ApiResponse;
import com.moodify.dto.RecommendationResponse;
import com.moodify.entity.UserPreference;
import com.moodify.repository.UserPreferenceRepository;
import com.moodify.service.RecommendationService;
import com.moodify.util.SecurityUtils;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/recommendations")
public class RecommendationController {

    private final RecommendationService recommendationService;
    private final SecurityUtils securityUtils;
    private final UserPreferenceRepository preferenceRepository;

    public RecommendationController(RecommendationService recommendationService,
                                    SecurityUtils securityUtils,
                                    UserPreferenceRepository preferenceRepository) {
        this.recommendationService = recommendationService;
        this.securityUtils = securityUtils;
        this.preferenceRepository = preferenceRepository;
    }

    @GetMapping("/{mood}")
    public ResponseEntity<ApiResponse<RecommendationResponse>> getRecommendations(@PathVariable String mood) {
        Long userId = securityUtils.getCurrentUserId();
        String musicLanguage = preferenceRepository.findByUserId(userId)
                .map(p -> p.getMusicLanguage() != null ? p.getMusicLanguage() : "english")
                .orElse("english");
        RecommendationResponse response = recommendationService.getRecommendations(mood, musicLanguage);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PostMapping("/click")
    public ResponseEntity<ApiResponse<Void>> logClick(
            @RequestParam String mood,
            @RequestParam String type,
            @RequestParam String title) {
        Long userId = securityUtils.getCurrentUserId();
        recommendationService.logRecommendationClick(userId, mood, type, title);
        return ResponseEntity.ok(ApiResponse.success("Logged", null));
    }
}
