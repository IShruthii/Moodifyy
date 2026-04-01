package com.moodify.service.impl;

import com.moodify.dto.ChatRequest;
import com.moodify.dto.ChatResponse;
import com.moodify.entity.ChatMessage;
import com.moodify.entity.User;
import com.moodify.repository.ChatMessageRepository;
import com.moodify.repository.UserRepository;
import com.moodify.service.CompanionService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class CompanionServiceImpl implements CompanionService {

    private final ChatMessageRepository chatMessageRepository;
    private final UserRepository userRepository;
    private final RestTemplate restTemplate;

    @Value("${gemini.api.key:}")
    private String geminiApiKey;

    private static final String GEMINI_URL =
        "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=";

    public CompanionServiceImpl(ChatMessageRepository chatMessageRepository,
                                UserRepository userRepository) {
        this.chatMessageRepository = chatMessageRepository;
        this.userRepository = userRepository;
        this.restTemplate = new RestTemplate();
    }

    @Override
    public ChatResponse chat(Long userId, ChatRequest request) {
        String sessionId = request.getSessionId() != null ? request.getSessionId() : UUID.randomUUID().toString();
        User user = userRepository.findById(userId).orElse(null);
        String userName = user != null ? user.getName() : "friend";
        save(user, sessionId, "user", request.getMessage());
        String reply = callGemini(userId, userName, request, sessionId);
        save(user, sessionId, "assistant", reply);
        ChatResponse response = new ChatResponse();
        response.setMessage(reply);
        response.setSessionId(sessionId);
        response.setSuggestions(buildSuggestions(request.getCurrentMood()));
        return response;
    }

    @Override
    public List<ChatResponse> getChatHistory(Long userId, String sessionId) {
        return chatMessageRepository.findByUserIdAndSessionIdOrderByCreatedAtAsc(userId, sessionId)
            .stream().map(m -> {
                ChatResponse r = new ChatResponse();
                r.setMessage(m.getMessage());
                r.setSessionId(m.getSessionId());
                r.setRole(m.getSender());
                return r;
            }).collect(Collectors.toList());
    }

    private void save(User user, String sessionId, String sender, String content) {
        ChatMessage msg = new ChatMessage();
        msg.setUser(user);
        msg.setSessionId(sessionId);
        msg.setSender(sender);
        msg.setMessage(content);
        chatMessageRepository.save(msg);
    }

    private String callGemini(Long userId, String userName, ChatRequest request, String sessionId) {
        if (geminiApiKey == null || geminiApiKey.isBlank()) {
            return "Hey " + userName + "! I am Moo your Moodify companion. Add GEMINI_API_KEY to enable AI.";
        }
        try {
            List<ChatMessage> history = chatMessageRepository.findByUserIdAndSessionIdOrderByCreatedAtAsc(userId, sessionId);
            List<Map<String, Object>> contents = new ArrayList<>();
            int start = Math.max(0, history.size() - 10);
            for (int i = start; i < history.size(); i++) {
                ChatMessage m = history.get(i);
                String role = "assistant".equals(m.getSender()) ? "model" : "user";
                Map<String, Object> part = new HashMap<>();
                part.put("text", m.getMessage());
                List<Map<String, Object>> parts = new ArrayList<>();
                parts.add(part);
                Map<String, Object> turn = new HashMap<>();
                turn.put("role", role);
                turn.put("parts", parts);
                contents.add(turn);
            }
            Map<String, Object> curPart = new HashMap<>();
            curPart.put("text", request.getMessage());
            List<Map<String, Object>> curParts = new ArrayList<>();
            curParts.add(curPart);
            Map<String, Object> curTurn = new HashMap<>();
            curTurn.put("role", "user");
            curTurn.put("parts", curParts);
            contents.add(curTurn);
            Map<String, Object> sysPart = new HashMap<>();
            sysPart.put("text", buildSystemPrompt(userName, request.getCurrentMood()));
            List<Map<String, Object>> sysParts = new ArrayList<>();
            sysParts.add(sysPart);
            Map<String, Object> sysInstruction = new HashMap<>();
            sysInstruction.put("parts", sysParts);
            Map<String, Object> genConfig = new HashMap<>();
            genConfig.put("temperature", 0.9);
            genConfig.put("maxOutputTokens", 300);
            Map<String, Object> body = new HashMap<>();
            body.put("system_instruction", sysInstruction);
            body.put("contents", contents);
            body.put("generationConfig", genConfig);
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(body, headers);
            ResponseEntity<Map> resp = restTemplate.postForEntity(GEMINI_URL + geminiApiKey, entity, Map.class);
            if (resp.getStatusCode() == HttpStatus.OK && resp.getBody() != null) {
                return extractText(resp.getBody());
            }
        } catch (Exception e) {
            System.err.println("Gemini error: " + e.getMessage());
        }
        return "I am here for you, " + userName;
    }

    @SuppressWarnings("unchecked")
    private String extractText(Map<String, Object> body) {
        try {
            List<Map<String, Object>> candidates = (List<Map<String, Object>>) body.get("candidates");
            if (candidates != null && !candidates.isEmpty()) {
                Map<String, Object> content = (Map<String, Object>) candidates.get(0).get("content");
                List<Map<String, Object>> parts = (List<Map<String, Object>>) content.get("parts");
                if (parts != null && !parts.isEmpty()) return (String) parts.get(0).get("text");
            }
        } catch (Exception e) { System.err.println("Parse error: " + e.getMessage()); }
        return "I am here for you";
    }

    private String buildSystemPrompt(String userName, String mood) {
        return "You are Moo, a caring AI companion in Moodify. Care deeply about " + userName +
            ". Be warm, flirty, emotionally intelligent. Current mood: " + (mood != null ? mood : "unknown") +
            ". Keep responses to 2-4 sentences with emojis.";
    }

    private List<String> buildSuggestions(String mood) {
        if (mood == null) return Arrays.asList("How are you feeling?", "Tell me about your day", "What is on your mind?");
        switch (mood.toLowerCase()) {
            case "happy": case "excited": case "motivated":
                return Arrays.asList("What made you smile?", "Share your win!", "Keep this energy!");
            case "sad": case "lonely": case "disappointed":
                return Arrays.asList("I am here", "Want to talk?", "What would help?");
            case "anxious": case "stressed": case "overwhelmed":
                return Arrays.asList("Breathe with me", "What is worrying you?", "One step at a time");
            default:
                return Arrays.asList("How are you feeling?", "Tell me more", "I am all yours");
        }
    }
}
