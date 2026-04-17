package com.moodify.service.impl;

import com.moodify.entity.NotificationLog;
import com.moodify.entity.User;
import com.moodify.entity.UserPreference;
import com.moodify.repository.MoodEntryRepository;
import com.moodify.repository.NotificationLogRepository;
import com.moodify.repository.UserPreferenceRepository;
import com.moodify.repository.UserRepository;
import com.moodify.service.AnalyticsService;
import com.moodify.service.NotificationService;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.*;

/**
 * NotificationServiceImpl
 *
 * Scheduled reminders run at 9am, 12pm, 3pm, 6pm, 9pm server time.
 * Each reminder uses the user's selected bot personality for tone.
 *
 * NOTE: Render free tier sleeps after 15 mins of inactivity.
 * The scheduled jobs will only fire if the server is awake.
 * To guarantee delivery, upgrade to a paid Render tier or use an
 * external cron service (e.g. cron-job.org) to ping the backend
 * at each scheduled time to keep it awake.
 */
@Service
public class NotificationServiceImpl implements NotificationService {

    private final NotificationLogRepository notificationLogRepository;
    private final UserRepository userRepository;
    private final UserPreferenceRepository preferenceRepository;
    private final MoodEntryRepository moodEntryRepository;
    private final AnalyticsService analyticsService;

    public NotificationServiceImpl(NotificationLogRepository notificationLogRepository,
                                   UserRepository userRepository,
                                   UserPreferenceRepository preferenceRepository,
                                   MoodEntryRepository moodEntryRepository,
                                   AnalyticsService analyticsService) {
        this.notificationLogRepository = notificationLogRepository;
        this.userRepository = userRepository;
        this.preferenceRepository = preferenceRepository;
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

    // ── Scheduled reminders — 5 times per day ────────────────────────────────
    // Multiple times so at least one fires while server is awake on Render free tier

    @Scheduled(cron = "0 0 9 * * *")   // 9am
    @Transactional
    public void sendMorningReminders() { sendDailyReminders(); }

    @Scheduled(cron = "0 0 12 * * *")  // 12pm
    @Transactional
    public void sendNoonReminders() { sendDailyReminders(); }

    @Scheduled(cron = "0 0 15 * * *")  // 3pm
    @Transactional
    public void sendAfternoonReminders() { sendDailyReminders(); }

    @Scheduled(cron = "0 0 18 * * *")  // 6pm
    @Transactional
    public void sendEveningReminders() { sendDailyReminders(); }

    @Scheduled(cron = "0 0 21 * * *")  // 9pm
    @Transactional
    public void sendNightReminders() { sendDailyReminders(); }

    @Override
    @Transactional
    public void sendDailyReminders() {
        List<User> users = userRepository.findAll();
        for (User user : users) {
            if (!user.isActive()) continue;

            // Get user's personality preference
            String personality = preferenceRepository.findByUserId(user.getId())
                .map(UserPreference::getBotPersonality)
                .orElse("friendly");
            String botName = preferenceRepository.findByUserId(user.getId())
                .map(UserPreference::getBotName)
                .orElse("Moo");

            boolean hasMoodToday = moodEntryRepository
                .findByUserIdAndEntryDate(user.getId(), LocalDate.now())
                .isPresent();

            if (!hasMoodToday) {
                // Only send one mood reminder per day
                long todayReminders = notificationLogRepository
                    .findByUserIdOrderBySentAtDesc(user.getId())
                    .stream()
                    .filter(n -> "DAILY_REMINDER".equals(n.getType())
                        && n.getSentAt() != null
                        && n.getSentAt().toLocalDate().equals(LocalDate.now()))
                    .count();

                if (todayReminders == 0) {
                    String msg = buildMoodReminderMessage(user.getName(), botName, personality);
                    createNotification(user.getId(), "DAILY_REMINDER", msg);
                }
            }

            // Streak reminder — only once per day
            int streak = analyticsService.calculateCurrentStreak(user.getId());
            if (streak >= 3) {
                long todayStreakReminders = notificationLogRepository
                    .findByUserIdOrderBySentAtDesc(user.getId())
                    .stream()
                    .filter(n -> "STREAK_REMINDER".equals(n.getType())
                        && n.getSentAt() != null
                        && n.getSentAt().toLocalDate().equals(LocalDate.now()))
                    .count();

                if (todayStreakReminders == 0) {
                    String msg = buildStreakMessage(user.getName(), streak, personality);
                    createNotification(user.getId(), "STREAK_REMINDER", msg);
                }
            }
        }
    }

    // ── Personality-aware message builders ───────────────────────────────────

    private String buildMoodReminderMessage(String name, String botName, String personality) {
        String N = name != null ? name.split(" ")[0] : "there";
        switch (personality.toLowerCase()) {
            case "flirty":
                return "Hey " + N + " 💜 I've been thinking about you. Come tell me how you're feeling today?";
            case "friendly":
                return "Hey " + N + "! Just checking in — how are you feeling today? 😊";
            case "sassy":
                return N + ", you haven't logged your mood yet. I'm not mad, just disappointed 💅";
            case "calm":
                return "A gentle reminder, " + N + " — take a moment to check in with yourself today 🌿";
            case "motivational":
                return N + "! Don't break the streak — log your mood and keep going! 🔥";
            case "therapist":
                return "Hey " + N + " 💙 How are you feeling today? Take a moment to check in when you're ready.";
            case "funny":
                return N + ", your mood is unlogged. Scientists are concerned. Please advise 😂";
            default:
                return "Hey " + N + "! How are you feeling today? Take a moment to check in 💙";
        }
    }

    private String buildStreakMessage(String name, int streak, String personality) {
        String N = name != null ? name.split(" ")[0] : "there";
        switch (personality.toLowerCase()) {
            case "flirty":
                return N + ", you're on a " + streak + "-day streak 🔥 I love your consistency. Keep it going for me? 💜";
            case "friendly":
                return N + "! " + streak + "-day streak! You're on a roll — keep it up! 🙌";
            case "sassy":
                return streak + "-day streak, " + N + ". Okay, I'm actually impressed 💅";
            case "calm":
                return N + ", you've checked in for " + streak + " days in a row 🌿 That's a beautiful habit.";
            case "motivational":
                return streak + " DAYS! " + N + ", you're unstoppable! Keep that streak alive! 🔥";
            case "therapist":
                return N + " 💙 " + streak + " days of checking in. That's real commitment to yourself.";
            case "funny":
                return streak + "-day streak, " + N + ". At this point I'm legally your accountability partner 😂";
            default:
                return "You're on a " + streak + "-day streak, " + N + "! Keep it going 🔥";
        }
    }
}
