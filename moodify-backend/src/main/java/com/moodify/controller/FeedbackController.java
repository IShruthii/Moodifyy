package com.moodify.controller;

import com.moodify.dto.ApiResponse;
import com.moodify.dto.FeedbackRequest;
import com.moodify.dto.FeedbackResponse;
import com.moodify.service.FeedbackService;
import com.moodify.util.SecurityUtils;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/feedback")
public class FeedbackController {

    private final FeedbackService feedbackService;
    private final SecurityUtils securityUtils;

    public FeedbackController(FeedbackService feedbackService, SecurityUtils securityUtils) {
        this.feedbackService = feedbackService;
        this.securityUtils = securityUtils;
    }

    @PostMapping
    public ResponseEntity<ApiResponse<FeedbackResponse>> submit(@Valid @RequestBody FeedbackRequest request) {
        Long userId = securityUtils.getCurrentUserId();
        FeedbackResponse response = feedbackService.submitFeedback(userId, request);
        return ResponseEntity.ok(ApiResponse.success("Feedback submitted", response));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<FeedbackResponse>>> getHistory() {
        Long userId = securityUtils.getCurrentUserId();
        return ResponseEntity.ok(ApiResponse.success(feedbackService.getFeedbackHistory(userId)));
    }

    @GetMapping("/summary")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getSummary() {
        Long userId = securityUtils.getCurrentUserId();
        return ResponseEntity.ok(ApiResponse.success(feedbackService.getFeedbackSummary(userId)));
    }
}
