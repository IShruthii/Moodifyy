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
    public ResponseEntity<ApiResponse<PreferenceRequest>> getPreference() {
        Long userId = securityUtils.getCurrentUserId();
        UserPreference preference = preferenceService.getPreference(userId);
        PreferenceRequest dto = toDto(preference);
        return ResponseEntity.ok(ApiResponse.success(dto));
    }

    @PutMapping
    public ResponseEntity<ApiResponse<PreferenceRequest>> savePreference(@RequestBody PreferenceRequest request) {
        Long userId = securityUtils.getCurrentUserId();
        UserPreference preference = preferenceService.savePreference(userId, request);
        PreferenceRequest dto = toDto(preference);
        return ResponseEntity.ok(ApiResponse.success("Preferences saved", dto));
    }

    private PreferenceRequest toDto(UserPreference p) {
        PreferenceRequest dto = new PreferenceRequest();
        dto.setDisplayName(p.getDisplayName());
        dto.setAvatarId(p.getAvatarId());
        dto.setTheme(p.getTheme());
        dto.setNotificationEnabled(p.isNotificationEnabled());
        dto.setDailyReminderTime(p.getDailyReminderTime());
        dto.setMusicLanguage(p.getMusicLanguage());
        dto.setBotName(p.getBotName() != null ? p.getBotName() : "Moo");
        dto.setBotPersonality(p.getBotPersonality() != null ? p.getBotPersonality() : "flirty");
        dto.setVoicePreference(p.getVoicePreference() != null ? p.getVoicePreference() : "auto");
        return dto;
    }
}
