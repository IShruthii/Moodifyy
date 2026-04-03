package com.moodify.service.impl;

import com.moodify.dto.MoodRequest;
import com.moodify.dto.MoodResponse;
import com.moodify.entity.MoodEntry;
import com.moodify.entity.User;
import com.moodify.repository.MoodEntryRepository;
import com.moodify.repository.UserRepository;
import com.moodify.service.AnalyticsService;
import com.moodify.service.MoodService;
import com.moodify.util.MoodData;
import org.springframework.context.annotation.Lazy;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class MoodServiceImpl implements MoodService {

    private final MoodEntryRepository moodEntryRepository;
    private final UserRepository userRepository;
    private final AnalyticsService analyticsService;

    public MoodServiceImpl(MoodEntryRepository moodEntryRepository,
                           UserRepository userRepository,
                           @Lazy AnalyticsService analyticsService) {
        this.moodEntryRepository = moodEntryRepository;
        this.userRepository = userRepository;
        this.analyticsService = analyticsService;
    }

    @Override
    @Transactional
    public MoodResponse logMood(Long userId, MoodRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        MoodData.MoodInfo moodInfo = MoodData.getMoodInfo(request.getMood());

        MoodEntry entry = new MoodEntry();
        entry.setUser(user);
        entry.setMood(request.getMood().toUpperCase());
        entry.setMoodEmoji(moodInfo.getEmoji());
        entry.setMoodCategory(moodInfo.getCategory());
        entry.setEnergyLevel(moodInfo.getEnergyLevel());
        entry.setPositivityScore(moodInfo.getPositivityScore());
        entry.setNote(request.getNote());
        if (request.getIntensity() != null) entry.setIntensity(request.getIntensity());
        entry.setEntryDate(LocalDate.now());

        entry = moodEntryRepository.save(entry);

        analyticsService.checkAndAwardBadges(userId);

        return toResponse(entry);
    }

    @Override
    public List<MoodResponse> getMoodHistory(Long userId) {
        return moodEntryRepository.findByUserIdOrderByCreatedAtDesc(userId)
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    public MoodResponse getTodaysMood(Long userId) {
        return moodEntryRepository.findByUserIdAndEntryDate(userId, LocalDate.now())
                .map(this::toResponse)
                .orElse(null);
    }

    @Override
    public List<MoodResponse> getMoodsByDateRange(Long userId, String startDate, String endDate) {
        LocalDate start = LocalDate.parse(startDate);
        LocalDate end = LocalDate.parse(endDate);
        return moodEntryRepository.findByUserIdAndEntryDateBetweenOrderByEntryDateAsc(userId, start, end)
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    private MoodResponse toResponse(MoodEntry entry) {
        MoodResponse response = new MoodResponse();
        response.setId(entry.getId());
        response.setMood(entry.getMood());
        response.setMoodEmoji(entry.getMoodEmoji());
        response.setMoodCategory(entry.getMoodCategory());
        response.setEnergyLevel(entry.getEnergyLevel());
        response.setPositivityScore(entry.getPositivityScore());
        response.setNote(entry.getNote());
        response.setEntryDate(entry.getEntryDate());
        response.setCreatedAt(entry.getCreatedAt());
        return response;
    }
}
