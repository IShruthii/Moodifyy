package com.moodify.service.impl;

import com.moodify.entity.NotificationLog;
import com.moodify.entity.User;
import com.moodify.repository.MoodEntryRepository;
import com.moodify.repository.NotificationLogRepository;
import com.moodify.repository.UserRepository;
import com.moodify.service.AnalyticsService;
import com.moodify.service.NotificationService;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Service
public class NotificationServiceImpl implements NotificationService {

    private final NotificationLogRepository notificationLogRepository;
    private final UserRepository userRepository;
    private final MoodEntryRepository moodEntryRepository;
    private final AnalyticsService analyticsService;

    public NotificationServiceImpl(NotificationLogRepository notificationLogRepository,
                                    UserRepository userRepository,
                                    MoodEntryRepository moodEntryRepository,
                                    AnalyticsService analyticsService) {
        this.notificationLogRepository = notificationLogRepository;
        this.userRepository = userRepository;
        this.moodEntryRepository = moodEntryRepository;
        this.analyticsService = analyticsService;
    }

    @Override
    public List<NotificationLog> getNotifications(Long userId) {
        return notificationLogRepository.findByUserIdOrderBySentAtDesc(userId);
    }

    @Override
    public long getUnreadCount(Long userId) {
        return notificationLogRepository.countByUserIdAndReadFalse(userId);
    }

    @Override
    @Transactional
    public void markAllRead(Long userId) {
        List<NotificationLog> unread = notificationLogRepository.findByUserIdAndReadFalseOrderBySentAtDesc(userId);
        unread.forEach(n -> n.setRead(true));
        notificationLogRepository.saveAll(unread);
    }

    @Override
    @Transactional
    public void createNotification(Long userId, String type, String message) {
        userRepository.findById(userId).ifPresent(user -> {
            NotificationLog log = new NotificationLog();
            log.setUser(user);
            log.setType(type);
            log.setMessage(message);
            notificationLogRepository.save(log);
        });
    }

    @Override
    @Scheduled(cron = "0 0 9 * * *")
    @Transactional
    public void sendDailyReminders() {
        List<User> users = userRepository.findAll();
        for (User user : users) {
            if (!user.isActive()) continue;

            Optional<com.moodify.entity.MoodEntry> todaysMood =
                    moodEntryRepository.findByUserIdAndEntryDate(user.getId(), LocalDate.now());

            if (todaysMood.isEmpty()) {
                createNotification(user.getId(), "DAILY_REMINDER",
                        "Hey " + user.getName() + "! How are you feeling today? Take a moment to check in with yourself. 💙");
            }

            int streak = analyticsService.calculateCurrentStreak(user.getId());
            if (streak >= 3) {
                createNotification(user.getId(), "STREAK_REMINDER",
                        "You're on a " + streak + "-day streak! Keep it going — you're building a beautiful habit. 🔥");
            }
        }
    }
}
