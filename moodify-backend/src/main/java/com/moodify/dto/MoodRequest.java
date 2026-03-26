package com.moodify.dto;

import jakarta.validation.constraints.NotBlank;

public class MoodRequest {

    @NotBlank(message = "Mood is required")
    private String mood;

    private String note;

    public MoodRequest() {}

    public MoodRequest(String mood, String note) {
        this.mood = mood;
        this.note = note;
    }

    public String getMood() { return mood; }
    public void setMood(String mood) { this.mood = mood; }

    public String getNote() { return note; }
    public void setNote(String note) { this.note = note; }
}
