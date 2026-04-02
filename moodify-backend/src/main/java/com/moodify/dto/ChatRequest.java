package com.moodify.dto;

import jakarta.validation.constraints.NotBlank;

public class ChatRequest {

    @NotBlank(message = "Message is required")
    private String message;

    private String sessionId;
    private String currentMood;
    private String quickAction;
    private String botName;
    private String botPersonality;

    public ChatRequest() {}

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }

    public String getSessionId() { return sessionId; }
    public void setSessionId(String sessionId) { this.sessionId = sessionId; }

    public String getCurrentMood() { return currentMood; }
    public void setCurrentMood(String currentMood) { this.currentMood = currentMood; }

    public String getQuickAction() { return quickAction; }
    public void setQuickAction(String quickAction) { this.quickAction = quickAction; }

    public String getBotName() { return botName; }
    public void setBotName(String botName) { this.botName = botName; }

    public String getBotPersonality() { return botPersonality; }
    public void setBotPersonality(String botPersonality) { this.botPersonality = botPersonality; }
}
