package com.moodify.service;

import com.moodify.entity.NotificationLog;

import java.util.List;

public interface NotificationService {
    List<NotificationLog> getNotifications(Long userId);
    long getUnreadCount(Long userId);
    void markAllRead(Long userId);
    void sendDailyReminders();
    void createNotification(Long userId, String type, String message);
}
