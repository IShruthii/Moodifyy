package com.moodify.service;

import com.moodify.dto.PreferenceRequest;
import com.moodify.entity.UserPreference;

public interface PreferenceService {
    UserPreference getPreference(Long userId);
    UserPreference savePreference(Long userId, PreferenceRequest request);
}
