package com.moodify.controller;

import com.moodify.dto.ApiResponse;
import com.moodify.dto.PreferenceRequest;
import com.moodify.entity.UserPreference;
import com.moodify.service.PreferenceService;
import com.moodify.util.SecurityUtils;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/preferences")
public class PreferenceController {

    private final PreferenceService preferenceService;
    private final SecurityUtils securityUtils;

    public PreferenceController(PreferenceService preferenceService, SecurityUtils securityUtils) {
        this.preferenceService = preferenceService;
        this.securityUtils = securityUtils;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<UserPreference>> getPreference() {
        Long userId = securityUtils.getCurrentUserId();
        UserPreference preference = preferenceService.getPreference(userId);
        return ResponseEntity.ok(ApiResponse.success(preference));
    }

    @PutMapping
    public ResponseEntity<ApiResponse<UserPreference>> savePreference(@RequestBody PreferenceRequest request) {
        Long userId = securityUtils.getCurrentUserId();
        UserPreference preference = preferenceService.savePreference(userId, request);
        return ResponseEntity.ok(ApiResponse.success("Preferences saved", preference));
    }
}
