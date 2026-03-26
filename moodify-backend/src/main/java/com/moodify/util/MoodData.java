package com.moodify.util;

import java.util.HashMap;
import java.util.Map;

public class MoodData {

    public static class MoodInfo {
        private final String emoji;
        private final String category;
        private final int energyLevel;
        private final int positivityScore;
        private final String recommendationStrategy;
        private final String gameStrategy;
        private final String companionBehavior;
        private final String journalPrompt;
        private final String challenge;

        public MoodInfo(String emoji, String category, int energyLevel, int positivityScore,
                        String recommendationStrategy, String gameStrategy, String companionBehavior,
                        String journalPrompt, String challenge) {
            this.emoji = emoji;
            this.category = category;
            this.energyLevel = energyLevel;
            this.positivityScore = positivityScore;
            this.recommendationStrategy = recommendationStrategy;
            this.gameStrategy = gameStrategy;
            this.companionBehavior = companionBehavior;
            this.journalPrompt = journalPrompt;
            this.challenge = challenge;
        }

        public String getEmoji() { return emoji; }
        public String getCategory() { return category; }
        public int getEnergyLevel() { return energyLevel; }
        public int getPositivityScore() { return positivityScore; }
        public String getRecommendationStrategy() { return recommendationStrategy; }
        public String getGameStrategy() { return gameStrategy; }
        public String getCompanionBehavior() { return companionBehavior; }
        public String getJournalPrompt() { return journalPrompt; }
        public String getChallenge() { return challenge; }
    }

    private static final Map<String, MoodInfo> MOOD_MAP = new HashMap<>();

