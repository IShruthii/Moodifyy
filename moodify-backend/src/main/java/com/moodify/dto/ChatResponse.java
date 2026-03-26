package com.moodify.dto;

import java.util.List;

public class ChatResponse {

    private String message;
    private String sessionId;
    private List<String> suggestions;
    private String actionType;

    public ChatResponse() {}

    public ChatResponse(String message, String sessionId, List<String> suggestions, String actionType) {
        this.message = message;
        this.sessionId = sessionId;
        this.suggestions = suggestions;
        this.actionType = actionType;
    }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }

    public String getSessionId() { return sessionId; }
    public void setSessionId(String sessionId) { this.sessionId = sessionId; }

    public List<String> getSuggestions() { return suggestions; }
    public void setSuggestions(List<String> suggestions) { this.suggestions = suggestions; }

    public String getActionType() { return actionType; }
    public void setActionType(String actionType) { this.actionType = actionType; }
}
