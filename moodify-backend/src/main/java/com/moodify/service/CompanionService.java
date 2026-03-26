package com.moodify.service;

import com.moodify.dto.ChatRequest;
import com.moodify.dto.ChatResponse;

import java.util.List;

public interface CompanionService {
    ChatResponse chat(Long userId, ChatRequest request);
    List<ChatResponse> getChatHistory(Long userId, String sessionId);
}
