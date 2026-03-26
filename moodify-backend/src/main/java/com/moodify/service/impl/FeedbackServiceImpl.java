package com.moodify.service.impl;

import com.moodify.dto.FeedbackRequest;
import com.moodify.dto.FeedbackResponse;
import com.moodify.entity.UserFeedback;
import com.moodify.repository.UserFeedbackRepository;
import com.moodify.repository.UserRepository;
import com.moodify.service.FeedbackService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class FeedbackServiceImpl implements FeedbackService {

    private final UserFeedbackRepository feedbackRepository;
    private final UserRepository userRepository;

    public FeedbackServiceImpl(UserFeedbackRepository feedbackRepository,
                                UserRepository userRepository) {
        this.feedbackRepository = feedbackRepository;
        this.userRepository = userRepository;
    }

    @Override
    @Transactional
    public FeedbackResponse submitFeedback(Long userId, FeedbackRequest request) {
        UserFeedback feedback = new UserFeedback();
        userRepository.findById(userId).ifPresent(feedback::setUser);
        feedback.setRating(request.getRating());
        feedback.setComment(request.getComment());
        feedback.setMoodBefore(request.getMoodBefore());
        feedback.setMoodAfter(request.getMoodAfter());
        feedback.setSessionType(request.getSessionType() != null ? request.getSessionType() : "GENERAL");
        feedback = feedbackRepository.save(feedback);
        return toResponse(feedback);
    }

    @Override
    public List<FeedbackResponse> getFeedbackHistory(Long userId) {
        return feedbackRepository.findByUserIdOrderByCreatedAtDesc(userId)
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    @Override
    public Map<String, Object> getFeedbackSummary(Long userId) {
        Double avg = feedbackRepository.findAverageRatingByUserId(userId);
        long count = feedbackRepository.countByUserId(userId);
        List<UserFeedback> all = feedbackRepository.findByUserIdOrderByCreatedAtDesc(userId);

        long[] stars = new long[5];
        for (UserFeedback f : all) {
            int r = Math.max(1, Math.min(5, f.getRating()));
            stars[r - 1]++;
        }

        Map<String, Object> summary = new HashMap<>();
        summary.put("averageRating", avg != null ? Math.round(avg * 10.0) / 10.0 : 0.0);
        summary.put("totalFeedback", count);
        summary.put("starBreakdown", Map.of(
            "1", stars[0], "2", stars[1], "3", stars[2], "4", stars[3], "5", stars[4]
        ));
        summary.put("recentFeedback", all.stream().limit(5).map(this::toResponse).collect(Collectors.toList()));
        return summary;
    }

    private FeedbackResponse toResponse(UserFeedback f) {
        FeedbackResponse r = new FeedbackResponse();
        r.setId(f.getId());
        r.setRating(f.getRating());
        r.setComment(f.getComment());
        r.setMoodBefore(f.getMoodBefore());
        r.setMoodAfter(f.getMoodAfter());
        r.setSessionType(f.getSessionType());
        r.setCreatedAt(f.getCreatedAt());
        return r;
    }
}
