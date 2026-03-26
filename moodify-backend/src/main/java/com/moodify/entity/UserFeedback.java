package com.moodify.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "user_feedback")
public class UserFeedback {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false)
    private int rating;           // 1–5 stars

    @Column(columnDefinition = "TEXT")
    private String comment;

    @Column(name = "mood_before")
    private String moodBefore;

    @Column(name = "mood_after")
    private String moodAfter;

    @Column(name = "session_type")
    private String sessionType;   // RECOMMENDATION, GAME, CHAT

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    public UserFeedback() {}

    @PrePersist
    protected void onCreate() { createdAt = LocalDateTime.now(); }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

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
