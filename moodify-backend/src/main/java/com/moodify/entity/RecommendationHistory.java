package com.moodify.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "recommendation_history")
public class RecommendationHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false)
    private String mood;

    @Column(name = "recommendation_type")
    private String recommendationType;

    @Column(name = "recommendation_title")
    private String recommendationTitle;

    @Column(name = "clicked_at")
    private LocalDateTime clickedAt;

    public RecommendationHistory() {}

    @PrePersist
    protected void onCreate() {
        clickedAt = LocalDateTime.now();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    public String getMood() { return mood; }
    public void setMood(String mood) { this.mood = mood; }

    public String getRecommendationType() { return recommendationType; }
    public void setRecommendationType(String recommendationType) { this.recommendationType = recommendationType; }

    public String getRecommendationTitle() { return recommendationTitle; }
    public void setRecommendationTitle(String recommendationTitle) { this.recommendationTitle = recommendationTitle; }

    public LocalDateTime getClickedAt() { return clickedAt; }
    public void setClickedAt(LocalDateTime clickedAt) { this.clickedAt = clickedAt; }
}
