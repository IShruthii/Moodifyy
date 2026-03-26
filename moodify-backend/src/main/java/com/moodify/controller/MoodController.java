package com.moodify.controller;

import com.moodify.dto.ApiResponse;
import com.moodify.dto.MoodRequest;
import com.moodify.dto.MoodResponse;
import com.moodify.service.MoodService;
import com.moodify.util.SecurityUtils;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/mood")
public class MoodController {

    private final MoodService moodService;
    private final SecurityUtils securityUtils;

    public MoodController(MoodService moodService, SecurityUtils securityUtils) {
        this.moodService = moodService;
        this.securityUtils = securityUtils;
    }

    @PostMapping("/log")
    public ResponseEntity<ApiResponse<MoodResponse>> logMood(@Valid @RequestBody MoodRequest request) {
        Long userId = securityUtils.getCurrentUserId();
        MoodResponse response = moodService.logMood(userId, request);
        return ResponseEntity.ok(ApiResponse.success("Mood logged successfully", response));
    }

    @GetMapping("/history")
    public ResponseEntity<ApiResponse<List<MoodResponse>>> getMoodHistory() {
        Long userId = securityUtils.getCurrentUserId();
        List<MoodResponse> history = moodService.getMoodHistory(userId);
        return ResponseEntity.ok(ApiResponse.success(history));
    }

    @GetMapping("/today")
    public ResponseEntity<ApiResponse<MoodResponse>> getTodaysMood() {
        Long userId = securityUtils.getCurrentUserId();
        MoodResponse today = moodService.getTodaysMood(userId);
        return ResponseEntity.ok(ApiResponse.success(today));
    }

    @GetMapping("/range")
    public ResponseEntity<ApiResponse<List<MoodResponse>>> getMoodsByRange(
            @RequestParam String startDate,
            @RequestParam String endDate) {
        Long userId = securityUtils.getCurrentUserId();
        List<MoodResponse> moods = moodService.getMoodsByDateRange(userId, startDate, endDate);
        return ResponseEntity.ok(ApiResponse.success(moods));
    }
}
