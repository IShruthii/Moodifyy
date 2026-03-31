package com.moodify.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "user_preferences")
public class UserPreference {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "avatar_id")
    private String avatarId = "avatar_1";

    @Column(name = "theme")
    private String theme = "soft_purple";

    @Column(name = "display_name")
    private String displayName;

    @Column(name = "notification_enabled")
    private boolean notificationEnabled = true;

    @Column(name = "daily_reminder_time")
    private String dailyReminderTime = "09:00";

    @Column(name = "music_language")
    private String musicLanguage = "english";

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public UserPreference() {}

    public UserPreference(User user) {
        this.user = user;
        this.displayName = user.getName();
    }

    @PrePersist
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    public String getAvatarId() { return avatarId; }
    public void setAvatarId(String avatarId) { this.avatarId = avatarId; }

    public String getTheme() { return theme; }
    public void setTheme(String theme) { this.theme = theme; }

    public String getDisplayName() { return displayName; }
    public void setDisplayName(String displayName) { this.displayName = displayName; }

    public boolean isNotificationEnabled() { return notificationEnabled; }
    public void setNotificationEnabled(boolean notificationEnabled) { this.notificationEnabled = notificationEnabled; }

    public String getDailyReminderTime() { return dailyReminderTime; }
    public void setDailyReminderTime(String dailyReminderTime) { this.dailyReminderTime = dailyReminderTime; }

    public String getMusicLanguage() { return musicLanguage; }
    public void setMusicLanguage(String musicLanguage) { this.musicLanguage = musicLanguage; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
