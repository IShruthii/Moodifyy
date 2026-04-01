package com.moodify.dto;

import java.util.List;

public class ChatResponse {

    private String message;
    private String sessionId;
    private List<String> suggestions;
    private String actionType;
    private String role;

    public ChatResponse() {}

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }
    public String getSessionId() { return sessionId; }
    public void setSessionId(String sessionId) { this.sessionId = sessionId; }
    public List<String> getSuggestions() { return suggestions; }
    public void setSuggestions(List<String> suggestions) { this.suggestions = suggestions; }
    public String getActionType() { return actionType; }
    public void setActionType(String actionType) { this.actionType = actionType; }
    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }
}
