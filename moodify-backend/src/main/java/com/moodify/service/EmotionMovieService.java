package com.moodify.service;

import com.moodify.dto.MovieRecommendationResponse;
import com.moodify.dto.MovieRecommendationResponse.MovieItem;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class EmotionMovieService {

    private final TmdbService tmdbService;

    public EmotionMovieService(TmdbService tmdbService) {
        this.tmdbService = tmdbService;
    }

    // ── Emotion → Genre mapping (multi-strategy) ─────────────────────────────
    private static final Map<String, Map<String, List<String>>> EMOTION_MAP = buildEmotionMap();

    private static Map<String, Map<String, List<String>>> buildEmotionMap() {
        Map<String, Map<String, List<String>>> map = new LinkedHashMap<>();

        map.put("happy",       Map.of(
            "AMPLIFY",  List.of("comedy", "adventure", "musical"),
            "MATCH",    List.of("comedy", "romance")));

        map.put("sad",         Map.of(
            "REPAIR",   List.of("comedy", "animation", "family"),
            "MATCH",    List.of("drama", "romance"),
            "ESCAPE",   List.of("fantasy", "adventure")));

        map.put("angry",       Map.of(
            "MATCH",    List.of("action", "thriller", "crime"),
            "REPAIR",   List.of("comedy", "animation")));

        map.put("fear",        Map.of(
            "CALM",     List.of("comedy", "animation", "family"),
            "MATCH",    List.of("thriller", "mystery")));

        map.put("surprise",    Map.of(
            "AMPLIFY",  List.of("adventure", "sci-fi", "mystery"),
            "MATCH",    List.of("comedy", "thriller")));

        map.put("disgust",     Map.of(
            "REPAIR",   List.of("comedy", "animation"),
            "ESCAPE",   List.of("fantasy", "adventure")));

        map.put("anxious",     Map.of(
            "CALM",     List.of("comedy", "romance", "animation"),
            "CONTROLLED", List.of("mystery", "drama")));

        map.put("stressed",    Map.of(
            "CALM",     List.of("comedy", "drama", "romance"),
            "RELEASE",  List.of("action", "adventure")));

        map.put("bored",       Map.of(
            "STIMULATE", List.of("action", "sci-fi", "adventure", "thriller"),
            "DISCOVER",  List.of("mystery", "crime")));

        map.put("lonely",      Map.of(
            "CONNECTION", List.of("romance", "family", "drama"),
            "COMFORT",    List.of("comedy", "animation")));

        map.put("depressed",   Map.of(
            "GENTLE",   List.of("animation", "family", "comedy"),
            "HOPEFUL",  List.of("biography", "drama")));

        map.put("heartbroken", Map.of(
            "REPAIR",   List.of("comedy", "animation", "adventure"),
            "MATCH",    List.of("romance", "drama")));

        map.put("excited",     Map.of(
            "AMPLIFY",  List.of("action", "adventure", "sci-fi"),
            "MATCH",    List.of("comedy", "thriller")));

        map.put("calm",        Map.of(
            "MAINTAIN", List.of("drama", "romance", "mystery"),
            "DEEPEN",   List.of("documentary", "history")));

        map.put("motivated",   Map.of(
            "AMPLIFY",  List.of("biography", "sports", "drama"),
            "INSPIRE",  List.of("adventure", "action")));

        map.put("nostalgic",   Map.of(
            "MATCH",    List.of("drama", "romance", "family"),
            "CLASSIC",  List.of("comedy", "adventure")));

        map.put("confused",    Map.of(
            "CLARITY",  List.of("drama", "biography"),
            "ESCAPE",   List.of("comedy", "animation")));

        map.put("tired",       Map.of(
            "EASY",     List.of("comedy", "romance", "animation"),
            "LIGHT",    List.of("family", "adventure")));

        map.put("overwhelmed", Map.of(
            "CALM",     List.of("animation", "comedy", "family"),
            "ESCAPE",   List.of("fantasy", "adventure")));

        map.put("jealous",     Map.of(
            "REPAIR",   List.of("comedy", "romance"),
            "DISTRACT", List.of("action", "thriller")));

        map.put("hopeful",     Map.of(
            "AMPLIFY",  List.of("biography", "drama", "adventure"),
            "INSPIRE",  List.of("sports", "musical")));

        map.put("romantic",    Map.of(
            "MATCH",    List.of("romance", "comedy"),
            "AMPLIFY",  List.of("drama", "musical")));

        return map;
    }

    private static final Map<String, String> STRATEGY_LABELS = Map.ofEntries(
        Map.entry("REPAIR",     "To improve your mood 💙"),
        Map.entry("AMPLIFY",    "To amplify your mood ✨"),
        Map.entry("MATCH",      "Based on your mood 🎭"),
        Map.entry("CALM",       "To calm you down 🌿"),
        Map.entry("ESCAPE",     "For a mood escape 🚀"),
        Map.entry("STIMULATE",  "To beat the boredom 🎯"),
        Map.entry("CONNECTION", "For connection & warmth 🤗"),
        Map.entry("INSPIRE",    "To inspire you 🌟"),
        Map.entry("EASY",       "Easy watch for tired days 😌"),
        Map.entry("GENTLE",     "Gentle & healing 💜"),
        Map.entry("CLASSIC",    "Classic nostalgia 🎞️"),
        Map.entry("CONTROLLED", "Controlled tension 🔍"),
        Map.entry("RELEASE",    "Release the pressure 💥"),
        Map.entry("DISCOVER",   "Discover something new 🔎"),
        Map.entry("COMFORT",    "Comfort watch 🤗"),
        Map.entry("HOPEFUL",    "Something hopeful 🌅"),
        Map.entry("MAINTAIN",   "Stay in the zone ☕"),
        Map.entry("DEEPEN",     "Deepen the calm 📚"),
        Map.entry("CLARITY",    "Find some clarity 💡"),
        Map.entry("LIGHT",      "Light & easy 🌸"),
        Map.entry("DISTRACT",   "Healthy distraction 🎮")
    );

    public List<MovieRecommendationResponse> getMovieRecommendations(String emotion) {
        String e = emotion.toLowerCase().trim();
        Map<String, List<String>> strategies = EMOTION_MAP.getOrDefault(e,
            Map.of("MATCH", List.of("drama", "comedy")));

        List<MovieRecommendationResponse> result = new ArrayList<>();

        strategies.forEach((strategy, genres) -> {
            List<MovieItem> movies = tmdbService.fetchByGenres(genres, 6);
            if (!movies.isEmpty()) {
                String label = STRATEGY_LABELS.getOrDefault(strategy, "Recommended for you");
                result.add(new MovieRecommendationResponse(e, strategy, label, movies));
            }
        });

        return result;
    }
}
