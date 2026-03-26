package com.moodify.dto;

import java.time.LocalDateTime;

public class FeedbackResponse {

    private Long id;
    private int rating;
    private String comment;
    private String moodBefore;
    private String moodAfter;
    private String sessionType;
    private LocalDateTime createdAt;

    public FeedbackResponse() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public int getRating() { return rating; }
    public void setRating(int rating) { this.rating = rating; }

    public String getComment() { return comment; }
    public void setComment(String comment) { this.comment = comment; }

    public String getMoodBefore() { return moodBefore; }
    public void setMoodBefore(String moodBefore) { this.moodBefore = moodBefore; }

    public String getMoodAfter() { return moodAfter; }
    public void setMoodAfter(String moodAfter) { this.moodAfter = moodAfter; }

    public String getSessionType() { return sessionType; }
    public void setSessionType(String sessionType) { this.sessionType = sessionType; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
