package com.moodify.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public class FeedbackRequest {

    @NotNull
    @Min(1) @Max(5)
    private Integer rating;

    private String comment;
    private String moodBefore;
    private String moodAfter;
    private String sessionType;

    public FeedbackRequest() {}

    public Integer getRating() { return rating; }
    public void setRating(Integer rating) { this.rating = rating; }

    public String getComment() { return comment; }
    public void setComment(String comment) { this.comment = comment; }

    public String getMoodBefore() { return moodBefore; }
    public void setMoodBefore(String moodBefore) { this.moodBefore = moodBefore; }

    public String getMoodAfter() { return moodAfter; }
    public void setMoodAfter(String moodAfter) { this.moodAfter = moodAfter; }

    public String getSessionType() { return sessionType; }
    public void setSessionType(String sessionType) { this.sessionType = sessionType; }
}
