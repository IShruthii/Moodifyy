package com.moodify.service;

import com.moodify.dto.MoodRequest;
import com.moodify.dto.MoodResponse;

import java.util.List;

public interface MoodService {
    MoodResponse logMood(Long userId, MoodRequest request);
    List<MoodResponse> getMoodHistory(Long userId);
    MoodResponse getTodaysMood(Long userId);
    List<MoodResponse> getMoodsByDateRange(Long userId, String startDate, String endDate);
}
