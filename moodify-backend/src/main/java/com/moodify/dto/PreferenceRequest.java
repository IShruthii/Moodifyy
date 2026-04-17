package com.moodify.dto;

public class PreferenceRequest {

    private String displayName;
    private String avatarId;
    private String theme;
    private boolean notificationEnabled;
    private String dailyReminderTime;
    private String musicLanguage;
    private String botName;
    private String botPersonality;
    private String voicePreference;

    public PreferenceRequest() {}

    public String getDisplayName() { return displayName; }
    public void setDisplayName(String displayName) { this.displayName = displayName; }

    public String getAvatarId() { return avatarId; }
    public void setAvatarId(String avatarId) { this.avatarId = avatarId; }

    public String getTheme() { return theme; }
    public void setTheme(String theme) { this.theme = theme; }

    public boolean isNotificationEnabled() { return notificationEnabled; }
    public void setNotificationEnabled(boolean notificationEnabled) { this.notificationEnabled = notificationEnabled; }

    public String getDailyReminderTime() { return dailyReminderTime; }
    public void setDailyReminderTime(String dailyReminderTime) { this.dailyReminderTime = dailyReminderTime; }

    public String getMusicLanguage() { return musicLanguage; }
    public void setMusicLanguage(String musicLanguage) { this.musicLanguage = musicLanguage; }

    public String getBotName() { return botName; }
    public void setBotName(String botName) { this.botName = botName; }

    public String getBotPersonality() { return botPersonality; }
    public void setBotPersonality(String botPersonality) { this.botPersonality = botPersonality; }

    public String getVoicePreference() { return voicePreference; }
    public void setVoicePreference(String voicePreference) { this.voicePreference = voicePreference; }
}
