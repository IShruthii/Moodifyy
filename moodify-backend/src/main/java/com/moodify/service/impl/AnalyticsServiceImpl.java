package com.moodify.service.impl;

import com.moodify.dto.AnalyticsResponse;
import com.moodify.dto.AnalyticsResponse.BadgeInfo;
import com.moodify.dto.AnalyticsResponse.MoodFrequency;
import com.moodify.entity.Badge;
import com.moodify.entity.MoodEntry;
import com.moodify.entity.User;
import com.moodify.entity.UserBadge;
import com.moodify.entity.UserFeedback;
import com.moodify.repository.BadgeRepository;
import com.moodify.repository.MoodEntryRepository;
import com.moodify.repository.UserBadgeRepository;
import com.moodify.repository.UserFeedbackRepository;
import com.moodify.repository.UserRepository;
import com.moodify.service.AnalyticsService;
import com.moodify.util.MoodData;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.YearMonth;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class AnalyticsServiceImpl implements AnalyticsService {

    private final MoodEntryRepository moodEntryRepository;
    private final UserBadgeRepository userBadgeRepository;
    private final BadgeRepository badgeRepository;
    private final UserRepository userRepository;
    private final UserFeedbackRepository feedbackRepository;

    public AnalyticsServiceImpl(MoodEntryRepository moodEntryRepository,
                                 UserBadgeRepository userBadgeRepository,
                                 BadgeRepository badgeRepository,
                                 UserRepository userRepository,
                                 UserFeedbackRepository feedbackRepository) {
        this.moodEntryRepository = moodEntryRepository;
        this.userBadgeRepository = userBadgeRepository;
        this.badgeRepository = badgeRepository;
        this.userRepository = userRepository;
        this.feedbackRepository = feedbackRepository;
    }

    @Override
    public AnalyticsResponse getAnalytics(Long userId) {
        AnalyticsResponse response = new AnalyticsResponse();

        int currentStreak = calculateCurrentStreak(userId);
        int longestStreak = calculateLongestStreak(userId);
        long totalEntries = moodEntryRepository.countAllMoodsByUserId(userId);
        long positiveEntries = moodEntryRepository.countPositiveMoodsByUserId(userId);
        double positiveRatio = totalEntries > 0 ? (double) positiveEntries / totalEntries * 100 : 0;

        response.setCurrentStreak(currentStreak);
        response.setLongestStreak(longestStreak);
        response.setTotalEntries((int) totalEntries);
        response.setPositiveRatio(Math.round(positiveRatio * 10.0) / 10.0);

        List<Object[]> freqData = moodEntryRepository.findMoodFrequencyByUserId(userId);
        List<MoodFrequency> frequencies = new ArrayList<>();
        String topMood = "NEUTRAL";
        String topEmoji = "😐";

        for (Object[] row : freqData) {
            String mood = (String) row[0];
            long count = (Long) row[1];
            MoodData.MoodInfo info = MoodData.getMoodInfo(mood);
            frequencies.add(new MoodFrequency(mood, info.getEmoji(), count));
        }

        if (!frequencies.isEmpty()) {
            topMood = frequencies.get(0).getMood();
            topEmoji = MoodData.getMoodInfo(topMood).getEmoji();
        }

        response.setMostFrequentMood(topMood);
        response.setMostFrequentMoodEmoji(topEmoji);
        response.setMoodFrequencies(frequencies);

        Map<String, String> calendarData = buildCalendarData(userId);
        response.setCalendarData(calendarData);

        List<UserBadge> userBadges = userBadgeRepository.findByUserId(userId);
        List<BadgeInfo> badgeInfos = userBadges.stream().map(ub -> {
            BadgeInfo bi = new BadgeInfo();
            bi.setCode(ub.getBadge().getCode());
            bi.setName(ub.getBadge().getName());
            bi.setDescription(ub.getBadge().getDescription());
            bi.setEmoji(ub.getBadge().getEmoji());
            bi.setEarnedAt(ub.getEarnedAt().toLocalDate().toString());
            return bi;
        }).collect(Collectors.toList());
        response.setBadges(badgeInfos);

        return response;
    }

    @Override
    @Transactional
    public void checkAndAwardBadges(Long userId) {
        int streak = calculateCurrentStreak(userId);
        long totalEntries = moodEntryRepository.countAllMoodsByUserId(userId);

        awardBadgeIfEligible(userId, "FIRST_MOOD", streak >= 0 && totalEntries >= 1);
        awardBadgeIfEligible(userId, "STREAK_3", streak >= 3);
        awardBadgeIfEligible(userId, "STREAK_7", streak >= 7);
        awardBadgeIfEligible(userId, "STREAK_14", streak >= 14);
        awardBadgeIfEligible(userId, "STREAK_30", streak >= 30);
        awardBadgeIfEligible(userId, "ENTRIES_10", totalEntries >= 10);
        awardBadgeIfEligible(userId, "ENTRIES_50", totalEntries >= 50);
    }

    @Override
    public int calculateCurrentStreak(Long userId) {
        List<MoodEntry> entries = moodEntryRepository
                .findByUserIdAndEntryDateGreaterThanEqualOrderByEntryDateAsc(userId, LocalDate.now().minusDays(365));

        if (entries.isEmpty()) return 0;

        Set<LocalDate> entryDates = entries.stream()
                .map(MoodEntry::getEntryDate)
                .collect(Collectors.toSet());

        int streak = 0;
        LocalDate checkDate = LocalDate.now();

        while (entryDates.contains(checkDate)) {
            streak++;
            checkDate = checkDate.minusDays(1);
        }

        return streak;
    }

    private int calculateLongestStreak(Long userId) {
        List<MoodEntry> entries = moodEntryRepository.findByUserIdOrderByCreatedAtDesc(userId);
        if (entries.isEmpty()) return 0;

        List<LocalDate> sortedDates = entries.stream()
                .map(MoodEntry::getEntryDate)
                .distinct()
                .sorted()
                .collect(Collectors.toList());

        int longest = 1;
        int current = 1;

        for (int i = 1; i < sortedDates.size(); i++) {
            if (sortedDates.get(i).equals(sortedDates.get(i - 1).plusDays(1))) {
                current++;
                longest = Math.max(longest, current);
            } else {
                current = 1;
            }
        }

        return longest;
    }

    private Map<String, String> buildCalendarData(Long userId) {
        LocalDate start = LocalDate.now().minusDays(90);
        List<MoodEntry> entries = moodEntryRepository
                .findByUserIdAndEntryDateBetweenOrderByEntryDateAsc(userId, start, LocalDate.now());

        Map<String, String> calendarData = new LinkedHashMap<>();
        DateTimeFormatter formatter = DateTimeFormatter.ISO_LOCAL_DATE;

        for (MoodEntry entry : entries) {
            calendarData.put(entry.getEntryDate().format(formatter), entry.getMood());
        }

        return calendarData;
    }

    @Override
    public Map<String, Object> getMonthlyReport(Long userId, int year, int month) {
        YearMonth ym = YearMonth.of(year, month);
        LocalDate start = ym.atDay(1);
        LocalDate end   = ym.atEndOfMonth();

        // Mood entries for the month
        List<MoodEntry> moods = moodEntryRepository
                .findByUserIdAndEntryDateBetweenOrderByEntryDateAsc(userId, start, end);

        // Feedback for the month
        List<UserFeedback> feedbacks = feedbackRepository
                .findByUserIdAndCreatedAtBetweenOrderByCreatedAtAsc(
                        userId,
                        start.atStartOfDay(),
                        end.atTime(23, 59, 59));

        // Mood frequency
        Map<String, Long> moodFreq = moods.stream()
                .collect(Collectors.groupingBy(MoodEntry::getMood, Collectors.counting()));

        // Positive ratio
        long positive = moods.stream()
                .filter(m -> m.getPositivityScore() != null && m.getPositivityScore() >= 5)
                .count();
        double positiveRatio = moods.isEmpty() ? 0 : Math.round((double) positive / moods.size() * 1000.0) / 10.0;

        // Average feedback rating
        double avgRating = feedbacks.stream()
                .mapToInt(UserFeedback::getRating)
                .average().orElse(0.0);

        // Calendar data for the month
        DateTimeFormatter fmt = DateTimeFormatter.ISO_LOCAL_DATE;
        Map<String, String> calendarData = new LinkedHashMap<>();
        for (MoodEntry e : moods) {
            calendarData.put(e.getEntryDate().format(fmt), e.getMood());
        }

        // Feedback calendar (date -> rating)
        Map<String, Integer> feedbackCalendar = new LinkedHashMap<>();
        for (UserFeedback f : feedbacks) {
            feedbackCalendar.put(f.getCreatedAt().toLocalDate().format(fmt), f.getRating());
        }

        // Most frequent mood
        String topMood = moodFreq.entrySet().stream()
                .max(Map.Entry.comparingByValue())
                .map(Map.Entry::getKey).orElse("NEUTRAL");

        // Streak for the month
        int streak = calculateCurrentStreak(userId);

        // User name
        String userName = userRepository.findById(userId)
                .map(u -> u.getName()).orElse("User");

        Map<String, Object> report = new LinkedHashMap<>();
        report.put("userName", userName);
        report.put("year", year);
        report.put("month", month);
        report.put("monthName", ym.getMonth().getDisplayName(
                java.time.format.TextStyle.FULL, java.util.Locale.ENGLISH));
        report.put("totalMoodEntries", moods.size());
        report.put("positiveRatio", positiveRatio);
        report.put("mostFrequentMood", topMood);
        report.put("mostFrequentMoodEmoji", MoodData.getMoodInfo(topMood).getEmoji());
        report.put("currentStreak", streak);
        report.put("totalFeedback", feedbacks.size());
        report.put("averageFeedbackRating", Math.round(avgRating * 10.0) / 10.0);
        report.put("moodFrequency", moodFreq);
        report.put("calendarData", calendarData);
        report.put("feedbackCalendar", feedbackCalendar);
        report.put("recentFeedbackComments", feedbacks.stream()
                .filter(f -> f.getComment() != null && !f.getComment().isBlank())
                .map(f -> Map.of(
                        "rating", f.getRating(),
                        "comment", f.getComment(),
                        "date", f.getCreatedAt().toLocalDate().format(fmt),
                        "sessionType", f.getSessionType() != null ? f.getSessionType() : "GENERAL"
                ))
                .collect(Collectors.toList()));

        return report;
    }

    private void awardBadgeIfEligible(Long userId, String badgeCode, boolean eligible) {
        if (!eligible) return;
        if (userBadgeRepository.existsByUserIdAndBadgeCode(userId, badgeCode)) return;

        badgeRepository.findByCode(badgeCode).ifPresent(badge -> {
            userRepository.findById(userId).ifPresent(user -> {
                UserBadge userBadge = new UserBadge(user, badge);
                userBadgeRepository.save(userBadge);
            });
        });
    }
}