    static {
        MOOD_MAP.put("HAPPY", new MoodInfo("😊", "POSITIVE", 8, 9,
                "upbeat_energetic", "fun_interactive",
                "celebratory_supportive",
                "What made you smile the most today? Write about that moment in detail.",
                "Share your happiness — send a kind message to someone you care about today."));

        MOOD_MAP.put("SAD", new MoodInfo("😢", "NEGATIVE", 3, 2,
                "comforting_gentle", "light_uplifting",
                "empathetic_validating",
                "It's okay to feel sad. What's weighing on your heart right now? Let it out here.",
                "Do one small act of self-care today — a warm drink, a short walk, or your favorite song."));

        MOOD_MAP.put("ANGRY", new MoodInfo("😠", "NEGATIVE", 9, 2,
                "calming_release", "calming_tap_release",
                "calm_grounding",
                "What triggered this feeling? Write it out without holding back — this is your safe space.",
                "Take 5 deep breaths, then write down 3 things you can control right now."));

        MOOD_MAP.put("STRESSED", new MoodInfo("😰", "NEGATIVE", 7, 3,
                "relaxation_focused", "breathing_relax",
                "soothing_structured",
                "List everything on your mind right now. Then circle the one thing that matters most today.",
                "Try the 5-4-3-2-1 grounding technique: name 5 things you see, 4 you hear, 3 you can touch."));

        MOOD_MAP.put("ANXIOUS", new MoodInfo("😟", "NEGATIVE", 6, 3,
                "calming_grounding", "breathing_relax",
                "reassuring_gentle",
                "What are you most worried about? Write it down, then write one reason it might be okay.",
                "Step outside for 5 minutes and focus only on what you see and hear around you."));

        MOOD_MAP.put("LONELY", new MoodInfo("🥺", "NEGATIVE", 3, 3,
                "social_warm", "light_uplifting",
                "warm_connecting",
                "Who do you miss right now? Write them a letter — you don't have to send it.",
                "Reach out to one person today, even just a simple 'Hey, thinking of you.'"));

        MOOD_MAP.put("EXCITED", new MoodInfo("🤩", "POSITIVE", 10, 10,
                "upbeat_energetic", "fun_interactive",
                "enthusiastic_matching",
                "What are you most excited about? Write every detail of what you're looking forward to.",
                "Channel this energy — start that one thing you've been putting off. Do it now!"));

        MOOD_MAP.put("RELAXED", new MoodInfo("😌", "POSITIVE", 4, 8,
                "peaceful_ambient", "minimal_effort",
                "calm_flowing",
                "Describe your perfect peaceful moment. What does it look, sound, and feel like?",
                "Spend 10 minutes doing absolutely nothing — just breathe and be present."));

        MOOD_MAP.put("TIRED", new MoodInfo("😴", "NEUTRAL", 2, 5,
                "gentle_restorative", "minimal_effort",
                "nurturing_gentle",
                "Your body is asking for rest. What would truly recharge you right now?",
                "Give yourself permission to rest for 20 minutes without guilt."));

        MOOD_MAP.put("BORED", new MoodInfo("😑", "NEUTRAL", 4, 5,
                "stimulating_varied", "reflex_word",
                "curious_engaging",
                "If you could do anything right now with no limits, what would it be?",
                "Learn one new interesting fact or try one thing you've never done before today."));

        MOOD_MAP.put("MOTIVATED", new MoodInfo("💪", "POSITIVE", 9, 9,
                "productivity_focused", "fun_interactive",
                "encouraging_amplifying",
                "What goal feels most alive in you right now? Write your action plan for the next 24 hours.",
                "Pick your most important task and work on it for 25 focused minutes right now."));

        MOOD_MAP.put("NEUTRAL", new MoodInfo("😐", "NEUTRAL", 5, 5,
                "balanced_varied", "reflex_word",
                "curious_gentle",
                "Sometimes neutral is okay. What would make today feel a little more meaningful?",
                "Do one small thing that brings you joy — no matter how tiny it seems."));

        MOOD_MAP.put("OVERWHELMED", new MoodInfo("🤯", "NEGATIVE", 8, 2,
                "simplifying_calming", "breathing_relax",
                "grounding_structured",
                "Brain dump everything overwhelming you right now. Get it all out on paper.",
                "Pick just ONE thing from your list. Do only that. Everything else can wait."));

        MOOD_MAP.put("FRUSTRATED", new MoodInfo("😤", "NEGATIVE", 7, 3,
                "release_calming", "calming_tap_release",
                "validating_redirecting",
                "What's not going the way you want? Write about it honestly.",
                "Take a 10-minute break from whatever is frustrating you. Come back fresh."));

        MOOD_MAP.put("PEACEFUL", new MoodInfo("🕊️", "POSITIVE", 3, 9,
                "ambient_serene", "minimal_effort",
                "gentle_appreciative",
                "Capture this peaceful feeling in words. What brought you here?",
                "Share this peace — do something kind for someone without expecting anything back."));

        MOOD_MAP.put("HOPEFUL", new MoodInfo("🌟", "POSITIVE", 6, 8,
                "inspiring_uplifting", "fun_interactive",
                "encouraging_forward",
                "What are you hopeful about? Write your vision for how things could be.",
                "Take one small step today toward something you're hoping for."));

        MOOD_MAP.put("DISAPPOINTED", new MoodInfo("😞", "NEGATIVE", 3, 2,
                "comforting_reframing", "light_uplifting",
                "empathetic_reframing",
                "What were you expecting that didn't happen? Write about it without judgment.",
                "Write down one thing that still went right today, no matter how small."));

        MOOD_MAP.put("CONFIDENT", new MoodInfo("😎", "POSITIVE", 8, 9,
                "empowering_bold", "fun_interactive",
                "affirming_amplifying",
                "What are you most proud of about yourself right now? Write it boldly.",
                "Do that one thing you've been hesitating on. Today is the day."));

        MOOD_MAP.put("INSECURE", new MoodInfo("😔", "NEGATIVE", 4, 3,
                "affirming_gentle", "light_uplifting",
                "reassuring_affirming",
                "What's making you doubt yourself? Write it down, then write one thing you're genuinely good at.",
                "Write 3 things you like about yourself. Read them out loud."));

        MOOD_MAP.put("CALM", new MoodInfo("🧘", "POSITIVE", 4, 8,
                "peaceful_ambient", "minimal_effort",
                "gentle_appreciative",
                "What does this calm feel like in your body? Describe it in detail.",
                "Use this calm energy to do something creative — draw, write, or make something."));
    }

    public static MoodInfo getMoodInfo(String mood) {
        return MOOD_MAP.getOrDefault(mood.toUpperCase(), MOOD_MAP.get("NEUTRAL"));
    }

    public static boolean isValidMood(String mood) {
        return MOOD_MAP.containsKey(mood.toUpperCase());
    }

    public static Map<String, MoodInfo> getAllMoods() {
        return MOOD_MAP;
    }
}
