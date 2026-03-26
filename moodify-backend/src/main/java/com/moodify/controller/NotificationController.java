package com.moodify.controller;

import com.moodify.dto.ApiResponse;
import com.moodify.entity.NotificationLog;
import com.moodify.service.NotificationService;
import com.moodify.util.SecurityUtils;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    private final NotificationService notificationService;
    private final SecurityUtils securityUtils;

    public NotificationController(NotificationService notificationService, SecurityUtils securityUtils) {
        this.notificationService = notificationService;
        this.securityUtils = securityUtils;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<NotificationLog>>> getNotifications() {
        Long userId = securityUtils.getCurrentUserId();
        List<NotificationLog> notifications = notificationService.getNotifications(userId);
        return ResponseEntity.ok(ApiResponse.success(notifications));
    }

    @GetMapping("/unread-count")
    public ResponseEntity<ApiResponse<Map<String, Long>>> getUnreadCount() {
        Long userId = securityUtils.getCurrentUserId();
        long count = notificationService.getUnreadCount(userId);
        return ResponseEntity.ok(ApiResponse.success(Map.of("count", count)));
    }

    @PostMapping("/mark-read")
    public ResponseEntity<ApiResponse<Void>> markAllRead() {
        Long userId = securityUtils.getCurrentUserId();
        notificationService.markAllRead(userId);
        return ResponseEntity.ok(ApiResponse.success("All notifications marked as read", null));
    }
}
