package com.moodify.dto;

import java.util.List;

public class RecommendationResponse {

    private String mood;
    private String moodEmoji;
    private String message;
    private List<RecommendationItem> music;
    private List<RecommendationItem> movies;
    private List<RecommendationItem> places;
    private List<RecommendationItem> food;
    private List<RecommendationItem> games;
    private String journalPrompt;
    private String challenge;

    public RecommendationResponse() {}

    public static class RecommendationItem {
        private String title;
        private String description;
        private String category;
        private String imageEmoji;
        private List<ActionLink> links;
        private String reason; // explainability — "Picked for stress relief", etc.

        public RecommendationItem() {}

        public RecommendationItem(String title, String description, String category, String imageEmoji, List<ActionLink> links) {
            this.title = title;
            this.description = description;
            this.category = category;
            this.imageEmoji = imageEmoji;
            this.links = links;
        }

        public RecommendationItem(String title, String description, String category, String imageEmoji, List<ActionLink> links, String reason) {
            this(title, description, category, imageEmoji, links);
            this.reason = reason;
        }

        public String getTitle() { return title; }
        public void setTitle(String title) { this.title = title; }

        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }

        public String getCategory() { return category; }
        public void setCategory(String category) { this.category = category; }

        public String getImageEmoji() { return imageEmoji; }
        public void setImageEmoji(String imageEmoji) { this.imageEmoji = imageEmoji; }

        public List<ActionLink> getLinks() { return links; }
        public void setLinks(List<ActionLink> links) { this.links = links; }

        public String getReason() { return reason; }
        public void setReason(String reason) { this.reason = reason; }
    }

    public static class ActionLink {
        private String label;
        private String url;
        private String icon;

        public ActionLink() {}

        public ActionLink(String label, String url, String icon) {
            this.label = label;
            this.url = url;
            this.icon = icon;
        }

        public String getLabel() { return label; }
        public void setLabel(String label) { this.label = label; }

        public String getUrl() { return url; }
        public void setUrl(String url) { this.url = url; }

        public String getIcon() { return icon; }
        public void setIcon(String icon) { this.icon = icon; }
    }

    public String getMood() { return mood; }
    public void setMood(String mood) { this.mood = mood; }

    public String getMoodEmoji() { return moodEmoji; }
    public void setMoodEmoji(String moodEmoji) { this.moodEmoji = moodEmoji; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }

    public List<RecommendationItem> getMusic() { return music; }
    public void setMusic(List<RecommendationItem> music) { this.music = music; }

    public List<RecommendationItem> getMovies() { return movies; }
    public void setMovies(List<RecommendationItem> movies) { this.movies = movies; }

    public List<RecommendationItem> getPlaces() { return places; }
    public void setPlaces(List<RecommendationItem> places) { this.places = places; }

    public List<RecommendationItem> getFood() { return food; }
    public void setFood(List<RecommendationItem> food) { this.food = food; }

    public List<RecommendationItem> getGames() { return games; }
    public void setGames(List<RecommendationItem> games) { this.games = games; }

    public String getJournalPrompt() { return journalPrompt; }
    public void setJournalPrompt(String journalPrompt) { this.journalPrompt = journalPrompt; }

    public String getChallenge() { return challenge; }
    public void setChallenge(String challenge) { this.challenge = challenge; }
}
