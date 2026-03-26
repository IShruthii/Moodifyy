package com.moodify.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.*;

@Service
public class GeminiService {

    @Value("${gemini.api.key}")
    private String apiKey;

    @Value("${gemini.api.url}")
    private String apiUrl;

    private final RestTemplate restTemplate = new RestTemplate();

    /**
     * Calls Gemini API with a mood-aware system prompt.
     * Returns null if the call fails so the caller can fall back.
     */
    public String ask(String userName, String userMessage, String mood, List<String> recentHistory) {
        // Skip if API key not configured
        if (apiKey == null || apiKey.isBlank()) {
            return null;
        }
        try {
            String systemPrompt = buildSystemPrompt(userName, mood);
            String fullPrompt = buildFullPrompt(systemPrompt, recentHistory, userMessage);

            Map<String, Object> body = new HashMap<>();
            List<Map<String, Object>> contents = new ArrayList<>();

            Map<String, Object> content = new HashMap<>();
            List<Map<String, Object>> parts = new ArrayList<>();
            Map<String, Object> part = new HashMap<>();
            part.put("text", fullPrompt);
            parts.add(part);
            content.put("parts", parts);
            contents.add(content);
            body.put("contents", contents);

            // Safety + generation config
            Map<String, Object> genConfig = new HashMap<>();
            genConfig.put("temperature", 0.85);
            genConfig.put("maxOutputTokens", 200);
            genConfig.put("topP", 0.9);
            body.put("generationConfig", genConfig);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            String url = apiUrl + "?key=" + apiKey;
            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(body, headers);

            ResponseEntity<Map> response = restTemplate.postForEntity(url, entity, Map.class);

            if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
                String result = extractText(response.getBody());
                if (result != null && !result.isBlank()) {
                    return result;
                }
            } else {
                System.err.println("[GeminiService] Non-200 response: " + response.getStatusCode());
            }
        } catch (org.springframework.web.client.HttpClientErrorException e) {
            System.err.println("[GeminiService] HTTP error " + e.getStatusCode() + ": " + e.getResponseBodyAsString());
        } catch (Exception e) {
            System.err.println("[GeminiService] API call failed: " + e.getMessage());
        }
        return null;
    }

    private String buildSystemPrompt(String userName, String mood) {
        String moodContext = (mood != null && !mood.isBlank())
                ? "The user's current logged mood is: " + mood + "."
                : "The user's mood is not yet logged.";

        return """
                You are Moo — a warm, emotionally intelligent AI companion inside the Moodify wellness app.
                You are NOT a generic chatbot. You are a caring, smart friend who truly listens and responds meaningfully.

                User's name: %s
                %s

                YOUR PERSONALITY:
                - Warm, calm, human, and genuine
                - Concise — 1 to 3 sentences max per reply
                - Never robotic, never clinical, never preachy
                - Respond like a real friend who actually cares

                HOW TO RESPOND:
                1. If the user expresses an emotion (sad, stressed, anxious, angry, lonely, tired):
                   - First: acknowledge their feeling with empathy (1 sentence)
                   - Then: offer 1 gentle, realistic suggestion (breathing, music, journaling, game, walk)
                   - Never lecture or give a list of advice

                2. If the user mentions food or eating (e.g. "I want to eat something", "I'm hungry", "craving"):
                   - Respond warmly and suggest they check the Food tab in their recommendations
                   - Example: "Ooh, food sounds like a great idea right now! Check your Food recommendations — I've picked something based on your mood. 🍜"

                3. If the user mentions music:
                   - Suggest they check the Music tab in recommendations
                   - Example: "Music is perfect for this moment. Head to your Music recommendations — I've curated something just for you. 🎵"

                4. If the user mentions games or boredom:
                   - Suggest the Games tab
                   - Example: "A little game could be just what you need! Check your Games tab. 🎮"

                5. If the user is happy or excited:
                   - Match their energy, celebrate with them, ask what's going well

                6. If the user asks a general question:
                   - Answer clearly and helpfully like an intelligent assistant

                7. If the user seems in serious distress:
                   - Be gentle, validate their feelings
                   - Softly suggest talking to a trusted person or professional
                   - Never diagnose or prescribe

                STRICT RULES:
                - NEVER say "I'm having trouble connecting"
                - NEVER repeat the same response twice in a row
                - NEVER give medical advice or diagnosis
                - NEVER write more than 3 sentences
                - ALWAYS respond in the same language the user writes in
                - Use at most 1 emoji per response
                """.formatted(userName, moodContext);
    }

    private String buildFullPrompt(String system, List<String> history, String userMessage) {
        StringBuilder sb = new StringBuilder()
                .append(system)
                .append("\n\n");

        if (!history.isEmpty()) {
            sb.append("Recent conversation (for context):\n");
            for (String h : history) {
                sb.append(h).append("\n");
            }
            sb.append("\n");
        }

        sb.append("User: ").append(userMessage).append("\n")
          .append("Moo (respond naturally, 1-3 sentences max):");
        return sb.toString();
    }

    @SuppressWarnings("unchecked")
    private String extractText(Map<String, Object> body) {
        try {
            List<Map<String, Object>> candidates = (List<Map<String, Object>>) body.get("candidates");
            if (candidates == null || candidates.isEmpty()) return null;
            Map<String, Object> content = (Map<String, Object>) candidates.get(0).get("content");
            if (content == null) return null;
            List<Map<String, Object>> parts = (List<Map<String, Object>>) content.get("parts");
            if (parts == null || parts.isEmpty()) return null;
            String text = (String) parts.get(0).get("text");
            return text != null ? text.trim() : null;
        } catch (Exception e) {
            return null;
        }
    }
}
