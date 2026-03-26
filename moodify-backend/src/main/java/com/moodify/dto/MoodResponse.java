package com.moodify.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;

public class MoodResponse {

    private Long id;
    private String mood;
    private String moodEmoji;
    private String moodCategory;
    private Integer energyLevel;
    private Integer positivityScore;
    private String note;
    private LocalDate entryDate;
    private LocalDateTime createdAt;

    public MoodResponse() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

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

    public String getNote() { return note; }
    public void setNote(String note) { this.note = note; }

    public LocalDate getEntryDate() { return entryDate; }
    public void setEntryDate(LocalDate entryDate) { this.entryDate = entryDate; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
