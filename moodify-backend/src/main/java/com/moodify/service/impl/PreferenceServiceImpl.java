package com.moodify.service.impl;

import com.moodify.dto.PreferenceRequest;
import com.moodify.entity.User;
import com.moodify.entity.UserPreference;
import com.moodify.repository.UserPreferenceRepository;
import com.moodify.repository.UserRepository;
import com.moodify.service.PreferenceService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class PreferenceServiceImpl implements PreferenceService {

    private final UserPreferenceRepository preferenceRepository;
    private final UserRepository userRepository;

    public PreferenceServiceImpl(UserPreferenceRepository preferenceRepository,
                                  UserRepository userRepository) {
        this.preferenceRepository = preferenceRepository;
        this.userRepository = userRepository;
    }

    @Override
    public UserPreference getPreference(Long userId) {
        return preferenceRepository.findByUserId(userId)
                .orElseGet(() -> {
                    User user = userRepository.findById(userId)
                            .orElseThrow(() -> new RuntimeException("User not found"));
                    UserPreference pref = new UserPreference(user);
                    return preferenceRepository.save(pref);
                });
    }

    @Override
    @Transactional
    public UserPreference savePreference(Long userId, PreferenceRequest request) {
        UserPreference preference = getPreference(userId);

        if (request.getDisplayName() != null) preference.setDisplayName(request.getDisplayName());
        if (request.getAvatarId() != null) preference.setAvatarId(request.getAvatarId());
        if (request.getTheme() != null) preference.setTheme(request.getTheme());
        preference.setNotificationEnabled(request.isNotificationEnabled());
        if (request.getDailyReminderTime() != null) preference.setDailyReminderTime(request.getDailyReminderTime());
        if (request.getMusicLanguage() != null) preference.setMusicLanguage(request.getMusicLanguage());

        return preferenceRepository.save(preference);
    }
}
