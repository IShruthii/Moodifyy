package com.moodify.entity;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "mood_entries")
public class MoodEntry {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false)
    private String mood;

    @Column(name = "mood_emoji")
    private String moodEmoji;

    @Column(name = "mood_category")
    private String moodCategory;

    @Column(name = "energy_level")
    private Integer energyLevel;

    @Column(name = "positivity_score")
    private Integer positivityScore;

    @Column(name = "intensity")
    private Integer intensity;

    @Column(columnDefinition = "TEXT")
    private String note;

    @Column(name = "entry_date")
    private LocalDate entryDate;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    public MoodEntry() {}

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        if (entryDate == null) {
            entryDate = LocalDate.now();
        }
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    public String getMood() { return mood; }
    public void setMood(String mood) { this.mood = mood; }

    public String getMoodEmoji() { return moodEmoji; }
    public void setMoodEmoji(String moodEmoji) { this.moodEmoji = moodEmoji; }

    public String getMoodCategory() { return moodCategory; }
    public void setMoodCategory(String moodCategory) { this.moodCategory = moodCategory; }

    public Integer getEnergyLevel() { return energyLevel; }
    public void setEnergyLevel(Integer energyLevel) { this.energyLevel = energyLevel; }

    public Integer getPositivityScore() { return positivityScore; }
    public void setPositivityScore(Integer positivityScore) { this.positivityScore = positivityScore; }

    public Integer getIntensity() { return intensity; }
    public void setIntensity(Integer intensity) { this.intensity = intensity; }

    public String getNote() { return note; }
    public void setNote(String note) { this.note = note; }

    public LocalDate getEntryDate() { return entryDate; }
    public void setEntryDate(LocalDate entryDate) { this.entryDate = entryDate; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
