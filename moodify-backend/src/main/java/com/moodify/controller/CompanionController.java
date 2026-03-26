package com.moodify.controller;

import com.moodify.dto.ApiResponse;
import com.moodify.dto.ChatRequest;
import com.moodify.dto.ChatResponse;
import com.moodify.service.CompanionService;
import com.moodify.util.SecurityUtils;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/companion")
public class CompanionController {

    private final CompanionService companionService;
    private final SecurityUtils securityUtils;

    public CompanionController(CompanionService companionService, SecurityUtils securityUtils) {
        this.companionService = companionService;
        this.securityUtils = securityUtils;
    }

    @PostMapping("/chat")
    public ResponseEntity<ApiResponse<ChatResponse>> chat(@Valid @RequestBody ChatRequest request) {
        Long userId = securityUtils.getCurrentUserId();
        ChatResponse response = companionService.chat(userId, request);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/history/{sessionId}")
    public ResponseEntity<ApiResponse<List<ChatResponse>>> getChatHistory(@PathVariable String sessionId) {
        Long userId = securityUtils.getCurrentUserId();
        List<ChatResponse> history = companionService.getChatHistory(userId, sessionId);
        return ResponseEntity.ok(ApiResponse.success(history));
    }
}
