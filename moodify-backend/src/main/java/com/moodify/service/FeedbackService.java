package com.moodify.service;

import com.moodify.dto.FeedbackRequest;
import com.moodify.dto.FeedbackResponse;

import java.util.List;
import java.util.Map;

public interface FeedbackService {
    FeedbackResponse submitFeedback(Long userId, FeedbackRequest request);
    List<FeedbackResponse> getFeedbackHistory(Long userId);
    Map<String, Object> getFeedbackSummary(Long userId);
}
